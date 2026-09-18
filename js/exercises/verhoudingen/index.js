// exercises/verhoudingen/index.js
// -----------------------------------------------------------------------------
// Startpunt van de verhoudingen-module. Regelt de overgang tussen het
// instelscherm en het oefenscherm, en meldt de oefening aan bij het register.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";
import { icoonWeegschaal } from "../../utils/iconen.js";

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

export const verhoudingenOefening = {
  id: "verhoudingen",
  titel: "Verhoudingen",
  omschrijving: "Reken met verhoudingen in recepten en op de kaart.",
  icoonSvg: icoonWeegschaal(),
  kleurthema: "#2f6ed4",
  mount,
};