// exercises/robot/levels.js
// -----------------------------------------------------------------------------
// 12 robot-commandospel-levels voor de Rekenportal.
// Groep 4 = levels 1–6 (pijltjesmodus), Groep 8 = levels 7–12 (codemodus).
// Elk level is een 8×8-grid (0-indexed).
// -----------------------------------------------------------------------------

/**
 * @typedef {Object} LevelData
 * @property {number} id
 * @property {string} name
 * @property {number} size        — grid is size×size (altijd 8)
 * @property {{row:number,col:number}} robot       — startpositie
 * @property {{row:number,col:number}} target      — doelpositie
 * @property {{row:number,col:number}[]} obstacles — blokkades
 * @property {{row:number,col:number}[]} coins     — te verzamelen munten
 * @property {number} minSteps    — minimale aantal stappen voor een perfecte score (doel + alle munten)
 * @property {'arrows'|'code'} mode
 */

export const LEVELS = [
  // ── Groep 4 (levels 1–6) ──────────────────────────────────────────────
  {
    id: 1,
    name: "Eerste stapjes",
    size: 8,
    robot: { row: 0, col: 0 },
    target: { row: 0, col: 3 },
    obstacles: [],
    coins: [],
    minSteps: 3,
    mode: "arrows",
  },
  {
    id: 2,
    name: "Rechtdoor en omhoog",
    size: 8,
    robot: { row: 7, col: 0 },
    target: { row: 4, col: 7 },
    obstacles: [
      // horizontale muur tussen rij 2 en 3, kolom 0–4
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      // verticale muur kolom 5, rij 3–6 (onderaan open, zodat de robot erlangs kan)
      { row: 3, col: 5 },
      { row: 4, col: 5 },
      { row: 5, col: 5 },
      { row: 6, col: 5 },
    ],
    coins: [],
    minSteps: 10,
    mode: "arrows",
  },
  {
    id: 3,
    name: "De L-vorm",
    size: 8,
    robot: { row: 0, col: 0 },
    target: { row: 7, col: 7 },
    obstacles: [
      // L-vormige muur van (0,2) naar (6,2) omlaag, dan rechts naar (6,5)
      { row: 0, col: 2 },
      { row: 1, col: 2 },
      { row: 2, col: 2 },
      { row: 3, col: 2 },
      { row: 4, col: 2 },
      { row: 5, col: 2 },
      { row: 6, col: 2 },
      { row: 6, col: 3 },
      { row: 6, col: 4 },
      { row: 6, col: 5 },
      // korte muur van (3,5) naar (3,7)
      { row: 3, col: 5 },
      { row: 3, col: 6 },
      { row: 3, col: 7 },
    ],
    coins: [],
    minSteps: 14,
    mode: "arrows",
  },
  {
    id: 4,
    name: "Muntjes rapen 1",
    size: 8,
    robot: { row: 0, col: 0 },
    target: { row: 0, col: 7 },
    obstacles: [
      // verticale muur in het midden, stopt op rij 6 zodat er onderdoor een doorgang is
      { row: 0, col: 4 },
      { row: 1, col: 4 },
      { row: 2, col: 4 },
      { row: 3, col: 4 },
      { row: 4, col: 4 },
      { row: 5, col: 4 },
      { row: 6, col: 4 },
    ],
    coins: [
      { row: 0, col: 2 },
      { row: 2, col: 2 },
      { row: 2, col: 6 },
      { row: 4, col: 6 },
    ],
    minSteps: 21,
    mode: "arrows",
  },
  {
    id: 5,
    name: "Muntjes rapen 2",
    size: 8,
    robot: { row: 7, col: 0 },
    target: { row: 0, col: 7 },
    obstacles: [
      // zigzag-muur
      { row: 6, col: 1 },
      { row: 6, col: 2 },
      { row: 5, col: 2 },
      { row: 5, col: 3 },
      { row: 4, col: 3 },
      { row: 4, col: 4 },
      { row: 3, col: 4 },
      { row: 3, col: 5 },
      { row: 2, col: 5 },
      { row: 2, col: 6 },
    ],
    coins: [
      { row: 6, col: 5 },
      { row: 4, col: 7 },
      { row: 2, col: 3 },
      { row: 1, col: 1 },
      { row: 0, col: 4 },
    ],
    minSteps: 28,
    mode: "arrows",
  },
  {
    id: 6,
    name: "Het doolhof",
    size: 8,
    robot: { row: 0, col: 0 },
    target: { row: 7, col: 7 },
    obstacles: [
      // serpentine: twee horizontale gangen met telkens een doorgang
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 2, col: 5 },
      { row: 5, col: 2 },
      { row: 5, col: 3 },
      { row: 5, col: 4 },
      { row: 5, col: 5 },
      { row: 5, col: 6 },
      { row: 5, col: 7 },
    ],
    coins: [
      { row: 0, col: 4 },
      { row: 3, col: 7 },
      { row: 4, col: 4 },
      { row: 6, col: 3 },
    ],
    minSteps: 26,
    mode: "arrows",
  },

  // ── Groep 8 (levels 7–12) ──────────────────────────────────────────────
  {
    id: 7,
    name: "Programmeer de robot",
    size: 8,
    robot: { row: 0, col: 0 },
    target: { row: 7, col: 7 },
    obstacles: [
      // diagonaal blokkerende muren
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
      { row: 5, col: 5 },
      { row: 5, col: 6 },
      { row: 6, col: 5 },
      { row: 6, col: 6 },
    ],
    coins: [
      { row: 0, col: 5 },
      { row: 3, col: 3 },
      { row: 7, col: 3 },
    ],
    minSteps: 18,
    mode: "code",
  },
  {
    id: 8,
    name: "Slalom",
    size: 8,
    robot: { row: 0, col: 0 },
    target: { row: 7, col: 7 },
    obstacles: [
      // slalom: om en om een muur heen
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 3 },
      { row: 1, col: 4 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
      { row: 3, col: 3 },
      { row: 3, col: 4 },
      { row: 4, col: 1 },
      { row: 4, col: 2 },
      { row: 5, col: 3 },
      { row: 5, col: 4 },
      { row: 6, col: 1 },
      { row: 6, col: 2 },
    ],
    coins: [
      { row: 0, col: 5 },
      { row: 2, col: 5 },
      { row: 4, col: 5 },
      { row: 6, col: 5 },
      { row: 6, col: 0 },
    ],
    minSteps: 28,
    mode: "code",
  },
  {
    id: 9,
    name: "De omweg",
    size: 8,
    robot: { row: 7, col: 0 },
    target: { row: 7, col: 7 },
    obstacles: [
      // volledige horizontale barrière op rij 6, kolom 1–6
      { row: 6, col: 1 },
      { row: 6, col: 2 },
      { row: 6, col: 3 },
      { row: 6, col: 4 },
      { row: 6, col: 5 },
      { row: 6, col: 6 },
      // T-vorm in het midden
      { row: 3, col: 3 },
      { row: 3, col: 4 },
      { row: 3, col: 5 },
      { row: 4, col: 4 },
      { row: 5, col: 4 },
    ],
    coins: [
      { row: 4, col: 1 },
      { row: 4, col: 2 },
      { row: 0, col: 4 },
      { row: 2, col: 6 },
    ],
    minSteps: 21,
    mode: "code",
  },
  {
    id: 10,
    name: "Volle kamer",
    size: 8,
    robot: { row: 0, col: 0 },
    target: { row: 7, col: 7 },
    obstacles: [
      // serpentine: volle horizontale muren met telkens één doorgang (afwisselend)
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 1, col: 3 },
      { row: 1, col: 4 },
      { row: 1, col: 5 },
      { row: 1, col: 6 },
      { row: 3, col: 1 },
      { row: 3, col: 2 },
      { row: 3, col: 3 },
      { row: 3, col: 4 },
      { row: 3, col: 5 },
      { row: 3, col: 6 },
      { row: 3, col: 7 },
      { row: 5, col: 0 },
      { row: 5, col: 1 },
      { row: 5, col: 2 },
      { row: 5, col: 3 },
      { row: 5, col: 4 },
      { row: 5, col: 5 },
      { row: 5, col: 6 },
      { row: 7, col: 0 },
      { row: 7, col: 1 },
      { row: 7, col: 2 },
      { row: 7, col: 3 },
      { row: 7, col: 4 },
      { row: 7, col: 5 },
    ],
    coins: [
      { row: 0, col: 3 },
      { row: 2, col: 4 },
      { row: 4, col: 5 },
      { row: 6, col: 6 },
    ],
    minSteps: 30,
    mode: "code",
  },
  {
    id: 11,
    name: "Muntjesjager",
    size: 8,
    robot: { row: 0, col: 0 },
    target: { row: 0, col: 7 },
    obstacles: [
      // kronkelige gang met hoge muren
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 1, col: 3 },
      { row: 2, col: 1 },
      { row: 2, col: 3 },
      { row: 3, col: 1 },
      { row: 3, col: 2 },
      { row: 3, col: 3 },
      { row: 3, col: 5 },
      { row: 3, col: 6 },
      { row: 4, col: 1 },
      { row: 4, col: 5 },
      { row: 5, col: 1 },
      { row: 5, col: 2 },
      { row: 5, col: 5 },
      { row: 6, col: 5 },
      { row: 6, col: 6 },
      { row: 7, col: 5 },
    ],
    coins: [
      { row: 1, col: 1 },
      { row: 1, col: 5 },
      { row: 2, col: 5 },
      { row: 4, col: 3 },
      { row: 4, col: 6 },
      { row: 6, col: 2 },
      { row: 7, col: 1 },
    ],
    minSteps: 31,
    mode: "code",
  },
  {
    id: 12,
    name: "Meesterrobot",
    size: 8,
    robot: { row: 0, col: 0 },
    target: { row: 7, col: 7 },
    obstacles: [
      // serpentine met vier gedeeltelijke muren en wisselende doorgangen
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 1, col: 3 },
      { row: 1, col: 4 },
      { row: 1, col: 5 },
      { row: 3, col: 2 },
      { row: 3, col: 3 },
      { row: 3, col: 4 },
      { row: 3, col: 5 },
      { row: 3, col: 6 },
      { row: 3, col: 7 },
      { row: 5, col: 0 },
      { row: 5, col: 1 },
      { row: 5, col: 2 },
      { row: 5, col: 3 },
      { row: 5, col: 4 },
      { row: 5, col: 5 },
      { row: 7, col: 0 },
      { row: 7, col: 1 },
      { row: 7, col: 2 },
      { row: 7, col: 3 },
      { row: 7, col: 4 },
    ],
    coins: [
      { row: 0, col: 4 },
      { row: 2, col: 6 },
      { row: 4, col: 2 },
      { row: 6, col: 4 },
    ],
    minSteps: 28,
    mode: "code",
  },
];

/**
 * Vindt een level op id.
 * @param {number} id - level id (1-12)
 * @returns {Object|null} level data of null
 */
export function laadLevel(id) {
  return LEVELS.find(l => l.id === id) || null;
}