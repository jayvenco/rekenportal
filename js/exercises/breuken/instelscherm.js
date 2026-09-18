// exercises/breuken/instelscherm.js
// -----------------------------------------------------------------------------
// Bouwt het instelscherm van de breuken/procenten/kommagetallen-module:
// kies het conversietype en het aantal opgaven.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const CONVERSIE_OPTIES = [
  { id: "breuk→procent", label: "Breuk → Procent" },
  { id: "procent→komma", label: "Procent → Kommagetal" },
  { id: "komma→breuk", label: "Kommagetal → Breuk" },
  { id: "alles", label: "Alles door elkaar" },
];

const AANTAL_OPTIES = [5, 10, 20];

const STANDAARD_INSTELLINGEN = {
  conversieType: "alles",
  aantalOpgaven: 10,
};

/**
 * Bouwt het instelscherm en roept startOefening aan met de gekozen instellingen.
 * @param {HTMLElement} container
 * @param {Function} startOefening - callback(instellingen)
 */
export async function toonInstellingenScherm(container, startOefening) {
  const opgeslagen = (await getInstellingen("breuken")) || {};
  const instellingen = {
    ...STANDAARD_INSTELLINGEN,
    ...opgeslagen,
  };

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Breuken, procenten & kommagetallen";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Oefen het omrekenen tussen breuken, procenten en kommagetallen.";
  kaart.appendChild(uitleg);

  // --- Conversietype kiezen ---
  const conversieGroep = document.createElement("div");
  conversieGroep.className = "instel-groep";
  const conversieLabel = document.createElement("span");
  conversieLabel.className = "instel-groep__label";
  conversieLabel.textContent = "Wat wil je oefenen?";
  conversieGroep.appendChild(conversieLabel);

  const conversieRij = document.createElement("div");
  conversieRij.className = "keuze-rij";
  conversieRij.setAttribute("role", "radiogroup");
  conversieRij.setAttribute("aria-label", "Conversietype kiezen");

  const conversieKnoppen = [];
  for (const optie of CONVERSIE_OPTIES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = optie.label;
    knop.setAttribute("role", "radio");
    knop.setAttribute("aria-checked", String(instellingen.conversieType === optie.id));
    knop.addEventListener("click", () => {
      instellingen.conversieType = optie.id;
      for (const item of conversieKnoppen) {
        const actief = item.id === optie.id;
        item.knop.setAttribute("aria-checked", String(actief));
      }
    });
    conversieKnoppen.push({ knop, id: optie.id });
    conversieRij.appendChild(knop);
  }
  conversieGroep.appendChild(conversieRij);
  kaart.appendChild(conversieGroep);

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
    knop.setAttribute("aria-label", `${aantal} opgaven`);
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
    await saveInstellingen("breuken", instellingen);
    startOefening({ ...instellingen });
  });
  startRij.appendChild(startKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}