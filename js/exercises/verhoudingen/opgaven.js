// exercises/verhoudingen/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor het genereren van verhouding-opgaven (recepten & schaal).
// Elke opgave-object heeft: { type, vraagTekst, antwoordGoed, meta }
// - meta.categorie: "recepten" of "schaal", voor later uitsplitsen.
// Alle antwoorden zijn gehele getallen (geen breuken).
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";

// =============================================================================
// RECEPT-TEMPLATES
// =============================================================================
// Elk recept heeft een basis-hoeveelheid voor een basis-aantal personen.
// Bij generatie wordt een doel-aantal personen gekozen dat een heel getal
// als antwoord oplevert.
// -----------------------------------------------------------------------------

const RECEPTEN = [
  // --- Eieren ---
  { ing: "eieren", eenheid: "eieren", baseAmount: 3, basePeople: 6 },
  { ing: "eieren", eenheid: "eieren", baseAmount: 4, basePeople: 8 },
  { ing: "eieren", eenheid: "eieren", baseAmount: 6, basePeople: 4 },
  { ing: "eieren", eenheid: "eieren", baseAmount: 2, basePeople: 4 },
  { ing: "eieren", eenheid: "eieren", baseAmount: 5, basePeople: 10 },
  // --- Bloem ---
  { ing: "bloem", eenheid: "gram", baseAmount: 200, basePeople: 4 },
  { ing: "bloem", eenheid: "gram", baseAmount: 300, basePeople: 6 },
  { ing: "bloem", eenheid: "gram", baseAmount: 500, basePeople: 5 },
  { ing: "bloem", eenheid: "gram", baseAmount: 250, basePeople: 5 },
  // --- Suiker ---
  { ing: "suiker", eenheid: "gram", baseAmount: 150, basePeople: 6 },
  { ing: "suiker", eenheid: "gram", baseAmount: 100, basePeople: 4 },
  // --- Melk ---
  { ing: "melk", eenheid: "ml", baseAmount: 400, basePeople: 4 },
  { ing: "melk", eenheid: "ml", baseAmount: 500, basePeople: 5 },
  { ing: "melk", eenheid: "ml", baseAmount: 300, basePeople: 6 },
  // --- Boter ---
  { ing: "boter", eenheid: "gram", baseAmount: 100, basePeople: 4 },
  { ing: "boter", eenheid: "gram", baseAmount: 200, basePeople: 8 },
  // --- Groenten / fruit ---
  { ing: "tomaten", eenheid: "stuks", baseAmount: 6, basePeople: 4 },
  { ing: "appels", eenheid: "stuks", baseAmount: 4, basePeople: 6 },
  { ing: "uien", eenheid: "stuks", baseAmount: 3, basePeople: 4 },
  // --- Kaas ---
  { ing: "kaas", eenheid: "gram", baseAmount: 150, basePeople: 4 },
  { ing: "kaas", eenheid: "gram", baseAmount: 200, basePeople: 6 },
  // --- Pasta / rijst ---
  { ing: "rijst", eenheid: "gram", baseAmount: 300, basePeople: 4 },
  { ing: "pasta", eenheid: "gram", baseAmount: 400, basePeople: 4 },
  { ing: "pasta", eenheid: "gram", baseAmount: 500, basePeople: 5 },
];

// =============================================================================
// SCHAAL-TEMPLATES
// =============================================================================
// "A cm = B km" waar B/A een geheel getal is.
// SCHALEN: normaal (km vragen) — 70% kans
// SCHALEN_INVERS: cm vragen — 30% kans
// -----------------------------------------------------------------------------

const SCHALEN = [
  { mapCm: 1, realKm: 2 },
  { mapCm: 1, realKm: 3 },
  { mapCm: 1, realKm: 4 },
  { mapCm: 1, realKm: 5 },
  { mapCm: 1, realKm: 10 },
  { mapCm: 1, realKm: 25 },
  { mapCm: 1, realKm: 50 },
  { mapCm: 1, realKm: 100 },
  { mapCm: 2, realKm: 4 },   // 1 cm = 2 km
  { mapCm: 2, realKm: 10 },  // 1 cm = 5 km
  { mapCm: 2, realKm: 20 },  // 1 cm = 10 km
  { mapCm: 3, realKm: 12 },  // 1 cm = 4 km
  { mapCm: 3, realKm: 15 },  // 1 cm = 5 km
  { mapCm: 4, realKm: 20 },  // 1 cm = 5 km
  { mapCm: 5, realKm: 10 },  // 1 cm = 2 km
  { mapCm: 5, realKm: 25 },  // 1 cm = 5 km
];

const SCHALEN_INVERS = [
  { mapCm: 1, realKm: 2 },
  { mapCm: 1, realKm: 3 },
  { mapCm: 1, realKm: 4 },
  { mapCm: 1, realKm: 5 },
  { mapCm: 1, realKm: 10 },
  { mapCm: 1, realKm: 25 },
  { mapCm: 2, realKm: 4 },
  { mapCm: 2, realKm: 8 },
  { mapCm: 2, realKm: 10 },
  { mapCm: 3, realKm: 6 },
  { mapCm: 4, realKm: 8 },
  { mapCm: 4, realKm: 12 },
  { mapCm: 5, realKm: 10 },
  { mapCm: 5, realKm: 15 },
  { mapCm: 5, realKm: 20 },
];

