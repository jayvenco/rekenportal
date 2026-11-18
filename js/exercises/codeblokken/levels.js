// exercises/codeblokken/levels.js
// -----------------------------------------------------------------------------
// Levels voor Code-blokken, in drie sets:
//   pijltjes  - simpel: richtingsblokken (N/Z/O/W) op een bord
//   bord      - slim: vooruit en draaien, herhalen en functies
//   platform  - slim: lopen, springen, schieten en bouwen op een platform
//
// Elk level heeft een voorbeeldoplossing (oplossing). Bij een bordlevel worden
// het doel en de plek van de sterretjes daaruit afgeleid (maakLevel), dus elk
// level is oplosbaar. `par` = aantal blokken van de voorbeeldoplossing;
// `max` = het maximum aantal blokken dat je mag gebruiken (null = onbeperkt).
// `startProgramma` (optioneel) zet al blokken klaar, voor "repareer de code".
// -----------------------------------------------------------------------------

import { maakLevel, bouwProgramma, telBlokken } from "./engine.js";

const PIJL = { N: "up", Z: "down", D: "down", W: "left", O: "right" }; // D = Down (hulpletter voor de auteur)
/** "OOZZ" -> ["right","right","down","down"] */
const pijlen = (tekst) => [...tekst].map((c) => PIJL[c]);

const KORT = ["fwd", "tl", "tr"];
const STANDAARD_PIJLEN = ["up", "down", "left", "right"];

function bordLevel(def) {
  const level = maakLevel({ type: "bord", ...def });
  level.par = telBlokken(bouwProgramma(def.oplossing));
  return level;
}
function platformLevel(def) {
  const level = maakLevel({ type: "platform", ...def });
  level.par = telBlokken(bouwProgramma(def.oplossing));
  return level;
}

// ---- Set 1: pijltjes --------------------------------------------------------
const PIJLTJES = [
  { naam: "Eerste stapjes", w: 6, h: 3, start: [0, 1], oplossing: { main: pijlen("OOO") },
    uitleg: "Breng het vogeltje naar de vlag. Sleep blokjes naar het werkvlak." },
  { naam: "Omlaag en rechts", w: 6, h: 5, start: [0, 0], oplossing: { main: pijlen("OOOODDD") } },
  { naam: "Om de muur heen", w: 6, h: 6, start: [0, 5],
    muren: [[1, 2], [2, 2], [3, 2], [1, 4]], oplossing: { main: pijlen("NNNNOOOO") } },
  { naam: "Pak het sterretje", w: 6, h: 6, start: [0, 0],
    muren: [[1, 1], [2, 1], [3, 1], [4, 1], [1, 3], [2, 3], [3, 3], [4, 3]],
    sterrenOpStap: [5], oplossing: { main: pijlen("ZZOOOOOZZZ") } },
  { naam: "Repareer de code", w: 6, h: 4, start: [0, 3],
    muren: [[1, 2], [2, 2], [3, 2]], oplossing: { main: pijlen("NNOOOO") },
    startProgramma: { main: pijlen("NOOONN") },
    uitleg: "Er zit een foutje in dit programma. Kijk goed en repareer het!" },
  { naam: "De slinger", w: 6, h: 6, start: [0, 0],
    muren: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3]],
    sterrenOpStap: [8, 15], oplossing: { main: pijlen("OOOOODDWWWWWDDOOOOOD") } },
  { naam: "Trap met sterren", w: 7, h: 7, start: [0, 0],
    muren: [[1, 1], [1, 2], [3, 0], [3, 1], [3, 3], [5, 2], [5, 3], [5, 5], [1, 4], [2, 5]],
    sterrenOpStap: [4, 8], oplossing: { main: pijlen("OODDOODDOODD") } },
  { naam: "Het grote rondje", w: 7, h: 6, start: [0, 5],
    muren: [[1, 1], [1, 2], [1, 3], [1, 4], [3, 3], [3, 4], [4, 1], [4, 3], [5, 1]],
    sterrenOpStap: [5, 11, 18], oplossing: { main: pijlen("NNNNNOOOOOODDDDDWWWWNNNOO") } },
].map((def) => bordLevel({ ...def, blokken: STANDAARD_PIJLEN, max: null, laag: "pijltjes" }));

