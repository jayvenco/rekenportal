// exercises/klokkijken/oefenscherm.js
// -----------------------------------------------------------------------------
// Het oefenscherm voor klokkijken: toont een analoge klok en laat het kind
// met meerkeuze kiezen hoe laat het is. Hele uren en halve uren (groep 4).
// -----------------------------------------------------------------------------

import { recordAnswer, getActiefProfielId, listProfielen } from "../../storage.js";
import { genereerOpgave, opgaveNaarSleutel, genereerFouteAntwoorden } from "./opgaven.js";
import { genereerUniekeOpgave, schudArray } from "../../utils/willekeurig.js";
import { geefCompliment, geefFoutmelding } from "../../utils/complimenten.js";
import { speelGoedGeluid, speelFoutGeluid } from "../../utils/geluid.js";
import { maakRaketAnimatie, toonEindAnimatie } from "../../utils/voortgangAnimatie.js";
import { maakVoortgangCirkels } from "../../utils/voortgangCirkels.js";
import { maakRewardTracker, toonBadgeUnlocks, toonRewardResultaat, verversCoinCounter } from "../../utils/rewards.js";
import { toonPerfecteScoreAnimatie } from "../../utils/eindeAnimatie.js";
import { bouwKlok } from "../../utils/klokSvg.js";

const EXERCISE_ID = "klokkijken";

/**
 * Start de klokkijken-oefensessie.
 * @param {HTMLElement} container
 * @param {Object} instellingen - { opgaveType, aantalOpgaven }
 * @param {Function} opKlaar - callback({ opnieuw: bool })
 */
export function startOefensessie(container, instellingen, opKlaar) {
  const gebruikteSleutels = new Set();
  let opgaveIndex = 0;
  let aantalGoedTotaal = 0;
  let startTijdOpgave = performance.now();
  let huidigeOpgave = null;
  let bezigMetFeedback = false;
  let pogingNummer = 1;

  container.innerHTML = "";

  let profielNaam = "";

  (async () => {
    const profielId = getActiefProfielId();
    if (profielId !== null) {
      const profielen = await listProfielen();
      const profiel = profielen.find((p) => p.id === profielId);
      if (profiel) profielNaam = profiel.naam;
    }
  })();

  // --- Koppen: voortgang ---
  const koppenRij = document.createElement("div");
  koppenRij.className = "oefen-koppen";
  const voortgangTekst = document.createElement("span");
  voortgangTekst.className = "voortgang-tekst";
  koppenRij.appendChild(voortgangTekst);
  container.appendChild(koppenRij);

  const voortgangCirkels = maakVoortgangCirkels(container, instellingen.aantalOpgaven);
  const raket = maakRaketAnimatie(container, instellingen.aantalOpgaven);
  const rewardTracker = maakRewardTracker(EXERCISE_ID, instellingen.aantalOpgaven);

  // --- Vraagtekst ---
  const vraagVlak = document.createElement("div");
  vraagVlak.className = "opgave-vraag";
  vraagVlak.setAttribute("aria-live", "polite");
  container.appendChild(vraagVlak);

  // --- Klok ---
  const klokHouder = document.createElement("div");
  klokHouder.className = "klok-houder";
  container.appendChild(klokHouder);

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

  /** Bouwt vier meerkeuze-knoppen: het goede antwoord plus drie foute, door elkaar. */
  function bouwMeerkeuze() {
    invoerVlak.innerHTML = "";
    const opties = schudArray([huidigeOpgave.antwoord, ...genereerFouteAntwoorden(huidigeOpgave.antwoord)]);
    const grid = document.createElement("div");
    grid.className = "meerkeuze-grid";
    for (const optie of opties) {
      const knop = document.createElement("button");
      knop.type = "button";
      knop.className = "meerkeuze-knop";
      knop.textContent = optie;
      knop.setAttribute("aria-label", `Antwoord: ${optie}`);
      knop.addEventListener("click", () => verwerkAntwoord(optie));
      grid.appendChild(knop);
    }
    invoerVlak.appendChild(grid);
  }

  /** Kleurt het goede antwoord groen en een fout gekozen antwoord rood. */
  function markeerAntwoorden(gekozenLabel) {
    const correct = String(huidigeOpgave.antwoord);
    const knoppen = invoerVlak.querySelectorAll(".meerkeuze-knop");
    for (const knop of knoppen) {
      if (knop.textContent === correct) {
        knop.classList.add("meerkeuze-knop--goed");
      } else if (knop.textContent === String(gekozenLabel)) {
        knop.classList.add("meerkeuze-knop--fout");
      }
    }
  }

  function toonOpgave() {
    if (opgaveIndex >= instellingen.aantalOpgaven) {
      toonEindscherm();
      return;
    }
    bezigMetFeedback = false;
    pogingNummer = 1;
    feedbackVlak.className = "feedback-vlak";
    feedbackVlak.textContent = "";

    huidigeOpgave = genereerUniekeOpgave(
      () => genereerOpgave(instellingen),
      opgaveNaarSleutel,
      gebruikteSleutels
    );
    startTijdOpgave = performance.now();
    bijwerkenVoortgang();

    vraagVlak.innerHTML = `<span class="getal-groot">Hoe laat is het?</span>`;
    klokHouder.innerHTML = "";
    klokHouder.appendChild(bouwKlok({ uur: huidigeOpgave.uur, minuten: huidigeOpgave.minuten }));

    bouwMeerkeuze();
  }

  async function verwerkAntwoord(antwoordVanKind) {
    if (bezigMetFeedback) return;
    try {
      const isGoed = String(antwoordVanKind) === String(huidigeOpgave.antwoord);
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
        markeerAntwoorden(antwoordVanKind);
        if (pogingNummer === 1) {
          feedbackVlak.className = "feedback-vlak feedback-vlak--goed";
          feedbackVlak.textContent = `✓ ${geefCompliment(profielNaam)}`;
          voortgangCirkels.zetStatus(opgaveIndex, "goed");
        } else {
          feedbackVlak.className = "feedback-vlak feedback-vlak--tweede-poging-goed";
          feedbackVlak.textContent = `✓ ${geefCompliment(profielNaam)} (tweede poging!)`;
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
        pogingNummer = 2;
        rewardTracker.registreerFout();
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = `${geefFoutmelding()} Probeer het nog eens.`;
        speelFoutGeluid();
        bouwMeerkeuze();
      } else {
        bezigMetFeedback = true;
        await recordAnswer({
          exerciseId: EXERCISE_ID,
          correct: false,
          timeMs: tijdBesteed,
          meta: { ...huidigeOpgave.meta, pogingen: 2 },
        });
        markeerAntwoorden(antwoordVanKind);
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = `${geefFoutmelding()} Het juiste antwoord is ${huidigeOpgave.antwoord}.`;
        speelFoutGeluid();
        raket.foutAntwoord();
        voortgangCirkels.zetStatus(opgaveIndex, "fout");
        bijwerkenVoortgang();
        setTimeout(() => {
          opgaveIndex += 1;
          toonOpgave();
        }, 1600);
      }
    } catch (fout) {
      console.error("Onverwachte fout bij verwerken antwoord:", fout);
      bezigMetFeedback = false;
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = "Er ging iets mis, probeer de volgende opgave.";
      setTimeout(() => {
        opgaveIndex += 1;
        toonOpgave();
      }, 2000);
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

    toonEindAnimatie(kaart, (aantalGoedTotaal / instellingen.aantalOpgaven) * 100);

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
    complimentTekst.textContent = geefCompliment(profielNaam);
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