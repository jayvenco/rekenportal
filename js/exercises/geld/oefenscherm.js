// exercises/geld/oefenscherm.js
// -----------------------------------------------------------------------------
// Oefensessie "Rekenen met geld":
//   tel    - geld wordt getoond, het kind typt het totaalbedrag.
//   betaal - een bedrag is gegeven, het kind kiest (tikken) of sleept biljetten
//            en munten uit de beschikbare voorraad naar het betaalvak.
// Twee pogingen per opgave, daarna wordt het antwoord getoond.
// -----------------------------------------------------------------------------

import { recordAnswer, getActiefProfielId, listProfielen } from "../../storage.js";
import { geefCompliment, geefFoutmelding } from "../../utils/complimenten.js";
import { speelGoedGeluid, speelFoutGeluid } from "../../utils/geluid.js";
import { maakRaketAnimatie, toonEindAnimatie } from "../../utils/voortgangAnimatie.js";
import { maakVoortgangCirkels } from "../../utils/voortgangCirkels.js";
import { maakRewardTracker, toonBadgeUnlocks, toonRewardResultaat, verversCoinCounter } from "../../utils/rewards.js";
import { toonPerfecteScoreAnimatie } from "../../utils/eindeAnimatie.js";
import { genereerUniekeOpgave } from "../../utils/willekeurig.js";
import { genereerOpgave, opgaveNaarSleutel, waardeVan, parseBedragNaarCenten } from "./opgaven.js";
import { GELDSOORTEN, soortById, maakGeldSvg, formatBedrag } from "./geldSvg.js";

const EXERCISE_ID = "geld";

function voegStijlToe() {
  if (document.getElementById("geld-stijl")) return;
  const s = document.createElement("style");
  s.id = "geld-stijl";
  s.textContent = `
  .geld-rij{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;padding:10px}
  .geld-tafel{background:#fff;border:2px solid #d9e2ec;border-radius:16px;min-height:90px}
  .geld-vak{border:3px dashed #3a9d5d;background:#f1faf4;border-radius:16px;min-height:120px;padding:8px}
  .geld-vak--over{background:#dff3e6;border-style:solid}
  .geld-vak__leeg{width:100%;text-align:center;color:#6b7b8c;font-weight:700}
  .geld-token{background:none;border:2px solid transparent;border-radius:10px;padding:2px;cursor:grab;touch-action:none;position:relative;line-height:0}
  .geld-token:focus-visible{outline:3px solid #2f6fb5}
  .geld-token[disabled]{opacity:.25;cursor:not-allowed}
  .geld-token__aantal{position:absolute;right:-4px;top:-6px;background:#2f6fb5;color:#fff;border-radius:12px;font-size:13px;font-weight:800;line-height:1;padding:3px 7px}
  .geld-spook{position:fixed;pointer-events:none;z-index:9999;opacity:.9;transform:translate(-50%,-50%)}
  .geld-invoer{font-size:1.6rem;padding:10px 14px;border:2px solid #9fb3c8;border-radius:12px;width:min(220px,100%);text-align:center}
  .geld-bedrag{font-size:2.2rem;font-weight:800;color:#2a7d49;text-align:center;margin:4px 0}
  .geld-kop{font-weight:700;margin:8px 0 2px;text-align:center}
  `;
  document.head.appendChild(s);
}

