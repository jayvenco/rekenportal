// exercises/getallenlijn/oefenscherm.js
// -----------------------------------------------------------------------------
// Het daadwerkelijke oefenscherm van de getallenlijn: toont opgaven één voor één,
// verwerkt antwoorden, geeft feedback en stuurt de raket-animatie aan.
// -----------------------------------------------------------------------------

import { recordAnswer } from "../../storage.js";
import { genereerOpgave, opgaveNaarSleutel } from "./opgaven.js";
import { genereerUniekeOpgave } from "../../utils/willekeurig.js";
import { geefCompliment, geefFoutmelding } from "../../utils/complimenten.js";
import { speelGoedGeluid, speelFoutGeluid } from "../../utils/geluid.js";
import { maakRaketAnimatie, toonEindAnimatie } from "../../utils/voortgangAnimatie.js";
import { maakVoortgangCirkels } from "../../utils/voortgangCirkels.js";
import { bouwGetallenlijn, xNaarGetal } from "../../utils/getallenlijnSvg.js";
import { maakRewardTracker, toonBadgeUnlocks, toonRewardResultaat, verversCoinCounter } from "../../utils/rewards.js";
import { berekenPunten, slaSessieOp, toonPuntenAnimatie } from "../../utils/punten.js";
import { toonPerfecteScoreAnimatie } from "../../utils/eindeAnimatie.js";

const EXERCISE_ID = "getallenlijn";

/**
 * Start de oefensessie.
 * @param {HTMLElement} container
 * @param {Object} instellingen - { min, max, stappen, aantalOpgaven, opgaveType }
 * @param {Function} opKlaar - callback(resultaten) als alle opgaven gedaan zijn.
 */
