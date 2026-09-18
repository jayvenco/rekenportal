// exercises/meten/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor het genereren van meet-opgaven: omtrek, oppervlakte,
// inhoud, gewicht en tijd. Elke opgave heeft:
//   { type, vraagTekst, antwoordGoed, meta }
// - meta.categorie: 'omtrek_oppervlakte' | 'inhoud' | 'gewicht' | 'tijd'
// - meta.soort: beschrijving van het soort som (voor statistieken).
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";

// --- Hulpfuncties voor mooie getallen ---

/** Kiest een getal uit een reeks stapgroottes. */
function randomStapGetal(min, max, stap) {
  const stappen = Math.floor((max - min) / stap);
  return min + randomGeheelGetal(0, stappen) * stap;
}

// --- Categorie: Omtrek / Oppervlakte ---

function genereerOmtrekVierkant() {
  const zijde = randomGeheelGetal(1, 20);
  const antwoordGoed = zijde * 4;
  return {
    type: "omtrek_oppervlakte",
    vraagTekst: `Een vierkant heeft een zijde van ${zijde} cm. Wat is de omtrek?`,
    antwoordGoed,
    meta: { categorie: "omtrek_oppervlakte", soort: "omtrek_vierkant" },
  };
}

function genereerOppervlakteVierkant() {
  const zijde = randomGeheelGetal(1, 15);
  const antwoordGoed = zijde * zijde;
  return {
    type: "omtrek_oppervlakte",
    vraagTekst: `Een vierkant heeft een zijde van ${zijde} cm. Wat is de oppervlakte?`,
    antwoordGoed,
    meta: { categorie: "omtrek_oppervlakte", soort: "oppervlakte_vierkant" },
  };
}

function genereerOmtrekRechthoek() {
  const lengte = randomGeheelGetal(1, 20);
  const breedte = randomGeheelGetal(1, 20);
  const antwoordGoed = (lengte + breedte) * 2;
  return {
    type: "omtrek_oppervlakte",
    vraagTekst: `Een rechthoek is ${lengte} cm bij ${breedte} cm. Wat is de omtrek?`,
    antwoordGoed,
    meta: { categorie: "omtrek_oppervlakte", soort: "omtrek_rechthoek" },
  };
}

function genereerOppervlakteRechthoek() {
  const lengte = randomGeheelGetal(1, 15);
  const breedte = randomGeheelGetal(1, 15);
  const antwoordGoed = lengte * breedte;
  return {
    type: "omtrek_oppervlakte",
    vraagTekst: `Een rechthoek is ${lengte} cm bij ${breedte} cm. Wat is de oppervlakte?`,
    antwoordGoed,
    meta: { categorie: "omtrek_oppervlakte", soort: "oppervlakte_rechthoek" },
  };
}

const OMTREK_OPPERVLAKTE_GENERATOREN = [
  genereerOmtrekVierkant,
  genereerOppervlakteVierkant,
  genereerOmtrekRechthoek,
  genereerOppervlakteRechthoek,
];

function genereerOmtrekOppervlakte() {
  return kiesWillekeurig(OMTREK_OPPERVLAKTE_GENERATOREN)();
}

// --- Categorie: Inhoud ---

function genereerLiterNaarMl() {
  const liter = randomGeheelGetal(1, 10);
  const antwoordGoed = liter * 1000;
  return {
    type: "inhoud",
    vraagTekst: `${liter} liter = ? ml`,
    antwoordGoed,
    meta: { categorie: "inhoud", soort: "liter_naar_ml" },
  };
}

function genereerMlNaarLiter() {
  const liter = randomGeheelGetal(1, 10);
  const ml = liter * 1000;
  const antwoordGoed = liter;
  return {
    type: "inhoud",
    vraagTekst: `${ml} ml = ? liter`,
    antwoordGoed,
    meta: { categorie: "inhoud", soort: "ml_naar_liter" },
  };
}

function genereerDoosInhoud() {
  const l = randomGeheelGetal(1, 10);
  const b = randomGeheelGetal(1, 10);
  const h = randomGeheelGetal(1, 10);
  const antwoordGoed = l * b * h;
  return {
    type: "inhoud",
    vraagTekst: `Een doos is ${l} cm × ${b} cm × ${h} cm. Wat is de inhoud in cm³?`,
    antwoordGoed,
    meta: { categorie: "inhoud", soort: "doos_inhoud" },
  };
}

const INHOUD_GENERATOREN = [
  genereerLiterNaarMl,
  genereerMlNaarLiter,
  genereerDoosInhoud,
];

function genereerInhoud() {
  return kiesWillekeurig(INHOUD_GENERATOREN)();
}

// --- Categorie: Gewicht ---

