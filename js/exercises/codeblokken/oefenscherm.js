// exercises/codeblokken/oefenscherm.js
// -----------------------------------------------------------------------------
// Speelscherm van één level: wereld links (of bovenaan bij een platform),
// blokken-editor rechts, knoppen Start / Stap / Opnieuw en een berichtvak.
// -----------------------------------------------------------------------------

import { recordAnswer } from "../../storage.js";
import { maakRewardTracker, toonBadgeUnlocks, toonRewardResultaat, verversCoinCounter } from "../../utils/rewards.js";
import { speelAf, berekenSterren, redenTekst, bouwProgramma } from "./engine.js";
import { maakWereld, beginSnap } from "./wereld.js";
import { maakEditor, voegStijlToe } from "./editor.js";
import { SETS } from "./levels.js";
import { sleutel, bewaarVoortgang } from "./voortgang.js";

const EXERCISE_ID = "codeblokken";
const SNELHEDEN = [
  { naam: "🐢 Langzaam", ms: 800 },
  { naam: "🚶 Normaal", ms: 450 },
  { naam: "🐇 Snel", ms: 200 },
];

export function sterTekst(n) {
  return "★".repeat(n) + "☆".repeat(3 - n);
}

/**
 * @param {HTMLElement} container
 * @param {{setId:string, index:number, voortgang:Object}} opties
 * @param {{naarLevels:Function, naarLevel:(setId:string,index:number)=>void}} nav
 */
