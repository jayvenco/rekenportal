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
    instelbareOpties: "Bereik, stapgrootte, aantal opgaven, opgavetype",
  },
  {
    ...tafelsOefening,
    instelbareOpties: "Welke tafel(s), aantal opgaven",
  },
  {
    ...plusMinOefening,
    instelbareOpties: "Bereik, plus/min/beide, aantal opgaven",
  },
  {
    ...verhaaltjesOefening,
    instelbareOpties: "Aantal opgaven",
  },
];

/** Zoekt een oefening op id, of undefined als die niet bestaat. */
export function vindOefening(id) {
  return EXERCISES.find((oefening) => oefening.id === id);
}
