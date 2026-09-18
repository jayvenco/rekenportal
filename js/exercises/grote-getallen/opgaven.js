// exercises/grote-getallen/opgaven.js
// -----------------------------------------------------------------------------
// Grote getallen voor groep 7: miljoenen/miljarden lezen, vergelijken, omrekenen.
// Vraagtypes:
//   1. naar-getal: "Schrijf 3 miljoen als getal" → 3000000
//   2. plus-groot: "1 miljoen + 2 miljoen = ?" → 3000000
//   3. hoeveel-nullen: "Hoeveel nullen heeft 1 miljoen?" → 6
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";

function genereerNaarGetal() {
  const isMiljard = Math.random() < 0.3;
  const factor = isMiljard ? 1_000_000_000 : 1_000_000;
  const max = isMiljard ? 9 : 999;
  const veelvoud = kiesWillekeurig([1, 2, 3, 4, 5, 6, 7, 8, 10, 15, 20, 25, 50, 100, 250, 500]);
  const getal = veelvoud * factor;
  const woord = isMiljard ? "miljard" : "miljoen";
  // Decimals: 2.5 miljoen, 1.5 miljard, etc.
  if (veelvoud > 100 && Math.random() < 0.2) {
    // half miljoen etc
    const halfGetal = (veelvoud + 0.5) * factor;
    return {
      type: "naar-getal",
      vraagTekst: `Schrijf ${veelvoud},5 ${woord} als getal.`,
      antwoordGoed: halfGetal,
      meta: { subtype: "naar-getal", grootte: woord, veelvoud: `${veelvoud},5` },
    };
  }
  return {
    type: "naar-getal",
    vraagTekst: `Schrijf ${veelvoud} ${woord} als getal.`,
    antwoordGoed: getal,
    meta: { subtype: "naar-getal", grootte: woord, veelvoud },
  };
}

function genereerPlusGroot() {
  const isMiljard = Math.random() < 0.2;
  const factor = isMiljard ? 1_000_000_000 : 1_000_000;
  const max = isMiljard ? 5 : 20;
  const a = randomGeheelGetal(1, max);
  const b = randomGeheelGetal(1, max);
  const getalA = a * factor;
  const getalB = b * factor;
  const antwoordGoed = getalA + getalB;
  const woord = isMiljard ? "miljard" : "miljoen";
  return {
    type: "plus-groot",
    vraagTekst: `${a} ${woord} + ${b} ${woord} = ?`,
    antwoordGoed,
    meta: { subtype: "plus-groot", grootte: woord, a, b },
  };
}

function genereerHoeveelNullen() {
  const opties = [
    { getal: "1 duizend", nullen: 3, getalAlsCijfer: 1000 },
    { getal: "10 duizend", nullen: 4, getalAlsCijfer: 10000 },
    { getal: "100 duizend", nullen: 5, getalAlsCijfer: 100000 },
    { getal: "1 miljoen", nullen: 6, getalAlsCijfer: 1000000 },
    { getal: "10 miljoen", nullen: 7, getalAlsCijfer: 10000000 },
    { getal: "100 miljoen", nullen: 8, getalAlsCijfer: 100000000 },
    { getal: "1 miljard", nullen: 9, getalAlsCijfer: 1000000000 },
  ];
  const optie = kiesWillekeurig(opties);
  return {
    type: "hoeveel-nullen",
    vraagTekst: `Hoeveel nullen heeft ${optie.getal}?`,
    antwoordGoed: optie.nullen,
    meta: { subtype: "hoeveel-nullen", getal: optie.getal },
  };
}

const GENEREERDERS = {
  "naar-getal": genereerNaarGetal,
  "plus-groot": genereerPlusGroot,
  "hoeveel-nullen": genereerHoeveelNullen,
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