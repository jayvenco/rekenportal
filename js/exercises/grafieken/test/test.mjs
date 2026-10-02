// Tests voor "Grafieken lezen": dataconsistentie en antwoordvalidatie.
// Uitvoeren: node js/exercises/grafieken/test/test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { uitvoer } from "../data/bouw-opgaven.mjs";
import { controleerAntwoord, parseGetal } from "../validatie.js";

const dir = dirname(fileURLToPath(import.meta.url));
const json = JSON.parse(readFileSync(join(dir, "../data/opgaven.json"), "utf8"));
let n = 0;
const test = (naam, fn) => { fn(); n += 1; console.log("ok -", naam); };

test("opgaven.json is up-to-date met de generator", () => assert.deepEqual(json, JSON.parse(JSON.stringify(uitvoer))));
test("50 unieke opgaven, 10 per niveau", () => {
  assert.equal(json.opgaven.length, 50);
  assert.equal(new Set(json.opgaven.map((o) => o.id)).size, 50);
  assert.equal(new Set(json.opgaven.map((o) => o.titel)).size, 50);
  for (let nv = 1; nv <= 5; nv++) assert.equal(json.opgaven.filter((o) => o.niveau === nv).length, 10);
});
test("alle verplichte velden en geldige types", () => {
  for (const o of json.opgaven) {
    for (const k of ["id", "titel", "context", "leerdoel", "categorie", "hint"]) assert.ok(o[k], `${o.id}: ${k}`);
    assert.ok(json.categorieen.includes(o.categorie));
    assert.ok(o.uitleg.length >= 2, `${o.id}: uitleg`);
    assert.ok(o.vraag.tekst.length > 5);
    assert.ok(["getal", "meerkeuze", "waaronwaar", "meerdere", "tekst"].includes(o.vraag.type));
  }
  const types = new Set(json.opgaven.map((o) => o.vraag.type));
  assert.equal(types.size, 5);
  const grafieken = new Set(json.opgaven.map((o) => o.grafiek.type));
  for (const t of ["staaf", "lijn", "cirkel", "pictogram", "tabel", "combi"]) assert.ok(grafieken.has(t), t);
});
test("grafiekdata is geldig (schaal, lengtes, cirkel = 100%/24 uur)", () => {
  for (const o of json.opgaven) {
    const g = o.grafiek;
    if (g.type === "lijn" || g.type === "staaf") {
      for (const r of g.reeksen) {
        assert.equal(r.waarden.length, g.labels.length, o.id);
        for (const w of r.waarden) assert.ok(w >= g.yMin && w <= g.yMax, `${o.id}: waarde buiten as`);
      }
      assert.ok(Math.abs((g.yMax - g.yMin) / g.stap - Math.round((g.yMax - g.yMin) / g.stap)) < 1e-9, `${o.id}: stap`);
    }
    if (g.type === "cirkel") {
      const t = g.segmenten.reduce((s, x) => s + x.waarde, 0);
      assert.equal(t, g.eenheid === "%" ? 100 : 24, o.id);
    }
    if (g.type === "combi") {
      assert.equal(g.staaf.waarden.length, g.labels.length);
      assert.equal(g.lijn.waarden.length, g.labels.length);
    }
  }
});
test("meerkeuze/meerdere: antwoord-indexen bestaan", () => {
  for (const o of json.opgaven) {
    const v = o.vraag;
    if (v.type === "meerkeuze") assert.ok(Number.isInteger(v.antwoord) && v.opties[v.antwoord] !== undefined && v.opties.length >= 3, o.id);
    if (v.type === "meerdere") assert.ok(v.antwoord.length >= 1 && v.antwoord.every((i) => v.opties[i] !== undefined), o.id);
    if (v.type === "waaronwaar") assert.equal(typeof v.antwoord, "boolean");
  }
});
test("uitleg vermeldt het antwoord bij getalvragen", () => {
  for (const o of json.opgaven.filter((x) => x.vraag.type === "getal")) {
    const tekst = o.uitleg.join(" ").replace(/\./g, "").replace(/,/g, ".");
    assert.ok(tekst.includes(String(o.vraag.antwoord)), `${o.id}: antwoord ${o.vraag.antwoord} niet in uitleg`);
  }
});
test("elk goed antwoord wordt goed gekeurd", () => {
  for (const o of json.opgaven) {
    const v = o.vraag;
    assert.ok(controleerAntwoord(v, v.type === "getal" ? String(v.antwoord).replace(".", ",") : v.antwoord), o.id);
  }
});
test("getalvalidatie: komma, punt, eenheid, spaties, duizendtallen", () => {
  const v = { type: "getal", antwoord: 6.8, eenheid: "cm" };
  for (const s of ["6,8", "6.8", " 6,8 cm", "6,8cm", "  6,80  "]) assert.ok(controleerAntwoord(v, s), s);
  for (const s of ["6,9", "68", "", "abc"]) assert.ok(!controleerAntwoord(v, s), s);
  assert.ok(controleerAntwoord({ type: "getal", antwoord: 4600 }, "4.600"));
  assert.ok(controleerAntwoord({ type: "getal", antwoord: 4600 }, "4600 bezoekers"));
  assert.ok(controleerAntwoord({ type: "getal", antwoord: 90 }, "€ 90"));
  assert.ok(controleerAntwoord({ type: "getal", antwoord: 25 }, "25%"));
  assert.equal(parseGetal("x"), null);
});
test("tekst-, waar/onwaar- en meerdere-validatie", () => {
  const t = { type: "tekst", antwoord: "Plant A", geaccepteerd: ["plant a", "a"] };
  assert.ok(controleerAntwoord(t, " plant  A ") && controleerAntwoord(t, "A") && !controleerAntwoord(t, "Plant B"));
  assert.ok(controleerAntwoord({ type: "waaronwaar", antwoord: false }, false) && !controleerAntwoord({ type: "waaronwaar", antwoord: false }, true));
  const m = { type: "meerdere", antwoord: [0, 1, 3] };
  assert.ok(controleerAntwoord(m, [3, 0, 1]) && !controleerAntwoord(m, [0, 1]) && !controleerAntwoord(m, [0, 1, 2, 3]));
});
console.log(`\n${n} testgroepen geslaagd`);
