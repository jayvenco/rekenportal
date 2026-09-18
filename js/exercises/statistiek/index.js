// exercises/statistiek/index.js
// -----------------------------------------------------------------------------
// Startpunt van de statistiek-module. Regelt de overgang tussen het
// instelscherm en het oefenscherm.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";

/** Eenvoudig staafdiagram-icoontje voor de menutegel. */
export function icoonStatistiek() {
  return `
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
      <rect x="8" y="36" width="10" height="20" rx="2" fill="#f07a3d" />
      <rect x="22" y="20" width="10" height="36" rx="2" fill="#f07a3d" opacity="0.75" />
      <rect x="36" y="28" width="10" height="28" rx="2" fill="#f07a3d" opacity="0.55" />
      <rect x="50" y="12" width="10" height="44" rx="2" fill="#f07a3d" opacity="0.4" />
      <line x1="6" y1="56" x2="62" y2="56" stroke="#3a72c4" stroke-width="2" stroke-linecap="round" />
      <line x1="8" y1="8" x2="8" y2="56" stroke="#3a72c4" stroke-width="2" stroke-linecap="round" />
    </svg>
  `;
}

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

export const statistiekOefening = {
  id: "statistiek",
  titel: "Statistiek & Data",
  omschrijving: "Cirkeldiagrammen, gemiddelde, tabellen en turven — groep 8.",
  icoonSvg: icoonStatistiek(),
  kleurthema: "#f07a3d",
  mount,
};