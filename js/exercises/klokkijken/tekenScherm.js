// exercises/klokkijken/tekenScherm.js
// -----------------------------------------------------------------------------
// Het 'tekenen'-oefenscherm: het kind zet zelf de wijzers op de klok voor een
// opgegeven tijd. Klik op de klok om de geselecteerde wijzer te plaatsen;
// de kleine wijzer snapt naar uren én halfuren, de grote naar heel/half.
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
import { bouwTekenKlok, klikNaarHoek, tijdNaarHoeken } from "../../utils/klokSvg.js";

const EXERCISE_ID = "klokkijken";

const HANDEN = [
  { id: "minuut", label: "Grote wijzer", icoon: "🔵", kleur: "#4f8fe8" },
  { id: "uur", label: "Kleine wijzer", icoon: "🔴", kleur: "#e8735a" },
];

/**
 * Start de teken-sessie.
 * @param {HTMLElement} container
 * @param {Object} instellingen - { modus, opgaveType, aantalOpgaven }
 * @param {Function} opKlaar - callback({ opnieuw: bool })
 */
export function startTekenSessie(container, instellingen, opKlaar) {
  const gebruikteSleutels = new Set();
  let opgaveIndex = 0;
  let aantalGoedTotaal = 0;
  let startTijdOpgave = performance.now();
  let huidigeOpgave = null;
  let bezigMetFeedback = false;
  let pogingNummer = 1;
  let gekozenHand = "minuut";
  let kindUurHoek = null;
  let kindMinuutHoek = null;

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

  // --- Vraag ---
  const vraagVlak = document.createElement("div");
  vraagVlak.className = "opgave-vraag";
  vraagVlak.setAttribute("aria-live", "polite");
  container.appendChild(vraagVlak);

  // --- Klok (klikbaar) ---
  const klokHouder = document.createElement("div");
  klokHouder.className = "klok-houder";
  container.appendChild(klokHouder);

  const hint = document.createElement("p");
  hint.style.cssText = "text-align:center;color:#5b6472;margin:8px 0 0;";
  hint.textContent = "Klik op de klok om een wijzer te zetten.";
  container.appendChild(hint);

  // --- Handkeuze ---
  const handRij = document.createElement("div");
  handRij.className = "keuze-rij";
  handRij.setAttribute("role", "group");
  handRij.setAttribute("aria-label", "Kies welke wijzer je zet");
  container.appendChild(handRij);

  const handKnoppen = [];
  for (const hand of HANDEN) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = `${hand.icoon} ${hand.label}`;
    knop.addEventListener("click", () => {
      if (bezigMetFeedback) return;
      gekozenHand = hand.id;
      werkHandKnoppenBij();
    });
    handKnoppen.push({ knop, id: hand.id });
    handRij.appendChild(knop);
  }

  function werkHandKnoppenBij() {
    for (const item of handKnoppen) {
      item.knop.setAttribute("aria-pressed", String(item.id === gekozenHand));
      item.knop.style.outline = item.id === gekozenHand ? "3px solid #1f2937" : "none";
    }
  }

  // --- Klaar-knop ---
  const klaarKnop = document.createElement("button");
  klaarKnop.type = "button";
  klaarKnop.className = "knop knop--primair";
  klaarKnop.style.display = "block";
  klaarKnop.style.margin = "12px auto";
  klaarKnop.textContent = "✅ Klaar";
  klaarKnop.addEventListener("click", verwerkAntwoord);
  container.appendChild(klaarKnop);

  // --- Feedback ---
  const feedbackVlak = document.createElement("div");
  feedbackVlak.className = "feedback-vlak";
  feedbackVlak.setAttribute("aria-live", "polite");
  container.appendChild(feedbackVlak);

  function bijwerkenVoortgang() {
    voortgangTekst.textContent = `Opgave ${Math.min(opgaveIndex + 1, instellingen.aantalOpgaven)} van ${instellingen.aantalOpgaven} — ${aantalGoedTotaal} goed`;
  }

  function werkKlaarKnopBij() {
    const compleet = kindUurHoek != null && kindMinuutHoek != null;
    klaarKnop.disabled = !compleet || bezigMetFeedback;
  }

  /** Tekent de klok (met geplaatste wijzers) en koppelt de klik-afhandeling. */
  function renderKlok() {
    klokHouder.innerHTML = "";
    const svg = bouwTekenKlok({ uurHoek: kindUurHoek, minuutHoek: kindMinuutHoek });
    svg.style.cursor = "pointer";
    svg.addEventListener("click", (gebeurtenis) => {
      if (bezigMetFeedback) return;
      const hoek = klikNaarHoek(gebeurtenis.clientX, gebeurtenis.clientY, svg);
      if (gekozenHand === "uur") {
        kindUurHoek = Math.round(hoek / 15) * 15 % 360;
      } else {
        kindMinuutHoek = Math.round(hoek / 180) * 180 % 360;
      }
      renderKlok();
      werkKlaarKnopBij();
    });
    klokHouder.appendChild(svg);
  }

  function toonOpgave() {
    if (opgaveIndex >= instellingen.aantalOpgaven) {
      toonEindscherm();
      return;
    }
    bezigMetFeedback = false;
    pogingNummer = 1;
    gekozenHand = "minuut";
    kindUurHoek = null;
    kindMinuutHoek = null;
    feedbackVlak.className = "feedback-vlak";
    feedbackVlak.textContent = "";

    huidigeOpgave = genereerUniekeOpgave(
      () => genereerOpgave(instellingen),
      opgaveNaarSleutel,
      gebruikteSleutels
    );
    startTijdOpgave = performance.now();
    bijwerkenVoortgang();

    vraagVlak.innerHTML = `Teken: <span class="getal-groot">${huidigeOpgave.antwoord}</span>`;
    werkHandKnoppenBij();
    renderKlok();
    werkKlaarKnopBij();
  }

  async function verwerkAntwoord() {
    if (bezigMetFeedback) return;
    if (kindUurHoek == null || kindMinuutHoek == null) return;

    const doel = tijdNaarHoeken(huidigeOpgave.uur, huidigeOpgave.minuten);
    const isGoed = kindUurHoek === doel.uurHoek && kindMinuutHoek === doel.minuutHoek;
    const tijdBesteed = Math.round(performance.now() - startTijdOpgave);

    try {
      if (isGoed) {
        bezigMetFeedback = true;
        aantalGoedTotaal += 1;
        await recordAnswer({
          exerciseId: EXERCISE_ID,
          correct: true,
          timeMs: tijdBesteed,
          meta: { ...huidigeOpgave.meta, teken: true, pogingen: pogingNummer },
        });
        feedbackVlak.className = "feedback-vlak feedback-vlak--goed";
        feedbackVlak.textContent = `✓ ${geefCompliment(profielNaam)}`;
        voortgangCirkels.zetStatus(opgaveIndex, pogingNummer === 1 ? "goed" : "tweedePogingGoed");
        speelGoedGeluid();
        raket.goedAntwoord();
        rewardTracker.registreerGoed(pogingNummer, feedbackVlak);
        bijwerkenVoortgang();
        werkKlaarKnopBij();
        setTimeout(() => {
          opgaveIndex += 1;
          toonOpgave();
        }, 1600);
      } else if (pogingNummer === 1) {
        pogingNummer = 2;
        rewardTracker.registreerFout();
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = `${geefFoutmelding()} Kijk nog eens goed naar de wijzers.`;
        speelFoutGeluid();
      } else {
        bezigMetFeedback = true;
        await recordAnswer({
          exerciseId: EXERCISE_ID,
          correct: false,
          timeMs: tijdBesteed,
          meta: { ...huidigeOpgave.meta, teken: true, pogingen: 2 },
        });
        // Toon het juiste antwoord
        klokHouder.innerHTML = "";
        klokHouder.appendChild(bouwTekenKlok({ uurHoek: doel.uurHoek, minuutHoek: doel.minuutHoek }));
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = `${geefFoutmelding()} Het juiste antwoord is ${huidigeOpgave.antwoord}.`;
        speelFoutGeluid();
        raket.foutAntwoord();
        voortgangCirkels.zetStatus(opgaveIndex, "fout");
        bijwerkenVoortgang();
        werkKlaarKnopBij();
        setTimeout(() => {
          opgaveIndex += 1;
          toonOpgave();
        }, 1900);
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