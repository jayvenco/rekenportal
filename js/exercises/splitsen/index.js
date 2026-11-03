// exercises/verhaaltjes/index.js
// -----------------------------------------------------------------------------
// Startpunt van de splitsen-module. Regelt de overgang tussen het
// instelscherm en het oefenscherm, en meldt de oefening aan bij het register.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";
import { toonUitleg } from "./uitleg.js";

/**
 * mount() — verplichte functie die elke oefening moet leveren aan het register.
 * @param {HTMLElement} container - het element waarin de oefening zichzelf tekent.
 * @param {Object} settings - (nog) niet gebruikt door deze module zelf; instellingen
 *   worden intern via storage.js bewaard, maar dit argument staat conform de
 *   afgesproken interface klaar voor eventuele toekomstige aanroepen van buitenaf.
 */
export async function mount(container) {
  await toonInstelscherm();

  async function toonInstelscherm() {
    await bouwInstelscherm(
      container,
      (gekozenInstellingen) => toonOefenscherm(gekozenInstellingen),
      () => toonUitleg(container, toonInstelscherm, toonInstelscherm)
    );
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

const icoonSplitsen = `
  <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
    <rect x="22" y="6" width="20" height="18" fill="#fff" stroke="#2e9e6b" stroke-width="3"/>
    <rect x="6" y="40" width="20" height="18" fill="#fff" stroke="#2e9e6b" stroke-width="3"/>
    <rect x="38" y="40" width="20" height="18" fill="#eaf8f0" stroke="#2e9e6b" stroke-width="3"/>
    <line x1="28" y1="26" x2="18" y2="38" stroke="#2e9e6b" stroke-width="3"/>
    <line x1="36" y1="26" x2="46" y2="38" stroke="#2e9e6b" stroke-width="3"/>
  </svg>`;

export const splitsenOefening = {
  id: "splitsen",
  titel: "Splitsen",
  omschrijving: "Splits getallen in twee delen met de splitsboom, tot 10, 20 of zelfs 100.",
  icoonSvg: icoonSplitsen,
  kleurthema: "#2e9e6b",
  mount,
};
