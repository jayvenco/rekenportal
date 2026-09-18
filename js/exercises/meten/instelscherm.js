// exercises/meten/instelscherm.js
// -----------------------------------------------------------------------------
// Bouwt het instelscherm van de meten-module: kies categorie(ën) en het aantal
// opgaven. Slaat de keuzes op via storage.js zodat ze de volgende keer al
// klaarstaan.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const CATEGORIE_OPTIES = [
  { id: "omtrek_oppervlakte", label: "Omtrek & oppervlakte" },
  { id: "inhoud", label: "Inhoud" },
  { id: "gewicht", label: "Gewicht" },
  { id: "tijd", label: "Tijd" },
];

const ALLE_CATEGORIEEN = CATEGORIE_OPTIES.map((o) => o.id);

const STANDAARD_INSTELLINGEN = {
  categorieen: [],
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
  const opgeslagen = (await getInstellingen("meten")) || {};
  const instellingen = {
    ...STANDAARD_INSTELLINGEN,
    ...opgeslagen,
    categorieen: Array.isArray(opgeslagen.categorieen)
      ? [...opgeslagen.categorieen]
      : [...STANDAARD_INSTELLINGEN.categorieen],
  };

  let foutMeldingEl = null;

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Oefen met meten";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent =
    "Kies welke onderdelen je wilt oefenen en hoeveel sommen je wilt maken.";
  kaart.appendChild(uitleg);

  // --- Categoriekeuze ---
  const catGroep = document.createElement("div");
  catGroep.className = "instel-groep";
  const catLabel = document.createElement("span");
  catLabel.className = "instel-groep__label";
  catLabel.textContent = "Wat wil je oefenen?";
  catGroep.appendChild(catLabel);

  const alleKnopRij = document.createElement("div");
  alleKnopRij.className = "keuze-rij";
  alleKnopRij.style.marginBottom = "12px";

  const alleKnop = document.createElement("button");
  alleKnop.type = "button";
  alleKnop.className = "keuze-knop";
  alleKnop.textContent = "Alles";
  alleKnop.setAttribute("aria-label", "Alle categorieën kiezen");
  alleKnopRij.appendChild(alleKnop);
  catGroep.appendChild(alleKnopRij);

  const catRij = document.createElement("div");
  catRij.className = "keuze-rij";
  catRij.setAttribute("role", "group");
  catRij.setAttribute("aria-label", "Categorieën kiezen");

  const catKnoppen = [];

  function werkAlleKnopBij() {
    const alleGeselecteerd = ALLE_CATEGORIEEN.every((c) =>
      instellingen.categorieen.includes(c)
    );
    alleKnop.setAttribute("aria-pressed", String(alleGeselecteerd));
  }

  for (const optie of CATEGORIE_OPTIES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = optie.label;
    knop.setAttribute("aria-label", optie.label);
    const actief = instellingen.categorieen.includes(optie.id);
    knop.setAttribute("aria-pressed", String(actief));
    knop.addEventListener("click", () => {
      const index = instellingen.categorieen.indexOf(optie.id);
      if (index >= 0) {
        instellingen.categorieen.splice(index, 1);
      } else {
        instellingen.categorieen.push(optie.id);
      }
      knop.setAttribute(
        "aria-pressed",
        String(instellingen.categorieen.includes(optie.id))
      );
      werkAlleKnopBij();
      // Verwijder foutmelding als er nu wél een categorie is gekozen
      if (foutMeldingEl && instellingen.categorieen.length > 0) {
        foutMeldingEl.remove();
        foutMeldingEl = null;
      }
    });
    catKnoppen.push({ knop, id: optie.id });
    catRij.appendChild(knop);
  }

  alleKnop.addEventListener("click", () => {
    instellingen.categorieen = [...ALLE_CATEGORIEEN];
    for (const item of catKnoppen) {
      item.knop.setAttribute("aria-pressed", "true");
    }
    werkAlleKnopBij();
  });

  werkAlleKnopBij();
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
    knop.setAttribute(
      "aria-pressed",
      String(instellingen.aantalOpgaven === aantal)
    );
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
    if (instellingen.categorieen.length === 0) {
      if (!foutMeldingEl) {
        foutMeldingEl = document.createElement("p");
        foutMeldingEl.style.cssText =
          "color:var(--kleur-fout);font-weight:600;margin:8px 0 0;";
        foutMeldingEl.textContent =
          "Kies eerst minstens één categorie om te oefenen.";
        startRij.appendChild(foutMeldingEl);
      }
      return;
    }
    if (foutMeldingEl) {
      foutMeldingEl.remove();
      foutMeldingEl = null;
    }
    await saveInstellingen("meten", instellingen);
    opStarten({ ...instellingen, categorieen: [...instellingen.categorieen] });
  });
  startRij.appendChild(startKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}