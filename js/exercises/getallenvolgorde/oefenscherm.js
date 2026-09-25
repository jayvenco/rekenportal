// exercises/getallenvolgorde/oefenscherm.js
// -----------------------------------------------------------------------------
// Het daadwerkelijke oefenscherm van de volgorde-oefening: toont per opgave
// een aantal door elkaar geschudde bolletjes. Het kind tikt ze aan van klein
// naar groot. Een fout tikje geeft een korte schudanimatie maar kost geen
// voortgang — het bolletje blijft gewoon aantikbaar tot het juiste gekozen is.
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

const EXERCISE_ID = "getallenvolgorde";

/**
 * Start de oefensessie.
 * @param {HTMLElement} container
 * @param {Object} instellingen - { min, max, aantalBolletjes, aantalOpgaven }
 * @param {Function} opKlaar - callback(resultaten) als alle opgaven gedaan zijn.
 */
export function startOefensessie(container, instellingen, opKlaar) {
  const gebruikteSleutels = new Set();
  let opgaveIndex = 0;
  let aantalGoedTotaal = 0;
  let startTijdOpgave = performance.now();
  let huidigeOpgave = null;
  let volgendeIndex = 0;
  let hadFoutBijDezeOpgave = false;
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

  // --- Voortgangscirkels: één per opgave, kleurt in na elk antwoord ---
  const voortgangCirkels = maakVoortgangCirkels(container, instellingen.aantalOpgaven);

  // --- Voortgangsanimatie ---
  const raket = maakRaketAnimatie(container, instellingen.aantalOpgaven);
  const rewardTracker = maakRewardTracker(EXERCISE_ID, instellingen.aantalOpgaven);

  // --- Opdracht ---
  const vraagVlak = document.createElement("div");
  vraagVlak.className = "opgave-vraag";
  vraagVlak.setAttribute("aria-live", "polite");
  vraagVlak.textContent = "Tik de bolletjes aan van klein naar groot.";
  container.appendChild(vraagVlak);

  // --- Rij met de al goed gekozen getallen (bouwt zich op) ---
  const antwoordRij = document.createElement("div");
  antwoordRij.className = "volgorde-antwoord-rij";
  antwoordRij.setAttribute("aria-live", "polite");
  antwoordRij.setAttribute("aria-label", "Al gekozen getallen, op volgorde");
  container.appendChild(antwoordRij);

  // --- De door elkaar geschudde bolletjes ---
  const bolletjesVlak = document.createElement("div");
  bolletjesVlak.className = "volgorde-bolletjes-vlak";
  bolletjesVlak.setAttribute("role", "group");
  bolletjesVlak.setAttribute("aria-label", "Kies het volgende getal");
  container.appendChild(bolletjesVlak);

  // --- Feedback ---
  const feedbackVlak = document.createElement("div");
  feedbackVlak.className = "feedback-vlak";
  feedbackVlak.setAttribute("aria-live", "polite");
  container.appendChild(feedbackVlak);

  function bijwerkenVoortgang() {
    voortgangTekst.textContent = `Opgave ${Math.min(opgaveIndex + 1, instellingen.aantalOpgaven)} van ${instellingen.aantalOpgaven} — ${aantalGoedTotaal} goed`;
  }

  function toonOpgave() {
    if (opgaveIndex >= instellingen.aantalOpgaven) {
      toonEindscherm();
      return;
    }
    bezigMetFeedback = false;
    volgendeIndex = 0;
    hadFoutBijDezeOpgave = false;
    feedbackVlak.className = "feedback-vlak";
    feedbackVlak.textContent = "";
    antwoordRij.innerHTML = "";

    huidigeOpgave = genereerUniekeOpgave(
      () => genereerOpgave(instellingen),
      opgaveNaarSleutel,
      gebruikteSleutels
    );
    startTijdOpgave = performance.now();
    bijwerkenVoortgang();

    bolletjesVlak.innerHTML = "";
    for (const getal of huidigeOpgave.getallen) {
      const bol = document.createElement("button");
      bol.type = "button";
      bol.className = "volgorde-bolletje";
      bol.textContent = String(getal);
      bol.setAttribute("aria-label", `Getal ${getal}`);
      bol.addEventListener("click", () => verwerkTik(getal, bol));
      bolletjesVlak.appendChild(bol);
    }
  }

  async function verwerkTik(getal, bolEl) {
    if (bezigMetFeedback || bolEl.disabled) return;

    try {
      const verwacht = huidigeOpgave.oplossing[volgendeIndex];

      if (getal === verwacht) {
        bolEl.disabled = true;
        bolEl.classList.add("volgorde-bolletje--opgelost");
        speelGoedGeluid();

        const chip = document.createElement("span");
        chip.className = "volgorde-chip";
        chip.textContent = String(getal);
        antwoordRij.appendChild(chip);

        volgendeIndex += 1;

        if (volgendeIndex >= huidigeOpgave.oplossing.length) {
          bezigMetFeedback = true;
          aantalGoedTotaal += 1;
          const tijdBesteed = Math.round(performance.now() - startTijdOpgave);
          await recordAnswer({
            exerciseId: EXERCISE_ID,
            correct: true,
            timeMs: tijdBesteed,
            meta: { ...huidigeOpgave.meta, hadFout: hadFoutBijDezeOpgave },
          });

          if (!hadFoutBijDezeOpgave) {
            feedbackVlak.className = "feedback-vlak feedback-vlak--goed";
            feedbackVlak.textContent = `✓ ${geefCompliment(profielNaam)}`;
            voortgangCirkels.zetStatus(opgaveIndex, "goed");
            rewardTracker.registreerGoed(1, feedbackVlak);
          } else {
            feedbackVlak.className = "feedback-vlak feedback-vlak--tweede-poging-goed";
            feedbackVlak.textContent = `✓ ${geefCompliment(profielNaam)} (goed op volgorde!)`;
            voortgangCirkels.zetStatus(opgaveIndex, "tweedePogingGoed");
            rewardTracker.registreerGoed(2, feedbackVlak);
          }
          raket.goedAntwoord();
          bijwerkenVoortgang();
          setTimeout(() => {
            opgaveIndex += 1;
            toonOpgave();
          }, 1600);
        }
      } else {
        hadFoutBijDezeOpgave = true;
        speelFoutGeluid();
        raket.foutAntwoord();
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = geefFoutmelding();
        bolEl.classList.add("volgorde-bolletje--fout");
        setTimeout(() => bolEl.classList.remove("volgorde-bolletje--fout"), 400);
      }
    } catch (fout) {
      console.error("Onverwachte fout bij verwerken tik:", fout);
      bezigMetFeedback = false;
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
