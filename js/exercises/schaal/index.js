// exercises/schaal/index.js
// -----------------------------------------------------------------------------
// Startpunt van "Rekenen op schaal" (groep 8): instelscherm, uitleg en oefenen.
// -----------------------------------------------------------------------------

import { bouwInstelscherm } from "./instelscherm.js";
import { startOefensessie } from "./oefenscherm.js";
import { toonUitleg } from "./uitleg.js";

export async function mount(container) {
  await toonInstelscherm();

  async function toonInstelscherm() {
    await bouwInstelscherm(
      container,
      (gekozen) => toonOefenscherm(gekozen),
      () => toonUitleg(container, toonInstelscherm, toonInstelscherm)
    );
  }

  function toonOefenscherm(instellingen) {
    startOefensessie(container, instellingen, ({ opnieuw }) => {
      if (opnieuw) toonOefenscherm(instellingen);
      else window.location.hash = "#/";
    });
  }
}

const icoonSchaal = `
  <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
    <rect x="6" y="10" width="34" height="26" rx="3" fill="#eaf8f0" stroke="#2e9e6b" stroke-width="3"/>
    <path d="M12 30 L20 20 L26 27 L32 16" fill="none" stroke="#2e9e6b" stroke-width="3" stroke-linejoin="round"/>
    <rect x="6" y="44" width="52" height="12" rx="2" fill="#ffe28a" stroke="#b58900" stroke-width="3"/>
    <g stroke="#2b3340" stroke-width="2"><line x1="14" y1="44" x2="14" y2="51"/><line x1="22" y1="44" x2="22" y2="49"/><line x1="30" y1="44" x2="30" y2="51"/><line x1="38" y1="44" x2="38" y2="49"/><line x1="46" y1="44" x2="46" y2="51"/></g>
    <circle cx="50" cy="22" r="9" fill="#fff" stroke="#e0533d" stroke-width="3"/>
    <text x="50" y="27" text-anchor="middle" font-size="13" font-weight="800" fill="#e0533d" font-family="system-ui,sans-serif">1:</text>
  </svg>`;

export const schaalOefening = {
  id: "schaal",
  titel: "Rekenen op schaal",
  omschrijving: "Reken met schaal op plattegronden, stadskaarten en schaalmodellen, met uitleg en hints.",
  icoonSvg: icoonSchaal,
  kleurthema: "#2e9e6b",
  mount,
};
