// exercises/procenten/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor procenten-opgaven (groep 7).
// Vraagtypes:
//   1. Procenten berekenen: "25% van 80 = ?" → 20
//   2. Procentuele toename/afname: "Een spel kost 50 euro, wordt 10% duurder. Nieuwe prijs?"
//   3. Verhoudingstabellen met breuken/procenten: "3/4 = ?%"
//   4. Korting/BTW/winst/verlies: "Een jas kost 120 euro, 15% korting. Wat betaal je?"
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";

/**
 * Genereert één procenten-opgave van een bepaald type.
 * @param {string} type - "procent-van", "toename-afname", "breuk-naar-procent", "korting"
 * @returns {Object} opgave-object
 */
function genereerProcentVan() {
  // "X% van Y = ?" — mooie getallen voor groep 7
  const percenten = kiesWillekeurig([10, 20, 25, 30, 40, 50, 60, 75, 80, 100]);
  const grondtalOpties = [];
  // Zorg dat het antwoord altijd heel is
  for (let g = 10; g <= 200; g += 5) {
    const antw = (percenten / 100) * g;
    if (Number.isInteger(antw) && antw >= 1) {
      grondtalOpties.push(g);
    }
  }
  const grondtal = kiesWillekeurig(grondtalOpties);
  const antwoordGoed = (percenten / 100) * grondtal;
  return {
    type: "procent-van",
    vraagTekst: `${percenten}% van ${grondtal} = ?`,
    antwoordGoed,
    meta: { subtype: "procent-van", percenten, grondtal },
  };
}

function genereerToenameAfname() {
  // Prijs verandert met X%
  const prijsOpties = [20, 30, 40, 50, 60, 80, 100, 120, 150, 200];
  const percenten = kiesWillekeurig([5, 10, 15, 20, 25, 50]);
  const isToename = Math.random() < 0.5;
  const prijs = kiesWillekeurig(prijsOpties);
  const verandering = (percenten / 100) * prijs;
  if (!Number.isInteger(verandering)) {
    // opnieuw proberen
    return genereerToenameAfname();
  }
  const antwoordGoed = isToename ? prijs + verandering : prijs - verandering;
  const items = ["spel", "boek", "tas", "schoen", "bioscoopkaartje", "shirt", "broek"];
  const item = kiesWillekeurig(items);
  const woord = isToename ? "duurder" : "goedkoper";
  return {
    type: "toename-afname",
    vraagTekst: `Een ${item} kost €${prijs} en wordt ${percenten}% ${woord}. Wat is de nieuwe prijs?`,
    antwoordGoed,
    meta: { subtype: "toename-afname", percenten, prijs, isToename },
  };
}

function genereerBreukNaarProcent() {
  // Breuk → percentage
  const breuken = [
    { t: 1, n: 2, pct: 50 },
    { t: 1, n: 4, pct: 25 },
    { t: 3, n: 4, pct: 75 },
    { t: 1, n: 5, pct: 20 },
    { t: 2, n: 5, pct: 40 },
    { t: 3, n: 5, pct: 60 },
    { t: 4, n: 5, pct: 80 },
    { t: 1, n: 10, pct: 10 },
    { t: 3, n: 10, pct: 30 },
    { t: 7, n: 10, pct: 70 },
    { t: 9, n: 10, pct: 90 },
    { t: 1, n: 8, pct: 12.5 },
    { t: 3, n: 8, pct: 37.5 },
    { t: 5, n: 8, pct: 62.5 },
    { t: 7, n: 8, pct: 87.5 },
    { t: 1, n: 3, pct: Math.round(100 / 3 * 10) / 10 }, // 33.3
    { t: 2, n: 3, pct: Math.round(200 / 3 * 10) / 10 }, // 66.7
  ];
  const breuk = kiesWillekeurig(breuken);
  return {
    type: "breuk-naar-procent",
    vraagTekst: `${breuk.t}/${breuk.n} = ?%`,
    antwoordGoed: breuk.pct,
    meta: { subtype: "breuk-naar-procent", teller: breuk.t, noemer: breuk.n },
  };
}

function genereerKorting() {
  // Korting op een prijs
  const prijsOpties = [20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250];
  const percenten = kiesWillekeurig([10, 15, 20, 25, 30, 40, 50]);
  const prijs = kiesWillekeurig(prijsOpties);
  const kortingBedrag = (percenten / 100) * prijs;
  if (!Number.isInteger(kortingBedrag) && (kortingBedrag * 10) % 1 !== 0) {
    return genereerKorting();
  }
  const antwoordGoed = prijs - kortingBedrag;
  const items = ["jas", "tas", "fiets", "laptop", "tablet", "broek", "jasje", "spel"];
  const item = kiesWillekeurig(items);
  return {
    type: "korting",
    vraagTekst: `Een ${item} kost €${prijs}. Je krijgt ${percenten}% korting. Wat betaal je?`,
    antwoordGoed,
    meta: { subtype: "korting", percenten, prijs },
  };
}

const GENEREERDERS = {
  "procent-van": genereerProcentVan,
  "toename-afname": genereerToenameAfname,
  "breuk-naar-procent": genereerBreukNaarProcent,
  "korting": genereerKorting,
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