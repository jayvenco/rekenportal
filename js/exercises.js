// exercises.js
// -----------------------------------------------------------------------------
// Centraal register van alle oefeningen in de Rekenportal.
// -----------------------------------------------------------------------------
// Om een NIEUWE oefening toe te voegen:
//   1. Maak een map js/exercises/<naam>/ met minstens een index.js dat een
//      object exporteert met: id, titel, omschrijving, icoonSvg, kleurthema,
//      instelbareOpties (korte tekst, mag leeg), en een mount(container, settings)-functie.
//   2. Importeer dat object hieronder en zet het in de EXERCISES-lijst.
//   Dat is alles — de homepage, de tegels en de statistieken werken dan automatisch.
// Zie README.md voor een uitgebreid stap-voor-stap voorbeeld.
// -----------------------------------------------------------------------------

import { getallenlijnOefening } from "./exercises/getallenlijn/index.js";
import { tafelsOefening } from "./exercises/tafels/index.js";
import { plusMinOefening } from "./exercises/plusmin/index.js";
import { verhaaltjesOefening } from "./exercises/verhaaltjes/index.js";
import { verhoudingenOefening } from "./exercises/verhoudingen/index.js";
import { breukenOefening } from "./exercises/breuken/index.js";
import { complexOefening } from "./exercises/complex/index.js";
import { metenOefening } from "./exercises/meten/index.js";
import { robotOefening } from "./exercises/robot/index.js";
import { redactiesommenOefening } from "./exercises/redactiesommen/index.js";
import { SPELEN } from "./exercises/games.js";
import { statistiekOefening } from "./exercises/statistiek/index.js";
import { procentenOefening } from "./exercises/procenten/index.js";
import { groteGetallenOefening } from "./exercises/grote-getallen/index.js";
import { getallenOefening } from "./exercises/getallen/index.js";
import { klokkijkenOefening } from "./exercises/klokkijken/index.js";

/**
 * Elke oefening in deze lijst heeft de vorm:
 * {
 *   id: string,               // unieke sleutel, wordt gebruikt in statistieken en de URL
 *   titel: string,            // naam op de tegel
 *   omschrijving: string,     // korte ondertitel op de tegel
 *   icoonSvg: string,         // inline SVG-markup (zelf getekend, geen externe bronnen)
 *   kleurthema: string,       // hex-kleur voor het icoon-vlak op de tegel
 *   instelbareOpties: string, // korte tekst die beschrijft wat instelbaar is (voor toekomstig gebruik)
 *   mount: (container, settings) => void, // tekent de oefening in de container
 * }
 */
export const EXERCISES = [
  {
    ...getallenlijnOefening,
    groep: 4,
    instelbareOpties: "Bereik, stapgrootte, aantal opgaven, opgavetype",
  },
  {
    ...tafelsOefening,
    groep: 4,
    instelbareOpties: "Welke tafel(s), aantal opgaven",
  },
  {
    ...plusMinOefening,
    groep: 4,
    instelbareOpties: "Bereik, plus/min/beide, aantal opgaven",
  },
  {
    ...verhaaltjesOefening,
    groep: 4,
    instelbareOpties: "Aantal opgaven",
  },
  {
    ...klokkijkenOefening,
    groep: 4,
    instelbareOpties: "Lezen of tekenen, hele/halve uren of mix, aantal opgaven",
  },
  {
    ...complexOefening,
    groep: 8,
    instelbareOpties: "Moeilijkheid (2 of 3 stappen), aantal opgaven",
  },
  {
    ...breukenOefening,
    groep: 8,
    instelbareOpties: "Conversietype (breuk→%, %→komma, komma→breuk), aantal opgaven",
  },
  {
    ...metenOefening,
    groep: 8,
    instelbareOpties: "Categorie (omtrek/oppervlakte, inhoud, gewicht, tijd), aantal opgaven",
  },
  {
    ...verhoudingenOefening,
    groep: 8,
    instelbareOpties: "Categorie (recepten, schaal, mix), aantal opgaven",
  },
  {
    ...robotOefening,
    groep: 4,
    instelbareOpties: "Pijltjesmodus, 6 levels",
  },
  {
    ...robotOefening,
    groep: 8,
    instelbareOpties: "Code modus, 12 levels",
  },
  {
    ...statistiekOefening,
    groep: 8,
    instelbareOpties: "Categorie (grafieken, gemiddelde/mediaan/modus, tabellen, turven), aantal opgaven",
  },
  {
    ...procentenOefening,
    groep: 7,
    instelbareOpties: "Vraagtype(s) (procent-van, toename/afname, breuk→%, korting), aantal opgaven",
  },
  {
    ...groteGetallenOefening,
    groep: 7,
    instelbareOpties: "Vraagtype(s) (naar-getal, plus-groot, hoeveel-nullen), aantal opgaven",
  },
  {
    ...getallenOefening,
    groep: 7,
    instelbareOpties: "Vraagtype(s) (negatief-plus, negatief-min, komma-keer, komma-delen), aantal opgaven",
  },
  {
    ...redactiesommenOefening,
    groep: 7,
    instelbareOpties: "Aantal opgaven (5, 10, 20)",
  },
  {
    ...redactiesommenOefening,
    groep: 8,
    instelbareOpties: "Aantal opgaven (5, 10, 20)",
  },
  ...SPELEN.map(s => ({
    ...s,
    groep: "games",
  })),
];

/** Zoekt een oefening op id, of undefined als die niet bestaat.
 * Optioneel: filter op groep (voor oefeningen die in meerdere groepen voorkomen). */
export function vindOefening(id, groep) {
  return EXERCISES.find((oefening) =>
    oefening.id === id && (groep === undefined || oefening.groep === groep)
  );
}
