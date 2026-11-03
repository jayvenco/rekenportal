// exercises/geld/instelscherm.js
// Instelscherm "Rekenen met geld": soort opgave, hoeveel geld, aantal opgaven.

import { getInstellingen, saveInstellingen } from "../../storage.js";
import { MAX_OPTIES } from "./opgaven.js";

const STANDAARD = { opgaveType: "alle", maxEuro: 50, aantalOpgaven: 10 };

function keuzeGroep(label, opties, huidige, opKies) {
  const groep = document.createElement("div");
  groep.className = "instel-groep";
  const l = document.createElement("span");
  l.className = "instel-groep__label";
  l.textContent = label;
  const rij = document.createElement("div");
  rij.className = "keuze-rij";
  const knoppen = [];
  for (const o of opties) {
    const k = document.createElement("button");
    k.type = "button";
    k.className = "keuze-knop";
    k.textContent = o.label;
    k.setAttribute("aria-pressed", String(o.waarde === huidige));
    k.addEventListener("click", () => {
      opKies(o.waarde);
      knoppen.forEach((x) => x.k.setAttribute("aria-pressed", String(x.w === o.waarde)));
    });
    knoppen.push({ k, w: o.waarde });
    rij.appendChild(k);
  }
  groep.append(l, rij);
  return groep;
}

export async function bouwInstelscherm(container, opStarten) {
  const inst = { ...STANDAARD, ...((await getInstellingen("geld")) || {}) };
  container.innerHTML = "";
  const kaart = document.createElement("div");
  kaart.className = "kaart";
  const titel = document.createElement("h2");
  titel.textContent = "Rekenen met geld 💶";
  const uitleg = document.createElement("p");
  uitleg.textContent = "Tel hoeveel geld je ziet, of kies het juiste geld om een bedrag te betalen. Met biljetten van 5, 10, 20, 50 en 100 euro en munten van 50 cent, 1 en 2 euro.";
  kaart.append(titel, uitleg);

  kaart.appendChild(keuzeGroep("Wat wil je oefenen?", [
    { label: "Alles door elkaar", waarde: "alle" },
    { label: "Tel het geld", waarde: "tel" },
    { label: "Betaal het bedrag", waarde: "betaal" },
  ], inst.opgaveType, (w) => { inst.opgaveType = w; }));
  kaart.appendChild(keuzeGroep("Hoeveel geld maximaal?",
    MAX_OPTIES.map((m) => ({ label: `€ ${m}`, waarde: m })), inst.maxEuro, (w) => { inst.maxEuro = w; }));
  kaart.appendChild(keuzeGroep("Hoeveel opgaven?",
    [5, 10, 20].map((n) => ({ label: String(n), waarde: n })), inst.aantalOpgaven, (w) => { inst.aantalOpgaven = w; }));

  const acties = document.createElement("div");
  acties.className = "acties-rij";
  const start = document.createElement("button");
  start.type = "button";
  start.className = "knop knop--primair";
  start.textContent = "Start de oefening";
  start.addEventListener("click", async () => {
    await saveInstellingen("geld", inst);
    opStarten({ ...inst });
  });
  acties.appendChild(start);
  kaart.appendChild(acties);
  container.appendChild(kaart);
}
