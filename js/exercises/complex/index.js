// exercises/complex/index.js
// -----------------------------------------------------------------------------
// Startpunt van de complexe meerstaps-verhaaltjessommen-module.
// Regelt de overgang tussen het instelscherm en het oefenscherm,
// en meldt de oefening aan bij het register.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";

/**
 * IcoonSVG: simpel verhaaltje 📖 — een open boek met piramide-stappen (meerstaps).
 */
function icoonComplex() {
  return `
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
      <path d="M32 12 C27 8 16 7 9 9 L9 48 C16 46 27 47 32 51 C37 47 48 46 55 48 L55 9 C48 7 37 8 32 12 Z"
        fill="#e6f4ea" stroke="#38b26a" stroke-width="3" stroke-linejoin="round" />
      <line x1="32" y1="12" x2="32" y2="51" stroke="#38b26a" stroke-width="3" />
      <!-- Stap 1 lijn -->
      <line x1="14" y1="22" x2="26" y2="21" stroke="#38b26a" stroke-width="2" stroke-linecap="round" />
      <!-- Stap 2 lijn -->
      <line x1="14" y1="30" x2="26" y2="29" stroke="#38b26a" stroke-width="2" stroke-linecap="round" />
      <!-- Stap 3 lijn (korter, voor meerstaps) -->
      <line x1="14" y1="38" x2="24" y2="37" stroke="#38b26a" stroke-width="2" stroke-linecap="round" />
      <!-- Piramide-trap symbool aan de rechterkant -->
      <rect x="40" y="25" width="16" height="4" rx="1" fill="#38b26a" opacity="0.8" />
      <rect x="44" y="31" width="12" height="4" rx="1" fill="#38b26a" opacity="0.6" />
      <rect x="48" y="37" width="8" height="4" rx="1" fill="#38b26a" opacity="0.4" />
    </svg>
  `;
}

/**
 * mount() — verplichte functie die elke oefening moet leveren aan het register.
 * @param {HTMLElement} container - het element waarin de oefening zichzelf tekent.
 * @param {Object} settings - (nog) niet gebruikt; instellingen worden intern bewaard.
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

export const complexOefening = {
  id: "complex",
  titel: "Complexe verhaaltjessommen",
  omschrijving: "Meerstaps-verhaaltjes met breuken, snelheid, geld en tijd voor groep 8.",
  icoonSvg: icoonComplex(),
  kleurthema: "#38b26a",
  mount,
};