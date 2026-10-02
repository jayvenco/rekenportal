// exercises/grafieken/index.js
// -----------------------------------------------------------------------------
// Startpunt van "Grafieken lezen" (groep 8): 50 opgaven over grafieken,
// diagrammen en tabellen. Opgaven staan in data/opgaven.json.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";

export async function mount(container) {
  await toonInstelscherm();

  async function toonInstelscherm() {
    await bouwInstelscherm(container, (instellingen) => toonOefenscherm(instellingen));
  }

  function toonOefenscherm(instellingen) {
    startOefensessie(container, instellingen, ({ opnieuw, terugNaarInstel }) => {
      if (terugNaarInstel) toonInstelscherm();
      else if (opnieuw) toonOefenscherm(instellingen);
      else window.location.hash = "#/";
    });
  }
}

const icoon = `
  <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
    <line x1="8" y1="8" x2="8" y2="56" stroke="#2f6fb5" stroke-width="3" stroke-linecap="round"/>
    <line x1="8" y1="56" x2="60" y2="56" stroke="#2f6fb5" stroke-width="3" stroke-linecap="round"/>
    <polyline points="12,46 24,34 36,40 56,14" fill="none" stroke="#e8913a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="24" cy="34" r="4" fill="#fff" stroke="#e8913a" stroke-width="3"/>
    <circle cx="36" cy="40" r="4" fill="#fff" stroke="#e8913a" stroke-width="3"/>
    <circle cx="56" cy="14" r="4" fill="#fff" stroke="#e8913a" stroke-width="3"/>
  </svg>`;

export const grafiekenOefening = {
  id: "grafieken",
  titel: "Grafieken lezen",
  omschrijving: "50 opgaven over staaf-, lijn- en cirkeldiagrammen, pictogrammen en tabellen.",
  icoonSvg: icoon,
  kleurthema: "#2f6fb5",
  mount,
};
