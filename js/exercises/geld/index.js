// exercises/verhaaltjes/index.js
// -----------------------------------------------------------------------------
// Startpunt van de geld-module. Regelt de overgang tussen het
// instelscherm en het oefenscherm, en meldt de oefening aan bij het register.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";


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

const icoonGeld = `
  <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
    <rect x="6" y="16" width="38" height="22" rx="3" fill="#cfeedd" stroke="#3a9d5d" stroke-width="3"/>
    <circle cx="25" cy="27" r="6" fill="#fff" stroke="#3a9d5d" stroke-width="2"/>
    <circle cx="46" cy="42" r="12" fill="#f3d36b" stroke="#a37d12" stroke-width="3"/>
    <text x="46" y="48" text-anchor="middle" font-size="16" font-weight="800" fill="#6b4f08">€</text>
  </svg>`;

export const geldOefening = {
  id: "geld",
  titel: "Rekenen met geld",
  omschrijving: "Tel biljetten en munten, en betaal het juiste bedrag.",
  icoonSvg: icoonGeld,
  kleurthema: "#3a9d5d",
  mount,
};
