// exercises/codeblokken/engine.js
// -----------------------------------------------------------------------------
// Rekenkern van Code-blokken (geen DOM, dus in Node te testen).
//
// Een programma is { main: Blok[], A: Blok[], B: Blok[] }. Een blok is
//   { id, t, n?, body? }   met t een van:
//   bord (absoluut):  up | down | left | right
//   bord (draaien):   fwd | tl | tr
//   platform:         walk | jump | shoot | build
//   besturing:        repeat (n, body) | callA | callB
// compileer() klapt lussen en functies uit tot een lijst acties; de
// simulatie speelt die acties af in een bord- of platformwereld.
// -----------------------------------------------------------------------------

export const MAX_ACTIES = 400;

let idTeller = 0;
export function nieuwId() {
  idTeller += 1;
  return `b${idTeller}`;
}

const RICHTING = { N: { dx: 0, dy: -1 }, E: { dx: 1, dy: 0 }, S: { dx: 0, dy: 1 }, W: { dx: -1, dy: 0 } };
const ABSOLUUT = { up: "N", down: "S", left: "W", right: "E" };
const LINKS = { N: "W", W: "S", S: "E", E: "N" };
const RECHTS = { N: "E", E: "S", S: "W", W: "N" };

/** Zet een beknopt programma ({main:["fwd",{r:3,b:[...]},"A"]}) om naar blokken met id's. */
export function bouwProgramma(beknopt = {}) {
  const maak = (spec) => {
    if (typeof spec === "string") {
      if (spec === "A") return { id: nieuwId(), t: "callA" };
      if (spec === "B") return { id: nieuwId(), t: "callB" };
      return { id: nieuwId(), t: spec };
    }
    return { id: nieuwId(), t: "repeat", n: spec.r, body: spec.b.map(maak) };
  };
  return {
    main: (beknopt.main || []).map(maak),
    A: (beknopt.A || []).map(maak),
    B: (beknopt.B || []).map(maak),
  };
}

/** Aantal blokken in het hele programma (inclusief herhaal- en functieblokken). */
export function telBlokken(programma) {
  const tel = (lijst) => lijst.reduce((som, b) => som + 1 + (b.body ? tel(b.body) : 0), 0);
  return tel(programma.main) + tel(programma.A) + tel(programma.B);
}

/**
 * Klapt het programma uit tot een rij acties.
 * @returns {{acties: {t:string, pad:string[]}[], fout: null|"leeg"|"te-lang"|"recursie"}}
 */
export function compileer(programma) {
  const acties = [];
  let fout = null;
  const loop = (lijst, pad, stapel) => {
    for (const blok of lijst) {
      if (fout) return;
      const nieuwPad = [...pad, blok.id];
      if (blok.t === "repeat") {
        const n = Math.max(1, Math.min(9, blok.n || 1));
        for (let i = 0; i < n && !fout; i += 1) loop(blok.body || [], nieuwPad, stapel);
      } else if (blok.t === "callA" || blok.t === "callB") {
        const naam = blok.t === "callA" ? "A" : "B";
        if (stapel.includes(naam)) {
          fout = "recursie";
          return;
        }
        loop(programma[naam] || [], nieuwPad, [...stapel, naam]);
      } else {
        acties.push({ t: blok.t, pad: nieuwPad });
        if (acties.length > MAX_ACTIES) {
          fout = "te-lang";
          return;
        }
      }
    }
  };
  loop(programma.main || [], [], []);
  if (!fout && acties.length === 0) fout = "leeg";
  return { acties, fout };
}

// ---------------------------------------------------------------------------
// Levels voorbereiden
// ---------------------------------------------------------------------------

/**
 * Maakt van een level-definitie een afgemaakt level: het doel en de sterren
 * van een bordlevel worden uit de voorbeeldoplossing (oplossing) afgeleid, zodat
 * het level altijd oplosbaar is.
 */
export function maakLevel(def) {
  if (def.type === "platform") {
    const cellen = def.cellen;
    return { ...def, aantalSterren: [...cellen].filter((c) => c === "*").length };
  }
  const basis = { ...def, muren: def.muren || [], dir: def.dir || "E", sterren: [], doel: null };
  const { acties } = compileer(bouwProgramma(def.oplossing));
  const sim = simuleerBord(basis, acties);
  const laatste = sim.stappen[sim.stappen.length - 1];
  const sterren = (def.sterrenOpStap || []).map((i) => ({ x: sim.stappen[i].x, y: sim.stappen[i].y }));
  return { ...basis, doel: { x: laatste.x, y: laatste.y }, sterren, aantalSterren: sterren.length };
}

// ---------------------------------------------------------------------------
// Bordwereld
// ---------------------------------------------------------------------------

