// exercises/meten/index.js
// -----------------------------------------------------------------------------
// Startpunt van de meten-module. Regelt de overgang tussen het instelscherm
// en het oefenscherm, en meldt de oefening aan bij het register.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";

/**
 * Eenvoudige liniaal SVG voor het icoon.
 * @returns {string} SVG-markup.
 */
function icoonLiniaal() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="48" height="48" fill="none">
  <rect x="4" y="14" width="56" height="36" rx="4" fill="#f5b942" stroke="#d4952e" stroke-width="2"/>
  <line x1="12" y1="20" x2="12" y2="44" stroke="#fff" stroke-width="2"/>
  <line x1="22" y1="20" x2="22" y2="44" stroke="#fff" stroke-width="2"/>
  <line x1="32" y1="20" x2="32" y2="44" stroke="#fff" stroke-width="2"/>
  <line x1="42" y1="20" x2="42" y2="44" stroke="#fff" stroke-width="2"/>
  <line x1="52" y1="20" x2="52" y2="44" stroke="#fff" stroke-width="2"/>
  <line x1="17" y1="20" x2="17" y2="36" stroke="#c9842a" stroke-width="1.5"/>
  <line x1="27" y1="20" x2="27" y2="36" stroke="#c9842a" stroke-width="1.5"/>
  <line x1="37" y1="20" x2="37" y2="36" stroke="#c9842a" stroke-width="1.5"/>
  <line x1="47" y1="20" x2="47" y2="36" stroke="#c9842a" stroke-width="1.5"/>
</svg>`;
}

/**
 * mount() — verplichte functie die elke oefening moet leveren aan het register.
 * @param {HTMLElement} container - het element waarin de oefening zichzelf tekent.
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
        // Terug naar het portaal-menu.
        window.location.hash = "#/";
      }
    });
  }
}

export const metenOefening = {
  id: "meten",
  titel: "Meten",
  omschrijving: "Oefen met omtrek, oppervlakte, inhoud, gewicht en tijd.",
  icoonSvg: icoonLiniaal(),
  kleurthema: "#f5b942",
  mount,
};