// exercises/getallenvolgorde/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor de volgorde-oefening: kiest een aantal unieke getallen
// binnen het gekozen bereik en schudt ze door elkaar. De oplossing is de
// oplopende volgorde.
// -----------------------------------------------------------------------------

import { randomGeheelGetal, schudArray } from "../../utils/willekeurig.js";

/**
 * Genereert één opgave.
 * @param {Object} instellingen - { min, max, aantalBolletjes }
 * @returns {{ getallen: number[], oplossing: number[], meta: Object }}
 */
export function genereerOpgave(instellingen) {
  const { min, max, aantalBolletjes } = instellingen;
  const bereikGrootte = max - min + 1;
  const aantal = Math.max(2, Math.min(aantalBolletjes, bereikGrootte));

  const getallenSet = new Set();
  while (getallenSet.size < aantal) {
    getallenSet.add(randomGeheelGetal(min, max));
  }

  const oplossing = [...getallenSet].sort((a, b) => a - b);
  const getallen = schudArray(oplossing);

  return {
    getallen,
    oplossing,
    meta: { aantalBolletjes: aantal, min, max },
  };
}

/** Unieke sleutel voor het voorkomen van identieke opgaven binnen één sessie. */
export function opgaveNaarSleutel(opgave) {
  return opgave.oplossing.join(",");
}
