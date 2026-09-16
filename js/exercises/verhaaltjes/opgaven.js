// exercises/verhaaltjes/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor de verhaaltjessommen: korte Nederlandse tekstverhaaltjes met
// plus of min tot 10. Elke opgave combineert een sjabloon (het verhaaltje),
// een naam, een voorwerp en twee getallen zodat de uitkomst altijd tussen
// 0 en 10 blijft. Een opgave-object heeft altijd:
//   { type, vraagTekst, antwoordGoed, meta: { bewerking, a, b, naam, object } }
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";

/** Kinderen met een naam en een geslacht (voor het juiste voornaamwoord: hij/zij). */
const NAMEN = [
  { naam: "Anna", geslacht: "v" },
  { naam: "Tim", geslacht: "m" },
  { naam: "Sofie", geslacht: "v" },
  { naam: "Daan", geslacht: "m" },
  { naam: "Mila", geslacht: "v" },
  { naam: "Bram", geslacht: "m" },
  { naam: "Nora", geslacht: "v" },
  { naam: "Sem", geslacht: "m" },
  { naam: "Lotte", geslacht: "v" },
  { naam: "Finn", geslacht: "m" },
  { naam: "Eva", geslacht: "v" },
  { naam: "Liam", geslacht: "m" },
  { naam: "Zoë", geslacht: "v" },
  { naam: "Noah", geslacht: "m" },
  { naam: "Julia", geslacht: "v" },
  { naam: "Milan", geslacht: "m" },
  { naam: "Fenna", geslacht: "v" },
  { naam: "Jesse", geslacht: "m" },
];

/** Voorwerpen, ingedeeld per categorie, met enkelvoud (ev) en meervoud (mv). */
const OBJECTEN = [
  { categorie: "fruit", ev: "appel", mv: "appels" },
  { categorie: "fruit", ev: "peer", mv: "peren" },
  { categorie: "fruit", ev: "banaan", mv: "bananen" },
  { categorie: "fruit", ev: "aardbei", mv: "aardbeien" },
  { categorie: "fruit", ev: "kers", mv: "kersen" },
  { categorie: "snoep", ev: "snoepje", mv: "snoepjes" },
  { categorie: "snoep", ev: "koekje", mv: "koekjes" },
  { categorie: "snoep", ev: "chocolaatje", mv: "chocolaatjes" },
  { categorie: "snoep", ev: "lolly", mv: "lolly's" },
  { categorie: "speelgoed", ev: "knikker", mv: "knikkers" },
  { categorie: "speelgoed", ev: "autootje", mv: "autootjes" },
  { categorie: "speelgoed", ev: "blokje", mv: "blokjes" },
  { categorie: "speelgoed", ev: "sticker", mv: "stickers" },
  { categorie: "speelgoed", ev: "ballon", mv: "ballonnen" },
  { categorie: "dieren", ev: "vis", mv: "vissen" },
  { categorie: "dieren", ev: "konijn", mv: "konijnen" },
  { categorie: "dieren", ev: "kip", mv: "kippen" },
  { categorie: "dieren", ev: "vogeltje", mv: "vogeltjes" },
  { categorie: "dieren", ev: "cavia", mv: "cavia's" },
];

/** Geeft "3 appels" of "1 appel" terug, met het juiste enkelvoud/meervoud. */
function aantalWoord(n, object) {
  return n === 1 ? `${n} ${object.ev}` : `${n} ${object.mv}`;
}

/** Voornaamwoord: hij/zij, met optioneel een hoofdletter voor het begin van een zin. */
function voornaamwoord(geslacht, hoofdletter = false) {
  const woord = geslacht === "m" ? "hij" : "zij";
  return hoofdletter ? woord.charAt(0).toUpperCase() + woord.slice(1) : woord;
}

/**
 * Alle verhaaltjes-sjablonen. Elk sjabloon heeft:
 * - id: unieke naam voor statistieken/sleutel.
 * - bewerking: "plus" of "min".
 * - categorieën: welke voorwerp-categorieën logisch passen bij dit verhaaltje.
 * - zin(ctx): bouwt de volledige vraagtekst met { naam, geslacht, a, b, object }.
 */
