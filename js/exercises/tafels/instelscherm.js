// exercises/tafels/instelscherm.js
// -----------------------------------------------------------------------------
// Bouwt het instelscherm van de tafels-module: welke tafel(s) en hoeveel
// opgaven. Slaat de keuzes op via storage.js zodat ze de volgende keer al
// klaarstaan.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const ALLE_TAFELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const STANDAARD_INSTELLINGEN = {
  tafels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  aantalOpgaven: 10,
};

const AANTAL_OPTIES = [5, 10, 20];

/**
 * Bouwt het instelscherm.
 * @param {HTMLElement} container - waar het scherm in getekend wordt.
 * @param {Function} opStarten - callback(instellingen) die wordt aangeroepen als het kind op "Start" klikt.
 */
export async function bouwInstelscherm(container, opStarten) {
  const opgeslagen = (await getInstellingen("tafels")) || {};
  const instellingen = {
    ...STANDAARD_INSTELLINGEN,
    ...opgeslagen,
    tafels: Array.isArray(opgeslagen.tafels) && opgeslagen.tafels.length > 0
      ? [...opgeslagen.tafels]
      : [...STANDAARD_INSTELLINGEN.tafels],
  };

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Oefen de tafels";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Kies welke tafel(s) je wilt oefenen en hoeveel sommen je wilt maken.";
  kaart.appendChild(uitleg);

  // --- Tafelkeuze ---
  const tafelGroep = document.createElement("div");
  tafelGroep.className = "instel-groep";
  const tafelLabel = document.createElement("span");
  tafelLabel.className = "instel-groep__label";
  tafelLabel.textContent = "Welke tafel(s) wil je oefenen?";
  tafelGroep.appendChild(tafelLabel);

  const alleKnopRij = document.createElement("div");
  alleKnopRij.className = "keuze-rij";
  alleKnopRij.style.marginBottom = "12px";

  const alleKnop = document.createElement("button");
  alleKnop.type = "button";
  alleKnop.className = "keuze-knop";
  alleKnop.textContent = "Alle tafels";
  alleKnop.setAttribute("aria-label", "Alle tafels van 1 tot en met 10 kiezen");
  alleKnopRij.appendChild(alleKnop);
  tafelGroep.appendChild(alleKnopRij);

  const tafelRij = document.createElement("div");
  tafelRij.className = "keuze-rij";
  tafelRij.setAttribute("role", "group");
  tafelRij.setAttribute("aria-label", "Tafels kiezen");

  const tafelKnoppen = [];

  function werkAlleKnopBij() {
    const alleGeselecteerd = ALLE_TAFELS.every((t) => instellingen.tafels.includes(t));
    alleKnop.setAttribute("aria-pressed", String(alleGeselecteerd));
  }

  for (const tafel of ALLE_TAFELS) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = `Tafel van ${tafel}`;
    knop.setAttribute("aria-label", `Tafel van ${tafel}`);
    const actief = instellingen.tafels.includes(tafel);
    knop.setAttribute("aria-pressed", String(actief));
    knop.addEventListener("click", () => {
      const index = instellingen.tafels.indexOf(tafel);
      if (index >= 0) {
        // Niet de laatste tafel kunnen uitvinken: er moet minstens 1 gekozen blijven.
        if (instellingen.tafels.length > 1) {
          instellingen.tafels.splice(index, 1);
        }
      } else {
        instellingen.tafels.push(tafel);
      }
      knop.setAttribute("aria-pressed", String(instellingen.tafels.includes(tafel)));
      werkAlleKnopBij();
    });
    tafelKnoppen.push({ knop, tafel });
    tafelRij.appendChild(knop);
  }

  alleKnop.addEventListener("click", () => {
    instellingen.tafels = [...ALLE_TAFELS];
    for (const item of tafelKnoppen) {
      item.knop.setAttribute("aria-pressed", "true");
    }
    werkAlleKnopBij();
  });

  werkAlleKnopBij();
  tafelGroep.appendChild(tafelRij);
  kaart.appendChild(tafelGroep);

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
    if (instellingen.tafels.length === 0) {
      instellingen.tafels = [...ALLE_TAFELS];
    }
    await saveInstellingen("tafels", instellingen);
    opStarten({ ...instellingen, tafels: [...instellingen.tafels] });
  });
  startRij.appendChild(startKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}
