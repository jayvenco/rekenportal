// exercises/plusmin/instelscherm.js
// -----------------------------------------------------------------------------
// Bouwt het instelscherm van de plus-en-min-module: bereik (van/tot, met
// snelkeuzes), keuze plus/min/beide en aantal opgaven. Slaat de keuzes op
// via storage.js zodat ze de volgende keer al klaarstaan.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";
import { BEWERKING_OPTIES } from "./opgaven.js";

const STANDAARD_INSTELLINGEN = {
  min: 1,
  max: 20,
  bewerking: "beide",
  aantalOpgaven: 10,
};

const SNELKEUZES_BEREIK = [
  { label: "1 t/m 10", min: 1, max: 10 },
  { label: "1 t/m 20", min: 1, max: 20 },
  { label: "10 t/m 100", min: 10, max: 100 },
  { label: "1 t/m 100", min: 1, max: 100 },
];

const AANTAL_OPTIES = [5, 10, 20];

/**
 * Bouwt het instelscherm.
 * @param {HTMLElement} container - waar het scherm in getekend wordt.
 * @param {Function} opStarten - callback(instellingen) die wordt aangeroepen als het kind op "Start" klikt.
 */
export async function bouwInstelscherm(container, opStarten) {
  const opgeslagen = (await getInstellingen("plusmin")) || {};
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
  minInvoer.min = "1";
  minInvoer.max = "100";
  minInvoer.value = String(instellingen.min);
  minInvoer.setAttribute("aria-label", "Begingetal van het bereik");
  minLabel.appendChild(minInvoer);

  const maxLabel = document.createElement("label");
  maxLabel.textContent = "tot:";
  const maxInvoer = document.createElement("input");
  maxInvoer.type = "number";
  maxInvoer.min = "1";
  maxInvoer.max = "100";
  maxInvoer.value = String(instellingen.max);
  maxInvoer.setAttribute("aria-label", "Eindgetal van het bereik");
  maxLabel.appendChild(maxInvoer);

  function verwerkEigenBereik() {
    let nieuweMin = Math.max(1, Math.min(100, Number(minInvoer.value) || 1));
    let nieuweMax = Math.max(1, Math.min(100, Number(maxInvoer.value) || 1));
    if (nieuweMax <= nieuweMin) {
      nieuweMax = Math.min(100, nieuweMin + 9);
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

  // --- Bewerking: plus / min / beide ---
  const bewerkingGroep = document.createElement("div");
  bewerkingGroep.className = "instel-groep";
  const bewerkingLabel = document.createElement("span");
  bewerkingLabel.className = "instel-groep__label";
  bewerkingLabel.textContent = "Optellen of aftrekken?";
  bewerkingGroep.appendChild(bewerkingLabel);

  const bewerkingRij = document.createElement("div");
  bewerkingRij.className = "keuze-rij";
  bewerkingRij.setAttribute("role", "radiogroup");
  bewerkingRij.setAttribute("aria-label", "Kies plus, min of beide");

  const bewerkingKnoppen = [];
  for (const optie of BEWERKING_OPTIES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = optie.label;
    knop.setAttribute("role", "radio");
    knop.setAttribute("aria-checked", String(instellingen.bewerking === optie.id));
    knop.setAttribute("aria-pressed", String(instellingen.bewerking === optie.id));
    knop.addEventListener("click", () => {
      instellingen.bewerking = optie.id;
      for (const item of bewerkingKnoppen) {
        const actief = item.id === optie.id;
        item.knop.setAttribute("aria-checked", String(actief));
        item.knop.setAttribute("aria-pressed", String(actief));
      }
    });
    bewerkingKnoppen.push({ knop, id: optie.id });
    bewerkingRij.appendChild(knop);
  }
  bewerkingGroep.appendChild(bewerkingRij);
  kaart.appendChild(bewerkingGroep);

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

  // --- Startknop ---
  const startRij = document.createElement("div");
  startRij.className = "acties-rij";
  const startKnop = document.createElement("button");
  startKnop.type = "button";
  startKnop.className = "knop knop--primair";
  startKnop.textContent = "Start de oefening";
  startKnop.addEventListener("click", async () => {
    verwerkEigenBereik();
    await saveInstellingen("plusmin", instellingen);
    opStarten({ ...instellingen });
  });
  startRij.appendChild(startKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}
