// exercises/meerminder/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor de "Meer of minder?"-oefening: korte vergelijkingen tussen
// twee waarden. Drie categorieën:
//   - aantal:   wie heeft er meer/minder <voorwerpen>? (bv. appels, knikkers)
//   - grootte:  welke <voorwerp> is groter/kleiner? (bv. toren, boom, doos)
//   - hoogte:   wie/wat vliegt hoger/lager? (bv. vlieger, ballon, drone)
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig, schudArray } from "../../utils/willekeurig.js";

const NAMEN = ["Sam", "Robin", "Fen", "Jules", "Noor", "Bram", "Lot", "Timo", "Mila", "Finn"];

const AANTAL_VOORWERPEN = [
  { naam: "appels", kleur: "#e8735a" },
  { naam: "knikkers", kleur: "#3a72c4" },
  { naam: "stickers", kleur: "#38b26a" },
  { naam: "ballonnen", kleur: "#f0883e" },
  { naam: "snoepjes", kleur: "#a56ee2" },
  { naam: "schelpen", kleur: "#2fb6c4" },
];

const GROOTTE_VOORWERPEN = [
  { onderwerp: "toren", lidwoord: "de", eenheid: "cm", min: 10, max: 60, kleur: "#3a72c4" },
  { onderwerp: "boom", lidwoord: "de", eenheid: "cm", min: 80, max: 300, kleur: "#38b26a" },
  { onderwerp: "doos", lidwoord: "de", eenheid: "cm", min: 8, max: 50, kleur: "#f0883e" },
  { onderwerp: "knuffel", lidwoord: "de", eenheid: "cm", min: 15, max: 70, kleur: "#a56ee2" },
];

const HOOGTE_VOORWERPEN = [
  { onderwerp: "vlieger", werkwoord: "vliegt", eenheid: "meter", min: 5, max: 60, kleur: "#3a72c4" },
  { onderwerp: "ballon", werkwoord: "vliegt", eenheid: "meter", min: 5, max: 100, kleur: "#e8735a" },
  { onderwerp: "drone", werkwoord: "vliegt", eenheid: "meter", min: 5, max: 80, kleur: "#38b26a" },
  { onderwerp: "vogel", werkwoord: "vliegt", eenheid: "meter", min: 5, max: 90, kleur: "#f0883e" },
];

/** Geeft twee verschillende willekeurige getallen terug tussen min en max. */
function tweeUniekeGetallen(min, max) {
  const a = randomGeheelGetal(min, max);
  let b = randomGeheelGetal(min, max);
  let pogingen = 0;
  while (b === a && pogingen < 30) {
    b = randomGeheelGetal(min, max);
    pogingen += 1;
  }
  if (b === a) b = a === max ? a - 1 : a + 1;
  return [a, b];
}

function tweeUniekeNamen() {
  const geschud = schudArray(NAMEN);
  return [geschud[0], geschud[1]];
}

function genereerAantalOpgave() {
  const voorwerp = kiesWillekeurig(AANTAL_VOORWERPEN);
  const [naamA, naamB] = tweeUniekeNamen();
  const [waardeA, waardeB] = tweeUniekeGetallen(2, 12);
  const richting = kiesWillekeurig(["meer", "minder"]);

  const opties = [
    { naam: naamA, waarde: waardeA, eenheid: voorwerp.naam, kleur: voorwerp.kleur },
    { naam: naamB, waarde: waardeB, eenheid: voorwerp.naam, kleur: voorwerp.kleur },
  ];
  const doelWaarde = richting === "meer" ? Math.max(waardeA, waardeB) : Math.min(waardeA, waardeB);
  for (const optie of opties) optie.correct = optie.waarde === doelWaarde;

  return {
    categorie: "aantal",
    vraagTekst: `${naamA} heeft ${waardeA} ${voorwerp.naam}. ${naamB} heeft ${waardeB} ${voorwerp.naam}. Wie heeft er ${richting} ${voorwerp.naam}?`,
    richting,
    opties,
    schaalMax: 12,
    meta: { voorwerp: voorwerp.naam, richting, waardeA, waardeB },
  };
}

