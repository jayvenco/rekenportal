// exercises/verhaaltjes/instelscherm.js
// -----------------------------------------------------------------------------
// Bouwt het (heel eenvoudige) instelscherm van de verhaaltjessommen-module:
// alleen het aantal opgaven is instelbaar. Slaat de keuze op via storage.js
// zodat ze de volgende keer al klaarstaat.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";
import { MAX_OPTIES } from "./opgaven.js";

const STANDAARD_INSTELLINGEN = {
  maxGetal: 20,
  aantalOpgaven: 10,
  moeilijkheid: "uitdagend",
  soort: "boom",
};

const AANTAL_OPTIES = [5, 10, 20];

/**
 * Bouwt het instelscherm.
 * @param {HTMLElement} container - waar het scherm in getekend wordt.
 * @param {Function} opStarten - callback(instellingen) die wordt aangeroepen als het kind op "Start" klikt.
 */
export async function bouwInstelscherm(container, opStarten, opUitleg) {
  const opgeslagen = (await getInstellingen("splitsen")) || {};
  const instellingen = { ...STANDAARD_INSTELLINGEN, ...opgeslagen };

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Splitsen \u{1F333}";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Splits het getal in twee delen. Eén deel is al gegeven: welk getal hoort in het lege vakje?";
  kaart.appendChild(uitleg);

  // --- Soort opgaven ---
  const soortGroep = document.createElement("div");
  soortGroep.className = "instel-groep";
  const soortLabel = document.createElement("span");
  soortLabel.className = "instel-groep__label";
  soortLabel.textContent = "Wat wil je oefenen?";
  soortGroep.appendChild(soortLabel);
  const soortRij = document.createElement("div");
  soortRij.className = "keuze-rij";
  soortRij.setAttribute("role", "radiogroup");
  soortRij.setAttribute("aria-label", "Soort opgaven");
  const SOORT_LABELS = [
    { id: "boom", label: "\u{1F333} Splitsboom" },
    { id: "brug", label: "\u2795\u2796 Sommen via het tiental" },
    { id: "beide", label: "\u{1F500} Allebei" },
  ];
  const soortKnoppen = [];
  for (const optie of SOORT_LABELS) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = optie.label;
    knop.setAttribute("role", "radio");
    const actief0 = instellingen.soort === optie.id;
    knop.setAttribute("aria-checked", String(actief0));
    knop.setAttribute("aria-pressed", String(actief0));
    knop.addEventListener("click", () => {
      instellingen.soort = optie.id;
      for (const item of soortKnoppen) {
        const actief = item.id === optie.id;
        item.knop.setAttribute("aria-checked", String(actief));
        item.knop.setAttribute("aria-pressed", String(actief));
      }
      soortToelichting.textContent = toelichting(optie.id);
    });
    soortKnoppen.push({ knop, id: optie.id });
    soortRij.appendChild(knop);
  }
  soortGroep.appendChild(soortRij);
  const soortToelichting = document.createElement("p");
  soortToelichting.style.cssText = "margin:6px 0 0;font-size:0.95rem;opacity:.85";
  function toelichting(id) {
    if (id === "brug") return "Reken plus- en minsommen uit door eerst een heel tiental te maken, bijvoorbeeld 38 + 7 = 38 + 2 + 5. Je rekent minstens tot 20.";
    if (id === "beide") return "Een mix van splitsbomen en sommen via het tiental.";
    return "Vul het ontbrekende deel van de splitsboom in.";
  }
  soortToelichting.textContent = toelichting(instellingen.soort);
  soortGroep.appendChild(soortToelichting);
  kaart.appendChild(soortGroep);

  // --- Tot hoever splitsen ---
  const maxGroep = document.createElement("div");
  maxGroep.className = "instel-groep";
  const maxLabel = document.createElement("span");
  maxLabel.className = "instel-groep__label";
  maxLabel.textContent = "Tot welk getal oefenen we? (10 t/m 100)";
  maxGroep.appendChild(maxLabel);
  const maxRij = document.createElement("div");
  maxRij.className = "keuze-rij";
  maxRij.setAttribute("role", "group");
  maxRij.setAttribute("aria-label", "Grootste getal kiezen");
  const maxKnoppen = [];
  for (const m of MAX_OPTIES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = String(m);
    knop.setAttribute("aria-pressed", String(instellingen.maxGetal === m));
    knop.addEventListener("click", () => {
      instellingen.maxGetal = m;
      for (const item of maxKnoppen) item.knop.setAttribute("aria-pressed", String(item.m === m));
    });
    maxKnoppen.push({ knop, m });
    maxRij.appendChild(knop);
  }
  maxGroep.appendChild(maxRij);
  kaart.appendChild(maxGroep);

  // --- Moeilijkheid ---
  const moeiGroep = document.createElement("div");
  moeiGroep.className = "instel-groep";
  const moeiLabel = document.createElement("span");
  moeiLabel.className = "instel-groep__label";
  moeiLabel.textContent = "Hoe moeilijk?";
  moeiGroep.appendChild(moeiLabel);

  const moeiRij = document.createElement("div");
  moeiRij.className = "keuze-rij";
  moeiRij.setAttribute("role", "radiogroup");
  moeiRij.setAttribute("aria-label", "Moeilijkheidsgraad");

  const MOEILIJKHEID_OPTIES = [
    { id: "makkelijk", label: "\u{1F31F} Makkelijk (meerkeuze)" },
    { id: "uitdagend", label: "\u{1F680} Uitdagend (zelf intypen)" },
  ];

  const moeiKnoppen = [];
  for (const optie of MOEILIJKHEID_OPTIES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = optie.label;
    knop.setAttribute("role", "radio");
    knop.setAttribute("aria-checked", String(instellingen.moeilijkheid === optie.id));
    knop.setAttribute("aria-pressed", String(instellingen.moeilijkheid === optie.id));
    knop.addEventListener("click", () => {
      instellingen.moeilijkheid = optie.id;
      for (const item of moeiKnoppen) {
        const actief = item.id === optie.id;
        item.knop.setAttribute("aria-checked", String(actief));
        item.knop.setAttribute("aria-pressed", String(actief));
      }
    });
    moeiKnoppen.push({ knop, id: optie.id });
    moeiRij.appendChild(knop);
  }
  moeiGroep.appendChild(moeiRij);
  kaart.appendChild(moeiGroep);

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
    knop.setAttribute("aria-label", `${aantal} opgaven maken`);
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
    await saveInstellingen("splitsen", instellingen);
    opStarten({ ...instellingen });
  });
  startRij.appendChild(startKnop);
  const uitlegKnop = document.createElement("button");
  uitlegKnop.type = "button";
  uitlegKnop.className = "knop knop--zacht";
  uitlegKnop.textContent = "\u{1F4D6} Uitleg: hoe werkt splitsen?";
  uitlegKnop.addEventListener("click", opUitleg);
  startRij.appendChild(uitlegKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}
