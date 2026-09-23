// exercises/complex/oefenscherm.js
// -----------------------------------------------------------------------------
// Het oefenscherm van de complexe meerstaps-verhaaltjessommen.
// Toont verhaaltjes één voor één, verwerkt antwoorden, geeft feedback.
// 2 pogingen per opgave. Cijfertoetsenbord (uitdagend) of meerkeuze (makkelijk).
// Groen/oranje/rood cirkels voor voortgang.
// -----------------------------------------------------------------------------

import { recordAnswer, getActiefProfielId, listProfielen } from "../../storage.js";
import { bouwCijferInvoer, bouwMeerkeuzeInvoer, genereerFoutePlusMinAntwoorden } from "../../utils/invoerModus.js";
import { genereerOpgave, opgaveNaarSleutel } from "./opgaven.js";
import { genereerUniekeOpgave } from "../../utils/willekeurig.js";
import { geefCompliment, geefFoutmelding } from "../../utils/complimenten.js";
import { speelGoedGeluid, speelFoutGeluid } from "../../utils/geluid.js";
import { maakVoortgangCirkels } from "../../utils/voortgangCirkels.js";
import { maakRewardTracker, toonBadgeUnlocks, toonRewardResultaat, verversCoinCounter } from "../../utils/rewards.js";
import { berekenPunten, slaSessieOp, toonPuntenAnimatie } from "../../utils/punten.js";
import { toonPerfecteScoreAnimatie } from "../../utils/eindeAnimatie.js";
import { maakRaketAnimatie, toonEindAnimatie } from "../../utils/voortgangAnimatie.js";

const EXERCISE_ID = "complex";

/**
 * Start de oefensessie.
 * @param {HTMLElement} container
 * @param {Object} instellingen - { moeilijkheid: string, aantalOpgaven: number }
 * @param {Function} opKlaar - callback(resultaten) als alle opgaven gedaan zijn.
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

  // --- Voortgangscirkels (groen/oranje/rood) ---
  const voortgangCirkels = maakVoortgangCirkels(container, instellingen.aantalOpgaven);

  // --- Voortgangsanimatie ---
  const raket = maakRaketAnimatie(container, instellingen.aantalOpgaven);

  // --- Reward tracker ---
  const rewardTracker = maakRewardTracker(EXERCISE_ID, instellingen.aantalOpgaven);

  // --- Vraagtekst ---
  const vraagVlak = document.createElement("div");
  vraagVlak.className = "opgave-vraag";
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
    vraagVlak.innerHTML = `<div class="vraag-tekst" style="font-size:16px;line-height:1.6;max-width:600px;margin:0 auto;">${huidigeOpgave.vraagTekst}</div>`;

    if (instellingen.moeilijkheid === "makkelijk") {
      opruimHuidigeInvoer = bouwMeerkeuzeInvoer(
        invoerVlak,
        verwerkAntwoord,
        huidigeOpgave.antwoordGoed,
        genereerFoutePlusMinAntwoorden(huidigeOpgave.antwoordGoed)
      );
    } else {
      // Uitdagend: cijfertoetsenbord, max 3 of 4 cijfers
      const maxCijfers = huidigeOpgave.antwoordGoed >= 100 ? 4 : 3;
      opruimHuidigeInvoer = bouwCijferInvoer(invoerVlak, verwerkAntwoord, () => bezigMetFeedback, maxCijfers);
    }
  }

  async function verwerkAntwoord(antwoordVanKind) {
    if (bezigMetFeedback) return;
    try {
      const isGoed = Number(antwoordVanKind) === Number(huidigeOpgave.antwoordGoed);
      const tijdBesteed = Math.round(performance.now() - startTijdOpgave);

      if (isGoed) {
            bezigMetFeedback = true;
            aantalGoedTotaal += 1;
            raket.goedAntwoord();

            recordAnswer({
          correct: true,
          timeMs: tijdBesteed,
          meta: { ...huidigeOpgave.meta, pogingen: pogingNummer },
        });
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
        rewardTracker.registreerGoed(pogingNummer, feedbackVlak);
        bijwerkenVoortgang();
        setTimeout(() => {
          opgaveIndex += 1;
          toonOpgave();
        }, 1600);
      } else if (pogingNummer === 1) {
        // Eerste poging fout: oranje, nog een kans
        pogingNummer = 2;
        raket.foutAntwoord();
        rewardTracker.registreerFout();
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = `${geefFoutmelding()} Probeer het nog eens.`;
        speelFoutGeluid();
        if (opruimHuidigeInvoer) opruimHuidigeInvoer();
        if (instellingen.moeilijkheid === "makkelijk") {
          opruimHuidigeInvoer = bouwMeerkeuzeInvoer(
            invoerVlak,
            verwerkAntwoord,
            huidigeOpgave.antwoordGoed,
            genereerFoutePlusMinAntwoorden(huidigeOpgave.antwoordGoed)
          );
        } else {
          const maxCijfers = huidigeOpgave.antwoordGoed >= 100 ? 4 : 3;
          opruimHuidigeInvoer = bouwCijferInvoer(invoerVlak, verwerkAntwoord, () => bezigMetFeedback, maxCijfers);
        }
      } else {
        // Tweede poging ook fout: toon juiste antwoord
        bezigMetFeedback = true;
        raket.foutAntwoord();
        await recordAnswer({
          exerciseId: EXERCISE_ID,
          correct: false,
          timeMs: tijdBesteed,
          meta: { ...huidigeOpgave.meta, pogingen: 2 },
        });
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = `${geefFoutmelding()} Het juiste antwoord is ${huidigeOpgave.antwoordGoed}.`;
        speelFoutGeluid();
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