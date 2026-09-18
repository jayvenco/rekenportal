// exercises/breuken/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor het genereren van breuk↔procent↔kommagetal conversies.
// Elke opgave-object heeft: { type, vraagTekst, antwoordGoed, meta }
// -----------------------------------------------------------------------------

import { kiesWillekeurig } from "../../utils/willekeurig.js";

/**
 * Grootste gemene deler (Euclides).
 */
function ggd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Brengt een breuk terug tot de eenvoudigste vorm.
 */
function vereenvoudig(teller, noemer) {
  const d = ggd(teller, noemer);
  return { teller: teller / d, noemer: noemer / d };
}

/**
 * Alle logische conversies tussen breuk, procent en kommagetal.
 * Alleen zuivere, eenvoudige combinaties die groep-8-kinderen kunnen maken.
 */
const CONVERSIES = [
  // helften
  { teller: 1, noemer: 2, procent: 50, komma: "0,5" },
  // kwarten
  { teller: 1, noemer: 4, procent: 25, komma: "0,25" },
  { teller: 3, noemer: 4, procent: 75, komma: "0,75" },
  // vijfden
  { teller: 1, noemer: 5, procent: 20, komma: "0,2" },
  { teller: 2, noemer: 5, procent: 40, komma: "0,4" },
  { teller: 3, noemer: 5, procent: 60, komma: "0,6" },
  { teller: 4, noemer: 5, procent: 80, komma: "0,8" },
  // tienden
  { teller: 1, noemer: 10, procent: 10, komma: "0,1" },
  { teller: 3, noemer: 10, procent: 30, komma: "0,3" },
  { teller: 7, noemer: 10, procent: 70, komma: "0,7" },
  { teller: 9, noemer: 10, procent: 90, komma: "0,9" },
  // eenvoudige extra
  { teller: 1, noemer: 1, procent: 100, komma: "1" },
  { teller: 2, noemer: 10, procent: 20, komma: "0,2" },
  { teller: 5, noemer: 10, procent: 50, komma: "0,5" },
  { teller: 1, noemer: 5, procent: 20, komma: "0,2" },
  { teller: 1, noemer: 2, procent: 50, komma: "0,5" },
];

/**
 * Maakt een mooie breukweergave voor het vraagscherm.
 * Gebruikt Unicode superscript/subscript voor teller/noemer.
 */
function breukVraagTekst(teller, noemer) {
  const superscript = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  const subscript   = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  const boven = String(teller).split('').map(c => superscript[c] || c).join('');
  const onder = String(noemer).split('').map(c => subscript[c] || c).join('');
  return `${boven}/${onder}`;
}

/**
 * Genereert één opgave voor de breuken-oefening.
 * @param {Object} instellingen - { conversieType: string, aantalOpgaven: number }
 *   conversieType: "breuk→procent" | "procent→komma" | "komma→breuk" | "alles"
 * @returns {Object} opgave-object met vraag, antwoord, etc.
 */
export function genereerOpgave(instellingen) {
  const conversieType = instellingen.conversieType || "alles";
  const type = kiesWillekeurig(
    conversieType === "alles"
      ? ["breuk→procent", "procent→komma", "komma→breuk"]
      : [conversieType]
  );

  const data = kiesWillekeurig(CONVERSIES);

  // Vereenvoudig de breuk voor de vraagstelling
  const simple = vereenvoudig(data.teller, data.noemer);

  let vraagTekst;
  let antwoordGoed;
  let antwoordType;
  let uitleg;

  switch (type) {
    case "breuk→procent": {
      // Toon breuk, kind typt percentage
      const breukVisueel = breukVraagTekst(simple.teller, simple.noemer);
      vraagTekst = `${breukVisueel} = hoeveel procent?`;
      antwoordGoed = {
        type: "procent",
        waarde: data.procent,            // number voor vergelijking
        display: `${data.procent}%`,
        normaal: data.procent,
      };
      antwoordType = "procent";
      uitleg = `${simple.teller}/${simple.noemer} = ${data.procent}%`;
      break;
    }

    case "procent→komma": {
      // Toon percentage, kind typt kommagetal
      vraagTekst = `${data.procent}% = welk kommagetal?`;
      antwoordGoed = {
        type: "komma",
        waarde: data.komma,              // string "0,5" voor weergave, ook voor parse
        display: data.komma,
        normaal: parseFloat(data.komma.replace(",", ".")), // 0.5
      };
      antwoordType = "komma";
      uitleg = `${data.procent}% = ${data.komma}`;
      break;
    }

    case "komma→breuk": {
      // Toon kommagetal, kind typt breuk (bv. "1/2")
      vraagTekst = `${data.komma} = welke breuk?`;
      antwoordGoed = {
        type: "breuk",
        teller: simple.teller,
        noemer: simple.noemer,
        display: `${simple.teller}/${simple.noemer}`,
        waarde: `${simple.teller}/${simple.noemer}`,
      };
      antwoordType = "breuk";
      uitleg = `${data.komma} = ${simple.teller}/${simple.noemer}`;
      break;
    }
  }

  return {
    type,
    vraagTekst,
    antwoordGoed,
    antwoordType,
    uitleg,
    meta: {
      conversieType: type,
      teller: simple.teller,
      noemer: simple.noemer,
      procent: data.procent,
      komma: data.komma,
    },
  };
}

/** Maakt een unieke sleutel van een opgave, om herhaling binnen een sessie te voorkomen. */
export function opgaveNaarSleutel(opgave) {
  return `${opgave.type}_${opgave.antwoordType}_${opgave.meta.teller}_${opgave.meta.noemer}_${opgave.meta.procent}`;
}