const TEMPLATES = [
  // --- Plus-verhaaltjes ---
  {
    id: "plus_krijgtErbij",
    bewerking: "plus",
    categorieën: ["fruit", "snoep", "speelgoed", "dieren"],
    zin: ({ naam, geslacht, a, b, object }) =>
      `${naam} heeft ${aantalWoord(a, object)}. ${voornaamwoord(geslacht, true)} krijgt er ${b} bij. Hoeveel ${object.mv} heeft ${naam} nu?`,
  },
  {
    id: "plus_vindtNog",
    bewerking: "plus",
    categorieën: ["fruit", "snoep", "speelgoed", "dieren"],
    zin: ({ naam, geslacht, a, b, object }) =>
      `${naam} had ${aantalWoord(a, object)}. Onderweg vindt ${voornaamwoord(geslacht)} er nog ${b}. Hoeveel ${object.mv} heeft ${naam} nu?`,
  },
  {
    id: "plus_mandLegtBij",
    bewerking: "plus",
    categorieën: ["fruit"],
    zin: ({ naam, a, b, object }) =>
      `In de mand liggen ${aantalWoord(a, object)}. ${naam} legt er nog ${b} bij. Hoeveel ${object.mv} liggen er nu in de mand?`,
  },
  {
    id: "plus_kassaGratis",
    bewerking: "plus",
    categorieën: ["fruit", "snoep", "speelgoed"],
    zin: ({ naam, geslacht, a, b, object }) =>
      `${naam} koopt ${aantalWoord(a, object)}. Bij de kassa krijgt ${voornaamwoord(geslacht)} er nog ${b} gratis bij. Hoeveel ${object.mv} heeft ${naam} nu?`,
  },
  {
    id: "plus_dierenKomenBij",
    bewerking: "plus",
    categorieën: ["dieren"],
    zin: ({ naam, a, b, object }) =>
      `Bij de dierenwinkel zijn ${aantalWoord(a, object)}. Er komen nog ${b} ${object.mv} bij. Hoeveel ${object.mv} zijn er nu?`,
  },
  {
    id: "plus_tekentErbij",
    bewerking: "plus",
    categorieën: ["speelgoed", "dieren"],
    zin: ({ naam, geslacht, a, b, object }) =>
      `${naam} tekent ${aantalWoord(a, object)} op een blaadje. Daarna tekent ${voornaamwoord(geslacht)} er nog ${b} bij. Hoeveel ${object.mv} heeft ${naam} nu getekend?`,
  },
  {
    id: "plus_verstoptNog",
    bewerking: "plus",
    categorieën: ["speelgoed", "snoep"],
    zin: ({ naam, geslacht, a, b, object }) =>
      `${naam} heeft ${aantalWoord(a, object)} verstopt. Daarna verstopt ${voornaamwoord(geslacht)} er nog ${b}. Hoeveel ${object.mv} heeft ${naam} nu verstopt?`,
  },
  {
    id: "plus_spaartErbij",
    bewerking: "plus",
    categorieën: ["speelgoed"],
    zin: ({ naam, geslacht, a, b, object }) =>
      `${naam} spaart ${object.mv}. ${voornaamwoord(geslacht, true)} heeft er al ${a}. Deze week krijgt ${voornaamwoord(geslacht)} er nog ${b} bij. Hoeveel ${object.mv} heeft ${naam} nu?`,
  },
  {
    id: "plus_baktExtra",
    bewerking: "plus",
    categorieën: ["snoep", "fruit"],
    zin: ({ naam, geslacht, a, b, object }) =>
      `${naam} bakt ${aantalWoord(a, object)}. Daarna bakt ${voornaamwoord(geslacht)} er nog ${b} extra. Hoeveel ${object.mv} heeft ${naam} nu gebakken?`,
  },
  {
    id: "plus_tuinKomenBij",
    bewerking: "plus",
    categorieën: ["dieren"],
    zin: ({ naam, a, b, object }) =>
      `In de tuin van ${naam} zitten ${aantalWoord(a, object)}. Er komen nog ${b} ${object.mv} bij. Hoeveel ${object.mv} zitten er nu in de tuin?`,
  },

  // --- Min-verhaaltjes ---
  {
    id: "min_gafWeg",
    bewerking: "min",
    categorieën: ["fruit", "snoep", "speelgoed", "dieren"],
    zin: ({ naam, geslacht, a, b, object }) =>
      `${naam} had ${aantalWoord(a, object)}. ${voornaamwoord(geslacht, true)} gaf er ${b} weg. Hoeveel ${object.mv} heeft ${naam} nu nog over?`,
  },
  {
    id: "min_gingenKapot",
    bewerking: "min",
    categorieën: ["speelgoed", "snoep"],
    zin: ({ naam, a, b, object }) =>
      `${naam} heeft ${aantalWoord(a, object)}. Er gaan ${b} ${object.mv} kapot. Hoeveel ${object.mv} heeft ${naam} nu nog?`,
  },
  {
    id: "min_doosPaktEruit",
    bewerking: "min",
    categorieën: ["fruit", "snoep", "speelgoed", "dieren"],
    zin: ({ naam, a, b, object }) =>
      `In de doos zaten ${aantalWoord(a, object)}. ${naam} pakt er ${b} uit. Hoeveel ${object.mv} zitten er nu nog in de doos?`,
  },
  {
    id: "min_atOp",
    bewerking: "min",
    categorieën: ["snoep", "fruit"],
    zin: ({ naam, geslacht, a, b, object }) =>
      `${naam} had ${aantalWoord(a, object)}. ${voornaamwoord(geslacht, true)} at er ${b} op. Hoeveel ${object.mv} heeft ${naam} nu nog over?`,
  },
  {
    id: "min_tafelPaktWeg",
    bewerking: "min",
    categorieën: ["fruit", "snoep", "speelgoed"],
    zin: ({ naam, a, b, object }) =>
      `Er stonden ${aantalWoord(a, object)} op de tafel. ${naam} pakt er ${b} weg. Hoeveel ${object.mv} staan er nu nog op de tafel?`,
  },
  {
    id: "min_verliest",
    bewerking: "min",
    categorieën: ["speelgoed"],
    zin: ({ naam, geslacht, a, b, object }) =>
      `${naam} heeft ${aantalWoord(a, object)}. Onderweg verliest ${voornaamwoord(geslacht)} er ${b}. Hoeveel ${object.mv} heeft ${naam} nu nog?`,
  },
  {
    id: "min_geeftAanVriend",
    bewerking: "min",
    categorieën: ["fruit", "snoep", "speelgoed", "dieren"],
    zin: ({ naam, geslacht, a, b, object }) =>
      `${naam} had ${aantalWoord(a, object)}. ${voornaamwoord(geslacht, true)} geeft er ${b} aan een vriendje. Hoeveel ${object.mv} houdt ${naam} zelf over?`,
  },
  {
    id: "min_schoolpleinRaaptOp",
    bewerking: "min",
    categorieën: ["speelgoed"],
    zin: ({ naam, a, b, object }) =>
      `Op het schoolplein liggen ${aantalWoord(a, object)}. ${naam} raapt er ${b} op om mee naar huis te nemen. Hoeveel ${object.mv} blijven er liggen?`,
  },
  {
    id: "min_verkoopt",
    bewerking: "min",
    categorieën: ["fruit", "speelgoed", "dieren"],
    zin: ({ naam, a, b, object }) =>
      `${naam} heeft ${aantalWoord(a, object)} op de markt. ${naam} verkoopt er ${b}. Hoeveel ${object.mv} heeft ${naam} nu nog?`,
  },
  {
    id: "min_zakjeVielenEruit",
    bewerking: "min",
    categorieën: ["fruit", "snoep", "speelgoed"],
    zin: ({ naam, a, b, object }) =>
      `${naam} had ${aantalWoord(a, object)} in een zakje. Er vielen ${b} ${object.mv} uit het zakje. Hoeveel ${object.mv} zitten er nu nog in het zakje?`,
  },
];

