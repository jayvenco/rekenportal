// exercises/getallenlijn/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor het genereren van getallenlijn-opgaven.
// Elke functie maakt één opgave-object voor een bepaald opgavetype.
// Een opgave-object heeft altijd: { type, vraagTekst, antwoordGoed, meta, weergave }
// - antwoordGoed: het juiste antwoord (getal, of array bij meerdere lege plekken).
// - weergave: alle info die de getallenlijn-tekenfunctie nodig heeft.
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";

/** Rondt een getal af naar het dichtstbijzijnde meervoud van stap, binnen [min, max]. */
function rondAfNaarStap(getal, min, max, stap) {
  const afgerond = Math.round((getal - min) / stap) * stap + min;
  return Math.min(max, Math.max(min, afgerond));
}

/** Geeft een willekeurig geldig getal op de lijn terug (op een stap-punt, niet gelijk aan de grenzen indien mogelijk). */
function willekeurigPuntOpLijn(min, max, stap, vermijdRanden = true) {
  const aantalStappen = Math.floor((max - min) / stap);
  if (aantalStappen <= 0) return min;
  let stapIndex = randomGeheelGetal(0, aantalStappen);
  if (vermijdRanden && aantalStappen > 2) {
    stapIndex = randomGeheelGetal(1, aantalStappen - 1);
  }
  return min + stapIndex * stap;
}

/**
 * Type 1: "Welk getal is dit?" — een pijl wijst naar een punt, kind typt het getal.
 */
export function genereerWelkGetal({ min, max, stap }) {
  const getal = willekeurigPuntOpLijn(min, max, stap);
  return {
    type: "welkGetal",
    vraagTekst: "Welk getal wijst de pijl aan?",
    antwoordGoed: getal,
    meta: { opgaveType: "welkGetal", stap, bereikMin: min, bereikMax: max },
    weergave: {
      min, max, stap,
      markeringen: [{ getal, pijl: true, kleur: "#e8735a" }],
    },
    invoerType: "cijfers",
  };
}

/**
 * Type 2: "Plaats het getal." — een getal wordt getoond, kind klikt op de juiste plek.
 */
export function genereerPlaatsGetal({ min, max, stap }) {
  const getal = willekeurigPuntOpLijn(min, max, stap);
  return {
    type: "plaatsGetal",
    vraagTekst: `Klik op de plek van het getal <span class="getal-groot">${getal}</span> op de lijn.`,
    antwoordGoed: getal,
    meta: { opgaveType: "plaatsGetal", stap, bereikMin: min, bereikMax: max },
    weergave: { min, max, stap, markeringen: [] },
    invoerType: "klikOpLijn",
  };
}

/**
 * Type 3: "Vul aan." — een paar getallen op de lijn zijn verborgen, kind vult ze in.
 * Er wordt telkens één verborgen getal per keer gevraagd, zodat feedback per antwoord blijft.
 */
export function genereerVulAan({ min, max, stap }) {
  const aantalStappen = Math.floor((max - min) / stap);
  const alleGetallen = [];
  for (let i = 0; i <= aantalStappen; i += 1) {
    alleGetallen.push(min + i * stap);
  }
  // Verberg 1 tot 3 getallen (niet de begin/eind), kies er 1 om te bevragen.
  const binnenGetallen = alleGetallen.filter((g) => g !== min && g !== max);
  const aantalTeVerbergen = Math.min(binnenGetallen.length, randomGeheelGetal(1, 3));
  const verborgen = [];
  const kopieBinnen = [...binnenGetallen];
  for (let i = 0; i < aantalTeVerbergen; i += 1) {
    const index = randomGeheelGetal(0, kopieBinnen.length - 1);
    verborgen.push(kopieBinnen[index]);
    kopieBinnen.splice(index, 1);
  }
  const gevraagdGetal = kiesWillekeurig(verborgen);
  return {
    type: "vulAan",
    vraagTekst: "Welk getal hoort in het lege vakje?",
    antwoordGoed: gevraagdGetal,
    meta: { opgaveType: "vulAan", stap, bereikMin: min, bereikMax: max },
    weergave: {
      min, max, stap,
      verborgenGetallen: verborgen,
      markeringen: [{ getal: gevraagdGetal, pijl: true, kleur: "#e8735a" }],
    },
    invoerType: "cijfers",
  };
}