// =============================================================================
// HULPFUNCTIES: vind doel-waarden die een heel antwoord opleveren
// =============================================================================

/**
 * Vind alle geldige doel-aantallen personen voor een recept-template
 * waarbij het antwoord een geheel getal is (1-60).
 */
function vindReceptDoelen(baseAmount, basePeople) {
  const doelen = [];
  for (let target = 2; target <= 24; target += 1) {
    if (target === basePeople) continue;
    const antwoord = (baseAmount * target) / basePeople;
    if (Number.isInteger(antwoord) && antwoord >= 1 && antwoord <= 60) {
      doelen.push({ targetPeople: target, antwoord });
    }
  }
  return doelen;
}

/**
 * Vind alle geldige cm → km combinaties voor een schaal-template.
 */
function vindSchaalDoelen(mapCm, realKm) {
  const doelen = [];
  for (let cm = 2; cm <= 15; cm += 1) {
    const km = (realKm * cm) / mapCm;
    if (Number.isInteger(km) && km >= 1 && km <= 500) {
      doelen.push({ cm, km });
    }
  }
  return doelen;
}

/**
 * Vind alle geldige km → cm combinaties voor een inverse schaal-template.
 */
function vindSchaalInversDoelen(mapCm, realKm) {
  const doelen = [];
  for (let km = 2; km <= 100; km += 1) {
    const cm = (mapCm * km) / realKm;
    if (Number.isInteger(cm) && cm >= 1 && cm <= 20) {
      doelen.push({ km, cm });
    }
  }
  return doelen;
}

// =============================================================================
// GENERATOR-FUNCTIES
// =============================================================================

export function genereerReceptOpgave() {
  const recept = kiesWillekeurig(RECEPTEN);
  const doelen = vindReceptDoelen(recept.baseAmount, recept.basePeople);
  if (doelen.length === 0) return genereerReceptOpgave(); // fallback: probeer opnieuw

  const gekozen = kiesWillekeurig(doelen);

  return {
    type: "recept",
    vraagTekst: `Een recept vraagt ${recept.baseAmount} ${recept.ing} ` +
      `voor ${recept.basePeople} personen. Hoeveel ${recept.ing} ` +
      `heb je nodig voor ${gekozen.targetPeople} personen?`,
    antwoordGoed: gekozen.antwoord,
    meta: { categorie: "recepten" },
  };
}

export function genereerSchaalOpgave() {
  const isInvers = Math.random() < 0.3; // 30% inverse (vraag naar cm)

  if (isInvers) {
    const sjabloon = kiesWillekeurig(SCHALEN_INVERS);
    const doelen = vindSchaalInversDoelen(sjabloon.mapCm, sjabloon.realKm);
    if (doelen.length === 0) return genereerSchaalOpgave();
    const gekozen = kiesWillekeurig(doelen);
    return {
      type: "schaal_invers",
      vraagTekst: `Op een kaart is ${sjabloon.mapCm} cm = ${sjabloon.realKm} km. ` +
        `Hoeveel cm is ${gekozen.km} km in het echt op de kaart?`,
      antwoordGoed: gekozen.cm,
      meta: { categorie: "schaal" },
    };
  }

  // Normaal: geef cm, vraag km
  const sjabloon = kiesWillekeurig(SCHALEN);
  const doelen = vindSchaalDoelen(sjabloon.mapCm, sjabloon.realKm);
  if (doelen.length === 0) return genereerSchaalOpgave();
  const gekozen = kiesWillekeurig(doelen);

  return {
    type: "schaal",
    vraagTekst: `Op een kaart is ${sjabloon.mapCm} cm = ${sjabloon.realKm} km. ` +
      `Hoeveel km is ${gekozen.cm} cm in het echt?`,
    antwoordGoed: gekozen.km,
    meta: { categorie: "schaal" },
  };
}

// =============================================================================
// EXPORT: genereerOpgave + opgaveNaarSleutel
// =============================================================================

/**
 * Genereert één opgave op basis van de gekozen instellingen.
 * @param {Object} instellingen - { categorie: string, aantalOpgaven: number }
 * @returns {Object} opgave-object.
 */
export function genereerOpgave(instellingen) {
  const categorie = instellingen.categorie || "mix";

  switch (categorie) {
    case "recepten":
      return genereerReceptOpgave();
    case "schaal":
      return genereerSchaalOpgave();
    default: // "mix": 50/50
      return Math.random() < 0.5
        ? genereerReceptOpgave()
        : genereerSchaalOpgave();
  }
}

/** Maakt een unieke sleutel van een opgave, om herhaling binnen een sessie te voorkomen. */
export function opgaveNaarSleutel(opgave) {
  return `${opgave.type}_${opgave.vraagTekst}`;
}