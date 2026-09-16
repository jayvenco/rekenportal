// exercises/tafels/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor het genereren van tafel-opgaven (keersommen).
// Elke opgave-object heeft: { type, vraagTekst, antwoordGoed, meta }
// - meta.tafel: het tafelgetal (bv. 7), zodat statistieken later per tafel
//   uitgesplitst kunnen worden.
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";

/**
 * Genereert één keersom-opgave voor een gekozen tafel.
 * @param {number} tafel - het tafelgetal (1 t/m 10).
 * @returns {Object} opgave-object.
 */
export function genereerKeersom(tafel) {
  const factor = randomGeheelGetal(1, 10);
  const antwoordGoed = tafel * factor;
  return {
    type: "keersom",
    vraagTekst: `${tafel} x ${factor} = ?`,
    antwoordGoed,
    meta: { tafel },
  };
}

/**
 * Genereert één opgave voor de gekozen tafel(s).
 * @param {Object} instellingen - { tafels: number[], aantalOpgaven: number }
 * @returns {Object} opgave-object.
 */
export function genereerOpgave(instellingen) {
  const tafel = kiesWillekeurig(instellingen.tafels);
  return genereerKeersom(tafel);
}

/** Maakt een unieke sleutel van een opgave, om herhaling binnen een sessie te voorkomen. */
export function opgaveNaarSleutel(opgave) {
  return `${opgave.type}_${opgave.meta.tafel}_${opgave.vraagTekst}`;
}
