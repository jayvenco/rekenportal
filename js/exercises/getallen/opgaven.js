// exercises/getallen/opgaven.js
// -----------------------------------------------------------------------------
// Negatieve getallen + kommagetallen voor groep 7.
// Vraagtypes:
//   1. negatief-plus: "-5 + 3 = ?" → -2
//   2. negatief-min: "7 - (-3) = ?" → 10
//   3. komma-keer: "0.5 × 6 = ?" → 3
//   4. komma-delen: "2.4 ÷ 0.6 = ?" → 4
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";

function genereerNegatiefPlus() {
  // -5 + 3 = -2  of  -3 + 7 = 4  (kan positief of negatief uitkomen)
  const a = -randomGeheelGetal(2, 10);
  const b = randomGeheelGetal(1, 9);
  const antwoordGoed = a + b;
  return {
    type: "negatief-plus",
    vraagTekst: `${a} + ${b} = ?`,
    antwoordGoed,
    meta: { subtype: "negatief-plus", a, b },
  };
}

function genereerNegatiefMin() {
  // 7 - (-3) = 10  of  -5 - (-2) = -3
  const aOpties = [-10, -8, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const a = kiesWillekeurig(aOpties.filter((n) => n !== 0));
  const bNegatief = -randomGeheelGetal(1, 8);
  const antwoordGoed = a - bNegatief; // min een negatief = plus
  return {
    type: "negatief-min",
    vraagTekst: `${a} - (${bNegatief}) = ?`,
    antwoordGoed,
    meta: { subtype: "negatief-min", a, b: bNegatief },
  };
}

function genereerKommaKeer() {
  // 0.5 × 6 = 3  of  0.2 × 8 = 1.6
  const kommaOpties = [
    { factor: 0.5, label: "0,5" },
    { factor: 0.2, label: "0,2" },
    { factor: 0.25, label: "0,25" },
    { factor: 0.4, label: "0,4" },
    { factor: 0.75, label: "0,75" },
    { factor: 0.1, label: "0,1" },
    { factor: 1.5, label: "1,5" },
    { factor: 2.5, label: "2,5" },
    { factor: 0.05, label: "0,05" },
  ];
  const keuze = kiesWillekeurig(kommaOpties);
  // Kies een geheel getal zodat antwoord maximaal 1 decimaal heeft
  const heleOpties = [];
  for (let g = 1; g <= 20; g++) {
    const antw = keuze.factor * g;
    if (Math.abs(Math.round(antw * 10) - antw * 10) < 0.001) {
      heleOpties.push(g);
    }
  }
  const geheel = kiesWillekeurig(heleOpties);
  const antwoordGoed = Math.round(keuze.factor * geheel * 10) / 10;
  return {
    type: "komma-keer",
    vraagTekst: `${keuze.label} × ${geheel} = ?`,
    antwoordGoed,
    meta: { subtype: "komma-keer", komma: keuze.factor, geheel },
  };
}

function genereerKommaDelen() {
  // 2.4 ÷ 0.6 = 4  of  1.5 ÷ 0.5 = 3
  const delingen = [
    { deler: 0.5, labelDeler: "0,5", quotienten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { deler: 0.2, labelDeler: "0,2", quotienten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { deler: 0.25, labelDeler: "0,25", quotienten: [1, 2, 3, 4] },
    { deler: 0.4, labelDeler: "0,4", quotienten: [1, 2, 3, 4, 5] },
    { deler: 0.75, labelDeler: "0,75", quotienten: [1, 2, 3, 4] },
    { deler: 0.1, labelDeler: "0,1", quotienten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { deler: 1.5, labelDeler: "1,5", quotienten: [2, 4, 6] },
    { deler: 2.5, labelDeler: "2,5", quotienten: [2, 4] },
    { deler: 0.05, labelDeler: "0,05", quotienten: [10, 20, 30, 40] },
  ];
  const keuze = kiesWillekeurig(delingen);
  const quot = kiesWillekeurig(keuze.quotienten);
  const deeltal = Math.round(keuze.deler * quot * 10) / 10;
  const antwoordGoed = Math.round(quot * 10) / 10;
  return {
    type: "komma-delen",
    vraagTekst: `${deeltal.toFixed(keuze.deler < 0.1 ? 2 : 1).replace(".", ",")} ÷ ${keuze.labelDeler} = ?`,
    antwoordGoed,
    meta: { subtype: "komma-delen", deeltal, deler: keuze.deler, quot },
  };
}

const GENEREERDERS = {
  "negatief-plus": genereerNegatiefPlus,
  "negatief-min": genereerNegatiefMin,
  "komma-keer": genereerKommaKeer,
  "komma-delen": genereerKommaDelen,
};

/**
 * Genereert één opgave voor de gekozen vraagtype(s).
 * @param {Object} instellingen - { types: string[], aantalOpgaven: number }
 * @returns {Object} opgave-object
 */
export function genereerOpgave(instellingen) {
  const type = kiesWillekeurig(instellingen.types);
  const generator = GENEREERDERS[type];
  return generator();
}

/** Maakt een unieke sleutel van een opgave. */
export function opgaveNaarSleutel(opgave) {
  return `${opgave.type}_${opgave.vraagTekst}`;
}