export function startLevel(container, { setId, index, voortgang }, nav) {
  voegStijlToe();
  const set = SETS.find((s) => s.id === setId);
  const level = set.levels[index];
  const platform = level.type === "platform";
  const tracker = maakRewardTracker(EXERCISE_ID, 1);
  const startTijd = performance.now();
  let mislukt = 0;
  let beloond = false;
  let snelheid = 1;
  let sessie = null; // { sim, i, bezig, afgebroken }

  container.textContent = "";
  const hoofd = document.createElement("div");
  hoofd.className = "cb";
  container.appendChild(hoofd);

  // --- kop ---
  const kop = document.createElement("div");
  kop.className = "kaart";
  kop.style.cssText = "padding:12px 16px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between";
  const titelBlok = document.createElement("div");
  const titel = document.createElement("h2");
  titel.style.margin = "0";
  titel.textContent = `${set.icoon} ${set.naam} · level ${index + 1}: ${level.naam}`;
  const uitleg = document.createElement("p");
  uitleg.style.cssText = "margin:4px 0 0;font-size:.98rem";
  uitleg.textContent = level.uitleg || (platform
    ? "Breng het vogeltje naar de vlag. Pak onderweg de sterretjes!"
    : "Breng het vogeltje naar de vlag. Pak onderweg de sterretjes!");
  titelBlok.append(titel, uitleg);
  const terug = document.createElement("button");
  terug.type = "button";
  terug.className = "knop knop--zacht";
  terug.textContent = "← Alle levels";
  terug.addEventListener("click", () => {
    stopSessie();
    editor.ruimOp();
    nav.naarLevels();
  });
  kop.append(titelBlok, terug);
  hoofd.appendChild(kop);

  // --- wereld + editor ---
  const rij = document.createElement("div");
  rij.className = "cb-bovenrij" + (platform ? " cb-bovenrij--platform" : "");
  const links = document.createElement("div");
  links.className = "cb-links";
  const wereld = maakWereld(level);
  const knoppen = document.createElement("div");
  knoppen.className = "cb-knoppen";
  const startKnop = maakKnop("▶ Start", "");
  const stapKnop = maakKnop("⏭ Stap", "");
  const opnieuwKnop = maakKnop("↺ Opnieuw", "cb-knop--zacht");
  const wisKnop = maakKnop("🗑 Wis alles", "cb-knop--zacht");
  const snelKnop = maakKnop(SNELHEDEN[snelheid].naam, "cb-knop--zacht");
  knoppen.append(startKnop, stapKnop, opnieuwKnop, wisKnop, snelKnop);
  const bericht = document.createElement("div");
  bericht.className = "cb-bericht";
  bericht.setAttribute("aria-live", "polite");
  const rewardVlak = document.createElement("div");
  const acties = document.createElement("div");
  acties.className = "cb-knoppen";
  links.append(wereld.element, knoppen, bericht, rewardVlak, acties);

  const editor = maakEditor({ level });
  rij.append(links, editor.element);
  hoofd.appendChild(rij);

  if (level.startProgramma) editor.zetProgramma(bouwProgramma(level.startProgramma));
  zetBericht("Sleep blokjes naar het werkvlak en druk op Start.");

  function maakKnop(tekst, extra) {
    const k = document.createElement("button");
    k.type = "button";
    k.className = `cb-knop ${extra}`;
    k.textContent = tekst;
    return k;
  }
  function zetBericht(tekst, soort = "") {
    bericht.className = `cb-bericht${soort ? ` cb-bericht--${soort}` : ""}`;
    bericht.textContent = tekst;
  }
  const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

  // --- afspelen ---------------------------------------------------------------
  function stopSessie() {
    if (sessie) sessie.afgebroken = true;
    sessie = null;
  }

  function herstel() {
    stopSessie();
    wereld.reset();
    editor.markeer([]);
    editor.vergrendel(false);
    startKnop.disabled = false;
    stapKnop.disabled = false;
    acties.textContent = "";
    zetBericht("Sleep blokjes naar het werkvlak en druk op Start.");
  }

  function maakSessie() {
    const programma = editor.getProgramma();
    const sim = speelAf(level, programma);
    if (sim.fout) {
      zetBericht(redenTekst(sim.fout, level.type), "fout");
      return null;
    }
    wereld.reset();
    editor.vergrendel(true);
    acties.textContent = "";
    sessie = { sim, i: 0, bezig: false, afgebroken: false };
    return sessie;
  }

  async function doeStap(s) {
    const { sim } = s;
    const vorige = sim.stappen[s.i];
    const volgende = sim.stappen[s.i + 1];
    s.bezig = true;
    const a = volgende.actie >= 0 ? sim.acties[volgende.actie] : null;
    editor.markeer(a ? a.pad : []);
    await wereld.speel(vorige, volgende, SNELHEDEN[snelheid].ms);
    s.i += 1;
    s.bezig = false;
    return s.i >= sim.stappen.length - 1;
  }

  async function startKlik() {
    if (sessie?.bezig) return;
    let s = sessie;
    if (!s) s = maakSessie();
    if (!s) return;
    startKnop.disabled = true;
    stapKnop.disabled = true;
    zetBericht("Het vogeltje voert je programma uit…");
    for (;;) {
      if (s.afgebroken) return;
      if (s.i >= s.sim.stappen.length - 1) break;
      const klaar = await doeStap(s);
      if (s.afgebroken) return;
      if (klaar) break;
    }
    await afronden(s);
  }

  async function stapKlik() {
    if (sessie?.bezig) return;
    let s = sessie;
    if (!s) s = maakSessie();
    if (!s) return;
    if (s.sim.stappen.length <= 1) {
      await afronden(s);
      return;
    }
    stapKnop.disabled = true;
    startKnop.disabled = true;
    const klaar = await doeStap(s);
    if (s.afgebroken) return;
    if (klaar) {
      await afronden(s);
    } else {
      stapKnop.disabled = false;
      startKnop.disabled = false;
      const a = s.sim.acties[s.sim.stappen[s.i].actie];
      zetBericht("Druk op Stap voor de volgende stap, of op Start om door te gaan.");
      void a;
    }
  }

  async function afronden(s) {
    editor.markeer([]);
    const r = s.sim.resultaat;
    if (r.gewonnen) {
      const blokken = editor.tel();
      const sterren = berekenSterren(level, r, blokken);
      const sl = sleutel(setId, index);
      const eerder = voortgang.sterren[sl] || 0;
      const beloon = sterren > eerder && !beloond;
      if (sterren > eerder) {
        voortgang.sterren[sl] = sterren;
        voortgang.set = setId;
        await bewaarVoortgang(voortgang);
      }
      let tip = "";
      if (sterren < 3) {
        if (r.sterrenGepakt < r.aantalSterren) tip = " Tip: pak ook alle sterretjes!";
        else if (blokken > level.par) tip = ` Tip: het kan met ${level.par} blokjes.`;
      }
      zetBericht(`🎉 Gelukt! ${sterTekst(sterren)}${tip}`, "goed");
      if (beloon) {
        beloond = true;
        tracker.registreerGoed(mislukt === 0 ? 1 : 2, bericht);
        await recordAnswer({
          exerciseId: EXERCISE_ID,
          correct: true,
          timeMs: Math.round(performance.now() - startTijd),
          meta: { set: setId, level: index + 1, sterren, blokken, pogingen: mislukt + 1 },
        });
      }
      toonKlaarKnoppen(sterren);
      if (beloon) {
        const rewards = await tracker.voltooi();
        toonRewardResultaat(rewardVlak, rewards);
        await verversCoinCounter();
        await toonBadgeUnlocks(rewards?.badgesEarned || []);
      }
      startKnop.disabled = true;
      stapKnop.disabled = true;
      sessie = null;
      return;
    }
    mislukt += 1;
    tracker.registreerFout();
    zetBericht(`${redenTekst(r.reden, level.type)} Pas je blokjes aan en probeer het opnieuw.`, "fout");
    editor.vergrendel(false);
    startKnop.disabled = false;
    stapKnop.disabled = false;
    sessie = null;
    await wacht(200);
  }

  function toonKlaarKnoppen() {
    acties.textContent = "";
    const opnieuw = maakKnop("↺ Nog een keer", "cb-knop--zacht");
    opnieuw.addEventListener("click", () => {
      herstel();
      editor.vergrendel(false);
    });
    acties.appendChild(opnieuw);
    if (index + 1 < set.levels.length) {
      const volgend = maakKnop("Volgend level ▶", "");
      volgend.addEventListener("click", () => {
        editor.ruimOp();
        nav.naarLevel(setId, index + 1);
      });
      acties.appendChild(volgend);
    } else {
      const alle = maakKnop("🏆 Alle levels van deze set gehaald!", "");
      alle.addEventListener("click", () => {
        editor.ruimOp();
        nav.naarLevels();
      });
      acties.appendChild(alle);
    }
    editor.vergrendel(false);
  }

  startKnop.addEventListener("click", startKlik);
  stapKnop.addEventListener("click", stapKlik);
  opnieuwKnop.addEventListener("click", herstel);
  wisKnop.addEventListener("click", () => {
    herstel();
    editor.wis();
  });
  snelKnop.addEventListener("click", () => {
    snelheid = (snelheid + 1) % SNELHEDEN.length;
    snelKnop.textContent = SNELHEDEN[snelheid].naam;
  });
}