export function startOefensessie(container, instellingen, opKlaar) {
  const gebruikteSleutels = new Set();
  let opgaveIndex = 0;
  let aantalGoedTotaal = 0;
  let startTijdOpgave = performance.now();
  let huidigeOpgave = null;
  let bezigMetFeedback = false;
  let pogingNummer = 1; // 1 = eerste poging, 2 = tweede (laatste) poging

  container.innerHTML = "";

  // --- Koppen: voortgang ---
  const koppenRij = document.createElement("div");
  koppenRij.className = "oefen-koppen";
  const voortgangTekst = document.createElement("span");
  voortgangTekst.className = "voortgang-tekst";
  koppenRij.appendChild(voortgangTekst);
  container.appendChild(koppenRij);

  // --- Voortgangscirkels: één per opgave, kleurt in na elk antwoord ---
  const voortgangCirkels = maakVoortgangCirkels(container, instellingen.aantalOpgaven);

  // --- Raket-animatie ---
  const raket = maakRaketAnimatie(container, instellingen.aantalOpgaven);
  const rewardTracker = maakRewardTracker(EXERCISE_ID, instellingen.aantalOpgaven);

  // --- Vraagtekst ---
  const vraagVlak = document.createElement("div");
  vraagVlak.className = "opgave-vraag";
  vraagVlak.setAttribute("aria-live", "polite");
  container.appendChild(vraagVlak);

  // --- Getallenlijn houder ---
  const lijnHouder = document.createElement("div");
  lijnHouder.className = "getallenlijn-houder";
  container.appendChild(lijnHouder);

  // --- Feedback ---
  const feedbackVlak = document.createElement("div");
  feedbackVlak.className = "feedback-vlak";
  feedbackVlak.setAttribute("aria-live", "polite");
  container.appendChild(feedbackVlak);

  // --- Invoergebied (verandert per opgave-type) ---
  const invoerVlak = document.createElement("div");
  container.appendChild(invoerVlak);

  function bijwerkenVoortgang() {
    voortgangTekst.textContent = `Opgave ${Math.min(opgaveIndex + 1, instellingen.aantalOpgaven)} van ${instellingen.aantalOpgaven} — ${aantalGoedTotaal} goed`;
  }

  /** Tekent de getallenlijn opnieuw met de gegeven weergave-instellingen. */
  function tekenLijn(weergave) {
    lijnHouder.innerHTML = "";
    const { svg } = bouwGetallenlijn(weergave);
    lijnHouder.appendChild(svg);
    return svg;
  }

  /** Bouwt de "cijfers"-invoer: groot invoerveld + numeriek toetsenbord + bevestigknop. */
  function bouwCijferInvoer(opGeantwoord) {
    invoerVlak.innerHTML = "";
    let huidigeWaarde = "";

    const scherm = document.createElement("div");
    scherm.className = "antwoord-scherm";
    scherm.setAttribute("aria-label", "Jouw antwoord");
    scherm.textContent = "";
    invoerVlak.appendChild(scherm);

    const pad = document.createElement("div");
    pad.className = "cijfer-pad";

    function toonWaarde() {
      scherm.textContent = huidigeWaarde;
    }

    const cijferKnoppen = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (const cijfer of cijferKnoppen) {
      const knop = document.createElement("button");
      knop.type = "button";
      knop.className = "cijfer-toets";
      knop.textContent = String(cijfer);
      knop.setAttribute("aria-label", `Cijfer ${cijfer}`);
      knop.addEventListener("click", () => {
        if (huidigeWaarde.length < 3) {
          huidigeWaarde += String(cijfer);
          toonWaarde();
        }
      });
      pad.appendChild(knop);
    }

    const wisKnop = document.createElement("button");
    wisKnop.type = "button";
    wisKnop.className = "cijfer-toets";
    wisKnop.textContent = "⌫";
    wisKnop.setAttribute("aria-label", "Verwijder laatste cijfer");
    wisKnop.addEventListener("click", () => {
      huidigeWaarde = huidigeWaarde.slice(0, -1);
      toonWaarde();
    });
    pad.appendChild(wisKnop);

    const nulKnop = document.createElement("button");
    nulKnop.type = "button";
    nulKnop.className = "cijfer-toets";
    nulKnop.textContent = "0";
    nulKnop.setAttribute("aria-label", "Cijfer 0");
    nulKnop.addEventListener("click", () => {
      if (huidigeWaarde.length < 3) {
        huidigeWaarde += "0";
        toonWaarde();
      }
    });
    pad.appendChild(nulKnop);

    const bevestigKnop = document.createElement("button");
    bevestigKnop.type = "button";
    bevestigKnop.className = "cijfer-toets";
    bevestigKnop.style.background = "#38b26a";
    bevestigKnop.style.color = "#ffffff";
    bevestigKnop.textContent = "✓";
    bevestigKnop.setAttribute("aria-label", "Antwoord bevestigen");
    bevestigKnop.addEventListener("click", () => {
      if (huidigeWaarde === "") return;
      opGeantwoord(Number(huidigeWaarde));
    });
    pad.appendChild(bevestigKnop);

    invoerVlak.appendChild(pad);

    // Ook bruikbaar via echt toetsenbord: cijfers, backspace en Enter.
    function toetsHandler(gebeurtenis) {
      if (bezigMetFeedback) return;
      if (/^[0-9]$/.test(gebeurtenis.key) && huidigeWaarde.length < 3) {
        huidigeWaarde += gebeurtenis.key;
        toonWaarde();
      } else if (gebeurtenis.key === "Backspace") {
        huidigeWaarde = huidigeWaarde.slice(0, -1);
        toonWaarde();
      } else if (gebeurtenis.key === "Enter" && huidigeWaarde !== "") {
        opGeantwoord(Number(huidigeWaarde));
      }
    }
    document.addEventListener("keydown", toetsHandler);
    invoerVlak.dataset.actief = "true";
    return () => document.removeEventListener("keydown", toetsHandler);
  }

  /** Bouwt de "klik op de lijn"-invoer voor het "plaats het getal"-opgavetype. */
  function bouwKlikInvoer(svg, opgave, opGeantwoord) {
    invoerVlak.innerHTML = "";
    const hint = document.createElement("p");
    hint.style.textAlign = "center";
    hint.textContent = "Tik of klik op de plek waar je denkt dat het getal staat.";
    invoerVlak.appendChild(hint);

    let gekozenGetal = null;

    function verwerkKlik(gebeurtenis) {
      const clientX = gebeurtenis.clientX !== undefined ? gebeurtenis.clientX
        : (gebeurtenis.touches && gebeurtenis.touches[0] ? gebeurtenis.touches[0].clientX : null);
      if (clientX === null) return;
      gekozenGetal = xNaarGetal(clientX, svg, opgave.weergave.min, opgave.weergave.max, opgave.weergave.stap);
      opGeantwoord(gekozenGetal);
    }

    svg.style.cursor = "pointer";
    svg.addEventListener("click", verwerkKlik);
    svg.setAttribute("tabindex", "0");
    svg.setAttribute(
      "aria-label",
      `Getallenlijn van ${opgave.weergave.min} tot ${opgave.weergave.max}. Klik om het getal ${opgave.antwoordGoed >= 0 ? "te plaatsen" : ""} te plaatsen.`
    );

    // Toetsenbord-alternatief: pijltjes + Enter, voor kinderen die liever typen.
    const bevestigKnop = document.createElement("button");
    bevestigKnop.type = "button";
    bevestigKnop.className = "knop knop--primair";
    bevestigKnop.style.display = "block";
    bevestigKnop.style.margin = "16px auto";
    bevestigKnop.textContent = "Ik heb geklikt, controleer!";
    bevestigKnop.addEventListener("click", () => {
      if (gekozenGetal !== null) opGeantwoord(gekozenGetal);
    });
    invoerVlak.appendChild(bevestigKnop);

    return () => svg.removeEventListener("click", verwerkKlik);
  }

  let opruimHuidigeInvoer = null;

  function toonOpgave() {
    if (opgaveIndex >= instellingen.aantalOpgaven) {
      toonEindscherm();
      return;
    }
    bezigMetFeedback = false;
    pogingNummer = 1;
    feedbackVlak.className = "feedback-vlak";
    feedbackVlak.textContent = "";
    if (opruimHuidigeInvoer) {
      opruimHuidigeInvoer();
      opruimHuidigeInvoer = null;
    }

    huidigeOpgave = genereerUniekeOpgave(
      () => genereerOpgave(instellingen),
      opgaveNaarSleutel,
      gebruikteSleutels
    );
    startTijdOpgave = performance.now();
    bijwerkenVoortgang();
    vraagVlak.innerHTML = huidigeOpgave.vraagTekst;
    const svg = tekenLijn(huidigeOpgave.weergave);

    if (huidigeOpgave.invoerType === "klikOpLijn") {
      opruimHuidigeInvoer = bouwKlikInvoer(svg, huidigeOpgave, verwerkAntwoord);
    } else {
      opruimHuidigeInvoer = bouwCijferInvoer(verwerkAntwoord);
    }
  }

  async function verwerkAntwoord(antwoordVanKind) {
    if (bezigMetFeedback) return;
    const isGoed = Number(antwoordVanKind) === Number(huidigeOpgave.antwoordGoed);
    const tijdBesteed = Math.round(performance.now() - startTijdOpgave);

    if (isGoed) {
      bezigMetFeedback = true;
      aantalGoedTotaal += 1;
      await recordAnswer({
        exerciseId: EXERCISE_ID,
        correct: true,
        timeMs: tijdBesteed,
        meta: { ...huidigeOpgave.meta, pogingen: pogingNummer },
      });
      if (pogingNummer === 1) {
        feedbackVlak.className = "feedback-vlak feedback-vlak--goed";
        feedbackVlak.textContent = `✓ ${geefCompliment()}`;
        voortgangCirkels.zetStatus(opgaveIndex, "goed");
      } else {
        feedbackVlak.className = "feedback-vlak feedback-vlak--tweede-poging-goed";
        feedbackVlak.textContent = `✓ ${geefCompliment()} (tweede poging!)`;
        voortgangCirkels.zetStatus(opgaveIndex, "tweedePogingGoed");
      }
      speelGoedGeluid();
      raket.goedAntwoord();
      rewardTracker.registreerGoed(pogingNummer, feedbackVlak);
      bijwerkenVoortgang();
      setTimeout(() => {
        opgaveIndex += 1;
        toonOpgave();
      }, 1600);
    } else if (pogingNummer === 1) {
      // Eerste poging fout: oranje feedback, antwoord nog niet verklappen, nog een kans.
      pogingNummer = 2;
      rewardTracker.registreerFout();
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = `${geefFoutmelding()} Probeer het nog eens.`;
      speelFoutGeluid();
      if (opruimHuidigeInvoer) {
        opruimHuidigeInvoer();
        opruimHuidigeInvoer = null;
      }
      if (huidigeOpgave.invoerType === "klikOpLijn") {
        const svgOpnieuw = tekenLijn(huidigeOpgave.weergave);
        opruimHuidigeInvoer = bouwKlikInvoer(svgOpnieuw, huidigeOpgave, verwerkAntwoord);
      } else {
        opruimHuidigeInvoer = bouwCijferInvoer(verwerkAntwoord);
      }
    } else {
      // Tweede poging ook fout: toon het juiste antwoord, ga door naar de volgende opgave.
      bezigMetFeedback = true;
      await recordAnswer({
        exerciseId: EXERCISE_ID,
        correct: false,
        timeMs: tijdBesteed,
        meta: { ...huidigeOpgave.meta, pogingen: 2 },
      });
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = `${geefFoutmelding()} Het juiste antwoord is ${huidigeOpgave.antwoordGoed}.`;
      speelFoutGeluid();
      raket.foutAntwoord();
      voortgangCirkels.zetStatus(opgaveIndex, "fout");
      // Toon zowel het antwoord van het kind als het juiste antwoord op de lijn.
      const markeringen = [
        { getal: huidigeOpgave.antwoordGoed, kleur: "#38b26a", label: "juist" },
      ];
      if (!Number.isNaN(Number(antwoordVanKind))) {
        markeringen.unshift({ getal: Number(antwoordVanKind), kleur: "#e8735a", label: "jouw antwoord" });
      }
      tekenLijn({ ...huidigeOpgave.weergave, markeringen });
      bijwerkenVoortgang();
      setTimeout(() => {
        opgaveIndex += 1;
        toonOpgave();
      }, 1600);
    }
  }

  function toonEindscherm() {
    container.innerHTML = "";
    const kaart = document.createElement("div");
    kaart.className = "kaart";
    kaart.style.textAlign = "center";

    const titel = document.createElement("h2");
    const percentageGoedVoorTitel = (aantalGoedTotaal / instellingen.aantalOpgaven) * 100;
    if (percentageGoedVoorTitel === 100) toonPerfecteScoreAnimatie();
    titel.textContent = percentageGoedVoorTitel >= 70 ? "Goed gedaan!" : "Bijna! Nog even oefenen.";
    kaart.appendChild(titel);

    const raketEind = toonEindAnimatie(kaart, (aantalGoedTotaal / instellingen.aantalOpgaven) * 100);

    const resultaatTekst = document.createElement("p");
    resultaatTekst.style.fontSize = "24px";
    resultaatTekst.style.fontWeight = "700";
    resultaatTekst.style.color = "#1f2937";
    resultaatTekst.textContent = `Je had ${aantalGoedTotaal} van de ${instellingen.aantalOpgaven} goed!`;
    kaart.appendChild(resultaatTekst);

    const rewardVlak = document.createElement("div");
    kaart.appendChild(rewardVlak);

    const complimentTekst = document.createElement("p");
    complimentTekst.style.fontSize = "20px";
    complimentTekst.textContent = geefCompliment();
    kaart.appendChild(complimentTekst);

    const actiesRij = document.createElement("div");
    actiesRij.className = "acties-rij";

    const nogEenKeerKnop = document.createElement("button");
    nogEenKeerKnop.type = "button";
    nogEenKeerKnop.className = "knop knop--primair";
    nogEenKeerKnop.textContent = "Nog een keer";
    nogEenKeerKnop.addEventListener("click", () => opKlaar({ opnieuw: true }));

    const terugKnop = document.createElement("button");
    terugKnop.type = "button";
    terugKnop.className = "knop knop--zacht";
    terugKnop.textContent = "Terug naar het menu";
    terugKnop.addEventListener("click", () => opKlaar({ opnieuw: false }));

    actiesRij.append(nogEenKeerKnop, terugKnop);
    kaart.appendChild(actiesRij);
    container.appendChild(kaart);

    (async () => {
      const rewards = await rewardTracker.voltooi();
      toonRewardResultaat(rewardVlak, rewards);
      await verversCoinCounter();
      await toonBadgeUnlocks(rewards?.badgesEarned || []);
    })();
  }

  toonOpgave();
}