export function startOefensessie(container, instellingen, opKlaar) {
  voegStijlToe();
  const gebruikteSleutels = new Set();
  let opgaveIndex = 0;
  let aantalGoedTotaal = 0;
  let startTijdOpgave = performance.now();
  let huidigeOpgave = null;
  let bezigMetFeedback = false;
  let pogingNummer = 1;
  let profielNaam = "";
  let leesAntwoord = () => null;
  let toonOplossing = () => {};

  container.innerHTML = "";
  (async () => {
    const id = getActiefProfielId();
    if (id !== null) profielNaam = (await listProfielen()).find((p) => p.id === id)?.naam || "";
  })();

  const koppenRij = document.createElement("div");
  koppenRij.className = "oefen-koppen";
  const voortgangTekst = document.createElement("span");
  voortgangTekst.className = "voortgang-tekst";
  koppenRij.appendChild(voortgangTekst);
  container.appendChild(koppenRij);
  const voortgangCirkels = maakVoortgangCirkels(container, instellingen.aantalOpgaven);
  const raket = maakRaketAnimatie(container, instellingen.aantalOpgaven);
  const rewardTracker = maakRewardTracker(EXERCISE_ID, instellingen.aantalOpgaven);

  const vraagVlak = document.createElement("div");
  vraagVlak.className = "opgave-vraag";
  vraagVlak.style.textAlign = "center";
  vraagVlak.setAttribute("aria-live", "polite");
  const werkVlak = document.createElement("div");
  const feedbackVlak = document.createElement("div");
  feedbackVlak.className = "feedback-vlak";
  feedbackVlak.setAttribute("aria-live", "polite");
  const knoppenVlak = document.createElement("div");
  knoppenVlak.className = "acties-rij";
  const controleKnop = document.createElement("button");
  controleKnop.type = "button";
  controleKnop.className = "knop knop--primair";
  controleKnop.textContent = "Controleer";
  controleKnop.addEventListener("click", () => verwerkAntwoord(leesAntwoord()));
  knoppenVlak.appendChild(controleKnop);
  container.append(vraagVlak, werkVlak, feedbackVlak, knoppenVlak);

  function bijwerkenVoortgang() {
    voortgangTekst.textContent = `Opgave ${Math.min(opgaveIndex + 1, instellingen.aantalOpgaven)} van ${instellingen.aantalOpgaven} — ${aantalGoedTotaal} goed`;
  }

  // ---- Opgavetype "tel": geld tellen ---------------------------------------
  function bouwTel(opgave) {
    const kop = document.createElement("p");
    kop.style.fontWeight = "700";
    kop.textContent = "Hoeveel geld is dit samen?";
    const tafel = document.createElement("div");
    tafel.className = "geld-rij geld-tafel";
    for (const id of opgave.items) tafel.appendChild(maakGeldSvg(id, soortById(id).soort === "biljet" ? 110 : undefined));
    vraagVlak.append(kop, tafel);

    const rij = document.createElement("div");
    rij.className = "geld-rij";
    const inv = document.createElement("input");
    inv.className = "geld-invoer";
    inv.type = "text";
    inv.inputMode = "decimal";
    inv.autocomplete = "off";
    inv.placeholder = "€ ...";
    inv.setAttribute("aria-label", "Jouw antwoord in euro");
    inv.addEventListener("keydown", (e) => { if (e.key === "Enter") verwerkAntwoord(leesAntwoord()); });
    const hulp = document.createElement("p");
    hulp.style.cssText = "width:100%;text-align:center;color:#52667a;margin:0";
    hulp.textContent = "Gebruik een komma voor centen, bijvoorbeeld 12,50";
    rij.append(inv, hulp);
    werkVlak.appendChild(rij);
    setTimeout(() => inv.focus(), 0);
    leesAntwoord = () => parseBedragNaarCenten(inv.value);
    toonOplossing = () => { inv.value = formatBedrag(opgave.totaalCenten).replace("€ ", ""); inv.disabled = true; };
  }

  // ---- Opgavetype "betaal": geld kiezen / slepen ---------------------------
  function bouwBetaal(opgave) {
    const kop = document.createElement("p");
    kop.style.fontWeight = "700";
    kop.textContent = "Betaal dit bedrag. Tik op het geld of sleep het naar het betaalvak.";
    const bedrag = document.createElement("div");
    bedrag.className = "geld-bedrag";
    bedrag.textContent = formatBedrag(opgave.totaalCenten);
    vraagVlak.append(kop, bedrag);

    const voorraad = { ...opgave.voorraad };
    const gekozen = {};
    const volgorde = GELDSOORTEN.filter((g) => voorraad[g.id] !== undefined);

    const voorraadKop = document.createElement("div");
    voorraadKop.className = "geld-kop";
    voorraadKop.textContent = "Dit geld heb je:";
    const voorraadVak = document.createElement("div");
    voorraadVak.className = "geld-rij geld-tafel";
    const betaalKop = document.createElement("div");
    betaalKop.className = "geld-kop";
    betaalKop.textContent = "Dit betaal je:";
    const betaalVak = document.createElement("div");
    betaalVak.className = "geld-rij geld-vak";
    betaalVak.setAttribute("aria-label", "Betaalvak");
    werkVlak.append(voorraadKop, voorraadVak, betaalKop, betaalVak);

    let vergrendeld = false;

    function teken() {
      voorraadVak.innerHTML = "";
      betaalVak.innerHTML = "";
      for (const g of volgorde) {
        const over = voorraad[g.id] - (gekozen[g.id] || 0);
        const tok = maakToken(g, over, "toevoegen");
        if (over <= 0) tok.disabled = true;
        voorraadVak.appendChild(tok);
      }
      let n = 0;
      for (const g of volgorde) {
        for (let i = 0; i < (gekozen[g.id] || 0); i += 1) {
          betaalVak.appendChild(maakToken(g, 0, "terugleggen"));
          n += 1;
        }
      }
      if (!n) {
        const leeg = document.createElement("span");
        leeg.className = "geld-vak__leeg";
        leeg.textContent = "Het betaalvak is nog leeg";
        betaalVak.appendChild(leeg);
      }
    }

    function voegToe(id) { if (!vergrendeld && (voorraad[id] - (gekozen[id] || 0)) > 0) { gekozen[id] = (gekozen[id] || 0) + 1; teken(); } }
    function leg(id) { if (!vergrendeld && gekozen[id] > 0) { gekozen[id] -= 1; teken(); } }

    function maakToken(g, over, actie) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "geld-token";
      b.dataset.id = g.id;
      b.setAttribute("aria-label", `${g.label} ${actie === "toevoegen" ? "toevoegen aan betaalvak" : "terugleggen"}`);
      b.appendChild(maakGeldSvg(g, g.soort === "biljet" ? 104 : undefined));
      if (actie === "toevoegen") {
        const n = document.createElement("span");
        n.className = "geld-token__aantal";
        n.textContent = `×${over}`;
        b.appendChild(n);
      }
      let start = null;
      let spook = null;
      let versleept = false;
      b.addEventListener("pointerdown", (e) => {
        if (actie !== "toevoegen" || b.disabled) return;
        start = { x: e.clientX, y: e.clientY };
        versleept = false;
        b.setPointerCapture(e.pointerId);
      });
      b.addEventListener("pointermove", (e) => {
        if (!start) return;
        if (!versleept && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) {
          versleept = true;
          spook = maakGeldSvg(g, g.soort === "biljet" ? 104 : undefined);
          spook.classList.add("geld-spook");
          document.body.appendChild(spook);
        }
        if (spook) {
          spook.style.left = `${e.clientX}px`;
          spook.style.top = `${e.clientY}px`;
          const r = betaalVak.getBoundingClientRect();
          betaalVak.classList.toggle("geld-vak--over", e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom);
        }
      });
      const klaar = (e) => {
        if (!start) return;
        const r = betaalVak.getBoundingClientRect();
        const binnen = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (spook) { spook.remove(); spook = null; }
        betaalVak.classList.remove("geld-vak--over");
        const wasSleep = versleept;
        start = null;
        versleept = false;
        if (wasSleep) {
          b.dataset.sleep = "1";
          setTimeout(() => delete b.dataset.sleep, 50);
          if (binnen) voegToe(g.id);
        }
      };
      b.addEventListener("pointerup", klaar);
      b.addEventListener("pointercancel", klaar);
      b.addEventListener("click", () => {
        if (b.dataset.sleep) return;
        if (actie === "toevoegen") voegToe(g.id); else leg(g.id);
      });
      return b;
    }

    teken();
    leesAntwoord = () => waardeVan(gekozen);
    toonOplossing = () => {
      vergrendeld = true;
      for (const k of Object.keys(gekozen)) delete gekozen[k];
      Object.assign(gekozen, opgave.oplossing);
      teken();
      betaalVak.querySelectorAll("button").forEach((x) => { x.disabled = true; });
    };
    // Een te hoog of te laag bedrag krijgt een eigen hint.
    huidigeOpgave.extraHint = () => {
      const nu = waardeVan(gekozen);
      if (nu === 0) return "Je hebt nog geen geld gekozen.";
      return nu > opgave.totaalCenten ? "Je hebt te veel geld gekozen." : "Je hebt nog te weinig geld gekozen.";
    };
  }


  function toonOpgave() {
    if (opgaveIndex >= instellingen.aantalOpgaven) { toonEindscherm(); return; }
    bezigMetFeedback = false;
    pogingNummer = 1;
    feedbackVlak.className = "feedback-vlak";
    feedbackVlak.textContent = "";
    controleKnop.style.display = "";
    vraagVlak.innerHTML = "";
    werkVlak.innerHTML = "";
    huidigeOpgave = genereerUniekeOpgave(() => genereerOpgave(instellingen), opgaveNaarSleutel, gebruikteSleutels);
    startTijdOpgave = performance.now();
    bijwerkenVoortgang();
    if (huidigeOpgave.type === "betaal") bouwBetaal(huidigeOpgave); else bouwTel(huidigeOpgave);
  }

  async function verwerkAntwoord(antwoord) {
    if (bezigMetFeedback) return;
    if (antwoord === null || antwoord === undefined || (huidigeOpgave.type === "betaal" && antwoord === 0)) {
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = huidigeOpgave.type === "betaal" ? "Kies eerst geld voor het betaalvak." : "Vul eerst een bedrag in, bijvoorbeeld 12,50.";
      return;
    }
    try {
      const isGoed = antwoord === huidigeOpgave.antwoordGoed;
      const tijd = Math.round(performance.now() - startTijdOpgave);
      const meta = { opgaveType: huidigeOpgave.type, maxEuro: huidigeOpgave.meta.maxEuro };
      if (isGoed) {
        bezigMetFeedback = true;
        controleKnop.style.display = "none";
        aantalGoedTotaal += 1;
        await recordAnswer({ exerciseId: EXERCISE_ID, correct: true, timeMs: tijd, meta: { ...meta, pogingen: pogingNummer } });
        feedbackVlak.className = pogingNummer === 1 ? "feedback-vlak feedback-vlak--goed" : "feedback-vlak feedback-vlak--tweede-poging-goed";
        feedbackVlak.textContent = `✓ ${geefCompliment(profielNaam)}${pogingNummer === 2 ? " (tweede poging!)" : ""}`;
        voortgangCirkels.zetStatus(opgaveIndex, pogingNummer === 1 ? "goed" : "tweedePogingGoed");
        speelGoedGeluid();
        raket.goedAntwoord();
        rewardTracker.registreerGoed(pogingNummer, feedbackVlak);
        bijwerkenVoortgang();
        setTimeout(() => { opgaveIndex += 1; toonOpgave(); }, 1900);
      } else if (pogingNummer === 1) {
        pogingNummer = 2;
        rewardTracker.registreerFout();
        const extra = huidigeOpgave.extraHint ? `${huidigeOpgave.extraHint()} ` : "";
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = `${geefFoutmelding()} ${extra}Tip: ${huidigeOpgave.hint}`;
        speelFoutGeluid();
      } else {
        bezigMetFeedback = true;
        controleKnop.style.display = "none";
        await recordAnswer({ exerciseId: EXERCISE_ID, correct: false, timeMs: tijd, meta: { ...meta, pogingen: 2 } });
        toonOplossing();
        feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
        feedbackVlak.textContent = `${geefFoutmelding()} Het juiste bedrag is ${formatBedrag(huidigeOpgave.antwoordGoed)}.`;
        speelFoutGeluid();
        raket.foutAntwoord();
        voortgangCirkels.zetStatus(opgaveIndex, "fout");
        bijwerkenVoortgang();
        setTimeout(() => { opgaveIndex += 1; toonOpgave(); }, 3200);
      }
    } catch (fout) {
      console.error("Kon antwoord niet verwerken:", fout);
      bezigMetFeedback = false;
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = "Er ging iets mis. Probeer het nog eens.";
    }
  }

  function toonEindscherm() {
    container.innerHTML = "";
    const kaart = document.createElement("div");
    kaart.className = "kaart";
    kaart.style.textAlign = "center";
    const pct = (aantalGoedTotaal / instellingen.aantalOpgaven) * 100;
    if (pct === 100) toonPerfecteScoreAnimatie();
    const titel = document.createElement("h2");
    titel.textContent = pct >= 70 ? "Goed gedaan!" : "Bijna! Nog even oefenen.";
    kaart.appendChild(titel);
    toonEindAnimatie(kaart, pct);
    const res = document.createElement("p");
    res.style.cssText = "font-size:24px;font-weight:700";
    res.textContent = `Je had ${aantalGoedTotaal} van de ${instellingen.aantalOpgaven} goed!`;
    kaart.appendChild(res);
    const rewardVlak = document.createElement("div");
    kaart.appendChild(rewardVlak);
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
