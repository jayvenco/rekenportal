// exercises/klokkijken/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor de klokkijken-oefening (groep 4): hele uren, halve uren
// en een mix van beide. Elke opgave heeft:
//   { type, uur, minuten, antwoord, meta }
// - uur/minuten bepalen de wijzerstand op de klok.
// - antwoord is de Nederlandse schrijfwijze ("3 uur", "half 4").
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";

// Alle mogelijke tijden in chronologische volgorde (stap van een half uur).
// Wordt gebruikt om plausibele foute antwoorden vlakbij het goede antwoord te kiezen.
const ALLE_TIJDEN = [
  "1 uur", "half 2", "2 uur", "half 3", "3 uur", "half 4",
  "4 uur", "half 5", "5 uur", "half 6", "6 uur", "half 7",
  "7 uur", "half 8", "8 uur", "half 9", "9 uur", "half 10",
  "10 uur", "half 11", "11 uur", "half 12", "12 uur", "half 1",
];

function genereerHeelUur() {
  const uur = randomGeheelGetal(1, 12);
  return {
    type: "klokkijken",
    uur,
    minuten: 0,
    antwoord: `${uur} uur`,
    meta: { subtype: "heel_uur", uur, minuten: 0 },
  };
}

function genereerHalfUur() {
  // uur = het 'vorige' hele uur. "half 4" = 3:30, dus uur = 3.
  const uur = randomGeheelGetal(1, 12);
  const volgendeUur = (uur % 12) + 1;
  return {
    type: "klokkijken",
    uur,
    minuten: 30,
    antwoord: `half ${volgendeUur}`,
    meta: { subtype: "half_uur", uur, minuten: 30 },
  };
}

/**
 * Genereert één opgave op basis van het gekozen type.
 * @param {Object} instellingen - { opgaveType: "heel" | "half" | "mix", aantalOpgaven: number }
 * @returns {Object} opgave-object.
 */
export function genereerOpgave(instellingen) {
  const mode = instellingen.opgaveType;
  if (mode === "heel") return genereerHeelUur();
  if (mode === "half") return genereerHalfUur();
  return kiesWillekeurig([genereerHeelUur, genereerHalfUur])();
}

/**
 * Kiest maximaal `aantal` foute antwoorden vlakbij het goede antwoord
 * (een half uur of uur ervoor/erna) — precies de typische vergissingen.
 * @param {string} juistLabel - het goede antwoord, bv. "half 4".
 * @param {number} [aantal=3] - hoeveel foute antwoorden.
 * @returns {string[]}
 */
export function genereerFouteAntwoorden(juistLabel, aantal = 3) {
  const index = ALLE_TIJDEN.indexOf(juistLabel);
  const resultaat = [];
  for (let afstand = 1; resultaat.length < aantal && afstand <= ALLE_TIJDEN.length; afstand += 1) {
    for (const richting of [1, -1]) {
      if (resultaat.length >= aantal) break;
      const i = (index + richting * afstand + ALLE_TIJDEN.length) % ALLE_TIJDEN.length;
      const label = ALLE_TIJDEN[i];
      if (!resultaat.includes(label)) resultaat.push(label);
    }
  }
  return resultaat;
}

/** Maakt een unieke sleutel van een opgave, om herhaling binnen een sessie te voorkomen. */
export function opgaveNaarSleutel(opgave) {
  return `${opgave.type}_${opgave.uur}_${opgave.minuten}`;
}