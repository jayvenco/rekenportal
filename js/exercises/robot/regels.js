// exercises/robot/regels.js
// -----------------------------------------------------------------------------
// Spelregels van het Robot Programmeer Spel (geen DOM, dus in Node te testen).
//
//  - stevige muur (obstacles): onverwoestbaar, de robot botst ertegen.
//  - zwak muurtje (muurtjes):  de robot botst ertegen, tot een TNT het opblaast.
//  - TNT (tnt):                loop je er overheen, dan ontploft hij. Alle zwakke
//                              muurtjes in de 3x3 vakjes eromheen (straal 1) vallen
//                              om. Een TNT binnen die straal ontploft ook
//                              (kettingreactie). Munten in de straal gaan kapot.
//                              De robot zelf blijft heel.
//  - munt (coins):             optioneel; geeft punten.
//  - doel (target):            bereik je het doel, dan is het level klaar.
// -----------------------------------------------------------------------------

export const RICHTINGEN = {
  UP: [-1, 0],
  DOWN: [1, 0],
  LEFT: [0, -1],
  RIGHT: [0, 1],
};

const sl = (rij, kol) => `${rij},${kol}`;
const naarCel = (s) => {
  const [row, col] = s.split(",").map(Number);
  return { row, col };
};

/** Bouwt een wereld (veranderlijke staat) uit een level. */
export function maakWereld(level) {
  return {
    size: level.size ?? 8,
    robot: { row: level.robot.row, col: level.robot.col },
    doel: { row: level.target.row, col: level.target.col },
    stenen: new Set((level.obstacles || []).map((o) => sl(o.row, o.col))),
    muurtjes: new Set((level.muurtjes || []).map((o) => sl(o.row, o.col))),
    tnt: new Set((level.tnt || []).map((o) => sl(o.row, o.col))),
    munten: new Set((level.coins || []).map((o) => sl(o.row, o.col))),
    opgepakt: 0,
    kapot: 0,
  };
}

export function kopieer(w) {
  return {
    ...w,
    robot: { ...w.robot },
    stenen: w.stenen,
    muurtjes: new Set(w.muurtjes),
    tnt: new Set(w.tnt),
    munten: new Set(w.munten),
  };
}

/**
 * Laat de TNT op (rij, kol) ontploffen, inclusief kettingreactie.
 * @returns {{tnt:{row,col}, gesloopt:{row,col}[], kapot:{row,col}[], keten:{row,col}[]}[]}
 */
export function ontplof(w, rij, kol) {
  const gebeurtenissen = [];
  const wachtrij = [[rij, kol]];
  w.tnt.delete(sl(rij, kol));
  while (wachtrij.length) {
    const [r, c] = wachtrij.shift();
    const gesloopt = [];
    const kapot = [];
    const keten = [];
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= w.size || cc >= w.size) continue;
        const k = sl(rr, cc);
        if (w.muurtjes.delete(k)) gesloopt.push({ row: rr, col: cc });
        if (w.munten.delete(k)) {
          kapot.push({ row: rr, col: cc });
          w.kapot += 1;
        }
        if ((dr !== 0 || dc !== 0) && w.tnt.has(k)) {
          w.tnt.delete(k);
          wachtrij.push([rr, cc]);
          keten.push({ row: rr, col: cc });
        }
      }
    }
    gebeurtenissen.push({ tnt: { row: r, col: c }, gesloopt, kapot, keten });
  }
  return gebeurtenissen;
}

/**
 * Voert één commando uit.
 * @returns {{botsing: null|"rand"|"steen"|"muurtje"|"onbekend", naar?:{row,col}, munt:boolean, ontploffingen:Array, doel:boolean}}
 */
export function doeStap(w, cmd) {
  const d = RICHTINGEN[cmd];
  if (!d) return { botsing: "onbekend", munt: false, ontploffingen: [], doel: false };
  const nr = w.robot.row + d[0];
  const nc = w.robot.col + d[1];
  const naar = { row: nr, col: nc };
  if (nr < 0 || nc < 0 || nr >= w.size || nc >= w.size) return { botsing: "rand", naar, munt: false, ontploffingen: [], doel: false };
  const k = sl(nr, nc);
  if (w.stenen.has(k)) return { botsing: "steen", naar, munt: false, ontploffingen: [], doel: false };
  if (w.muurtjes.has(k)) return { botsing: "muurtje", naar, munt: false, ontploffingen: [], doel: false };
  w.robot = naar;
  let munt = false;
  if (w.munten.delete(k)) {
    w.opgepakt += 1;
    munt = true;
  }
  let ontploffingen = [];
  if (w.tnt.has(k)) ontploffingen = ontplof(w, nr, nc);
  return { botsing: null, naar, munt, ontploffingen, doel: nr === w.doel.row && nc === w.doel.col };
}

// ---------------------------------------------------------------------------
// Oplosser (voor tests en om minSteps te berekenen)
// ---------------------------------------------------------------------------

/**
 * Zoekt (breedte-eerst) de kortste route naar het doel.
 * @param {Object} level
 * @param {{alleMunten?:boolean, negeerTnt?:boolean}} opties
 *   alleMunten: de route moet ook alle munten rapen (en geen enkele laten ontploffen).
 *   negeerTnt:  TNT doet niets (om te testen of een level zonder TNT te halen is).
 * @returns {{stappen:number, route:string[]}|null}
 */
export function zoekKortsteRoute(level, { alleMunten = false, negeerTnt = false } = {}) {
  const start = maakWereld(level);
  if (negeerTnt) start.tnt = new Set();
  const totaalMunten = start.munten.size;
  const sleutel = (w) =>
    `${w.robot.row},${w.robot.col}|${[...w.muurtjes].sort().join(";")}|${[...w.tnt].sort().join(";")}|${[...w.munten].sort().join(";")}`;
  const gezien = new Set([sleutel(start)]);
  let rij = [{ w: start, route: [] }];
  while (rij.length) {
    const volgende = [];
    for (const { w, route } of rij) {
      for (const cmd of Object.keys(RICHTINGEN)) {
        const nw = kopieer(w);
        const r = doeStap(nw, cmd);
        if (r.botsing) continue;
        const nieuweRoute = [...route, cmd];
        if (r.doel) {
          if (!alleMunten || (nw.opgepakt === totaalMunten && nw.kapot === 0)) return { stappen: nieuweRoute.length, route: nieuweRoute };
          continue; // het level eindigt bij het doel: deze tak is een dood spoor
        }
        if (alleMunten && nw.kapot > 0) continue;
        const s = sleutel(nw);
        if (gezien.has(s)) continue;
        gezien.add(s);
        volgende.push({ w: nw, route: nieuweRoute });
      }
    }
    rij = volgende;
  }
  return null;
}
