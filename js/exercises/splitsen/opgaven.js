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

export const SOORT_OPTIES = ["boom", "brug", "beide"];

/** Splitsboom-opgave: één stap, het ontbrekende deel invullen. */
function genereerBoomOpgave(instellingen) {
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
  const hint = maakHint(totaal, gegeven);
  return {
    type: "splitsen",
    totaal,
    gegeven,
    gegevenLinks,
    antwoordGoed: antwoord,
    hint,
    stappen: [{
      vraag: `Splits ${totaal}. Welk getal hoort in het lege vakje?`,
      antwoord,
      hint,
    }],
    meta: { bewerking: "splitsen", totaal, maxGetal: max },
  };
}

/**
 * Bouwt een "via het tiental"-opgave uit een som. Het tweede getal (b) wordt
 * gesplitst in x (om het tiental te bereiken) en y (de rest):
 *   plus:  a + b  =  (a + x) + y   met a + x een heel tiental
 *   min:   a − b  =  (a − x) − y   met a − x een heel tiental
 * Stappen: 1) x  2) y  3) uitkomst.
 */
export function bouwBrugOpgave(bewerking, a, b) {
  const plus = bewerking === "plus";
  const eenheden = a % 10;
  const x = plus ? 10 - eenheden : eenheden;
  const y = b - x;
  const tiental = plus ? a + x : a - x;
  const uitkomst = plus ? tiental + y : tiental - y;
  const teken = plus ? "+" : "−";
  const richting = plus ? "volgende" : "vorige";
  return {
    type: "brug",
    bewerking,
    a, b, x, y, tiental, uitkomst,
    antwoordGoed: uitkomst,
    hint: "",
    stappen: [
      {
        vraag: `${a} ${teken} ${b}. Maak eerst een tiental: hoeveel ${plus ? "erbij" : "eraf"} om bij ${tiental} te komen?`,
        antwoord: x,
        hint: `Kijk naar de eenheden van ${a}. Hoeveel is het van ${a} naar het ${richting} tiental, ${tiental}?`,
      },
      {
        vraag: `Je hebt ${x} van de ${b} al gebruikt. Hoeveel blijft er over van ${b}?`,
        antwoord: y,
        hint: `Splits ${b} in twee delen: ${x} en nog een deel. Reken ${b} − ${x}.`,
      },
      {
        vraag: `Nu het laatste stuk: ${tiental} ${teken} ${y} = ?`,
        antwoord: uitkomst,
        hint: `Met een heel tiental is het makkelijk rekenen. ${tiental} ${teken} ${y}: tel de tientallen en de eenheden apart.`,
      },
    ],
    meta: { bewerking: `brug-${bewerking}`, a, b, maxGetal: Math.max(a, a + b) },
  };
}

/** Genereert een plus- of minsom waarbij je over een tiental heen moet. */
function genereerBrugOpgave(instellingen) {
  const max = Math.max(20, instellingen.maxGetal || 20);
  const plus = kiesWillekeurig([true, false]);
  // Soms een tweecijferig tweede getal (38 + 27) wanneer er ruimte is.
  const tweecijferig = max >= 50 && Math.random() < 0.4;
  for (let poging = 0; poging < 200; poging += 1) {
    if (plus) {
      const a = randomGeheelGetal(2, max - 3);
      const eenheden = a % 10;
      if (eenheden === 0) continue;
      const x = 10 - eenheden;
      const bMax = Math.min(tweecijferig ? 40 : 9, max - a);
      const bMin = Math.max(x + 1, tweecijferig ? 11 : 3);
      if (bMin > bMax) continue;
      const b = randomGeheelGetal(bMin, bMax);
      if (b > 10 && b % 10 === 0) continue; // 20, 30...: geen zinvolle splitsing
      return bouwBrugOpgave("plus", a, b);
    }
    const a = randomGeheelGetal(12, max);
    const eenheden = a % 10;
    if (eenheden === 0) continue;
    const bMax = Math.min(tweecijferig ? 40 : 9, a - 1);
    const bMin = Math.max(eenheden + 1, tweecijferig ? 11 : 3);
    if (bMin > bMax) continue;
    const b = randomGeheelGetal(bMin, bMax);
    if (b > 10 && b % 10 === 0) continue;
    return bouwBrugOpgave("min", a, b);
  }
  return bouwBrugOpgave("plus", 38, 7);
}

/**
 * Genereert één opgave.
 * @param {{maxGetal:number, soort?:"boom"|"brug"|"beide"}} instellingen
 */
export function genereerOpgave(instellingen) {
  const soort = instellingen.soort || "boom";
  if (soort === "brug") return genereerBrugOpgave(instellingen);
  if (soort === "beide" && Math.random() < 0.5) return genereerBrugOpgave(instellingen);
  return genereerBoomOpgave(instellingen);
}

export function opgaveNaarSleutel(opgave) {
  if (opgave.type === "brug") return `brug_${opgave.bewerking}_${opgave.a}_${opgave.b}`;
  return `${opgave.totaal}_${opgave.gegeven}_${opgave.gegevenLinks}`;
}