/**
 * Type 4: "Tel door." — "10, 20, 30, ... wat komt er daarna?"
 */
export function genereerTelDoor({ min, max, stap }) {
  const aantalStappen = Math.floor((max - min) / stap);
  // We hebben minstens 4 getallen nodig: 3 als reeks + 1 als antwoord.
  const maxStartIndex = Math.max(0, aantalStappen - 3);
  const startIndex = randomGeheelGetal(0, maxStartIndex);
  const reeks = [
    min + startIndex * stap,
    min + (startIndex + 1) * stap,
    min + (startIndex + 2) * stap,
  ];
  const antwoord = min + (startIndex + 3) * stap;
  return {
    type: "telDoor",
    vraagTekst: `${reeks.join(", ")}, ... wat komt er daarna?`,
    antwoordGoed: antwoord,
    meta: { opgaveType: "telDoor", stap, bereikMin: min, bereikMax: max },
    weergave: {
      min, max, stap,
      markeringen: reeks.map((g) => ({ getal: g, kleur: "#4f8fe8" })),
    },
    invoerType: "cijfers",
  };
}

/**
 * Type 5: "Sprongen." — "Begin bij 30 en maak 3 sprongen van 5. Waar kom je uit?"
 */
export function genereerSprongen({ min, max, stap }) {
  const aantalSprongen = randomGeheelGetal(2, 4);
  // Bepaal een startpunt zodat het eindpunt binnen [min, max] blijft.
  const maxStart = max - aantalSprongen * stap;
  const minStart = min;
  let start;
  if (maxStart < minStart) {
    // Bereik te klein voor dit aantal sprongen: val terug op kleinere sprongafstand.
    start = min;
  } else {
    start = rondAfNaarStap(randomGeheelGetal(minStart, maxStart), min, max, stap);
  }
  const eindpunt = Math.min(max, start + aantalSprongen * stap);
  return {
    type: "sprongen",
    vraagTekst: `Begin bij <span class="getal-groot">${start}</span> en maak ${aantalSprongen} sprongen van ${stap}. Waar kom je uit?`,
    antwoordGoed: eindpunt,
    meta: { opgaveType: "sprongen", stap, bereikMin: min, bereikMax: max },
    weergave: {
      min, max, stap,
      markeringen: [{ getal: start, kleur: "#4f8fe8", label: "start" }],
    },
    invoerType: "cijfers",
  };
}

const GENERATOREN = {
  welkGetal: genereerWelkGetal,
  plaatsGetal: genereerPlaatsGetal,
  vulAan: genereerVulAan,
  telDoor: genereerTelDoor,
  sprongen: genereerSprongen,
};

export const OPGAVE_TYPES = [
  { id: "welkGetal", label: "Welk getal is dit?" },
  { id: "plaatsGetal", label: "Plaats het getal" },
  { id: "vulAan", label: "Vul aan" },
  { id: "telDoor", label: "Tel door" },
  { id: "sprongen", label: "Sprongen" },
];

/**
 * Genereert één opgave van een gekozen (of willekeurig) type.
 * @param {Object} instellingen - { min, max, stappen: number[], opgaveType: "alle" | id }
 */
export function genereerOpgave(instellingen) {
  const { min, max, stappen, opgaveType } = instellingen;
  const stap = kiesWillekeurig(stappen);
  const type =
    opgaveType && opgaveType !== "alle" ? opgaveType : kiesWillekeurig(OPGAVE_TYPES.map((t) => t.id));
  const generator = GENERATOREN[type];
  return generator({ min, max, stap });
}

/** Maakt een unieke sleutel van een opgave, om herhaling binnen een sessie te voorkomen. */
export function opgaveNaarSleutel(opgave) {
  return `${opgave.type}_${opgave.weergave.min}_${opgave.weergave.max}_${opgave.weergave.stap}_${opgave.antwoordGoed}_${opgave.vraagTekst}`;
}
