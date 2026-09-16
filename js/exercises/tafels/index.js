// exercises/tafels/index.js
// -----------------------------------------------------------------------------
// Startpunt van de tafels-module. Regelt de overgang tussen het instelscherm
// en het oefenscherm, en meldt de oefening aan bij het register.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";
import { icoonTafels } from "../../utils/iconen.js";

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

export const tafelsOefening = {
  id: "tafels",
  titel: "Tafels",
  omschrijving: "Oefen de tafels van 1 tot en met 10 met keersommen.",
  icoonSvg: icoonTafels(),
  kleurthema: "#f5b942",
  mount,
};
