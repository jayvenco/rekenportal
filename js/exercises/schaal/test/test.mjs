// Tests voor de logica van "Rekenen op schaal". Draai: node js/exercises/schaal/test/test.mjs
import assert from "node:assert/strict";
import { genereerOpgave, isNetjes, nl, isAntwoordGoed, antwoordTekst, CM_PER } from "../opgaven.js";
import { afbeeldingSvg } from "../afbeeldingen.js";

let n = 0;
const SOORTEN = ["mix", "plattegrond", "kaart", "model", "reken"];
const strip = (t) => t.replace(/<[^>]+>/g, "").replace(/ /g, " ");

// 1. Veel opgaven: antwoord netjes, positief, tekst en hulp aanwezig.
for (const soort of SOORTEN) for (const niveau of [1, 2, 3]) for (let i = 0; i < 300; i += 1) {
  const o = genereerOpgave({ soort, niveau });
  n += 1;
  assert.ok(o.antwoordGoed > 0 && isNetjes(o.antwoordGoed), `netjes: ${JSON.stringify(o)}`);
  for (const veld of ["vraag", "rapport", "info", "hint"]) assert.ok(o[veld] && o[veld].length > 5, `${veld} ontbreekt`);
  assert.ok(o.stappen.length >= 1, "stappen");
  assert.ok(o.tabel.length >= 2 && o.tabel[0].length === 2, "tabel");
  // Laatste stap noemt het juiste antwoord (voor schaal-bepalen: het schaalgetal).
  const laatste = strip(o.stappen.join(" "));
  const verwacht = nl(o.antwoordGoed).replace(/\u00A0/g, " ");
  assert.ok(laatste.includes(verwacht), `uitleg noemt ${verwacht}: ${laatste}`);
  // Het eigen antwoord is goed, een ander niet.
  assert.ok(isAntwoordGoed(String(o.antwoordGoed).replace(".", ","), o));
  assert.ok(!isAntwoordGoed(o.antwoordGoed + 1, o));
  // Afbeelding aanwezig voor plaat-soorten en geldig SVG.
  if (o.afbeelding) {
    const svg = afbeeldingSvg(o.afbeelding);
    assert.ok(svg.startsWith("<svg") && svg.endsWith("</svg>") && !svg.includes("NaN") && !svg.includes("undefined"), "svg");
  }
  if (["plattegrond", "kaart", "model"].includes(o.soortTekst)) assert.ok(o.afbeelding, "afbeelding verwacht");
}

// 2. Rekenkundige controle: plattegrond-opgave "voor" met bekende getallen.
{
  const sleutel = [];
  for (let i = 0; i < 2000; i += 1) {
    const o = genereerOpgave({ soort: "plattegrond", niveau: 2 });
    if (o.type !== "voor") continue;
    const m = o.afbeelding.maten[o.afbeelding.gevraagd];
    const echtCm = m * o.afbeelding.schaal;
    assert.ok(Math.abs(o.antwoordGoed * CM_PER[o.eenheid] - echtCm) < 1e-6, "plattegrond voor");
    sleutel.push(1);
  }
  assert.ok(sleutel.length > 50);
}

// 3. Kaart: terug en voor zijn elkaars omgekeerde.
for (let i = 0; i < 2000; i += 1) {
  const o = genereerOpgave({ soort: "kaart", niveau: 3 });
  if (o.type === "terug") assert.equal(o.antwoordGoed, o.afbeelding.afstand);
  if (o.type === "bepaal") assert.equal(o.antwoordGoed, o.S);
  if (o.type === "voor") assert.ok(Math.abs(o.antwoordGoed * CM_PER[o.eenheid] - o.afbeelding.afstand * o.S) < 1e-6);
}

// 4. Niveau 1: alleen hele uitkomsten, geen komma-getallen (behalve "1 cm is ...").
for (let i = 0; i < 1000; i += 1) {
  const o = genereerOpgave({ soort: "mix", niveau: 1 });
  if (o.type !== "eenCm") assert.ok(Number.isInteger(o.antwoordGoed), `niveau 1 heel: ${o.rapport} => ${o.antwoordGoed}`);
}

// 5. Voorbeeld uit de opdracht: 1 cm bij 1 : 50 = 0,5 m; 8 cm bij 1:25 000 = 2 km.
assert.equal(nl(0.5), "0,5");
assert.equal(nl(25000), "25 000");
assert.equal(antwoordTekst({ eenheid: "meter", antwoordGoed: 1.75 }), "1,75 meter");
assert.equal(antwoordTekst({ voorvoegsel: "1 :", eenheid: "", antwoordGoed: 50 }), "1 : 50");

console.log(`schaal: ${n} opgaven gecontroleerd, alle tests geslaagd`);
