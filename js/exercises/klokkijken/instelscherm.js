// exercises/klokkijken/instelscherm.js
// -----------------------------------------------------------------------------
// Instelscherm voor de klokkijken-oefening: keuze uit hele uren, halve uren
// of een mix, plus het aantal opgaven.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const TYPEN = [
  { id: "heel", label: "Hele uren", voorbeeld: "3 uur" },
  { id: "half", label: "Halve uren", voorbeeld: "half 4" },
  { id: "mix", label: "Mix (heel + half)", voorbeeld: "alles door elkaar" },
];

const STANDAARD_INSTELLINGEN = {
  opgaveType: "mix",
  aantalOpgaven: 10,
};

const AANTAL_OPTIES = [5, 10, 20];

/**
 * Bouwt het instelscherm.
 * @param {HTMLElement} container
 * @param {Function} opStarten - callback(instellingen)
 */
export async function bouwInstelscherm(container, opStarten) {
  const opgeslagen = (await getInstellingen("klokkijken")) || {};
  const instellingen = { ...STANDAARD_INSTELLINGEN, ...opgeslagen };
  if (!TYPEN.some((t) => t.id === instellingen.opgaveType)) {
    instellingen.opgaveType = STANDAARD_INSTELLINGEN.opgaveType;
  }
  if (!AANTAL_OPTIES.includes(instellingen.aantalOpgaven)) {
    instellingen.aantalOpgaven = STANDAARD_INSTELLINGEN.aantalOpgaven;
  }

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Klokkijken";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Kijk naar de klok en kies hoe laat het is. De lange wijzer is de minuutwijzer, de korte wijzer is de uurwijzer.";
  kaart.appendChild(uitleg);

  // --- Typekeuze (één van de drie) ---
  const typeGroep = document.createElement("div");
  typeGroep.className = "instel-groep";
  const typeLabel = document.createElement("span");
  typeLabel.className = "instel-groep__label";
  typeLabel.textContent = "Wat wil je oefenen?";
  typeGroep.appendChild(typeLabel);

  const typeRij = document.createElement("div");
  typeRij.className = "keuze-rij";
  typeRij.style.flexWrap = "wrap";
  typeRij.setAttribute("role", "group");
  typeRij.setAttribute("aria-label", "Soort klokopgave kiezen");

  const typeKnoppen = [];
  for (const t of TYPEN) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = t.label;
    knop.title = t.voorbeeld;
    knop.addEventListener("click", () => {
      instellingen.opgaveType = t.id;
      for (const item of typeKnoppen) {
        item.knop.setAttribute("aria-pressed", String(item.id === t.id));
      }
    });
    knop.setAttribute("aria-pressed", String(instellingen.opgaveType === t.id));
    typeKnoppen.push({ knop, id: t.id });
    typeRij.appendChild(knop);
  }
  typeGroep.appendChild(typeRij);
  kaart.appendChild(typeGroep);

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
    await saveInstellingen("klokkijken", instellingen);
    opStarten({ ...instellingen });
  });
  startRij.appendChild(startKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}