function genereerGrootteOpgave() {
  const voorwerp = kiesWillekeurig(GROOTTE_VOORWERPEN);
  const [waardeA, waardeB] = tweeUniekeGetallen(voorwerp.min, voorwerp.max);
  const richting = kiesWillekeurig(["groter", "kleiner"]);

  const opties = [
    { naam: `${voorwerp.onderwerp} A`, waarde: waardeA, eenheid: voorwerp.eenheid, kleur: voorwerp.kleur },
    { naam: `${voorwerp.onderwerp} B`, waarde: waardeB, eenheid: voorwerp.eenheid, kleur: voorwerp.kleur },
  ];
  const doelWaarde = richting === "groter" ? Math.max(waardeA, waardeB) : Math.min(waardeA, waardeB);
  for (const optie of opties) optie.correct = optie.waarde === doelWaarde;

  return {
    categorie: "grootte",
    vraagTekst: `${voorwerp.lidwoord[0].toUpperCase()}${voorwerp.lidwoord.slice(1)} ene ${voorwerp.onderwerp} is ${waardeA} ${voorwerp.eenheid}, de andere is ${waardeB} ${voorwerp.eenheid}. Welke ${voorwerp.onderwerp} is ${richting}?`,
    richting,
    opties,
    schaalMax: voorwerp.max,
    meta: { voorwerp: voorwerp.onderwerp, richting, waardeA, waardeB },
  };
}

function genereerHoogteOpgave() {
  const voorwerp = kiesWillekeurig(HOOGTE_VOORWERPEN);
  const [naamA, naamB] = tweeUniekeNamen();
  const [waardeA, waardeB] = tweeUniekeGetallen(voorwerp.min, voorwerp.max);
  const richting = kiesWillekeurig(["hoger", "lager"]);

  const opties = [
    { naam: `${voorwerp.onderwerp} van ${naamA}`, waarde: waardeA, eenheid: voorwerp.eenheid, kleur: voorwerp.kleur },
    { naam: `${voorwerp.onderwerp} van ${naamB}`, waarde: waardeB, eenheid: voorwerp.eenheid, kleur: voorwerp.kleur },
  ];
  const doelWaarde = richting === "hoger" ? Math.max(waardeA, waardeB) : Math.min(waardeA, waardeB);
  for (const optie of opties) optie.correct = optie.waarde === doelWaarde;

  return {
    categorie: "hoogte",
    vraagTekst: `De ${voorwerp.onderwerp} van ${naamA} ${voorwerp.werkwoord} op ${waardeA} ${voorwerp.eenheid}. De ${voorwerp.onderwerp} van ${naamB} ${voorwerp.werkwoord} op ${waardeB} ${voorwerp.eenheid}. Welke ${voorwerp.onderwerp} ${voorwerp.werkwoord} ${richting}?`,
    richting,
    opties,
    schaalMax: voorwerp.max,
    meta: { voorwerp: voorwerp.onderwerp, richting, waardeA, waardeB },
  };
}

const GENERATOREN = {
  aantal: genereerAantalOpgave,
  grootte: genereerGrootteOpgave,
  hoogte: genereerHoogteOpgave,
};

/**
 * Genereert één opgave uit een van de gekozen categorieën.
 * @param {Object} instellingen - { categorieen: string[] }
 */
export function genereerOpgave(instellingen) {
  const categorieen = instellingen.categorieen && instellingen.categorieen.length > 0
    ? instellingen.categorieen
    : ["aantal", "grootte", "hoogte"];
  const categorie = kiesWillekeurig(categorieen);
  return GENERATOREN[categorie]();
}

/** Unieke sleutel voor het voorkomen van identieke opgaven binnen één sessie. */
export function opgaveNaarSleutel(opgave) {
  return `${opgave.categorie}:${opgave.meta.voorwerp}:${opgave.meta.waardeA}:${opgave.meta.waardeB}:${opgave.richting}`;
}