export function simuleerBord(level, acties) {
  const muren = new Set((level.muren || []).map(([x, y]) => `${x},${y}`));
  const sterren = level.sterren || [];
  let x = level.start[0];
  let y = level.start[1];
  let dir = level.dir || "E";
  const gepakt = new Set();
  const stappen = [{ x, y, dir, gepakt: [], gebeurtenis: "start", actie: -1 }];
  let reden = null;
  let gewonnen = false;

  for (let i = 0; i < acties.length; i += 1) {
    const t = acties[i].t;
    let gebeurtenis = "stap";
    if (t === "tl") {
      dir = LINKS[dir];
      gebeurtenis = "draai";
    } else if (t === "tr") {
      dir = RECHTS[dir];
      gebeurtenis = "draai";
    } else {
      let d = dir;
      if (ABSOLUUT[t]) d = ABSOLUUT[t];
      else if (t !== "fwd") continue; // onbekend blok voor dit type wereld
      const nx = x + RICHTING[d].dx;
      const ny = y + RICHTING[d].dy;
      dir = d;
      const buiten = nx < 0 || ny < 0 || nx >= level.w || ny >= level.h;
      if (buiten || muren.has(`${nx},${ny}`)) {
        stappen.push({ x, y, dir, gepakt: [...gepakt], gebeurtenis: "stoot", actie: i });
        reden = buiten ? "rand" : "muur";
        break;
      }
      x = nx;
      y = ny;
    }
    sterren.forEach((s, k) => {
      if (s.x === x && s.y === y) gepakt.add(k);
    });
    const opDoel = level.doel && x === level.doel.x && y === level.doel.y;
    stappen.push({ x, y, dir, gepakt: [...gepakt], gebeurtenis: opDoel ? "doel" : gebeurtenis, actie: i });
    if (opDoel) {
      gewonnen = true;
      break;
    }
  }
  if (!gewonnen && !reden) reden = "niet-bij-doel";
  return { stappen, resultaat: { gewonnen, reden, sterrenGepakt: gepakt.size, aantalSterren: sterren.length } };
}

// ---------------------------------------------------------------------------
// Platformwereld
// ---------------------------------------------------------------------------
// Cellen: . grond   ^ gat   # lage muur   E vijand   * ster   F vlag   = brug
// walk: 1 stap. jump: 2 stappen vooruit, de cel ertussen wordt overgeslagen
// (gat of muur), maar een vijand daar is te hoog. shoot: raakt de vijand in de
// volgende cel. build: legt een brug in een gat in de volgende cel.

export function simuleerPlatform(level, acties) {
  const cellen = [...level.cellen];
  let x = 0;
  const gepakt = new Set();
  const snap = (gebeurtenis, actie, extra = {}) => ({
    x, cellen: cellen.join(""), gepakt: [...gepakt], gebeurtenis, actie, ...extra,
  });
  const stappen = [snap("start", -1)];
  let reden = null;
  let gewonnen = false;

  const land = (doel, i, soort) => {
    const c = cellen[doel];
    if (c === undefined) return "rand";
    if (c === "^") return "val";
    if (c === "#") return "muur";
    if (c === "E") return "vijand";
    x = doel;
    if (c === "*") {
      gepakt.add(doel);
      cellen[doel] = ".";
    }
    if (c === "F") gewonnen = true;
    stappen.push(snap(gewonnen ? "doel" : soort, i));
    return null;
  };

  for (let i = 0; i < acties.length && !gewonnen && !reden; i += 1) {
    const t = acties[i].t;
    if (t === "walk") {
      const fout = land(x + 1, i, "loop");
      if (fout) {
        stappen.push(snap(fout === "val" ? "val" : "stoot", i, { naar: x + 1 }));
        reden = fout;
      }
    } else if (t === "jump") {
      const midden = cellen[x + 1];
      if (midden === "E") {
        stappen.push(snap("stoot", i, { naar: x + 1 }));
        reden = "vijand";
        break;
      }
      const fout = land(x + 2, i, "spring");
      if (fout) {
        stappen.push(snap(fout === "val" ? "val" : "stoot", i, { naar: x + 2, sprong: true }));
        reden = fout;
      }
    } else if (t === "shoot") {
      if (cellen[x + 1] === "E") {
        cellen[x + 1] = ".";
        stappen.push(snap("schiet-raak", i));
      } else {
        stappen.push(snap("schiet-mis", i));
      }
    } else if (t === "build") {
      if (cellen[x + 1] === "^") {
        cellen[x + 1] = "=";
        stappen.push(snap("bouw", i));
      } else {
        stappen.push(snap("bouw-mis", i));
      }
    }
  }
  if (!gewonnen && !reden) reden = "niet-bij-doel";
  const aantalSterren = [...level.cellen].filter((c) => c === "*").length;
  return { stappen, resultaat: { gewonnen, reden, sterrenGepakt: gepakt.size, aantalSterren } };
}

/** Speelt een programma af op een level. */
export function speelAf(level, programma) {
  const { acties, fout } = compileer(programma);
  if (fout) return { acties, fout, stappen: [], resultaat: { gewonnen: false, reden: fout, sterrenGepakt: 0, aantalSterren: level.aantalSterren || 0 } };
  const sim = level.type === "platform" ? simuleerPlatform(level, acties) : simuleerBord(level, acties);
  return { acties, fout: null, ...sim };
}

/** Sterren (0-3): vlag bereikt, alle sterretjes gepakt, en niet meer blokken dan par. */
export function berekenSterren(level, resultaat, gebruikteBlokken) {
  if (!resultaat.gewonnen) return 0;
  let s = 1;
  if (resultaat.sterrenGepakt >= resultaat.aantalSterren) s += 1;
  if (gebruikteBlokken <= level.par) s += 1;
  return s;
}

export const REDENEN = {
  muur: "Au! Het vogeltje liep tegen een muur.",
  rand: "Oeps! Het vogeltje liep van het bord af.",
  val: "Plons! Het vogeltje viel in een gat. Spring erover of bouw een brug.",
  vijand: "Help! De vijand pakt het poppetje. Schiet de vijand eerst weg.",
  "niet-bij-doel": "Het vogeltje staat nog niet bij de vlag.",
  "te-lang": "Je programma duurt veel te lang. Staat er een lus die nooit stopt?",
  recursie: "Een functie roept zichzelf aan. Dat kan niet.",
  leeg: "Zet eerst blokjes in je programma.",
};
export function redenTekst(reden, soort) {
  if (reden === "muur" && soort === "platform") return "Au! Een muur is in de weg. Spring erover.";
  return REDENEN[reden] || "Het is niet gelukt. Probeer het nog eens.";
}
