// exercises/schaal/oefenscherm.js
// -----------------------------------------------------------------------------
// Oefenscherm "Rekenen op schaal": toont per opgave een afbeelding (plattegrond,
// kaart of liniaal met model), een info-regel over de schaal, de vraag, een
// hint-knop en de invoer met eenheid. Na een fout komt de hint automatisch;
// na afloop (tweede poging of fout) staat de uitleg met verhoudingstabel klaar.
// -----------------------------------------------------------------------------

import { recordAnswer, getActiefProfielId, listProfielen } from "../../storage.js";
import { genereerOpgave, opgaveNaarSleutel, isAntwoordGoed, antwoordTekst } from "./opgaven.js";
import { afbeeldingSvg } from "./afbeeldingen.js";
import { bouwDecimaleInvoer } from "./invoer.js";
import { voegSchaalStijlToe, tabelHtml } from "./stijl.js";
import { genereerUniekeOpgave } from "../../utils/willekeurig.js";
import { geefCompliment, geefFoutmelding } from "../../utils/complimenten.js";
import { speelGoedGeluid, speelFoutGeluid } from "../../utils/geluid.js";
import { maakRaketAnimatie, toonEindAnimatie } from "../../utils/voortgangAnimatie.js";
import { maakVoortgangCirkels } from "../../utils/voortgangCirkels.js";
import { maakRewardTracker, toonBadgeUnlocks, toonRewardResultaat, verversCoinCounter } from "../../utils/rewards.js";
import { toonPerfecteScoreAnimatie } from "../../utils/eindeAnimatie.js";

const EXERCISE_ID = "schaal";

/**
 * @param {HTMLElement} container
 * @param {{soort:string, niveau:number, aantalOpgaven:number}} instellingen
 * @param {Function} opKlaar - callback({opnieuw})
 */
