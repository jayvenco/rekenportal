// exercises/redactiesommen/oefenscherm.js
import { recordAnswer } from "../../storage.js";
import { genereerOpgave, opgaveNaarSleutel } from "./opgaven.js";
import { genereerUniekeOpgave } from "../../utils/willekeurig.js";
import { geefCompliment, geefFoutmelding } from "../../utils/complimenten.js";
import { speelGoedGeluid, speelFoutGeluid } from "../../utils/geluid.js";
import { maakVoortgangCirkels } from "../../utils/voortgangCirkels.js";
import { maakRewardTracker, toonRewardResultaat, verversCoinCounter, toonBadgeUnlocks } from "../../utils/rewards.js";
import { maakRaketAnimatie, toonEindAnimatie } from "../../utils/raketAnimatie.js";
import { toonPerfecteScoreAnimatie } from "../../utils/eindeAnimatie.js";

const EXERCISE_ID = "redactiesommen";

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

  function bijwerkenVoortgang() {
    voortgangTekst.textContent = "Opgave " + Math.min(opgaveIndex + 1, instellingen.aantalOpgaven) + " van " + instellingen.aantalOpgaven + " — " + aantalGoedTotaal + " goed";
  }

  function toonOpgave() {
    if (opgaveIndex >= instellingen.aantalOpgaven) { toonEindscherm(); return; }
    bezigMetFeedback = false; pogingNummer = 1; huidigeWaarde = "";
    feedbackVlak.className = "feedback-vlak"; feedbackVlak.textContent = "";
    if (opruimHuidigeInvoer) { opruimHuidigeInvoer(); opruimHuidigeInvoer = null; }
    huidigeOpgave = genereerUniekeOpgave(() => genereerOpgave(instellingen), opgaveNaarSleutel, gebruikteSleutels);
    startTijdOpgave = performance.now();
    bijwerkenVoortgang();
    vraagVlak.innerHTML = "<div style="font-size:18px;line-height:1.6;padding:12px;background:#f8faff;border-radius:12px;border:2px solid #e2e8f0;">" + huidigeOpgave.vraagTekst + "</div>";
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

    function toon() { scherm.textContent = huidigeWaarde.replace(".", ","); }

    [ [1,2,3], [4,5,6], [7,8,9] ].forEach(rij => {
      rij.forEach(c => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "cijfer-toets"; b.textContent = String(c);
        b.addEventListener("click", () => { if (huidigeWaarde.length < 7) { huidigeWaarde += String(c); toon(); } });
        pad.appendChild(b);
      });
    });

    const m = document.createElement("div"); m.style.display = "contents";
    const minKnop = document.createElement("button");
    minKnop.type = "button"; minKnop.className = "cijfer-toets"; minKnop.textContent = "−";
    minKnop.addEventListener("click", () => { if (huidigeWaarde === "") huidigeWaarde = "-"; toon(); });
    pad.appendChild(minKnop);

    const nul = document.createElement("button");
    nul.type = "button"; nul.className = "cijfer-toets"; nul.textContent = "0";
    nul.addEventListener("click", () => { if (huidigeWaarde.length < 7) { huidigeWaarde += "0"; toon(); } });
    pad.appendChild(nul);

    const wis = document.createElement("button");
    wis.type = "button"; wis.className = "cijfer-toets"; wis.textContent = "⌫";
    wis.addEventListener("click", () => { huidigeWaarde = huidigeWaarde.slice(0, -1); toon(); });
    pad.appendChild(wis);

    const bevestig = document.createElement("button");
    bevestig.type = "button"; bevestig.className = "cijfer-toets";
    bevestig.style.cssText = "background:#38b26a;color:#fff;grid-column:span 2;";
    bevestig.textContent = "✓ Bevestig";
    bevestig.addEventListener("click", () => { if (huidigeWaarde !== "" && huidigeWaarde !== "-") verwerkAntwoord(huidigeWaarde); });
    pad.appendChild(bevestig);

    container.appendChild(pad);
    const h = (e) => {
      const k = e.key;
      if (/^[0-9]$/.test(k)) { if (huidigeWaarde.length < 7) { huidigeWaarde += k; toon(); } }
      else if (k === "Backspace") { huidigeWaarde = huidigeWaarde.slice(0, -1); toon(); }
      else if (k === "Enter" && huidigeWaarde !== "" && huidigeWaarde !== "-") verwerkAntwoord(huidigeWaarde);
    };
    document.addEventListener("keydown", h);
    opruimHuidigeInvoer = () => document.removeEventListener("keydown", h);
  }

  function verwerkAntwoord(ingave) {
    if (bezigMetFeedback) return;
    const ingaveNum = Number(ingave.replace(",", "."));
    const isGoed = Number.isFinite(ingaveNum) && ingaveNum === huidigeOpgave.antwoordGoed.normaal;
    const tijd = Math.round(performance.now() - startTijdOpgave);

    if (isGoed) {
      bezigMetFeedback = true;
      aantalGoedTotaal += 1;
      raket.goedAntwoord();
      recordAnswer({ exerciseId: EXERCISE_ID, correct: true, timeMs: tijd, meta: { pogingen: pogingNummer } }).catch(() => {});
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
      recordAnswer({ exerciseId: EXERCISE_ID, correct: false, timeMs: tijd, meta: { pogingen: 2 } }).catch(() => {});
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = geefFoutmelding() + " Het juiste antwoord is " + huidigeOpgave.antwoordGoed.display + ".";
      speelFoutGeluid();
      voortgangCirkels.zetStatus(opgaveIndex, "fout");
      setTimeout(() => { opgaveIndex += 1; toonOpgave(); }, 1600);
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
    const raketEind = toonEindAnimatie(kaart, pct);
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
