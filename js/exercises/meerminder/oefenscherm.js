// exercises/meerminder/oefenscherm.js
// -----------------------------------------------------------------------------
// Het daadwerkelijke oefenscherm van "Meer of minder?": toont per opgave een
// kort verhaaltje en twee geïllustreerde keuzekaarten. Het kind tikt de kaart
// aan die het antwoord op de vraag is (meer/minder, groter/kleiner,
// hoger/lager). Eén poging per opgave: bij een fout tikje wordt meteen het
// juiste antwoord getoond.
// -----------------------------------------------------------------------------

import { recordAnswer, getActiefProfielId, listProfielen } from "../../storage.js";
import { genereerOpgave, opgaveNaarSleutel } from "./opgaven.js";
import { genereerUniekeOpgave } from "../../utils/willekeurig.js";
import { geefCompliment, geefFoutmelding } from "../../utils/complimenten.js";
import { speelGoedGeluid, speelFoutGeluid } from "../../utils/geluid.js";
import { maakRaketAnimatie, toonEindAnimatie } from "../../utils/voortgangAnimatie.js";
import { maakVoortgangCirkels } from "../../utils/voortgangCirkels.js";
import { maakRewardTracker, toonBadgeUnlocks, toonRewardResultaat, verversCoinCounter } from "../../utils/rewards.js";
import { toonPerfecteScoreAnimatie } from "../../utils/eindeAnimatie.js";
import { bouwAantalIllustratie, bouwStaafIllustratie } from "./illustraties.js";

const EXERCISE_ID = "meerminder";

/**
 * Start de oefensessie.
 * @param {HTMLElement} container
 * @param {Object} instellingen - { categorieen, aantalOpgaven }
 * @param {Function} opKlaar - callback(resultaten) als alle opgaven gedaan zijn.
 */
export function startOefensessie(container, instellingen, opKlaar) {
  const gebruikteSleutels = new Set();
  let opgaveIndex = 0;
  let aantalGoedTotaal = 0;
  let startTijdOpgave = performance.now();
  let huidigeOpgave = null;
  let bezigMetFeedback = false;

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

  // --- Voortgangscirkels ---
  const voortgangCirkels = maakVoortgangCirkels(container, instellingen.aantalOpgaven);

  // --- Voortgangsanimatie ---
  const raket = maakRaketAnimatie(container, instellingen.aantalOpgaven);
  const rewardTracker = maakRewardTracker(EXERCISE_ID, instellingen.aantalOpgaven);

  // --- Het verhaaltje / de vraag ---
  const vraagVlak = document.createElement("div");
  vraagVlak.className = "opgave-vraag";
  vraagVlak.style.fontSize = "17px";
  vraagVlak.setAttribute("aria-live", "polite");
  container.appendChild(vraagVlak);

  // --- De twee keuzekaarten ---
  const kaartenVlak = document.createElement("div");
  kaartenVlak.className = "vergelijk-kaarten";
  kaartenVlak.setAttribute("role", "group");
  kaartenVlak.setAttribute("aria-label", "Kies het juiste antwoord");
  container.appendChild(kaartenVlak);

  // --- Feedback ---
  const feedbackVlak = document.createElement("div");
  feedbackVlak.className = "feedback-vlak";
  feedbackVlak.setAttribute("aria-live", "polite");
  container.appendChild(feedbackVlak);

  function bijwerkenVoortgang() {
    voortgangTekst.textContent = `Opgave ${Math.min(opgaveIndex + 1, instellingen.aantalOpgaven)} van ${instellingen.aantalOpgaven} — ${aantalGoedTotaal} goed`;
  }

  function bouwIllustratie(optie, opgave) {
    if (opgave.categorie === "aantal") {
      return bouwAantalIllustratie(optie.waarde, optie.kleur);
    }
    return bouwStaafIllustratie(optie.waarde, opgave.schaalMax, optie.kleur);
  }

  function toonOpgave() {
    if (opgaveIndex >= instellingen.aantalOpgaven) {
      toonEindscherm();
      return;
    }
    bezigMetFeedback = false;
    feedbackVlak.className = "feedback-vlak";
    feedbackVlak.textContent = "";

    huidigeOpgave = genereerUniekeOpgave(
      () => genereerOpgave(instellingen),
      opgaveNaarSleutel,
      gebruikteSleutels
    );
    startTijdOpgave = performance.now();
    bijwerkenVoortgang();
    vraagVlak.textContent = huidigeOpgave.vraagTekst;

    kaartenVlak.innerHTML = "";
    huidigeOpgave.opties.forEach((optie, index) => {
      const kaartKnop = document.createElement("button");
      kaartKnop.type = "button";
      kaartKnop.className = "vergelijk-kaart";
      kaartKnop.setAttribute("aria-label", `${optie.naam}: ${optie.waarde} ${optie.eenheid}`);

      const naamEl = document.createElement("div");
      naamEl.className = "vergelijk-kaart__naam";
      naamEl.textContent = optie.naam;

      const illustratieEl = document.createElement("div");
      illustratieEl.className = "vergelijk-kaart__illustratie";
      illustratieEl.innerHTML = bouwIllustratie(optie, huidigeOpgave);

      const waardeEl = document.createElement("div");
      waardeEl.className = "vergelijk-kaart__waarde";
      waardeEl.textContent = `${optie.waarde} ${optie.eenheid}`;

      kaartKnop.append(naamEl, illustratieEl, waardeEl);
      kaartKnop.addEventListener("click", () => verwerkKeuze(index));
      kaartenVlak.appendChild(kaartKnop);
    });
  }

  async function verwerkKeuze(gekozenIndex) {
    if (bezigMetFeedback) return;
    bezigMetFeedback = true;

    try {
      const gekozenOptie = huidigeOpgave.opties[gekozenIndex];
      const isGoed = !!gekozenOptie.correct;
      const tijdBesteed = Math.round(performance.now() - startTijdOpgave);
      const kaarten = kaartenVlak.querySelectorAll(".vergelijk-kaart");

      await recordAnswer({
        exerciseId: EXERCISE_ID,
        correct: isGoed,
        timeMs: tijdBesteed,
        meta: huidigeOpgave.meta,
      });

      if (isGoed) {
        aantalGoedTotaal += 1;
        kaarten[gekozenIndex].classList.add("vergelijk-kaart--goed");
        feedbackVlak.className = "feedback-vlak feedback-vlak--goed";
        feedbackVlak.textContent = `✓ ${geefCompliment(profielNaam)}`;
        voortgangCirkels.zetStatus(opgaveIndex, "goed");
        speelGoedGeluid();
        raket.goedAntwoord();
        rewardTracker.registreerGoed(1, feedbackVlak);
      } else {
        const goedeIndex = huidigeOpgave.opties.findIndex((o) => o.correct);
        kaarten[gekozenIndex].classList.add("vergelijk-kaart--fout");
        if (goedeIndex !== -1) kaarten[goedeIndex].classList.add("vergelijk-kaart--goed");
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = geefFoutmelding();
        voortgangCirkels.zetStatus(opgaveIndex, "fout");
        speelFoutGeluid();
        raket.foutAntwoord();
        rewardTracker.registreerFout();
      }

      bijwerkenVoortgang();
      setTimeout(() => {
        opgaveIndex += 1;
        toonOpgave();
      }, 1600);
    } catch (fout) {
      console.error("Onverwachte fout bij verwerken keuze:", fout);
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

    toonEindAnimatie(kaart, percentageGoedVoorTitel);

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
