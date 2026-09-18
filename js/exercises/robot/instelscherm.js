// exercises/robot/instelscherm.js
// -----------------------------------------------------------------------------
// Instelscherm voor de Robot Programmeer Spel-module.
// Kies level, modus (pijltjes / code), en moeilijkheid.
// Slaat keuzes op via storage.js.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const STANDAARD_INSTELLINGEN = {
  level: 1,
  modus: "arrows",
  moeilijkheid: "makkelijk",
  groep: 4,
};

const NIVEAUS_GROEP4 = [1, 2, 3, 4, 5, 6];
const NIVEAUS_GROEP8 = [7, 8, 9, 10, 11, 12];

const MODUS_OPTIES_GROEP4 = [{ id: "arrows", label: "Pijltjes" }];
const MODUS_OPTIES_GROEP8 = [
  { id: "arrows", label: "Pijltjes" },
  { id: "code", label: "Code" },
];

const MOEILIJKHEID_OPTIES = [
  { id: "makkelijk", label: "★ Makkelijk" },
  { id: "uitdagend", label: "★★ Uitdagend" },
];

/**
 * Toont het instelscherm voor het Robot Programmeer Spel.
 * @param {HTMLElement} container - waar het scherm in getekend wordt.
 * @param {Object} opgeslagen - eerder opgeslagen instellingen (of leeg object).
 * @param {Function} startOefening - callback(opgehaaldeInstellingen) als het kind op "START" klikt.
 */
export async function toonInstellingenScherm(container, opgeslagen, startOefening) {
  const saved = (await getInstellingen("robot")) || {};
  const instellingen = { ...STANDAARD_INSTELLINGEN, ...saved };

  const groep = instellingen.groep || 4;
  const niveauLijst = groep === 8 ? NIVEAUS_GROEP8 : NIVEAUS_GROEP4;
  const modusOpties = groep === 8 ? MODUS_OPTIES_GROEP8 : MODUS_OPTIES_GROEP4;

  // Forceer geldig niveau
  if (!niveauLijst.includes(instellingen.level)) {
    instellingen.level = niveauLijst[0];
  }

  container.innerHTML = "";

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  // --- Titel ---
  const titel = document.createElement("h2");
  titel.textContent = "🤖 Robot Programmeer Spel";
  titel.style.textAlign = "center";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent =
    "Stuur de robot naar het doel! Kies een level, een besturingsmodus en of je het makkelijk of uitdagend wilt.";
  kaart.appendChild(uitleg);

  // --- Niveaukeuze ---
  const niveauGroep = document.createElement("div");
  niveauGroep.className = "instel-groep";
  const niveauLabel = document.createElement("span");
  niveauLabel.className = "instel-groep__label";
  niveauLabel.textContent = "Kies een level";
  niveauGroep.appendChild(niveauLabel);

  const niveauRij = document.createElement("div");
  niveauRij.className = "keuze-rij";
  niveauRij.setAttribute("role", "radiogroup");
  niveauRij.setAttribute("aria-label", "Level kiezen");

  const niveauKnoppen = [];
  for (const niveau of niveauLijst) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = `Level ${niveau}`;
    knop.setAttribute("role", "radio");
    knop.setAttribute("aria-checked", String(instellingen.level === niveau));
    knop.setAttribute("aria-pressed", String(instellingen.level === niveau));
    knop.addEventListener("click", () => {
      instellingen.level = niveau;
      for (const item of niveauKnoppen) {
        const actief = item.niveau === niveau;
        item.knop.setAttribute("aria-checked", String(actief));
        item.knop.setAttribute("aria-pressed", String(actief));
      }
    });
    niveauKnoppen.push({ knop, niveau });
    niveauRij.appendChild(knop);
  }
  niveauGroep.appendChild(niveauRij);
  kaart.appendChild(niveauGroep);

  // --- Moduskeuze (pijltjes / code) ---
  if (modusOpties.length > 1) {
    const modusGroep = document.createElement("div");
    modusGroep.className = "instel-groep";
    const modusLabel = document.createElement("span");
    modusLabel.className = "instel-groep__label";
    modusLabel.textContent = "Hoe wil je de robot besturen?";
    modusGroep.appendChild(modusLabel);

    const modusRij = document.createElement("div");
    modusRij.className = "keuze-rij";
    modusRij.setAttribute("role", "radiogroup");
    modusRij.setAttribute("aria-label", "Besturingsmodus");

    const modusKnoppen = [];
    for (const optie of modusOpties) {
      const knop = document.createElement("button");
      knop.type = "button";
      knop.className = "keuze-knop";
      knop.textContent = optie.label;
      knop.setAttribute("role", "radio");
      const actief = instellingen.modus === optie.id;
      knop.setAttribute("aria-checked", String(actief));
      knop.setAttribute("aria-pressed", String(actief));
      knop.addEventListener("click", () => {
        instellingen.modus = optie.id;
        for (const item of modusKnoppen) {
          const isActief = item.id === optie.id;
          item.knop.setAttribute("aria-checked", String(isActief));
          item.knop.setAttribute("aria-pressed", String(isActief));
        }
      });
      modusKnoppen.push({ knop, id: optie.id });
      modusRij.appendChild(knop);
    }
    modusGroep.appendChild(modusRij);
    kaart.appendChild(modusGroep);
  }

  // --- Moeilijkheid (alleen voor groep 8) ---
  if (groep === 8) {
    const moeiGroep = document.createElement("div");
    moeiGroep.className = "instel-groep";
    const moeiLabel = document.createElement("span");
    moeiLabel.className = "instel-groep__label";
    moeiLabel.textContent = "Moeilijkheid";
    moeiGroep.appendChild(moeiLabel);

    const moeiRij = document.createElement("div");
    moeiRij.className = "keuze-rij";
    moeiRij.setAttribute("role", "radiogroup");
    moeiRij.setAttribute("aria-label", "Moeilijkheid kiezen");

    const moeiKnoppen = [];
    for (const optie of MOEILIJKHEID_OPTIES) {
      const knop = document.createElement("button");
      knop.type = "button";
      knop.className = "keuze-knop";
      knop.textContent = optie.label;
      knop.setAttribute("role", "radio");
      const actief = instellingen.moeilijkheid === optie.id;
      knop.setAttribute("aria-checked", String(actief));
      knop.setAttribute("aria-pressed", String(actief));
      knop.addEventListener("click", () => {
        instellingen.moeilijkheid = optie.id;
        for (const item of moeiKnoppen) {
          const isActief = item.id === optie.id;
          item.knop.setAttribute("aria-checked", String(isActief));
          item.knop.setAttribute("aria-pressed", String(isActief));
        }
      });
      moeiKnoppen.push({ knop, id: optie.id });
      moeiRij.appendChild(knop);
    }
    moeiGroep.appendChild(moeiRij);
    kaart.appendChild(moeiGroep);
  }

  // --- START-knop ---
  const startRij = document.createElement("div");
  startRij.className = "acties-rij";

  const startKnop = document.createElement("button");
  startKnop.type = "button";
  startKnop.className = "knop knop--primair";
  startKnop.textContent = "START ▶";
  startKnop.style.fontSize = "1.3em";
  startKnop.style.padding = "14px 48px";
  startKnop.addEventListener("click", async () => {
    await saveInstellingen("robot", instellingen);
    startOefening({ ...instellingen });
  });
  startRij.appendChild(startKnop);
  kaart.appendChild(startRij);

  container.appendChild(kaart);
}