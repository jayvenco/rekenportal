// exercises/codeblokken/instelscherm.js
// -----------------------------------------------------------------------------
// Levelkeuze van Code-blokken: drie sets (tabs) met levelknoppen en sterren.
// -----------------------------------------------------------------------------

import { SETS, vindSet } from "./levels.js";
import { sleutel } from "./voortgang.js";
import { sterTekst } from "./oefenscherm.js";

/**
 * @param {HTMLElement} container
 * @param {{voortgang:Object, startSet?:string}} opties
 * @param {(setId:string, index:number)=>void} opStarten
 */
export function toonLevelkeuze(container, { voortgang, startSet }, opStarten) {
  let actieveSet = vindSet(voortgang.set || startSet).id;
  if (startSet && !voortgang.set) actieveSet = vindSet(startSet).id;
  container.textContent = "";
  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "🧩 Code-blokken";
  kaart.appendChild(titel);
  const intro = document.createElement("p");
  intro.textContent = "Bouw een programma met blokjes. Sleep de blokjes naar het werkvlak en laat het vogeltje je programma uitvoeren!";
  kaart.appendChild(intro);

  const tabs = document.createElement("div");
  tabs.className = "keuze-rij";
  tabs.setAttribute("role", "tablist");
  const omschrijving = document.createElement("p");
  omschrijving.style.cssText = "margin:8px 0 12px;font-weight:700";
  const raster = document.createElement("div");
  raster.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px";

  const tabKnoppen = SETS.map((set) => {
    const k = document.createElement("button");
    k.type = "button";
    k.className = "keuze-knop";
    k.setAttribute("role", "tab");
    const totaal = set.levels.length * 3;
    const behaald = set.levels.reduce((n, _, i) => n + (voortgang.sterren[sleutel(set.id, i)] || 0), 0);
    k.textContent = `${set.icoon} ${set.naam} (${behaald}/${totaal}★)`;
    k.addEventListener("click", () => {
      actieveSet = set.id;
      teken();
    });
    tabs.appendChild(k);
    return { k, id: set.id };
  });

  function teken() {
    const set = vindSet(actieveSet);
    for (const t of tabKnoppen) t.k.setAttribute("aria-pressed", String(t.id === actieveSet));
    omschrijving.textContent = set.omschrijving;
    raster.textContent = "";
    set.levels.forEach((level, i) => {
      const n = voortgang.sterren[sleutel(set.id, i)] || 0;
      const k = document.createElement("button");
      k.type = "button";
      k.className = "keuze-knop";
      k.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 8px";
      const nr = document.createElement("strong");
      nr.textContent = `Level ${i + 1}`;
      const naam = document.createElement("span");
      naam.style.cssText = "font-size:.85rem;text-align:center";
      naam.textContent = level.naam;
      const sterren = document.createElement("span");
      sterren.style.cssText = `font-size:1.15rem;color:${n ? "#e8a400" : "#9aa5b4"}`;
      sterren.textContent = sterTekst(n);
      sterren.setAttribute("aria-label", `${n} van 3 sterren`);
      k.append(nr, naam, sterren);
      k.addEventListener("click", () => opStarten(set.id, i));
      raster.appendChild(k);
    });
  }

  kaart.append(tabs, omschrijving, raster);
  container.appendChild(kaart);
  teken();
}