function genereerKgNaarG() {
  const kg = randomGeheelGetal(1, 20);
  const antwoordGoed = kg * 1000;
  return {
    type: "gewicht",
    vraagTekst: `${kg} kg = ? g`,
    antwoordGoed,
    meta: { categorie: "gewicht", soort: "kg_naar_g" },
  };
}

function genereerGNaarKg() {
  const kg = randomGeheelGetal(1, 20);
  const g = kg * 1000;
  const antwoordGoed = kg;
  return {
    type: "gewicht",
    vraagTekst: `${g} g = ? kg`,
    antwoordGoed,
    meta: { categorie: "gewicht", soort: "g_naar_kg" },
  };
}

function genereerTonNaarKg() {
  const ton = randomGeheelGetal(1, 5);
  const antwoordGoed = ton * 1000;
  return {
    type: "gewicht",
    vraagTekst: `${ton} ton = ? kg`,
    antwoordGoed,
    meta: { categorie: "gewicht", soort: "ton_naar_kg" },
  };
}

function genereerKgNaarTon() {
  const ton = randomGeheelGetal(1, 5);
  const kg = ton * 1000;
  const antwoordGoed = ton;
  return {
    type: "gewicht",
    vraagTekst: `${kg} kg = ? ton`,
    antwoordGoed,
    meta: { categorie: "gewicht", soort: "kg_naar_ton" },
  };
}

const GEWICHT_GENERATOREN = [
  genereerKgNaarG,
  genereerGNaarKg,
  genereerTonNaarKg,
  genereerKgNaarTon,
];

function genereerGewicht() {
  return kiesWillekeurig(GEWICHT_GENERATOREN)();
}

// --- Categorie: Tijd ---

function genereerMinutenInUren() {
  const uren = randomGeheelGetal(1, 10);
  const antwoordGoed = uren * 60;
  return {
    type: "tijd",
    vraagTekst: `Hoeveel minuten zitten er in ${uren} uur?`,
    antwoordGoed,
    meta: { categorie: "tijd", soort: "minuten_in_uren" },
  };
}

function genereerUrenInMinuten() {
  const uren = randomGeheelGetal(1, 10);
  const minuten = uren * 60;
  const antwoordGoed = uren;
  return {
    type: "tijd",
    vraagTekst: `${minuten} minuten = ? uur`,
    antwoordGoed,
    meta: { categorie: "tijd", soort: "uren_in_minuten" },
  };
}

function genereerSecondenInMinuten() {
  const min = randomGeheelGetal(1, 10);
  const antwoordGoed = min * 60;
  return {
    type: "tijd",
    vraagTekst: `Hoeveel seconden zitten er in ${min} minuten?`,
    antwoordGoed,
    meta: { categorie: "tijd", soort: "seconden_in_minuten" },
  };
}

function genereerDagenInWeken() {
  const weken = randomGeheelGetal(1, 6);
  const antwoordGoed = weken * 7;
  return {
    type: "tijd",
    vraagTekst: `Hoeveel dagen zitten er in ${weken} weken?`,
    antwoordGoed,
    meta: { categorie: "tijd", soort: "dagen_in_weken" },
  };
}

function genereerUrenInDagen() {
  const dagen = randomGeheelGetal(1, 5);
  const antwoordGoed = dagen * 24;
  return {
    type: "tijd",
    vraagTekst: `Hoeveel uren zitten er in ${dagen} dagen?`,
    antwoordGoed,
    meta: { categorie: "tijd", soort: "uren_in_dagen" },
  };
}

const TIJD_GENERATOREN = [
  genereerMinutenInUren,
  genereerUrenInMinuten,
  genereerSecondenInMinuten,
  genereerDagenInWeken,
  genereerUrenInDagen,
];

function genereerTijd() {
  return kiesWillekeurig(TIJD_GENERATOREN)();
}

// --- Dispatch op basis van instellingen ---

const CATEGORIE_DISPATCH = {
  omtrek_oppervlakte: genereerOmtrekOppervlakte,
  inhoud: genereerInhoud,
  gewicht: genereerGewicht,
  tijd: genereerTijd,
};

/**
 * Genereert één opgave op basis van de gekozen categorie(ën).
 * @param {Object} instellingen - { categorieen: string[], aantalOpgaven: number }
 * @returns {Object} opgave-object.
 */
export function genereerOpgave(instellingen) {
  const gekozen = instellingen.categorieen;
  const cat =
    gekozen.length === 5 || gekozen.includes("alles")
      ? kiesWillekeurig(Object.keys(CATEGORIE_DISPATCH))
      : kiesWillekeurig(gekozen);
  return CATEGORIE_DISPATCH[cat]();
}

/** Maakt een unieke sleutel van een opgave, om herhaling binnen een sessie te voorkomen. */
export function opgaveNaarSleutel(opgave) {
  return `${opgave.type}_${opgave.meta.soort}_${opgave.vraagTekst}`;
}