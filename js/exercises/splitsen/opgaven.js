// exercises/splitsen/opgaven.js
// -----------------------------------------------------------------------------
// Splitsopgaven voor groep 4: een getal bovenin, één deel is gegeven en het
// andere deel moet worden ingevuld. De grootste splitsing is instelbaar van
// 10 t/m 100 in stappen van 10.
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";

export const MAX_OPTIES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

/**
 * Hint met de "rond af naar tientallen"-strategie: van het gegeven deel eerst
 * naar het volgende tiental, daarna van dat tiental naar het hele getal.
 */
export function maakHint(totaal, gegeven) {
  if (totaal <= 10) {
    return `Hoeveel moet er bij ${gegeven} om ${totaal} te maken? Tel maar door vanaf ${gegeven}.`;
  }
  const tiental = Math.ceil(gegeven / 10) * 10;
  if (tiental === gegeven || tiental > totaal) {
    if (tiental === gegeven) {
      return `${gegeven} is een heel tiental. Hoeveel is het nog tot ${totaal}? Reken ${totaal} − ${gegeven}.`;
    }
    return `Van ${gegeven} naar ${totaal} is een klein stapje. Reken ${totaal} − ${gegeven}.`;
  }
  return `Rond af naar tientallen: van ${gegeven} naar ${tiental} is ${tiental - gegeven}. Van ${tiental} naar ${totaal} is ${totaal - tiental}. Samen ${tiental - gegeven} + ${totaal - tiental}.`;
}

/**
 * Genereert één splitsopgave.
 * @param {{maxGetal:number}} instellingen
 */
export function genereerOpgave(instellingen) {
  const max = instellingen.maxGetal || 20;
  // Bij grotere reeksen vooral de hogere getallen oefenen, maar ook kleine laten voorkomen.
  const min = Math.max(2, max <= 20 ? 2 : Math.floor(max / 2));
  const totaal = randomGeheelGetal(Math.min(min, max), max);
  let gegeven = randomGeheelGetal(1, totaal - 1);
  // Soms een heel tiental als gegeven deel (bv. 70 = 40 + 30).
  if (totaal > 20 && Math.random() < 0.3) {
    const tienen = Math.floor((totaal - 1) / 10);
    if (tienen >= 1) gegeven = randomGeheelGetal(1, tienen) * 10;
  }
  const antwoord = totaal - gegeven;
  const gegevenLinks = kiesWillekeurig([true, false]);
  return {
    type: "splitsen",
    totaal,
    gegeven,
    gegevenLinks,
    antwoordGoed: antwoord,
    hint: maakHint(totaal, gegeven),
    meta: { bewerking: "splitsen", totaal, maxGetal: max },
  };
}

export function opgaveNaarSleutel(opgave) {
  return `${opgave.totaal}_${opgave.gegeven}_${opgave.gegevenLinks}`;
}
