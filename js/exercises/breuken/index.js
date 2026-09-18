// exercises/breuken/index.js
// -----------------------------------------------------------------------------
// Startpunt van de breuken/procenten/kommagetallen-module.
// Meldt de oefening aan bij het register.
// -----------------------------------------------------------------------------

import { toonInstellingenScherm } from "./instelscherm.js";
import { toonOefeningScherm } from "./oefenscherm.js";

/** Eenvoudig ½-breuk SVG-icoon */
function icoonBreuken() {
  return `
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="10" fill="#f3e9fb" stroke="#9b5de5" stroke-width="3" />
      <text x="32" y="24" text-anchor="middle" font-size="16" font-weight="800" fill="#9b5de5">½</text>
      <line x1="18" y1="30" x2="46" y2="30" stroke="#9b5de5" stroke-width="2" />
      <text x="32" y="48" text-anchor="middle" font-size="12" font-weight="600" fill="#9b5de5">%</text>
    </svg>
  `;
}

/**
 * mount() — verplichte functie voor het register.
 * @param {HTMLElement} container
 */
export async function mount(container) {
  await toonInstelscherm();

  async function toonInstelscherm() {
    await toonInstellingenScherm(container, (gekozenInstellingen) => {
      toonOefenscherm(gekozenInstellingen);
    });
  }

  function toonOefenscherm(instellingen) {
    toonOefeningScherm(container, instellingen);
  }
}

export const breukenOefening = {
  id: "breuken",
  titel: "Breuken, procenten & kommagetallen",
  omschrijving: "Reken om tussen breuken, procenten en kommagetallen.",
  icoonSvg: icoonBreuken(),
  kleurthema: "#9b5de5",
  mount,
};