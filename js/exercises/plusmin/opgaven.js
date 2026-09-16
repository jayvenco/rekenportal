// exercises/plusmin/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor het genereren van plus- en minsommen binnen een gekozen
// bereik. Elke opgave-object heeft: { type, vraagTekst, antwoordGoed, meta }
// - type: "plus" of "min" — welke bewerking.
// - antwoordGoed: het juiste antwoord (getal).
// - meta: extra info voor de statistieken ({ bewerking, bereikMin, bereikMax }).
// Aftreksommen leveren nooit een negatieve uitkomst op.
// -----------------------------------------------------------------------------

import { randomGeheelGetal } from "../../utils/willekeurig.js";

/**
 * Genereert een plussom binnen het gekozen bereik.
 * Beide getallen en de uitkomst blijven binnen [min, max].
 */
export function genereerPlusSom({ min, max }) {
  // Kies eerst de uitkomst binnen het bereik, dan een eerste term die kleiner is
  // dan de uitkomst, zodat de tweede term (uitkomst - eersteTerm) ook >= 0 is.
  // Dit garandeert dat zowel de termen als de uitkomst binnen [min, max] vallen.
  const uitkomst = randomGeheelGetal(min, max);
  const laagsteTerm = Math.max(0, min);
  const eersteTerm = randomGeheelGetal(laagsteTerm, uitkomst);
  const tweedeTerm = uitkomst - eersteTerm;
  return {
    type: "plus",
    vraagTekst: `${eersteTerm} + ${tweedeTerm} = ?`,
    antwoordGoed: uitkomst,
    meta: { bewerking: "plus", bereikMin: min, bereikMax: max },
  };
}

/**
 * Genereert een minsom binnen het gekozen bereik.
 * De uitkomst is nooit negatief: het aftrektal is altijd groter dan of gelijk
 * aan het te-trekken getal.
 */
export function genereerMinSom({ min, max }) {
  const aftrekTal = randomGeheelGetal(Math.max(min, 1), max);
  const laagsteAftrekker = Math.max(0, min);
  const teTrekken = randomGeheelGetal(laagsteAftrekker, aftrekTal);
  const uitkomst = aftrekTal - teTrekken;
  return {
    type: "min",
    vraagTekst: `${aftrekTal} - ${teTrekken} = ?`,
    antwoordGoed: uitkomst,
    meta: { bewerking: "min", bereikMin: min, bereikMax: max },
  };
}

const GENERATOREN = {
  plus: genereerPlusSom,
  min: genereerMinSom,
};

export const BEWERKING_OPTIES = [
  { id: "plus", label: "Plus (+)" },
  { id: "min", label: "Min (-)" },
  { id: "beide", label: "Beide" },
];

/**
 * Genereert één opgave op basis van de instellingen.
 * @param {Object} instellingen - { min, max, bewerking: "plus" | "min" | "beide" }
 */
export function genereerOpgave(instellingen) {
  const { min, max, bewerking } = instellingen;
  const gekozenType =
    bewerking === "beide" ? (Math.random() < 0.5 ? "plus" : "min") : bewerking;
  const generator = GENERATOREN[gekozenType] || genereerPlusSom;
  return generator({ min, max });
}

/** Maakt een unieke sleutel van een opgave, om herhaling binnen een sessie te voorkomen. */
export function opgaveNaarSleutel(opgave) {
  return `${opgave.type}_${opgave.vraagTekst}`;
}
