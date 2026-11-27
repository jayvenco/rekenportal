// exercises/schaal/instelscherm.js
// -----------------------------------------------------------------------------
// Instelscherm van "Rekenen op schaal": soort opgaven, niveau en aantal.
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const STANDAARD = { soort: "mix", niveau: 2, aantalOpgaven: 10 };

const SOORTEN = [
  { id: "mix", label: "🔀 Mix", titel: "Door elkaar: plattegronden, kaarten, modellen en sommen" },
  { id: "plattegrond", label: "📐 Plattegronden", titel: "Muren van een woning op een plattegrond" },
  { id: "kaart", label: "🗺️ Kaarten", titel: "Afstanden op een stadskaart" },
  { id: "model", label: "📏 Modellen en liniaal", titel: "Schaalmodellen opmeten met een liniaal" },
  { id: "reken", label: "🧮 Alleen rekenen", titel: "Sommen over schaal zonder afbeelding" },
];

const NIVEAUS = [
  { id: 1, label: "🌱 Makkelijk", titel: "Hele centimeters, schaal 1 : 50 en 1 : 100, alleen van tekening naar echt" },
  { id: 2, label: "🌿 Gemiddeld", titel: "Ook halve centimeters en van echt naar tekening" },
  { id: 3, label: "🌳 Uitdagend", titel: "Ook de schaal zelf bepalen, grotere schalen" },
];

const AANTAL = [5, 10, 20];

function keuzeGroep(kaart, label, opties, huidig, opKies, aria) {
  const groep = document.createElement("div");
  groep.className = "instel-groep";
  const l = document.createElement("span");
  l.className = "instel-groep__label";
  l.textContent = label;
  groep.appendChild(l);
  const rij = document.createElement("div");
  rij.className = "keuze-rij";
  rij.setAttribute("role", "radiogroup");
  rij.setAttribute("aria-label", aria);
  const knoppen = [];
  for (const o of opties) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop";
    knop.textContent = o.label;
    if (o.titel) knop.title = o.titel;
    const zetActief = (actief) => {
      knop.setAttribute("aria-checked", String(actief));
      knop.setAttribute("aria-pressed", String(actief));
    };
    knop.setAttribute("role", "radio");
    zetActief(o.id === huidig);
    knop.addEventListener("click", () => {
      opKies(o.id);
      knoppen.forEach((k) => k.zet(k.id === o.id));
    });
    knoppen.push({ id: o.id, zet: zetActief });
    rij.appendChild(knop);
  }
  groep.appendChild(rij);
  kaart.appendChild(groep);
}

/**
 * @param {HTMLElement} container
 * @param {Function} opStarten - callback(instellingen)
 * @param {Function} opUitleg - callback bij klik op de uitleg-knop
 */
export async function bouwInstelscherm(container, opStarten, opUitleg) {
  const opgeslagen = (await getInstellingen("schaal")) || {};
  const instellingen = { ...STANDAARD, ...opgeslagen };
  if (!SOORTEN.some((s) => s.id === instellingen.soort)) instellingen.soort = STANDAARD.soort;
  if (![1, 2, 3].includes(instellingen.niveau)) instellingen.niveau = STANDAARD.niveau;

  container.innerHTML = "";
  const kaart = document.createElement("div");
  kaart.className = "kaart";
  const titel = document.createElement("h2");
  titel.textContent = "Rekenen op schaal";
  kaart.appendChild(titel);
  const uitleg = document.createElement("p");
  uitleg.textContent =
    "Een schaal vertelt hoeveel kleiner een tekening, kaart of model is dan het echte ding. " +
    "Reken afstanden uit op plattegronden en kaarten, en lees schaalmodellen af met een liniaal.";
  kaart.appendChild(uitleg);

  keuzeGroep(kaart, "Wat wil je oefenen?", SOORTEN, instellingen.soort, (id) => { instellingen.soort = id; }, "Soort opgaven kiezen");
  keuzeGroep(kaart, "Hoe moeilijk?", NIVEAUS, instellingen.niveau, (id) => { instellingen.niveau = id; }, "Niveau kiezen");
  keuzeGroep(kaart, "Hoeveel opgaven wil je maken?", AANTAL.map((n) => ({ id: n, label: String(n), titel: `${n} opgaven` })),
    instellingen.aantalOpgaven, (id) => { instellingen.aantalOpgaven = id; }, "Aantal opgaven kiezen");

  const startRij = document.createElement("div");
  startRij.className = "acties-rij";
  const start = document.createElement("button");
  start.type = "button";
  start.className = "knop knop--primair";
  start.textContent = "Start de oefening";
  start.addEventListener("click", async () => {
    await saveInstellingen("schaal", instellingen);
    opStarten({ ...instellingen });
  });
  const uitlegKnop = document.createElement("button");
  uitlegKnop.type = "button";
  uitlegKnop.className = "knop knop--zacht";
  uitlegKnop.textContent = "📖 Uitleg: hoe werkt schaal?";
  uitlegKnop.addEventListener("click", opUitleg);
  startRij.append(start, uitlegKnop);
  kaart.appendChild(startRij);
  container.appendChild(kaart);
}
