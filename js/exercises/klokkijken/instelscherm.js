// exercises/klokkijken/instelscherm.js
// -----------------------------------------------------------------------------
// Instelscherm voor de klokkijken-oefening: kies lezen of tekenen, het soort
// tijden (hele/halve uren of mix) en het aantal opgaven.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";
import { URENVERSCHIL_OPTIES } from "./opgaven.js";

const MODI = [
  { id: "lezen", label: "👀 Lezen", omschrijving: "Kijk naar de klok en kies hoe laat het is." },
  { id: "tekenen", label: "✏️ Tekenen", omschrijving: "Zet zelf de wijzers op de juiste plek." },
  { id: "uren", label: "⏰ Uren eerder of later", omschrijving: "Reken uit hoe laat het 1, 2 of 3 uur eerder of later is." },
];

const RICHTINGEN = [
  { id: "eerder", label: "⏪ Eerder" },
  { id: "later", label: "⏩ Later" },
  { id: "beide", label: "🔀 Allebei" },
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
  urenVerschil: [1, 2, 3],
  richting: "beide",
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
  if (!RICHTINGEN.some((r) => r.id === instellingen.richting)) instellingen.richting = STANDAARD_INSTELLINGEN.richting;
  if (!Array.isArray(instellingen.urenVerschil) || !instellingen.urenVerschil.some((v) => URENVERSCHIL_OPTIES.includes(v))) {
    instellingen.urenVerschil = [...STANDAARD_INSTELLINGEN.urenVerschil];
  }
  instellingen.urenVerschil = instellingen.urenVerschil.filter((v) => URENVERSCHIL_OPTIES.includes(v));
  if (!AANTAL_OPTIES.includes(instellingen.aantalOpgaven)) instellingen.aantalOpgaven = STANDAARD_INSTELLINGEN.aantalOpgaven;

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Klokkijken";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Lees de klok, teken zelf de wijzers of reken uit hoe laat het eerder of later is.";
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
      werkZichtbaarheidBij();
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

  // --- Alleen bij "Uren eerder of later": hoeveel uur en welke richting ---
  const urenGroep = document.createElement("div");
  urenGroep.className = "instel-groep";
  const urenLabel = document.createElement("span");
  urenLabel.className = "instel-groep__label";
  urenLabel.textContent = "Hoeveel uur eerder of later? (kies er één of meer)";
  urenGroep.appendChild(urenLabel);
  const urenRij = document.createElement("div");
  urenRij.className = "keuze-rij";
  urenRij.setAttribute("role", "group");
  urenRij.setAttribute("aria-label", "Aantal uren kiezen");
  const urenKnoppen = [];
  for (const v of URENVERSCHIL_OPTIES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = `${v} uur`;
    knop.setAttribute("aria-pressed", String(instellingen.urenVerschil.includes(v)));
    knop.addEventListener("click", () => {
      const aan = instellingen.urenVerschil.includes(v);
      // Er moet er altijd minstens één aan blijven staan.
      if (aan && instellingen.urenVerschil.length === 1) return;
      instellingen.urenVerschil = aan
        ? instellingen.urenVerschil.filter((x) => x !== v)
        : [...instellingen.urenVerschil, v].sort((a, b) => a - b);
      knop.setAttribute("aria-pressed", String(!aan));
    });
    urenKnoppen.push({ knop, v });
    urenRij.appendChild(knop);
  }
  urenGroep.appendChild(urenRij);

  const richtingLabel = document.createElement("span");
  richtingLabel.className = "instel-groep__label";
  richtingLabel.style.display = "block";
  richtingLabel.style.marginTop = "12px";
  richtingLabel.textContent = "Eerder of later?";
  urenGroep.appendChild(richtingLabel);
  const richtingRij = document.createElement("div");
  richtingRij.className = "keuze-rij";
  richtingRij.setAttribute("role", "group");
  richtingRij.setAttribute("aria-label", "Richting kiezen");
  const richtingKnoppen = [];
  for (const r of RICHTINGEN) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = r.label;
    knop.setAttribute("aria-pressed", String(instellingen.richting === r.id));
    knop.addEventListener("click", () => {
      instellingen.richting = r.id;
      for (const item of richtingKnoppen) item.knop.setAttribute("aria-pressed", String(item.id === r.id));
    });
    richtingKnoppen.push({ knop, id: r.id });
    richtingRij.appendChild(knop);
  }
  urenGroep.appendChild(richtingRij);
  const urenToelichting = document.createElement("p");
  urenToelichting.style.cssText = "margin:8px 0 0;font-size:0.95rem;opacity:.85";
  urenToelichting.textContent = "Je ziet een hele tijd op de klok en typt zelf het antwoord, bijvoorbeeld: het is 2 uur, hoe laat was het 2 uur eerder? Antwoord: 12.";
  urenGroep.appendChild(urenToelichting);
  kaart.appendChild(urenGroep);

  /** Toont de uren-opties alleen in de uren-modus en verbergt dan de keuze voor hele/halve uren. */
  function werkZichtbaarheidBij() {
    const uren = instellingen.modus === "uren";
    urenGroep.style.display = uren ? "" : "none";
    typeGroep.style.display = uren ? "none" : "";
  }
  werkZichtbaarheidBij();

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