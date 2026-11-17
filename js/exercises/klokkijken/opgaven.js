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

export const URENVERSCHIL_OPTIES = [1, 2, 3];
export const RICHTING_OPTIES = ["eerder", "later", "beide"];

/** Uur op de klok (1 t/m 12) na `verschil` uur eerder (negatief) of later (positief). */
export function verschuifUur(uur, verschil) {
  return ((((uur - 1 + verschil) % 12) + 12) % 12) + 1;
}

/**
 * "Uren eerder of later": een hele tijd staat op de klok en het kind typt zelf
 * welk uur het 1, 2 of 3 uur eerder of later is (bijv. 2 uur, 2 uur eerder = 12).
 * @param {{urenVerschil?: number[], richting?: string}} instellingen
 */
function genereerUrenOpgave(instellingen) {
  const verschillen = (instellingen.urenVerschil || URENVERSCHIL_OPTIES).filter((v) => URENVERSCHIL_OPTIES.includes(v));
  const kies = verschillen.length ? verschillen : URENVERSCHIL_OPTIES;
  const verschil = kiesWillekeurig(kies);
  const richting = instellingen.richting === "eerder" || instellingen.richting === "later"
    ? instellingen.richting
    : kiesWillekeurig(["eerder", "later"]);
  const uur = randomGeheelGetal(1, 12);
  const antwoord = verschuifUur(uur, richting === "eerder" ? -verschil : verschil);
  const uurWoord = verschil === 1 ? "1 uur" : `${verschil} uur`;
  const vraag = richting === "eerder"
    ? `Het is ${uur} uur. Hoe laat was het ${uurWoord} eerder?`
    : `Het is ${uur} uur. Hoe laat is het ${uurWoord} later?`;
  const hint = richting === "eerder"
    ? `Tel ${uurWoord} terug vanaf ${uur} op de klok. Let op: na de 1 komt weer de 12.`
    : `Tel ${uurWoord} door vanaf ${uur} op de klok. Let op: na de 12 komt weer de 1.`;
  return {
    type: "klokkijken_uren",
    uur,
    minuten: 0,
    verschil,
    richting,
    vraag,
    hint,
    antwoord,
    meta: { subtype: `uren_${richting}`, uur, minuten: 0, verschil },
  };
}

/**
 * Genereert één opgave op basis van het gekozen type.
 * @param {Object} instellingen - { modus?: "lezen"|"tekenen"|"uren", opgaveType: "heel" | "half" | "mix", aantalOpgaven: number,
 *   urenVerschil?: number[], richting?: "eerder"|"later"|"beide" }
 * @returns {Object} opgave-object.
 */
export function genereerOpgave(instellingen) {
  if (instellingen.modus === "uren") return genereerUrenOpgave(instellingen);
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
  if (opgave.type === "klokkijken_uren") return `uren_${opgave.uur}_${opgave.richting}_${opgave.verschil}`;
  return `${opgave.type}_${opgave.uur}_${opgave.minuten}`;
}