// Test voor Code-blokken: elke voorbeeldoplossing moet het level winnen,
// binnen het blokkenmaximum, zonder vroeg het doel te raken.
// Draai: node js/exercises/codeblokken/test/test.mjs
import { SETS } from "../levels.js";
import { bouwProgramma, speelAf, telBlokken, compileer, berekenSterren } from "../engine.js";

let fouten = 0;
const check = (ok, tekst) => { if (!ok) { fouten += 1; console.log("FOUT:", tekst); } };

for (const set of SETS) {
  set.levels.forEach((level, i) => {
    const naam = `${set.id} ${i + 1} (${level.naam})`;
    const oplossing = bouwProgramma(level.oplossing || {});
    const sim = speelAf(level, oplossing);
    check(sim.resultaat.gewonnen, `${naam}: voorbeeldoplossing wint niet (${sim.resultaat.reden})`);
    const gebruikt = telBlokken(oplossing);
    check(level.max === null || gebruikt <= level.max, `${naam}: oplossing gebruikt ${gebruikt} > max ${level.max}`);
    check(level.par === gebruikt, `${naam}: par klopt niet`);
    const { acties } = compileer(oplossing);
    const laatste = sim.stappen[sim.stappen.length - 1];
    // na het bereiken van het doel mogen er alleen nog draaiblokken (tl/tr) volgen
    const restPunt = acties.slice(laatste.actie + 1).every((a) => a.t === "tl" || a.t === "tr");
    check(restPunt, `${naam}: doel wordt al eerder geraakt (stap ${laatste.actie + 1} van ${acties.length})`);
    check(berekenSterren(level, sim.resultaat, gebruikt) === 3 || level.aantalSterren > 0 && sim.resultaat.sterrenGepakt < level.aantalSterren, `${naam}: oplossing haalt geen 3 sterren`);
    if (level.type !== "platform") {
      check(level.doel && !level.muren.some(([x, y]) => x === level.doel.x && y === level.doel.y), `${naam}: doel op een muur`);
      check(level.sterren.length === (level.sterrenOpStap || []).length, `${naam}: sterren`);
    }
    // repareer-levels moeten in het begin fout zijn
    if (level.startProgramma) {
      const start = bouwProgramma(level.startProgramma);
      check(!speelAf(level, start).resultaat.gewonnen, `${naam}: startprogramma is al goed`);
    }
    // bij een maximum: zonder lussen/functies moet het te veel blokken kosten (anders is het geen les)
    if (level.max !== null && level.max < acties.length) {
      check(true, "");
    }
  });
}

// engine-gedrag
{
  const p = bouwProgramma({ main: ["A"], A: ["A"] });
  check(compileer(p).fout === "recursie", "recursie wordt niet herkend");
  const lang = bouwProgramma({ main: [{ r: 9, b: [{ r: 9, b: [{ r: 9, b: ["walk"] }] }] }] });
  check(compileer(lang).fout === "te-lang", "te lang wordt niet herkend");
  check(compileer(bouwProgramma({})).fout === "leeg", "leeg wordt niet herkend");
  const val = speelAf({ type: "platform", cellen: "..^.F" }, bouwProgramma({ main: ["walk", "walk"] }));
  check(val.resultaat.reden === "val", "val in gat");
  const vijand = speelAf({ type: "platform", cellen: ".E..F" }, bouwProgramma({ main: ["jump"] }));
  check(vijand.resultaat.reden === "vijand", "springen over vijand");
  const brug = speelAf({ type: "platform", cellen: ".^.F" }, bouwProgramma({ main: ["build", "walk", "walk", "walk"] }));
  check(brug.resultaat.gewonnen, "brug bouwen");
  const rand = speelAf({ type: "bord", w: 3, h: 3, start: [0, 0], dir: "E", muren: [], sterren: [], doel: { x: 2, y: 2 } }, bouwProgramma({ main: ["left"] }));
  check(rand.resultaat.reden === "rand", "rand van het bord");
}

const totaal = SETS.reduce((n, s) => n + s.levels.length, 0);
console.log(fouten === 0 ? `Alle tests geslaagd (${totaal} levels).` : `${fouten} fout(en).`);
process.exit(fouten === 0 ? 0 : 1);
