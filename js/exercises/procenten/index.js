// exercises/procenten/index.js
// -----------------------------------------------------------------------------
// Startpunt van de procenten-module (groep 7).
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";

/**
 * mount() — verplichte functie die elke oefening moet leveren aan het register.
 * @param {HTMLElement} container
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

export const procentenOefening = {
  id: "procenten",
  titel: "Procenten",
  omschrijving: "Reken met procenten: bereken, toename/afname, breuk→%, en korting.",
  icoonSvg: `<svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#3a72c4" stroke-width="3" />
    <text x="32" y="40" text-anchor="middle" font-size="24" font-weight="800" fill="#f07a3d">%</text>
  </svg>`,
  kleurthema: "#f07a3d",
  mount,
};