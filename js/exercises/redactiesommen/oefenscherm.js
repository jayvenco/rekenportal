// exercises/redactiesommen/oefenscherm.js
import { recordAnswer, vraagHint } from "../../storage.js";
import { genereerOpgave, opgaveNaarSleutel } from "./opgaven.js";
import { genereerUniekeOpgave } from "../../utils/willekeurig.js";
import { geefCompliment, geefFoutmelding } from "../../utils/complimenten.js";
import { speelGoedGeluid, speelFoutGeluid } from "../../utils/geluid.js";
import { maakVoortgangCirkels } from "../../utils/voortgangCirkels.js";
import { maakRewardTracker, toonRewardResultaat, verversCoinCounter, toonBadgeUnlocks } from "../../utils/rewards.js";
import { maakRaketAnimatie, toonEindAnimatie } from "../../utils/voortgangAnimatie.js";
import { toonPerfecteScoreAnimatie } from "../../utils/eindeAnimatie.js";

const EXERCISE_ID = "redactiesommen";
const MAX_INVOER = 12; // groter dan voorheen, voor grote getallen (bv. 12.550.000.000) en decimalen

export function toonOefeningScherm(container, instellingen) {
  const gebruikteSleutels = new Set();
  let opgaveIndex = 0, aantalGoedTotaal = 0, startTijdOpgave, huidigeOpgave, bezigMetFeedback = false, pogingNummer = 1;
  let opruimHuidigeInvoer = null, huidigeWaarde = "";

  container.innerHTML = "";
  const raket = maakRaketAnimatie(container, instellingen.aantalOpgaven);
  raket.element.style.marginBottom = "10px";

  const koppenRij = document.createElement("div");
  koppenRij.className = "oefen-koppen";
  const voortgangTekst = document.createElement("span");
  voortgangTekst.className = "voortgang-tekst";
  koppenRij.appendChild(voortgangTekst);
  container.appendChild(koppenRij);

  const voortgangCirkels = maakVoortgangCirkels(container, instellingen.aantalOpgaven);
  const rewardTracker = maakRewardTracker(EXERCISE_ID, instellingen.aantalOpgaven);

  const vraagVlak = document.createElement("div");
  vraagVlak.className = "opgave-vraag";
  vraagVlak.setAttribute("aria-live", "polite");
  container.appendChild(vraagVlak);

  const feedbackVlak = document.createElement("div");
  feedbackVlak.className = "feedback-vlak";
  container.appendChild(feedbackVlak);

  const invoerVlak = document.createElement("div");
  container.appendChild(invoerVlak);

  // --- Hint ---
  const hintKnop = document.createElement("button");
  hintKnop.type = "button";
  hintKnop.className = "knop knop--zacht";
  hintKnop.style.cssText = "display:block;margin:0 auto 8px;font-size:15px;";
  hintKnop.textContent = "💡 Hint";
  hintKnop.addEventListener("click", toonHint);
  container.appendChild(hintKnop);

  const hintVlak = document.createElement("div");
  hintVlak.setAttribute("aria-live", "polite");
  container.appendChild(hintVlak);

  function bijwerkenVoortgang() {
    voortgangTekst.textContent = "Opgave " + Math.min(opgaveIndex + 1, instellingen.aantalOpgaven) + " van " + instellingen.aantalOpgaven + " — " + aantalGoedTotaal + " goed";
  }

  async function toonHint() {
    if (!huidigeOpgave || bezigMetFeedback) return;
    hintVlak.style.cssText = "font-size:15px;line-height:1.55;color:#4a5568;text-align:left;padding:10px 14px;margin:4px 0 8px;background:#fef7e6;border:2px solid #f0d48a;border-radius:10px;";
    hintVlak.textContent = "Even nadenken…";
    const resultaat = await vraagHint(huidigeOpgave.vraagTekst, huidigeOpgave.meta?.categorie, pogingNummer);
    if (hintVlak.textContent === "Even nadenken…") {
      hintVlak.textContent = resultaat && resultaat.hint ? "💡 " + resultaat.hint : "💡 Lees de som rustig. Bedenk wat er wordt gevraagd en welke bewerking je nodig hebt.";
    }
  }

  function toonOpgave() {
    if (opgaveIndex >= instellingen.aantalOpgaven) { toonEindscherm(); return; }
    bezigMetFeedback = false; pogingNummer = 1; huidigeWaarde = "";
    feedbackVlak.className = "feedback-vlak"; feedbackVlak.textContent = "";
    hintVlak.textContent = "";
    if (opruimHuidigeInvoer) { opruimHuidigeInvoer(); opruimHuidigeInvoer = null; }
    huidigeOpgave = genereerUniekeOpgave(() => genereerOpgave(instellingen), opgaveNaarSleutel, gebruikteSleutels);
    startTijdOpgave = performance.now();
    bijwerkenVoortgang();
    vraagVlak.innerHTML = "<div style=\"font-size:18px;line-height:1.6;padding:12px;background:#f8faff;border-radius:12px;border:2px solid #e2e8f0;\">" + huidigeOpgave.vraagTekst + "</div>";
    bouwInvoer(invoerVlak);
  }

  function bouwInvoer(container) {
    container.innerHTML = "";
    huidigeWaarde = "";
    const scherm = document.createElement("div");
    scherm.className = "antwoord-scherm";
    container.appendChild(scherm);
    const pad = document.createElement("div");
    pad.className = "cijfer-pad";

    function toon() { scherm.textContent = huidigeWaarde; }

    function voegToe(c) {
      if (huidigeWaarde.length >= MAX_INVOER) return;
      huidigeWaarde += c;
      toon();
    }

    [ [1,2,3], [4,5,6], [7,8,9] ].forEach(rij => {
      rij.forEach(c => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "cijfer-toets"; b.textContent = String(c);
        b.addEventListener("click", () => voegToe(String(c)));
        pad.appendChild(b);
      });
    });

    const nul = document.createElement("button");
    nul.type = "button"; nul.className = "cijfer-toets"; nul.textContent = "0";
    nul.addEventListener("click", () => voegToe("0"));
    pad.appendChild(nul);

    // Komma-toets (voor decimale antwoorden)
    const komma = document.createElement("button");
    komma.type = "button"; komma.className = "cijfer-toets"; komma.textContent = ",";
    komma.style.background = "#4f8fe8"; komma.style.color = "#fff";
    komma.setAttribute("aria-label", "Komma");
    komma.addEventListener("click", () => {
      if (huidigeWaarde === "" || huidigeWaarde.includes(",")) return;
      voegToe(",");
    });
    pad.appendChild(komma);

    const wis = document.createElement("button");
    wis.type = "button"; wis.className = "cijfer-toets"; wis.textContent = "⌫";
    wis.addEventListener("click", () => { huidigeWaarde = huidigeWaarde.slice(0, -1); toon(); });
    pad.appendChild(wis);

    const bevestig = document.createElement("button");
    bevestig.type = "button"; bevestig.className = "cijfer-toets";
    bevestig.style.cssText = "background:#38b26a;color:#fff;grid-column:span 3;";
    bevestig.textContent = "✓ Bevestig";
    bevestig.addEventListener("click", () => { const v = huidigeWaarde.replace(",", "."); if (v !== "" && v !== "-") verwerkAntwoord(v); });
    pad.appendChild(bevestig);

    container.appendChild(pad);
    const h = (e) => {
      const k = e.key;
      if (/^[0-9]$/.test(k)) voegToe(k);
      else if ((k === "," || k === ".") && huidigeWaarde !== "" && !huidigeWaarde.includes(",")) voegToe(",");
      else if (k === "Backspace") { huidigeWaarde = huidigeWaarde.slice(0, -1); toon(); }
      else if (k === "Enter") { const v = huidigeWaarde.replace(",", "."); if (v !== "" && v !== "-") verwerkAntwoord(v); }
    };
    document.addEventListener("keydown", h);
    opruimHuidigeInvoer = () => document.removeEventListener("keydown", h);
  }

  function verwerkAntwoord(ingave) {
    if (bezigMetFeedback) return;
    const ingaveNum = Number(ingave);
    const isGoed = Number.isFinite(ingaveNum) && Math.abs(ingaveNum - huidigeOpgave.antwoordGoed.normaal) < 1e-6;
    const tijd = Math.round(performance.now() - startTijdOpgave);

    if (isGoed) {
      bezigMetFeedback = true;
      aantalGoedTotaal += 1;
      raket.goedAntwoord();
      recordAnswer({ exerciseId: EXERCISE_ID, correct: true, timeMs: tijd, meta: { ...huidigeOpgave.meta, pogingen: pogingNummer } }).catch(() => {});
      if (pogingNummer === 1) {
        feedbackVlak.className = "feedback-vlak feedback-vlak--goed";
        feedbackVlak.textContent = "✓ " + geefCompliment();
        voortgangCirkels.zetStatus(opgaveIndex, "goed");
      } else {
        feedbackVlak.className = "feedback-vlak feedback-vlak--tweede-poging-goed";
        feedbackVlak.textContent = "✓ " + geefCompliment() + " (tweede poging!)";
        voortgangCirkels.zetStatus(opgaveIndex, "tweedePogingGoed");
      }
      speelGoedGeluid();
      rewardTracker.registreerGoed(pogingNummer, feedbackVlak);
      setTimeout(() => { opgaveIndex += 1; toonOpgave(); }, 1600);
    } else if (pogingNummer === 1) {
      pogingNummer = 2;
      raket.foutAntwoord();
      rewardTracker.registreerFout();
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = geefFoutmelding() + " Probeer het nog eens.";
      speelFoutGeluid();
      if (opruimHuidigeInvoer) opruimHuidigeInvoer();
      bouwInvoer(invoerVlak);
    } else {
      bezigMetFeedback = true;
      raket.foutAntwoord();
      recordAnswer({ exerciseId: EXERCISE_ID, correct: false, timeMs: tijd, meta: { ...huidigeOpgave.meta, pogingen: 2 } }).catch(() => {});
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = geefFoutmelding() + " Het juiste antwoord is " + huidigeOpgave.antwoordGoed.display + ".";
      speelFoutGeluid();
      voortgangCirkels.zetStatus(opgaveIndex, "fout");
      setTimeout(() => { opgaveIndex += 1; toonOpgave(); }, 1800);
    }
  }

  function toonEindscherm() {
    container.innerHTML = "";
    const kaart = document.createElement("div"); kaart.className = "kaart"; kaart.style.textAlign = "center";
    const titel = document.createElement("h2");
    const pct = (aantalGoedTotaal / instellingen.aantalOpgaven) * 100;
    if (pct === 100) toonPerfecteScoreAnimatie();
    titel.textContent = pct >= 70 ? "Goed gedaan!" : "Bijna! Nog even oefenen.";
    kaart.appendChild(titel);
    toonEindAnimatie(kaart, pct);
    const r = document.createElement("p"); r.style.cssText = "font-size:24px;font-weight:700;color:#1f2937;";
    r.textContent = "Je had " + aantalGoedTotaal + " van de " + instellingen.aantalOpgaven + " goed!";
    kaart.appendChild(r);
    const rw = document.createElement("div"); kaart.appendChild(rw);
    const a = document.createElement("div"); a.className = "acties-rij";
    const nk = document.createElement("button"); nk.type = "button"; nk.className = "knop knop--primair";
    nk.textContent = "Nog een keer";
    nk.addEventListener("click", () => toonOefeningScherm(container, instellingen));
    const tk = document.createElement("button"); tk.type = "button"; tk.className = "knop knop--zacht";
    tk.textContent = "Terug naar het menu";
    tk.addEventListener("click", () => { window.location.hash = "#/"; });
    a.append(nk, tk); kaart.appendChild(a); container.appendChild(kaart);
    (async () => {
      const rewards = await rewardTracker.voltooi();
      toonRewardResultaat(rw, rewards);
      await verversCoinCounter();
      await toonBadgeUnlocks(rewards?.badgesEarned || []);
    })();
  }

  toonOpgave();
}