export function startOefensessie(container, instellingen, opKlaar) {
  voegSchaalStijlToe();
  const gebruikteSleutels = new Set();
  let opgaveIndex = 0;
  let aantalGoedTotaal = 0;
  let startTijdOpgave = performance.now();
  let huidigeOpgave = null;
  let bezigMetFeedback = false;
  let pogingNummer = 1;
  let opruimHuidigeInvoer = null;
  let profielNaam = "";
  let autoVolgendeTimer = null;

  container.innerHTML = "";

  (async () => {
    const profielId = getActiefProfielId();
    if (profielId !== null) {
      const profiel = (await listProfielen()).find((p) => p.id === profielId);
      if (profiel) profielNaam = profiel.naam;
    }
  })();

  const koppenRij = document.createElement("div");
  koppenRij.className = "oefen-koppen";
  const voortgangTekst = document.createElement("span");
  voortgangTekst.className = "voortgang-tekst";
  koppenRij.appendChild(voortgangTekst);
  container.appendChild(koppenRij);

  const voortgangCirkels = maakVoortgangCirkels(container, instellingen.aantalOpgaven);
  // De raketbaan komt onderaan, zodat de afbeelding en de vraag direct zichtbaar zijn.
  const raketHouder = document.createElement("div");
  const raket = maakRaketAnimatie(raketHouder, instellingen.aantalOpgaven);
  const rewardTracker = maakRewardTracker(EXERCISE_ID, instellingen.aantalOpgaven);

  const plaatVlak = document.createElement("div");
  plaatVlak.className = "schaal-plaat";
  const infoVlak = document.createElement("div");
  infoVlak.className = "schaal-info";
  const vraagVlak = document.createElement("div");
  vraagVlak.className = "schaal-vraag";
  vraagVlak.setAttribute("aria-live", "polite");
  const hintRij = document.createElement("div");
  hintRij.className = "schaal-hint-rij";
  const hintKnop = document.createElement("button");
  hintKnop.type = "button";
  hintKnop.className = "knop knop--zacht";
  hintKnop.textContent = "💡 Hint";
  const hintVlak = document.createElement("div");
  hintVlak.className = "schaal-hint";
  hintVlak.hidden = true;
  hintRij.appendChild(hintKnop);
  const feedbackVlak = document.createElement("div");
  feedbackVlak.className = "feedback-vlak";
  feedbackVlak.setAttribute("aria-live", "polite");
  const invoerVlak = document.createElement("div");
  const uitlegVlak = document.createElement("div");
  container.append(plaatVlak, infoVlak, vraagVlak, hintRij, hintVlak, feedbackVlak, invoerVlak, uitlegVlak, raketHouder);

  hintKnop.addEventListener("click", () => {
    hintVlak.hidden = !hintVlak.hidden;
    hintKnop.textContent = hintVlak.hidden ? "💡 Hint" : "💡 Verberg hint";
  });

  function bijwerkenVoortgang() {
    voortgangTekst.textContent = `Opgave ${Math.min(opgaveIndex + 1, instellingen.aantalOpgaven)} van ${instellingen.aantalOpgaven} — ${aantalGoedTotaal} goed`;
  }

  function toonInvoer() {
    if (opruimHuidigeInvoer) opruimHuidigeInvoer();
    opruimHuidigeInvoer = bouwDecimaleInvoer(invoerVlak, verwerkAntwoord, () => bezigMetFeedback, {
      eenheid: huidigeOpgave.eenheid,
      voorvoegsel: huidigeOpgave.voorvoegsel,
      maxTekens: huidigeOpgave.voorvoegsel ? 7 : 8,
    });
  }

  function toonOpgave() {
    if (opgaveIndex >= instellingen.aantalOpgaven) { toonEindscherm(); return; }
    clearTimeout(autoVolgendeTimer);
    bezigMetFeedback = false;
    pogingNummer = 1;
    feedbackVlak.className = "feedback-vlak";
    feedbackVlak.textContent = "";
    uitlegVlak.innerHTML = "";
    hintVlak.hidden = true;
    hintKnop.textContent = "💡 Hint";

    huidigeOpgave = genereerUniekeOpgave(() => genereerOpgave(instellingen), opgaveNaarSleutel, gebruikteSleutels);
    startTijdOpgave = performance.now();
    bijwerkenVoortgang();

    plaatVlak.innerHTML = afbeeldingSvg(huidigeOpgave.afbeelding);
    plaatVlak.hidden = !huidigeOpgave.afbeelding;
    infoVlak.innerHTML = `ℹ️ ${huidigeOpgave.info}`;
    vraagVlak.innerHTML = huidigeOpgave.vraag;
    hintVlak.innerHTML = `💡 ${huidigeOpgave.hint}`;
    toonInvoer();
  }

  function toonUitleg() {
    const o = huidigeOpgave;
    uitlegVlak.innerHTML =
      `<div class="schaal-uitleg"><h3>Zo reken je het uit</h3>` +
      `<ol>${o.stappen.map((s) => `<li>${s}</li>`).join("")}</ol>` +
      `${tabelHtml(o.tabel)}</div>`;
    const rij = document.createElement("div");
    rij.className = "schaal-volgende";
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "knop knop--primair";
    knop.textContent = opgaveIndex + 1 >= instellingen.aantalOpgaven ? "Klaar ✓" : "Volgende opgave ›";
    knop.addEventListener("click", () => { opgaveIndex += 1; toonOpgave(); });
    rij.appendChild(knop);
    uitlegVlak.appendChild(rij);
    knop.focus({ preventScroll: true });
    uitlegVlak.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function sluitInvoerAf() {
    if (opruimHuidigeInvoer) { opruimHuidigeInvoer(); opruimHuidigeInvoer = null; }
    invoerVlak.innerHTML = "";
  }

  async function verwerkAntwoord(antwoordVanKind) {
    if (bezigMetFeedback) return;
    try {
      const o = huidigeOpgave;
      const isGoed = isAntwoordGoed(antwoordVanKind, o);
      const tijdBesteed = Math.round(performance.now() - startTijdOpgave);
      const rapport = { vraag: o.rapport, gegeven: antwoordTekst(o, antwoordVanKind), juist: antwoordTekst(o) };

      if (isGoed) {
        bezigMetFeedback = true;
        aantalGoedTotaal += 1;
        await recordAnswer({ exerciseId: EXERCISE_ID, correct: true, timeMs: tijdBesteed, ...rapport, meta: { ...o.meta, pogingen: pogingNummer } });
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
        raket.goedAntwoord(pogingNummer);
        rewardTracker.registreerGoed(pogingNummer, feedbackVlak);
        bijwerkenVoortgang();
        sluitInvoerAf();
        if (pogingNummer === 1) {
          autoVolgendeTimer = setTimeout(() => { opgaveIndex += 1; toonOpgave(); }, 1600);
        } else {
          toonUitleg();
        }
      } else if (pogingNummer === 1) {
        pogingNummer = 2;
        rewardTracker.registreerFout();
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = `${geefFoutmelding()} Probeer het nog eens.`;
        hintVlak.innerHTML = `💡 ${o.hint}`;
        hintVlak.hidden = false;
        hintKnop.textContent = "💡 Verberg hint";
        speelFoutGeluid();
        toonInvoer();
      } else {
        bezigMetFeedback = true;
        await recordAnswer({ exerciseId: EXERCISE_ID, correct: false, timeMs: tijdBesteed, ...rapport, meta: { ...o.meta, pogingen: 2 } });
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = `${geefFoutmelding()} Het juiste antwoord is ${antwoordTekst(o)}.`;
        speelFoutGeluid();
        raket.foutAntwoord();
        voortgangCirkels.zetStatus(opgaveIndex, "fout");
        bijwerkenVoortgang();
        sluitInvoerAf();
        toonUitleg();
      }
    } catch (fout) {
      console.error("Onverwachte fout bij verwerken antwoord:", fout);
      bezigMetFeedback = false;
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = "Er ging iets mis, probeer de volgende opgave.";
      setTimeout(() => { opgaveIndex += 1; toonOpgave(); }, 2000);
    }
  }

  function toonEindscherm() {
    sluitInvoerAf();
    clearTimeout(autoVolgendeTimer);
    container.innerHTML = "";

    const kaart = document.createElement("div");
    kaart.className = "kaart";
    kaart.style.textAlign = "center";
    const titel = document.createElement("h2");
    const pct = (aantalGoedTotaal / instellingen.aantalOpgaven) * 100;
    if (pct === 100) toonPerfecteScoreAnimatie();
    titel.textContent = pct >= 70 ? "Goed gedaan!" : "Bijna! Nog even oefenen.";
    kaart.appendChild(titel);
    toonEindAnimatie(kaart, pct);

    const resultaat = document.createElement("p");
    resultaat.style.cssText = "font-size:24px;font-weight:700;color:#1f2937";
    resultaat.textContent = `Je had ${aantalGoedTotaal} van de ${instellingen.aantalOpgaven} goed!`;
    kaart.appendChild(resultaat);
    const rewardVlak = document.createElement("div");
    kaart.appendChild(rewardVlak);
    const compliment = document.createElement("p");
    compliment.style.fontSize = "20px";
    compliment.textContent = geefCompliment(profielNaam);
    kaart.appendChild(compliment);

    const acties = document.createElement("div");
    acties.className = "acties-rij";
    const nogEen = document.createElement("button");
    nogEen.type = "button";
    nogEen.className = "knop knop--primair";
    nogEen.textContent = "Nog een keer";
    nogEen.addEventListener("click", () => opKlaar({ opnieuw: true }));
    const terug = document.createElement("button");
    terug.type = "button";
    terug.className = "knop knop--zacht";
    terug.textContent = "Terug naar het menu";
    terug.addEventListener("click", () => opKlaar({ opnieuw: false }));
    acties.append(nogEen, terug);
    kaart.appendChild(acties);
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
