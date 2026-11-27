// screens/rapport.js
// -----------------------------------------------------------------------------
// Rapport per profiel: welke opgaven gingen niet goed in de afgelopen 14 dagen
// (fout, of pas bij de tweede poging goed). Alleen voor ouders: achter het
// instellingen-slot. Data bewaart de backend 14 dagen; daarna verdwijnt het.
// -----------------------------------------------------------------------------

import { EXERCISES } from "../exercises.js";
import { listProfielen, getRapport } from "../storage.js";

const DAGEN_NL = ["zo", "ma", "di", "wo", "do", "vr", "za"];

function datumTekst(iso) {
  const d = new Date(iso);
  const tijd = d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  return `${DAGEN_NL[d.getDay()]} ${d.getDate()}-${d.getMonth() + 1}, ${tijd}`;
}

function el(tag, klasse, tekst) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst !== undefined) e.textContent = tekst;
  return e;
}

function titelVan(id) {
  return EXERCISES.find((o) => o.id === id)?.titel || id;
}

function bouwItem(f) {
  const item = el("li", "rapport-item" + (f.definitiefFout ? " rapport-item--fout" : " rapport-item--tweede"));
  item.appendChild(el("div", "rapport-item__vraag", f.vraag));
  const regel = el("div", "rapport-item__regel");
  if (f.gegeven && f.definitiefFout) {
    const g = el("span", "rapport-chip rapport-chip--fout", `Kind: ${f.gegeven}`);
    regel.appendChild(g);
  }
  if (f.juist) regel.appendChild(el("span", "rapport-chip rapport-chip--goed", `Juist: ${f.juist}`));
  regel.appendChild(el("span", "rapport-chip rapport-chip--status",
    f.definitiefFout ? "Fout" : "Pas bij 2e poging goed"));
  regel.appendChild(el("span", "rapport-item__datum", datumTekst(f.tijdstip)));
  item.appendChild(regel);
  return item;
}

function bouwRapport(rapport, alleenFout) {
  const houder = document.createElement("div");
  const fouten = rapport.fouten.filter((f) => !alleenFout || f.definitiefFout);

  const totaalFout = rapport.fouten.filter((f) => f.definitiefFout).length;
  const totaalTweede = rapport.fouten.length - totaalFout;
  const totaalGemaakt = Object.values(rapport.gemaakt).reduce((a, b) => a + b, 0);

  const tegels = el("div", "rapport-tegels");
  for (const [w, l] of [
    [totaalGemaakt, "opgaven gemaakt"],
    [totaalFout, "fout"],
    [totaalTweede, "pas bij 2e poging goed"],
  ]) {
    const t = el("div", "stat-tegeltje");
    t.append(el("span", "stat-tegeltje__waarde", String(w)), el("span", "stat-tegeltje__label", l));
    tegels.appendChild(t);
  }
  houder.appendChild(tegels);

  if (fouten.length === 0) {
    const leeg = el("div", "kaart");
    leeg.appendChild(el("p", "leeg-melding",
      rapport.fouten.length === 0
        ? `Geen foute opgaven vastgelegd in de afgelopen ${rapport.dagen} dagen. 🎉 (Het rapport houdt fouten bij vanaf het moment dat deze functie in gebruik is genomen.)`
        : "Geen opgaven die uiteindelijk fout gingen. 🎉"));
    houder.appendChild(leeg);
    return houder;
  }

  const perOefening = new Map();
  for (const f of fouten) {
    if (!perOefening.has(f.exerciseId)) perOefening.set(f.exerciseId, []);
    perOefening.get(f.exerciseId).push(f);
  }
  const groepen = [...perOefening.entries()].sort((a, b) => b[1].length - a[1].length);

  for (const [id, lijst] of groepen) {
    const kaart = el("div", "kaart rapport-kaart");
    const kop = el("h2", null, titelVan(id));
    kaart.appendChild(kop);
    const gemaakt = rapport.gemaakt[id] || 0;
    const nFout = lijst.filter((f) => f.definitiefFout).length;
    kaart.appendChild(el("p", "rapport-samenvatting",
      `${nFout} fout, ${lijst.length - nFout} pas bij 2e poging goed — van ${gemaakt} gemaakte opgaven`));
    const ul = el("ul", "rapport-lijst");
    for (const f of lijst) ul.appendChild(bouwItem(f));
    kaart.appendChild(ul);
    houder.appendChild(kaart);
  }
  return houder;
}

