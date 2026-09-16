// exercises/plusmin/index.js
// -----------------------------------------------------------------------------
// Startpunt van de plus-en-min-module. Regelt de overgang tussen het
// instelscherm en het oefenscherm, en meldt de oefening aan bij het register.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";
import { icoonPlusMin } from "../../utils/iconen.js";

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

export const plusMinOefening = {
  id: "plusmin",
  titel: "Plus en min",
  omschrijving: "Oefen met optellen en aftrekken, van 1 tot en met 100.",
  icoonSvg: icoonPlusMin(),
  kleurthema: "#38b26a",
  mount,
};