// ---- Set 2: bord (slim programmeren) -----------------------------------------
const BORD = [
  { naam: "Herhaal!", w: 7, h: 3, start: [0, 1], blokken: ["fwd", "repeat"], max: 2,
    oplossing: { main: [{ r: 5, b: ["fwd"] }] },
    uitleg: "Je mag maar 2 blokjes gebruiken. Gebruik het herhaal-blok!" },
  { naam: "De trap", w: 7, h: 7, start: [0, 6], blokken: [...KORT, "repeat"], max: 6,
    muren: [[2, 6], [3, 5], [4, 4], [1, 4], [5, 2]], sterrenOpStap: [7, 11],
    oplossing: { main: [{ r: 4, b: ["fwd", "tl", "fwd", "tr"] }] } },
  { naam: "Vierkantje", w: 6, h: 5, start: [1, 1], blokken: [...KORT, "repeat"], max: 4,
    muren: [[1, 2], [2, 2]], sterrenOpStap: [2, 5],
    oplossing: { main: [{ r: 3, b: ["fwd", "fwd", "tr"] }] } },
  { naam: "Zigzag", w: 9, h: 5, start: [0, 4], blokken: [...KORT, "repeat"], max: 6,
    muren: [[1, 3], [3, 2], [3, 4], [5, 1], [5, 3], [7, 0], [7, 2]], sterrenOpStap: [5, 15],
    oplossing: { main: [{ r: 4, b: ["fwd", "fwd", "tl", "fwd", "tr"] }] } },
  { naam: "Mijn eerste functie", w: 9, h: 6, start: [0, 0], blokken: [...KORT, "repeat", "callA"], functies: ["A"], max: 10,
    muren: [[1, 1], [4, 0], [4, 2], [6, 0], [7, 3], [7, 1]], sterrenOpStap: [4, 11],
    oplossing: { main: ["A", "fwd", "A", "fwd", "A"], A: ["fwd", "fwd", "tr", "fwd", "tl"] },
    uitleg: "Maak een functie A met blokjes erin. Gebruik A daarna in je programma." },
  { naam: "Repareer de functie", w: 9, h: 6, start: [0, 0], blokken: [...KORT, "repeat", "callA"], functies: ["A"], max: 10,
    muren: [[1, 1], [4, 0], [4, 2], [6, 0], [7, 3], [7, 1]],
    oplossing: { main: ["A", "fwd", "A", "fwd", "A"], A: ["fwd", "fwd", "tr", "fwd", "tl"] },
    startProgramma: { main: ["A", "fwd", "A", "A"], A: ["fwd", "fwd", "tr", "fwd", "tl"] },
    uitleg: "Het programma is bijna goed. Welk blokje mist er? Repareer het!" },
  { naam: "Twee functies", w: 8, h: 8, start: [0, 7], blokken: [...KORT, "repeat", "callA", "callB"], functies: ["A", "B"], max: 12,
    muren: [[1, 6], [3, 7], [3, 5], [5, 6], [5, 4], [7, 5], [6, 3]], sterrenOpStap: [4, 9],
    oplossing: { main: ["A", "B", "A", "B", "A", "fwd"], A: ["fwd", "fwd", "tl"], B: ["fwd", "tr"] } },
  { naam: "Lus in een lus", w: 7, h: 7, start: [0, 0], blokken: [...KORT, "repeat", "callA", "callB"], functies: ["A", "B"], max: 8,
    muren: [[0, 2], [0, 3], [0, 4], [1, 2], [2, 2], [3, 2], [4, 2], [2, 3], [3, 3], [4, 3], [2, 4], [3, 4], [4, 4]],
    sterrenOpStap: [6, 13], oplossing: { main: [{ r: 3, b: [{ r: 2, b: ["A"] }, "tr"] }], A: ["fwd", "fwd", "fwd"] },
    uitleg: "Een herhaal-blok mag ook in een herhaal-blok. Er mogen maximaal 8 blokjes in je programma." },
].map((def) => bordLevel({ ...def, laag: "bord" }));

// ---- Set 3: platform ---------------------------------------------------------
const PLATFORM = [
  { naam: "Wandelen", cellen: ".....F", blokken: ["walk"], max: null,
    oplossing: { main: ["walk", "walk", "walk", "walk", "walk"] },
    uitleg: "Laat het poppetje naar de vlag lopen." },
  { naam: "Spring!", cellen: "..^..F", blokken: ["walk", "jump"], max: null,
    oplossing: { main: ["walk", "jump", "walk", "walk"] },
    uitleg: "Een gat! Met springen vlieg je er twee stappen overheen." },
  { naam: "Het muurtje", cellen: ".#...*.F", blokken: ["walk", "jump", "repeat"], max: 4,
    oplossing: { main: ["jump", { r: 5, b: ["walk"] }] } },
  { naam: "Schiet!", cellen: "..E..F", blokken: ["walk", "shoot", "repeat"], max: 5,
    oplossing: { main: ["walk", "shoot", { r: 4, b: ["walk"] }] },
    uitleg: "Een vijand! Schiet hem weg als hij vlak voor je staat." },
  { naam: "Bouw een brug", cellen: "..^^..F", blokken: ["walk", "build", "repeat"], max: 6,
    oplossing: { main: ["walk", { r: 2, b: ["build", "walk"] }, { r: 3, b: ["walk"] }] },
    uitleg: "Twee gaten achter elkaar! Met bouwen leg je een brug voor je." },
  { naam: "Alles samen", cellen: "..^.#.E..*F", blokken: ["walk", "jump", "shoot", "repeat"], max: 7,
    oplossing: { main: ["walk", "jump", "jump", "shoot", { r: 5, b: ["walk"] }] } },
  { naam: "Een functie", cellen: ".E^.E^.E^.F", blokken: ["walk", "jump", "shoot", "repeat", "callA"], functies: ["A"], max: 8,
    oplossing: { main: ["A", "A", "A", "walk"], A: ["shoot", "walk", "jump"] },
    uitleg: "Zie je het patroon? Stop het in functie A en gebruik A drie keer." },
  { naam: "De grote reis", cellen: "..^^.#.E^^..*.F",
    blokken: ["walk", "jump", "shoot", "build", "repeat", "callA"], functies: ["A"], max: 14,
    oplossing: { main: ["walk", "A", "A", "walk", "jump", "shoot", "walk", "A", "A", { r: 5, b: ["walk"] }], A: ["build", "walk"] } },
].map((def) => platformLevel({ ...def, laag: "platform" }));

export const SETS = [
  { id: "pijltjes", naam: "Pijltjes", icoon: "➡️", omschrijving: "Sleep richtingsblokken naar het werkvlak.", levels: PIJLTJES },
  { id: "bord", naam: "Slim bord", icoon: "🔁", omschrijving: "Herhaal-blokken en functies op een bord.", levels: BORD },
  { id: "platform", naam: "Platform", icoon: "🦘", omschrijving: "Lopen, springen, schieten en bouwen.", levels: PLATFORM },
];

export function vindSet(id) {
  return SETS.find((s) => s.id === id) || SETS[0];
}