export async function toonRapportScherm(container) {
  container.innerHTML = "";
  // De router kan dit scherm twee keer vlak na elkaar starten: alleen de laatste mag tekenen.
  const token = {};
  container._rapportToken = token;

  const kopBalk = el("div", "kop-balk");
  const titelBlok = el("div", "kop-balk__titel");
  titelBlok.appendChild(el("h1", null, "Rapport: wat ging niet goed?"));
  kopBalk.appendChild(titelBlok);
  const terug = el("a", "knop knop--zacht", "← Terug naar het menu");
  terug.href = "#/";
  kopBalk.appendChild(terug);
  container.appendChild(kopBalk);

  container.appendChild(el("p", "rapport-uitleg",
    "Opgaven die fout gingen of pas bij de tweede poging goed, van de afgelopen 14 dagen. " +
    "Oudere resultaten worden automatisch verwijderd. De gewone statistieken blijven bewaard."));

  const profielen = await listProfielen();
  if (container._rapportToken !== token) return;
  if (profielen.length === 0) {
    const k = el("div", "kaart");
    k.appendChild(el("p", "leeg-melding", "Er zijn nog geen profielen aangemaakt."));
    container.appendChild(k);
    return;
  }

  const keuzeRij = el("div", "acties-rij rapport-keuze");
  const optiesRij = el("div", "acties-rij rapport-opties");
  const inhoud = el("div", "rapport-inhoud");
  container.append(keuzeRij, optiesRij, inhoud);

  let gekozen = profielen[0].id;
  let alleenFout = false;
  let huidigRapport = null;

  const printKnop = el("button", "knop knop--zacht", "🖨️ Afdrukken");
  printKnop.type = "button";
  printKnop.addEventListener("click", () => window.print());
  const filterKnop = el("button", "knop knop--zacht", "Alleen echt foute tonen");
  filterKnop.type = "button";
  filterKnop.setAttribute("aria-pressed", "false");
  filterKnop.addEventListener("click", () => {
    alleenFout = !alleenFout;
    filterKnop.setAttribute("aria-pressed", String(alleenFout));
    filterKnop.classList.toggle("rapport-knop--aan", alleenFout);
    teken();
  });
  optiesRij.append(filterKnop, printKnop);

  function teken() {
    inhoud.innerHTML = "";
    if (!huidigRapport) {
      inhoud.appendChild(el("p", "leeg-melding", "Het rapport kon niet worden geladen."));
      return;
    }
    inhoud.appendChild(bouwRapport(huidigRapport, alleenFout));
  }

  async function kiesProfiel(id) {
    gekozen = id;
    for (const b of keuzeRij.querySelectorAll("button")) {
      const aan = Number(b.dataset.id) === id;
      b.classList.toggle("rapport-knop--aan", aan);
      b.setAttribute("aria-pressed", String(aan));
    }
    inhoud.innerHTML = "";
    inhoud.appendChild(el("p", null, "Laden…"));
    huidigRapport = await getRapport(id);
    if (gekozen === id) teken();
  }

  for (const p of profielen) {
    const b = el("button", "knop knop--zacht");
    if (p.avatar && /[./]/.test(p.avatar)) {
      const plaatje = document.createElement("img");
      plaatje.src = p.avatar;
      plaatje.alt = "";
      plaatje.className = "rapport-avatar";
      b.append(plaatje, document.createTextNode(` ${p.naam}`));
    } else {
      b.textContent = `${p.avatar || ""} ${p.naam}`.trim();
    }
    b.type = "button";
    b.dataset.id = String(p.id);
    b.addEventListener("click", () => kiesProfiel(p.id));
    keuzeRij.appendChild(b);
  }
  await kiesProfiel(gekozen);
}
