// exercises/grote-getallen/index.js
// -----------------------------------------------------------------------------
// Startpunt van de grote-getallen-module (groep 7).
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

export const groteGetallenOefening = {
  id: "grote-getallen",
  titel: "Grote getallen",
  omschrijving: "Oefen met miljoenen, miljarden en grote getallen.",
  icoonSvg: `<svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
    <rect x="10" y="14" width="44" height="36" rx="6" fill="none" stroke="#3a72c4" stroke-width="3" />
    <text x="32" y="40" text-anchor="middle" font-size="18" font-weight="900" fill="#2f6ed4">1M</text>
  </svg>`,
  kleurthema: "#2f6ed4",
  mount,
};