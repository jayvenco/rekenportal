// exercises/klokkijken/instelscherm.js
// -----------------------------------------------------------------------------
// Instelscherm voor de klokkijken-oefening: kies lezen of tekenen, het soort
// tijden (hele/halve uren of mix) en het aantal opgaven.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const MODI = [
  { id: "lezen", label: "👀 Lezen", omschrijving: "Kijk naar de klok en kies hoe laat het is." },
  { id: "tekenen", label: "✏️ Tekenen", omschrijving: "Zet zelf de wijzers op de juiste plek." },
];

const TYPEN = [
  { id: "heel", label: "Hele uren", voorbeeld: "3 uur" },
  { id: "half", label: "Halve uren", voorbeeld: "half 4" },
  { id: "mix", label: "Mix (heel + half)", voorbeeld: "alles door elkaar" },
];

const STANDAARD_INSTELLINGEN = {
  modus: "lezen",
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
  if (!MODI.some((m) => m.id === instellingen.modus)) instellingen.modus = STANDAARD_INSTELLINGEN.modus;
  if (!TYPEN.some((t) => t.id === instellingen.opgaveType)) instellingen.opgaveType = STANDAARD_INSTELLINGEN.opgaveType;
  if (!AANTAL_OPTIES.includes(instellingen.aantalOpgaven)) instellingen.aantalOpgaven = STANDAARD_INSTELLINGEN.aantalOpgaven;

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Klokkijken";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Lees de klok of teken zelf de wijzers voor hele en halve uren.";
  kaart.appendChild(uitleg);

  // --- Moduskeuze ---
  const modusGroep = document.createElement("div");
  modusGroep.className = "instel-groep";
  const modusLabel = document.createElement("span");
  modusLabel.className = "instel-groep__label";
  modusLabel.textContent = "Wat wil je doen?";
  modusGroep.appendChild(modusLabel);

  const modusRij = document.createElement("div");
  modusRij.className = "keuze-rij";
  modusRij.style.flexWrap = "wrap";
  modusRij.setAttribute("role", "group");
  modusRij.setAttribute("aria-label", "Soort oefening kiezen");

  const modusKnoppen = [];
  for (const m of MODI) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = m.label;
    knop.title = m.omschrijving;
    knop.addEventListener("click", () => {
      instellingen.modus = m.id;
      for (const item of modusKnoppen) {
        item.knop.setAttribute("aria-pressed", String(item.id === m.id));
      }
    });
    knop.setAttribute("aria-pressed", String(instellingen.modus === m.id));
    modusKnoppen.push({ knop, id: m.id });
    modusRij.appendChild(knop);
  }
  modusGroep.appendChild(modusRij);
  kaart.appendChild(modusGroep);

  // --- Typekeuze (één van de drie) ---
  const typeGroep = document.createElement("div");
  typeGroep.className = "instel-groep";
  const typeLabel = document.createElement("span");
  typeLabel.className = "instel-groep__label";
  typeLabel.textContent = "Welke tijden wil je oefenen?";
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