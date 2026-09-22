// exercises/klokkijken/index.js
// -----------------------------------------------------------------------------
// Startpunt van de klokkijken-module (hele uren + halve uren, groep 4).
// Regelt de overgang tussen instel- en oefenscherm en meldt de oefening aan.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";

/**
 * mount() — verplichte functie die elke oefening moet leveren aan het register.
 * @param {HTMLElement} container
 */
export async function mount(container) {
  await toonInstelscherm();

  async function toonInstelscherm() {
    await bouwInstelscherm(container, (gekozenInstellingen) => {
      toonOefenscherm(gekozenInstellingen);
    });
  }

  function toonOefenscherm(instellingen) {
    startOefensessie(container, instellingen, ({ opnieuw }) => {
      if (opnieuw) {
        toonOefenscherm(instellingen);
      } else {
        window.location.hash = "#/";
      }
    });
  }
}

export const klokkijkenOefening = {
  id: "klokkijken",
  titel: "Klokkijken",
  omschrijving: "Lees de klok: hele uren en halve uren.",
  icoonSvg: `<svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
    <circle cx="32" cy="32" r="26" fill="none" stroke="#4f8fe8" stroke-width="4"/>
    <line x1="32" y1="32" x2="32" y2="15" stroke="#1f2937" stroke-width="4" stroke-linecap="round"/>
    <line x1="32" y1="32" x2="46" y2="32" stroke="#e8735a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="3" fill="#1f2937"/>
  </svg>`,
  kleurthema: "#4f8fe8",
  mount,
};