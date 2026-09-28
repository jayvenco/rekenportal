// exercises/meerminder/index.js
// -----------------------------------------------------------------------------
// Startpunt van de "Meer of minder?"-module. Regelt de overgang tussen het
// instelscherm en het oefenscherm, en meldt de oefening aan bij het register.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";
import { icoonMeerMinder } from "../../utils/iconen.js";

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
        window.location.hash = "#/";
      }
    });
  }
}

export const meerMinderOefening = {
  id: "meerminder",
  titel: "Meer of minder?",
  omschrijving: "Korte verhaaltjes: wie heeft er meer, wat is groter, wie vliegt hoger?",
  icoonSvg: icoonMeerMinder(),
  kleurthema: "#e8735a",
  mount,
};
