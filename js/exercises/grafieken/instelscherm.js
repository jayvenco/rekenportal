// exercises/grafieken/instelscherm.js
// Startscherm: niveau/categorie/aantal kiezen, fout beantwoorde opgaven
// opnieuw oefenen en het voortgangsdashboard bekijken.

import { getInstellingen, saveInstellingen } from "../../storage.js";
import { laadOpgaven } from "./opgaven.js";
import { leesVoortgang, berekenSamenvatting, wisVoortgang } from "./voortgang.js";
import { voegGrafiekStijlToe } from "./grafiekWeergave.js";

const STANDAARD = { niveau: "alle", categorie: "alle", aantal: 10 };

function keuzeRij(label, opties, huidige, opKies) {
  const groep = document.createElement("div");
  groep.className = "instel-groep";
  const l = document.createElement("span");
  l.className = "instel-groep__label";
  l.textContent = label;
  groep.appendChild(l);
  const rij = document.createElement("div");
  rij.className = "keuze-rij";
  const knoppen = [];
  for (const o of opties) {
    const k = document.createElement("button");
    k.type = "button";
    k.className = "keuze-knop";
    k.textContent = o.label;
    k.setAttribute("aria-pressed", String(String(o.waarde) === String(huidige)));
    k.addEventListener("click", () => {
      opKies(o.waarde);
      knoppen.forEach((x) => x.k.setAttribute("aria-pressed", String(String(x.waarde) === String(o.waarde))));
    });
    knoppen.push({ k, waarde: o.waarde });
    rij.appendChild(k);
  }
  groep.appendChild(rij);
  return groep;
}

function balk(label, e) {
  const rij = document.createElement("div");
  rij.className = "gr-dash-rij";
  const naam = document.createElement("span");
  naam.textContent = label;
  const b = document.createElement("div");
  b.className = "gr-balk";
  const v = document.createElement("span");
  v.style.width = `${e.totaal ? (e.goed / e.totaal) * 100 : 0}%`;
  b.appendChild(v);
  const tel = document.createElement("span");
  tel.textContent = `${e.goed}/${e.totaal}`;
  rij.append(naam, b, tel);
  return rij;
}

export async function bouwInstelscherm(container, opStarten) {
  voegGrafiekStijlToe();
  const opgeslagen = (await getInstellingen("grafieken")) || {};
  const inst = { ...STANDAARD, ...opgeslagen };
  container.innerHTML = "";

  let data;
  try {
    data = await laadOpgaven();
  } catch (fout) {
    container.textContent = "De opgaven konden niet geladen worden. Probeer de pagina te verversen.";
    console.error(fout);
    return;
  }
  const voortgang = leesVoortgang();
  const sam = berekenSamenvatting(data.opgaven, voortgang);

  const kaart = document.createElement("div");
  kaart.className = "kaart";
  const titel = document.createElement("h2");
  titel.textContent = "Grafieken lezen 📊";
  const uitleg = document.createElement("p");
  uitleg.textContent = "Lees grafieken, diagrammen en tabellen, vergelijk de gegevens en reken ermee. 50 opgaven in 5 niveaus.";
  kaart.append(titel, uitleg);

  kaart.appendChild(keuzeRij("Niveau",
    [{ label: "Alle", waarde: "alle" }, ...Object.entries(data.niveaus).map(([n, naam]) => ({ label: `${n}. ${naam}`, waarde: n }))],
    inst.niveau, (w) => { inst.niveau = w; }));
  kaart.appendChild(keuzeRij("Categorie",
    [{ label: "Alle", waarde: "alle" }, ...data.categorieen.map((c) => ({ label: c, waarde: c }))],
    inst.categorie, (w) => { inst.categorie = w; }));
  kaart.appendChild(keuzeRij("Hoeveel opgaven?",
    [5, 10, 20, 50].map((n) => ({ label: n === 50 ? "Alle 50" : String(n), waarde: n })),
    inst.aantal, (w) => { inst.aantal = Number(w); }));

  const acties = document.createElement("div");
  acties.className = "acties-rij";
  const start = document.createElement("button");
  start.type = "button";
  start.className = "knop knop--primair";
  start.textContent = "Start met oefenen";
  start.addEventListener("click", async () => {
    await saveInstellingen("grafieken", inst);
    opStarten({ ...inst });
  });
  acties.appendChild(start);

  if (sam.fout.length) {
    const opnieuw = document.createElement("button");
    opnieuw.type = "button";
    opnieuw.className = "knop knop--zacht";
    opnieuw.textContent = `Fout beantwoorde opgaven opnieuw (${sam.fout.length})`;
    opnieuw.addEventListener("click", () => opStarten({ ...inst, ids: sam.fout, aantal: sam.fout.length }));
    acties.appendChild(opnieuw);
  }
  kaart.appendChild(acties);
  container.appendChild(kaart);

  // --- Dashboard ---
  const dash = document.createElement("div");
  dash.className = "kaart";
  const dt = document.createElement("h2");
  dt.textContent = "Mijn voortgang";
  dash.appendChild(dt);
  const regel = document.createElement("p");
  regel.innerHTML = `Gemaakt: <strong>${sam.gemaakt}</strong> van ${sam.totaal} &nbsp; Goed: <strong>${sam.goed}</strong> &nbsp; Percentage goed: <strong>${sam.percentage}%</strong>`;
  dash.appendChild(regel);
  const h3a = document.createElement("h3");
  h3a.textContent = "Per categorie";
  dash.appendChild(h3a);
  for (const [naam, e] of sam.perCategorie) dash.appendChild(balk(naam, e));
  const h3b = document.createElement("h3");
  h3b.textContent = "Per niveau";
  dash.appendChild(h3b);
  for (const [n, e] of sam.perNiveau) dash.appendChild(balk(`Niveau ${n}`, e));
  const h3c = document.createElement("h3");
  h3c.textContent = "Fout beantwoord";
  dash.appendChild(h3c);
  const foutLijst = document.createElement("p");
  foutLijst.textContent = sam.fout.length
    ? sam.fout.map((id) => data.opgaven.find((o) => o.id === id).titel).join(" · ")
    : "Nog geen fout beantwoorde opgaven.";
  dash.appendChild(foutLijst);
  if (sam.gemaakt) {
    const wis = document.createElement("button");
    wis.type = "button";
    wis.className = "knop knop--zacht";
    wis.textContent = "Voortgang wissen";
    wis.addEventListener("click", () => {
      if (confirm("Weet je zeker dat je je voortgang voor Grafieken lezen wilt wissen?")) {
        wisVoortgang();
        bouwInstelscherm(container, opStarten);
      }
    });
    dash.appendChild(wis);
  }
  container.appendChild(dash);
}
