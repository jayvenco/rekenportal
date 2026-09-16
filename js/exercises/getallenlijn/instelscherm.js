// exercises/getallenlijn/instelscherm.js
// -----------------------------------------------------------------------------
// Bouwt het instelscherm van de getallenlijn-module: bereik, stapgrootte,
// aantal opgaven en opgavetype. Slaat de keuzes op via storage.js zodat ze
// de volgende keer al klaarstaan.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";
import { OPGAVE_TYPES } from "./opgaven.js";

const STANDAARD_INSTELLINGEN = {
  min: 0,
  max: 20,
  stappen: [1],
  aantalOpgaven: 10,
  opgaveType: "alle",
};

const SNELKEUZES_BEREIK = [
  { label: "10 t/m 20", min: 10, max: 20 },
  { label: "10 t/m 50", min: 10, max: 50 },
  { label: "50 t/m 100", min: 50, max: 100 },
  { label: "0 t/m 100", min: 0, max: 100 },
];

const STAP_OPTIES = [1, 2, 5, 10, 25];
const AANTAL_OPTIES = [5, 10, 20];

/**
 * Bouwt het instelscherm.
 * @param {HTMLElement} container - waar het scherm in getekend wordt.
 * @param {Function} opStarten - callback(instellingen) die wordt aangeroepen als het kind op "Start" klikt.
 */
