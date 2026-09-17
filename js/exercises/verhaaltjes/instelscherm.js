// exercises/verhaaltjes/instelscherm.js
// -----------------------------------------------------------------------------
// Bouwt het (heel eenvoudige) instelscherm van de verhaaltjessommen-module:
// alleen het aantal opgaven is instelbaar. Slaat de keuze op via storage.js
// zodat ze de volgende keer al klaarstaat.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const STANDAARD_INSTELLINGEN = {
  aantalOpgaven: 10,
  moeilijkheid: "uitdagend",
};

const AANTAL_OPTIES = [5, 10, 20];

/**
 * Bouwt het instelscherm.
 * @param {HTMLElement} container - waar het scherm in getekend wordt.
 * @param {Function} opStarten - callback(instellingen) die wordt aangeroepen als het kind op "Start" klikt.
 */
export async function bouwInstelscherm(container, opStarten) {
  const opgeslagen = (await getInstellingen("verhaaltjes")) || {};
  const instellingen = { ...STANDAARD_INSTELLINGEN, ...opgeslagen };

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Verhaaltjessommen";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Lees het verhaaltje goed en reken uit hoeveel het er zijn.";
  kaart.appendChild(uitleg);

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
    await saveInstellingen("verhaaltjes", instellingen);
    opStarten({ ...instellingen });
  });
  startRij.appendChild(startKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}
