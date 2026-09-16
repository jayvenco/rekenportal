// exercises/verhaaltjes/oefenscherm.js
// -----------------------------------------------------------------------------
// Het daadwerkelijke oefenscherm van de verhaaltjessommen: toont verhaaltjes
// één voor één, verwerkt antwoorden, geeft feedback en stuurt de raket-animatie
// aan. Analoog aan het oefenscherm van de getallenlijn-module.
// -----------------------------------------------------------------------------

import { recordAnswer } from "../../storage.js";
import { genereerOpgave, opgaveNaarSleutel } from "./opgaven.js";
import { genereerUniekeOpgave } from "../../utils/willekeurig.js";
import { geefCompliment, geefFoutmelding } from "../../utils/complimenten.js";
import { speelGoedGeluid, speelFoutGeluid } from "../../utils/geluid.js";
import { maakRaketAnimatie, toonEindAnimatie } from "../../utils/raketAnimatie.js";

const EXERCISE_ID = "verhaaltjes";

/**
 * Start de oefensessie.
 * @param {HTMLElement} container
 * @param {Object} instellingen - { aantalOpgaven }
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

  // --- Raket-animatie ---
  const raket = maakRaketAnimatie(container, instellingen.aantalOpgaven);

  // --- Verhaaltje / vraagtekst ---
  const vraagVlak = document.createElement("div");
  vraagVlak.className = "opgave-vraag verhaaltje-tekst";
  vraagVlak.setAttribute("aria-live", "polite");
  container.appendChild(vraagVlak);

  // --- Feedback ---
  const feedbackVlak = document.createElement("div");
  feedbackVlak.className = "feedback-vlak";
  feedbackVlak.setAttribute("aria-live", "polite");
  container.appendChild(feedbackVlak);

  // --- Invoergebied ---
  const invoerVlak = document.createElement("div");
  container.appendChild(invoerVlak);

  function bijwerkenVoortgang() {
    voortgangTekst.textContent = `Opgave ${Math.min(opgaveIndex + 1, instellingen.aantalOpgaven)} van ${instellingen.aantalOpgaven} — ${aantalGoedTotaal} goed`;
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
        if (huidigeWaarde.length < 2) {
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
      if (huidigeWaarde.length < 2) {
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
      if (/^[0-9]$/.test(gebeurtenis.key) && huidigeWaarde.length < 2) {
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
    vraagVlak.textContent = huidigeOpgave.vraagTekst;

    opruimHuidigeInvoer = bouwCijferInvoer(verwerkAntwoord);
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
        meta: { bewerking: huidigeOpgave.meta.bewerking, pogingen: pogingNummer },
      });
      if (pogingNummer === 1) {
        feedbackVlak.className = "feedback-vlak feedback-vlak--goed";
        feedbackVlak.textContent = `✓ ${geefCompliment()}`;
      } else {
        feedbackVlak.className = "feedback-vlak feedback-vlak--tweede-poging-goed";
        feedbackVlak.textContent = `✓ ${geefCompliment()} (tweede poging!)`;
      }
      speelGoedGeluid();
      raket.goedAntwoord();
      bijwerkenVoortgang();
      setTimeout(() => {
        opgaveIndex += 1;
        toonOpgave();
      }, 1900);
    } else if (pogingNummer === 1) {
      // Eerste poging fout: oranje feedback, antwoord nog niet verklappen, nog een kans.
      pogingNummer = 2;
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = `${geefFoutmelding()} Probeer het nog eens.`;
      speelFoutGeluid();
      if (opruimHuidigeInvoer) opruimHuidigeInvoer();
      opruimHuidigeInvoer = bouwCijferInvoer(verwerkAntwoord);
    } else {
      // Tweede poging ook fout: toon het juiste antwoord, ga door naar de volgende opgave.
      bezigMetFeedback = true;
      await recordAnswer({
        exerciseId: EXERCISE_ID,
        correct: false,
        timeMs: tijdBesteed,
        meta: { bewerking: huidigeOpgave.meta.bewerking, pogingen: 2 },
      });
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = `${geefFoutmelding()} Het juiste antwoord is ${huidigeOpgave.antwoordGoed}.`;
      speelFoutGeluid();
      raket.foutAntwoord();
      bijwerkenVoortgang();
      setTimeout(() => {
        opgaveIndex += 1;
        toonOpgave();
      }, 1900);
    }
  }

  function toonEindscherm() {
    container.innerHTML = "";
    const kaart = document.createElement("div");
    kaart.className = "kaart";
    kaart.style.textAlign = "center";

    const titel = document.createElement("h2");
    const percentageGoedVoorTitel = (aantalGoedTotaal / instellingen.aantalOpgaven) * 100;
    titel.textContent = percentageGoedVoorTitel >= 70 ? "Goed gedaan!" : "Bijna! Nog even oefenen.";
    kaart.appendChild(titel);

    const raketEind = toonEindAnimatie(kaart, (aantalGoedTotaal / instellingen.aantalOpgaven) * 100);

    const resultaatTekst = document.createElement("p");
    resultaatTekst.style.fontSize = "24px";
    resultaatTekst.style.fontWeight = "700";
    resultaatTekst.style.color = "#1f2937";
    resultaatTekst.textContent = `Je had ${aantalGoedTotaal} van de ${instellingen.aantalOpgaven} goed!`;
    kaart.appendChild(resultaatTekst);

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
  }

  toonOpgave();
}
