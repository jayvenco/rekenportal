// exercises/procenten/instelscherm.js
// -----------------------------------------------------------------------------
// Instelscherm voor procenten: vraagtype(s) kiezen + aantal opgaven.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const ALLE_TYPES = [
  { id: "procent-van", label: "Procenten berekenen", voorbeeld: "25% van 80 = ?" },
  { id: "toename-afname", label: "Toename/afname", voorbeeld: "Prijs wordt 10% duurder" },
  { id: "breuk-naar-procent", label: "Breuk → procent", voorbeeld: "3/4 = ?%" },
  { id: "korting", label: "Korting", voorbeeld: "15% korting, wat betaal je?" },
];

const STANDAARD_INSTELLINGEN = {
  types: [],
  aantalOpgaven: 10,
};

const AANTAL_OPTIES = [5, 10, 20];

/**
 * Bouwt het instelscherm.
 * @param {HTMLElement} container
 * @param {Function} opStarten - callback(instellingen)
 */
export async function bouwInstelscherm(container, opStarten) {
  const opgeslagen = (await getInstellingen("procenten")) || {};
  const instellingen = {
    ...STANDAARD_INSTELLINGEN,
    ...opgeslagen,
    types: Array.isArray(opgeslagen.types) ? [...opgeslagen.types] : [...STANDAARD_INSTELLINGEN.types],
  };

  let foutMeldingEl = null;

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Oefen procenten";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Kies welke soort procenten-opgaven je wilt oefenen.";
  kaart.appendChild(uitleg);

  // --- Vraagtypekeuze ---
  const typeGroep = document.createElement("div");
  typeGroep.className = "instel-groep";
  const typeLabel = document.createElement("span");
  typeLabel.className = "instel-groep__label";
  typeLabel.textContent = "Welke vraagtypes wil je oefenen?";
  typeGroep.appendChild(typeLabel);

  const typeRij = document.createElement("div");
  typeRij.className = "keuze-rij";
  typeRij.style.flexWrap = "wrap";
  typeRij.setAttribute("role", "group");
  typeRij.setAttribute("aria-label", "Vraagtypes kiezen");

  const typeKnoppen = [];

  for (const t of ALLE_TYPES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = t.label;
    knop.title = t.voorbeeld;
    knop.setAttribute("aria-label", `${t.label}: ${t.voorbeeld}`);
    const actief = instellingen.types.includes(t.id);
    knop.setAttribute("aria-pressed", String(actief));
    knop.addEventListener("click", () => {
      const index = instellingen.types.indexOf(t.id);
      if (index >= 0) {
        instellingen.types.splice(index, 1);
      } else {
        instellingen.types.push(t.id);
      }
      knop.setAttribute("aria-pressed", String(instellingen.types.includes(t.id)));
      if (foutMeldingEl && instellingen.types.length > 0) {
        foutMeldingEl.remove();
        foutMeldingEl = null;
      }
    });
    typeKnoppen.push({ knop, id: t.id });
    typeRij.appendChild(knop);
  }
  typeGroep.appendChild(typeRij);
  kaart.appendChild(typeGroep);

  // --- Alle types knop ---
  const alleKnopRij = document.createElement("div");
  alleKnopRij.className = "keuze-rij";
  alleKnopRij.style.marginBottom = "12px";
  const alleKnop = document.createElement("button");
  alleKnop.type = "button";
  alleKnop.className = "keuze-knop";
  alleKnop.textContent = "Alle vraagtypes";
  alleKnop.setAttribute("aria-label", "Alle vraagtypes kiezen");
  alleKnopRij.appendChild(alleKnop);
  typeGroep.appendChild(alleKnopRij);

  function werkAlleKnopBij() {
    const alleGeselecteerd = ALLE_TYPES.every((t) => instellingen.types.includes(t.id));
    alleKnop.setAttribute("aria-pressed", String(alleGeselecteerd));
  }

  alleKnop.addEventListener("click", () => {
    instellingen.types = ALLE_TYPES.map((t) => t.id);
    for (const item of typeKnoppen) {
      item.knop.setAttribute("aria-pressed", "true");
    }
    werkAlleKnopBij();
  });
  werkAlleKnopBij();

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
    if (instellingen.types.length === 0) {
      if (!foutMeldingEl) {
        foutMeldingEl = document.createElement("p");
        foutMeldingEl.style.cssText = "color:var(--kleur-fout);font-weight:600;margin:8px 0 0;";
        foutMeldingEl.textContent = "Kies eerst minstens één vraagtype om te oefenen.";
        startRij.appendChild(foutMeldingEl);
      }
      return;
    }
    if (foutMeldingEl) { foutMeldingEl.remove(); foutMeldingEl = null; }
    await saveInstellingen("procenten", instellingen);
    opStarten({ ...instellingen, types: [...instellingen.types] });
  });
  startRij.appendChild(startKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}