export async function bouwInstelscherm(container, opStarten) {
  const opgeslagen = (await getInstellingen("getallenlijn")) || {};
  const instellingen = { ...STANDAARD_INSTELLINGEN, ...opgeslagen };

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Kies je oefening";
  kaart.appendChild(titel);

  // --- Bereik ---
  const bereikGroep = document.createElement("div");
  bereikGroep.className = "instel-groep";
  const bereikLabel = document.createElement("span");
  bereikLabel.className = "instel-groep__label";
  bereikLabel.textContent = "Van welk getal tot welk getal?";
  bereikGroep.appendChild(bereikLabel);

  const bereikRij = document.createElement("div");
  bereikRij.className = "keuze-rij";
  bereikRij.setAttribute("role", "group");
  bereikRij.setAttribute("aria-label", "Snelkeuze bereik");

  const bereikKnoppen = [];
  function werkBereikKnoppenBij() {
    for (const { knop, min, max } of bereikKnoppen) {
      const actief = instellingen.min === min && instellingen.max === max;
      knop.setAttribute("aria-pressed", String(actief));
    }
  }

  for (const snelkeuze of SNELKEUZES_BEREIK) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = snelkeuze.label;
    knop.setAttribute("aria-pressed", "false");
    knop.addEventListener("click", () => {
      instellingen.min = snelkeuze.min;
      instellingen.max = snelkeuze.max;
      minInvoer.value = String(snelkeuze.min);
      maxInvoer.value = String(snelkeuze.max);
      werkBereikKnoppenBij();
    });
    bereikKnoppen.push({ knop, min: snelkeuze.min, max: snelkeuze.max });
    bereikRij.appendChild(knop);
  }
  bereikGroep.appendChild(bereikRij);

  const eigenKeuzeRij = document.createElement("div");
  eigenKeuzeRij.className = "getal-invoer";
  eigenKeuzeRij.style.marginTop = "12px";

  const minLabel = document.createElement("label");
  minLabel.textContent = "Eigen keuze — van:";
  const minInvoer = document.createElement("input");
  minInvoer.type = "number";
  minInvoer.min = "0";
  minInvoer.max = "100";
  minInvoer.value = String(instellingen.min);
  minInvoer.setAttribute("aria-label", "Begingetal van de getallenlijn");
  minLabel.appendChild(minInvoer);

  const maxLabel = document.createElement("label");
  maxLabel.textContent = "tot:";
  const maxInvoer = document.createElement("input");
  maxInvoer.type = "number";
  maxInvoer.min = "0";
  maxInvoer.max = "100";
  maxInvoer.value = String(instellingen.max);
  maxInvoer.setAttribute("aria-label", "Eindgetal van de getallenlijn");
  maxLabel.appendChild(maxInvoer);

  function verwerkEigenBereik() {
    let nieuweMin = Math.max(0, Math.min(100, Number(minInvoer.value) || 0));
    let nieuweMax = Math.max(0, Math.min(100, Number(maxInvoer.value) || 0));
    if (nieuweMax <= nieuweMin) {
      nieuweMax = Math.min(100, nieuweMin + 10);
    }
    instellingen.min = nieuweMin;
    instellingen.max = nieuweMax;
    minInvoer.value = String(nieuweMin);
    maxInvoer.value = String(nieuweMax);
    werkBereikKnoppenBij();
  }

  minInvoer.addEventListener("change", verwerkEigenBereik);
  maxInvoer.addEventListener("change", verwerkEigenBereik);

  eigenKeuzeRij.append(minLabel, maxLabel);
  bereikGroep.appendChild(eigenKeuzeRij);
  werkBereikKnoppenBij();
  kaart.appendChild(bereikGroep);

  // --- Stapgrootte ---
  const stapGroep = document.createElement("div");
  stapGroep.className = "instel-groep";
  const stapLabel = document.createElement("span");
  stapLabel.className = "instel-groep__label";
  stapLabel.textContent = "Met welke stappen? (kies er één of meer)";
  stapGroep.appendChild(stapLabel);

  const stapRij = document.createElement("div");
  stapRij.className = "keuze-rij";
  stapRij.setAttribute("role", "group");
  stapRij.setAttribute("aria-label", "Stapgrootte kiezen");

  for (const stap of STAP_OPTIES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = `Stappen van ${stap}`;
    const actief = instellingen.stappen.includes(stap);
    knop.setAttribute("aria-pressed", String(actief));
    knop.addEventListener("click", () => {
      const index = instellingen.stappen.indexOf(stap);
      if (index >= 0) {
        // Niet de laatste optie kunnen uitvinken: er moet minstens 1 stap gekozen blijven.
        if (instellingen.stappen.length > 1) {
          instellingen.stappen.splice(index, 1);
        }
      } else {
        instellingen.stappen.push(stap);
      }
      knop.setAttribute("aria-pressed", String(instellingen.stappen.includes(stap)));
    });
    stapRij.appendChild(knop);
  }
  stapGroep.appendChild(stapRij);
  kaart.appendChild(stapGroep);

  // --- Aantal opgaven ---
  const aantalGroep = document.createElement("div");
  aantalGroep.className = "instel-groep";
  const aantalLabel = document.createElement("span");
  aantalLabel.className = "instel-groep__label";
  aantalLabel.textContent = "Hoeveel opgaven wil je maken?";
  aantalGroep.appendChild(aantalLabel);

  const aantalRij = document.createElement("div");
  aantalRij.className = "keuze-rij";
  aantalRij.setAttribute("role", "group");
  aantalRij.setAttribute("aria-label", "Aantal opgaven kiezen");

  const aantalKnoppen = [];
  for (const aantal of AANTAL_OPTIES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = String(aantal);
    knop.setAttribute("aria-pressed", String(instellingen.aantalOpgaven === aantal));
    knop.addEventListener("click", () => {
      instellingen.aantalOpgaven = aantal;
      for (const item of aantalKnoppen) {
        item.knop.setAttribute("aria-pressed", String(item.aantal === aantal));
      }
    });
    aantalKnoppen.push({ knop, aantal });
    aantalRij.appendChild(knop);
  }
  aantalGroep.appendChild(aantalRij);
  kaart.appendChild(aantalGroep);

  // --- Opgavetype ---
  const typeGroep = document.createElement("div");
  typeGroep.className = "instel-groep";
  const typeLabel = document.createElement("span");
  typeLabel.className = "instel-groep__label";
  typeLabel.textContent = "Welk soort opgaven?";
  typeGroep.appendChild(typeLabel);

  const typeRij = document.createElement("div");
  typeRij.className = "keuze-rij";
  typeRij.setAttribute("role", "group");
  typeRij.setAttribute("aria-label", "Opgavetype kiezen");

  const typeKnoppen = [];
  const alleTypeOpties = [{ id: "alle", label: "Alles door elkaar" }, ...OPGAVE_TYPES];
  for (const optie of alleTypeOpties) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = optie.label;
    knop.setAttribute("aria-pressed", String(instellingen.opgaveType === optie.id));
    knop.addEventListener("click", () => {
      instellingen.opgaveType = optie.id;
      for (const item of typeKnoppen) {
        item.knop.setAttribute("aria-pressed", String(item.id === optie.id));
      }
    });
    typeKnoppen.push({ knop, id: optie.id });
    typeRij.appendChild(knop);
  }
  typeGroep.appendChild(typeRij);
  kaart.appendChild(typeGroep);

  // --- Startknop ---
  const startRij = document.createElement("div");
  startRij.className = "acties-rij";
  const startKnop = document.createElement("button");
  startKnop.type = "button";
  startKnop.className = "knop knop--primair";
  startKnop.textContent = "Start de oefening";
  startKnop.addEventListener("click", async () => {
    verwerkEigenBereik();
    await saveInstellingen("getallenlijn", instellingen);
    opStarten({ ...instellingen });
  });
  startRij.appendChild(startKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}
