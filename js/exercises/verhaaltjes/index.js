// exercises/verhaaltjes/index.js
// -----------------------------------------------------------------------------
// Startpunt van de verhaaltjessommen-module. Regelt de overgang tussen het
// instelscherm en het oefenscherm, en meldt de oefening aan bij het register.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";
import { icoonVerhaaltjes } from "../../utils/iconen.js";

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

export const verhaaltjesOefening = {
  id: "verhaaltjes",
  titel: "Verhaaltjessommen",
  omschrijving: "Lees korte verhaaltjes en reken plus- en minsommen tot 10 uit.",
  icoonSvg: icoonVerhaaltjes(),
  kleurthema: "#a56ee2",
  mount,
};