/** Geeft de lijst met beschikbare sjabloon-id's + korte label terug (voor eventueel later gebruik). */
export const OPGAVE_TYPES = TEMPLATES.map((t) => ({ id: t.id, label: t.bewerking === "plus" ? "Erbij" : "Eraf" }));

/** Kiest voorwerpen die logisch bij de gekozen categorieën passen. */
function kiesObject(categorieën) {
  const opties = OBJECTEN.filter((o) => categorieën.includes(o.categorie));
  return kiesWillekeurig(opties.length > 0 ? opties : OBJECTEN);
}

/**
 * Genereert een plus-paar (a, b) zodat a + b altijd tussen 2 en 10 blijft.
 */
function genereerPlusGetallen() {
  const a = randomGeheelGetal(1, 9);
  const maxB = Math.max(1, 10 - a);
  const b = randomGeheelGetal(1, maxB);
  return { a, b, antwoord: a + b };
}

/**
 * Genereert een min-paar (a, b) zodat a - b altijd tussen 0 en 9 blijft en a maximaal 10 is.
 */
function genereerMinGetallen() {
  const a = randomGeheelGetal(1, 10);
  const b = randomGeheelGetal(1, a);
  return { a, b, antwoord: a - b };
}

/**
 * Genereert één verhaaltjesopgave.
 * @param {Object} [instellingen] - (nog) niet gebruikt door de generator zelf, maar
 *   volgens hetzelfde patroon als de andere oefeningen doorgegeven vanuit het oefenscherm.
 */
export function genereerOpgave(instellingen) {
  const bewerking = kiesWillekeurig(["plus", "min"]);
  const kandidaten = TEMPLATES.filter((t) => t.bewerking === bewerking);
  const template = kiesWillekeurig(kandidaten);
  const persoon = kiesWillekeurig(NAMEN);
  const object = kiesObject(template.categorieën);
  const { a, b, antwoord } =
    bewerking === "plus" ? genereerPlusGetallen() : genereerMinGetallen();

  const vraagTekst = template.zin({
    naam: persoon.naam,
    geslacht: persoon.geslacht,
    a,
    b,
    object,
  });

  return {
    type: template.id,
    vraagTekst,
    antwoordGoed: antwoord,
    meta: {
      bewerking,
      a,
      b,
      naam: persoon.naam,
      object: object.mv,
    },
    invoerType: "cijfers",
  };
}

/** Maakt een unieke sleutel van een opgave, om herhaling binnen een sessie te voorkomen. */
export function opgaveNaarSleutel(opgave) {
  return `${opgave.type}_${opgave.meta.naam}_${opgave.meta.a}_${opgave.meta.b}_${opgave.meta.object}`;
}
