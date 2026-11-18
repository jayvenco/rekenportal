// exercises/codeblokken/index.js
// -----------------------------------------------------------------------------
// Startpunt van Code-blokken: een programmeer-oefening met blokjes. Levelkeuze
// (drie sets) en het speelscherm per level.
// -----------------------------------------------------------------------------

import { toonLevelkeuze } from "./instelscherm.js";
import { startLevel } from "./oefenscherm.js";
import { laadVoortgang } from "./voortgang.js";

/**
 * @param {HTMLElement} container
 * @param {Object} [settings]
 */
export async function mount(container, settings = {}, startSet) {
  const voortgang = await laadVoortgang();

  const nav = {
    naarLevels: () => toonLevelkeuze(container, { voortgang, startSet }, (setId, index) => nav.naarLevel(setId, index)),
    naarLevel: (setId, index) => startLevel(container, { setId, index, voortgang }, nav),
  };
  nav.naarLevels();
}

const icoon = `<svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
  <rect x="8" y="10" width="34" height="14" rx="4" fill="#1fb5c4"/>
  <rect x="8" y="26" width="34" height="14" rx="4" fill="#1fb5c4"/>
  <rect x="22" y="42" width="34" height="14" rx="4" fill="#f0a030"/>
  <text x="14" y="21" font-size="11" font-weight="800" fill="#fff" font-family="sans-serif">O →</text>
  <text x="14" y="37" font-size="11" font-weight="800" fill="#fff" font-family="sans-serif">Z ↓</text>
  <text x="28" y="53" font-size="10" font-weight="800" fill="#fff" font-family="sans-serif">↺</text>
</svg>`;

export const codeblokkenOefening = {
  id: "codeblokken",
  titel: "Code-blokken",
  omschrijving: "Programmeer met blokjes: pijltjes, herhalen, functies en een platformspel.",
  icoonSvg: icoon,
  kleurthema: "#1fb5c4",
  mount,
};
