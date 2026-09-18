// exercises/getallen/index.js
// -----------------------------------------------------------------------------
// Startpunt van de getallen-module (negatief + komma, groep 7).
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

export const getallenOefening = {
  id: "getallen",
  titel: "Negatief & komma",
  omschrijving: "Reken met negatieve getallen en kommagetallen.",
  icoonSvg: `<svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
    <rect x="12" y="12" width="40" height="40" rx="8" fill="none" stroke="#3a72c4" stroke-width="3" />
    <text x="18" y="40" font-size="18" font-weight="800" fill="#38b26a">+</text>
    <text x="42" y="26" font-size="18" font-weight="800" fill="#e8735a">−</text>
    <line x1="16" y1="38" x2="48" y2="38" stroke="#38b26a" stroke-width="2" />
  </svg>`,
  kleurthema: "#38b26a",
  mount,
};