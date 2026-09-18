// exercises/statistiek/instelscherm.js
// -----------------------------------------------------------------------------
// Bouwt het instelscherm van de statistiek-module: kies categorie(ën) en
// aantal opgaven. Slaat de keuzes op via storage.js zodat ze de volgende
// keer al klaarstaan.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const ALLE_CATEGORIEEN = ["staafgrafiek", "gemiddelde", "tabel", "turven"];

const CATEGORIE_UI = [
  { id: "staafgrafiek", label: "\u{1F4CA} Grafieken", beschrijving: "Staafdiagrammen en cirkeldiagrammen aflezen" },
  { id: "gemiddelde", label: "\u{1F522} Gemiddelde/Mediaan/Modus", beschrijving: "Bereken gemiddelde, mediaan of modus van een dataset" },
  { id: "tabel", label: "\u{1F4D6} Tabellen", beschrijving: "Gegevens aflezen uit een tabel" },
  { id: "turven", label: "\u{270D} Turven/Frequentie", beschrijving: "Frequentietabellen met turven invullen" },
];

const STANDAARD_INSTELLINGEN = {
  categorieen: [],
  aantalOpgaven: 10,
};

const AANTAL_OPTIES = [5, 10, 20];

/**
 * Bouwt het instelscherm.
 * @param {HTMLElement} container
 * @param {Function} opStarten - callback(instellingen) bij klik op "Start"
 */
export async function bouwInstelscherm(container, opStarten) {
  const opgeslagen = (await getInstellingen("statistiek")) || {};
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
  titel.textContent = "Statistiek & Data";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent =
    "Oefen met het aflezen van grafieken, berekenen van gemiddeldes, " +
    "tabellen lezen en turven. Kies wat je wilt oefenen.";
  kaart.appendChild(uitleg);

  // --- Categoriekeuze (meerdere mogelijk) ---
  const catGroep = document.createElement("div");
  catGroep.className = "instel-groep";
  const catLabel = document.createElement("span");
  catLabel.className = "instel-groep__label";
  catLabel.textContent = "Welke categorie(ën) wil je oefenen?";
  catGroep.appendChild(catLabel);

  const alleKnopRij = document.createElement("div");
  alleKnopRij.className = "keuze-rij";
  alleKnopRij.style.marginBottom = "12px";

  const alleKnop = document.createElement("button");
  alleKnop.type = "button";
  alleKnop.className = "keuze-knop";
  alleKnop.textContent = "Alle categorieën";
  alleKnop.setAttribute("aria-label", "Alle categorieën tegelijk oefenen");
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

  for (const optie of CATEGORIE_UI) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = optie.label;
    knop.title = optie.beschrijving;
    knop.setAttribute("aria-label", optie.beschrijving);
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
        item.knop.setAttribute(
          "aria-pressed",
          String(item.aantal === aantal)
        );
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
    await saveInstellingen("statistiek", instellingen);
    opStarten({
      ...instellingen,
      categorieen: [...instellingen.categorieen],
    });
  });
  startRij.appendChild(startKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}