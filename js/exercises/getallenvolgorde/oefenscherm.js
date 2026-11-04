// exercises/getallenvolgorde/oefenscherm.js
// -----------------------------------------------------------------------------
// Het daadwerkelijke oefenscherm van de volgorde-oefening: een kikker springt
// van lelieblad naar lelieblad. Het kind tikt de bladen aan van klein naar
// groot; elke sprong laat een boogje achter (groen bij de juiste volgorde,
// rood bij een foute sprong, waarna de kikker terugspringt). Een fout tikje
// kost geen voortgang — het lelieblad blijft gewoon aantikbaar.
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
import { bouwKikkersprong } from "./kikkersprong.js";

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
  vraagVlak.textContent = "Tik de lelieblaadjes aan van klein naar groot — laat de kikker springen!";
  container.appendChild(vraagVlak);

  // --- Het kikkersprong-speelveld (wordt per opgave opnieuw opgebouwd) ---
  const kikkersprongHouder = document.createElement("div");
  container.appendChild(kikkersprongHouder);
  let kikkersprong = null;

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

    huidigeOpgave = genereerUniekeOpgave(
      () => genereerOpgave(instellingen),
      opgaveNaarSleutel,
      gebruikteSleutels
    );
    startTijdOpgave = performance.now();
    bijwerkenVoortgang();

    kikkersprongHouder.innerHTML = "";
    kikkersprong = bouwKikkersprong(huidigeOpgave.getallen, (getal) => verwerkTik(getal));
    kikkersprongHouder.appendChild(kikkersprong.element);
  }

  async function verwerkTik(getal) {
    if (bezigMetFeedback) return;
    bezigMetFeedback = true;

    try {
      const verwacht = huidigeOpgave.oplossing[volgendeIndex];
      const isGoed = getal === verwacht;

      await kikkersprong.springNaarGetal(getal, isGoed);

      if (isGoed) {
        speelGoedGeluid();
        volgendeIndex += 1;

        if (volgendeIndex >= huidigeOpgave.oplossing.length) {
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
          raket.goedAntwoord(hadFoutBijDezeOpgave ? 2 : 1);
          bijwerkenVoortgang();
          setTimeout(() => {
            opgaveIndex += 1;
            toonOpgave();
          }, 1600);
          return; // blijf vergrendeld tot de volgende opgave getoond wordt
        }

        bezigMetFeedback = false;
      } else {
        hadFoutBijDezeOpgave = true;
        speelFoutGeluid();
        raket.foutAntwoord();
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = geefFoutmelding();
        bezigMetFeedback = false;
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
