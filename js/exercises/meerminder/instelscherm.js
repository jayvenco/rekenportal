// exercises/meerminder/instelscherm.js
// -----------------------------------------------------------------------------
// Instelscherm van "Meer of minder?": welke categorieën (aantal, grootte,
// hoogte) en hoeveel opgaven. Slaat de keuzes op via storage.js.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const STANDAARD_INSTELLINGEN = {
  categorieen: ["aantal", "grootte", "hoogte"],
  aantalOpgaven: 10,
};

const CATEGORIE_OPTIES = [
  { id: "aantal", label: "Meer / minder" },
  { id: "grootte", label: "Groter / kleiner" },
  { id: "hoogte", label: "Hoger / lager" },
];

const AANTAL_OPTIES = [5, 10, 20];

/**
 * Bouwt het instelscherm.
 * @param {HTMLElement} container - waar het scherm in getekend wordt.
 * @param {Function} opStarten - callback(instellingen) die wordt aangeroepen als het kind op "Start" klikt.
 */
export async function bouwInstelscherm(container, opStarten) {
  const opgeslagen = (await getInstellingen("meerminder")) || {};
  const instellingen = {
    ...STANDAARD_INSTELLINGEN,
    ...opgeslagen,
    categorieen: opgeslagen.categorieen && opgeslagen.categorieen.length > 0
      ? [...opgeslagen.categorieen]
      : [...STANDAARD_INSTELLINGEN.categorieen],
  };

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Kies je oefening";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Korte verhaaltjes: kies steeds wie of wat er meer, groter of hoger is.";
  kaart.appendChild(uitleg);

  // --- Categorieën (minstens één moet aan blijven) ---
  const categorieGroep = document.createElement("div");
  categorieGroep.className = "instel-groep";
  const categorieLabel = document.createElement("span");
  categorieLabel.className = "instel-groep__label";
  categorieLabel.textContent = "Welke soorten vragen?";
  categorieGroep.appendChild(categorieLabel);

  const categorieRij = document.createElement("div");
  categorieRij.className = "keuze-rij";
  categorieRij.setAttribute("role", "group");
  categorieRij.setAttribute("aria-label", "Categorieën kiezen (meerdere mogelijk)");

  for (const optie of CATEGORIE_OPTIES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = optie.label;
    knop.setAttribute("aria-pressed", String(instellingen.categorieen.includes(optie.id)));
    knop.addEventListener("click", () => {
      const actief = instellingen.categorieen.includes(optie.id);
      if (actief && instellingen.categorieen.length === 1) return; // minstens één moet aan blijven
      if (actief) {
        instellingen.categorieen = instellingen.categorieen.filter((c) => c !== optie.id);
      } else {
        instellingen.categorieen.push(optie.id);
      }
      knop.setAttribute("aria-pressed", String(!actief));
    });
    categorieRij.appendChild(knop);
  }
  categorieGroep.appendChild(categorieRij);
  kaart.appendChild(categorieGroep);

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
    await saveInstellingen("meerminder", instellingen);
    opStarten({ ...instellingen, categorieen: [...instellingen.categorieen] });
  });
  startRij.appendChild(startKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}
