// exercises/verhoudingen/instelscherm.js
// -----------------------------------------------------------------------------
// Bouwt het instelscherm van de verhoudingen-module: kies categorie
// (recepten, schaal, mix) en aantal opgaven. Slaat de keuzes op.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const STANDAARD_INSTELLINGEN = {
  categorie: "mix",
  aantalOpgaven: 10,
};

const AANTAL_OPTIES = [5, 10, 20];

const CATEGORIE_OPTIES = [
  { id: "recepten", label: "\u{1F372} Recepten", beschrijving: "Verhoudingen in recepten (eieren, bloem, etc.)" },
  { id: "schaal", label: "\u{1F5FA} Schaal", beschrijving: "Verhoudingen op een kaart (cm ↔ km)" },
  { id: "mix", label: "\u{1F504} Mix", beschrijving: "Door elkaar: recepten én schaal" },
];

/**
 * Bouwt het instelscherm.
 * @param {HTMLElement} container
 * @param {Function} opStarten - callback(instellingen) bij klik op "Start"
 */
export async function bouwInstelscherm(container, opStarten) {
  const opgeslagen = (await getInstellingen("verhoudingen")) || {};
  const instellingen = {
    ...STANDAARD_INSTELLINGEN,
    ...opgeslagen,
  };

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Verhoudingen";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent =
    "Oefen met verhoudingen in praktische situaties: " +
    "recepten aanpassen voor meer of minder personen, " +
    "of afstanden berekenen op een kaart.";
  kaart.appendChild(uitleg);

  // --- Categoriekeuze ---
  const catGroep = document.createElement("div");
  catGroep.className = "instel-groep";
  const catLabel = document.createElement("span");
  catLabel.className = "instel-groep__label";
  catLabel.textContent = "Wat wil je oefenen?";
  catGroep.appendChild(catLabel);

  const catRij = document.createElement("div");
  catRij.className = "keuze-rij";
  catRij.setAttribute("role", "radiogroup");
  catRij.setAttribute("aria-label", "Categorie kiezen");

  const catKnoppen = [];
  for (const optie of CATEGORIE_OPTIES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = optie.label;
    knop.title = optie.beschrijving;
    knop.setAttribute("role", "radio");
    knop.setAttribute("aria-checked", String(instellingen.categorie === optie.id));
    knop.setAttribute("aria-pressed", String(instellingen.categorie === optie.id));
    knop.addEventListener("click", () => {
      instellingen.categorie = optie.id;
      for (const item of catKnoppen) {
        const actief = item.id === optie.id;
        item.knop.setAttribute("aria-checked", String(actief));
        item.knop.setAttribute("aria-pressed", String(actief));
      }
    });
    catKnoppen.push({ knop, id: optie.id });
    catRij.appendChild(knop);
  }
  catGroep.appendChild(catRij);
  kaart.appendChild(catGroep);

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
    await saveInstellingen("verhoudingen", instellingen);
    opStarten({ ...instellingen });
  });
  startRij.appendChild(startKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}