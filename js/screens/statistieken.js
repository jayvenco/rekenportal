// screens/statistieken.js
// -----------------------------------------------------------------------------
// Statistiekenscherm: totalen, per-oefening blokken, grafiek van 14 dagen,
// streaks, gemiddelde tijd, uitsplitsing per instelling, en een wis-knop.
// Alle data komt nu via de backend-API (voor het actieve profiel).
// -----------------------------------------------------------------------------

import { EXERCISES } from "../exercises.js";
import {
  getStatistiekOverzicht,
  getDagelijkseStatistieken,
  getUitsplitsingPerVeld,
  wisAlleStatistieken,
} from "../storage.js";
import { bouwDagelijkseGrafiek } from "../utils/grafiekSvg.js";

function maakStatTegeltje(waarde, label) {
  const tegel = document.createElement("div");
  tegel.className = "stat-tegeltje";
  const waardeEl = document.createElement("span");
  waardeEl.className = "stat-tegeltje__waarde";
  waardeEl.textContent = waarde;
  const labelEl = document.createElement("span");
  labelEl.className = "stat-tegeltje__label";
  labelEl.textContent = label;
  tegel.append(waardeEl, labelEl);
  return tegel;
}

function formatTijd(ms) {
  if (ms === 0) return "–";
  const seconden = ms / 1000;
  return `${seconden.toFixed(1)}s`;
}

/** Bouwt een SVG-donutdiagram met % goed (groen) en % fout (grijs). */
function bouwTaartDiagram(percentageGoed, percentageFout) {
  const wrapper = document.createElement("div");
  wrapper.style.textAlign = "center";
  wrapper.style.flexShrink = "0";

  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 120 120");
  svg.setAttribute("width", "120");
  svg.setAttribute("height", "120");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Taartdiagram: ${percentageGoed}% goed, ${percentageFout}% fout`);

  const omtrek = 2 * Math.PI * 42;
  const offsetGoed = omtrek * (1 - percentageGoed / 100);

  // Achtergrondcirkel (grijs = fout)
  const bg = document.createElementNS(NS, "circle");
  bg.setAttribute("cx", "60"); bg.setAttribute("cy", "60"); bg.setAttribute("r", "42");
  bg.setAttribute("fill", "none"); bg.setAttribute("stroke", "#e2e8f0");
  bg.setAttribute("stroke-width", "16");

  // Voorgrondcirkel (groen = goed)
  const fg = document.createElementNS(NS, "circle");
  fg.setAttribute("cx", "60"); fg.setAttribute("cy", "60"); fg.setAttribute("r", "42");
  fg.setAttribute("fill", "none"); fg.setAttribute("stroke", "#38b26a");
  fg.setAttribute("stroke-width", "16");
  fg.setAttribute("stroke-dasharray", String(omtrek));
  fg.setAttribute("stroke-dashoffset", String(offsetGoed));
  fg.setAttribute("stroke-linecap", "round");
  fg.setAttribute("transform", "rotate(-90 60 60)");
  fg.style.transition = "stroke-dashoffset 0.6s ease";

  // Centrale tekst
  const text = document.createElementNS(NS, "text");
  text.setAttribute("x", "60"); text.setAttribute("y", "55");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", "22"); text.setAttribute("font-weight", "800");
  text.setAttribute("fill", "#1f2937");
  text.textContent = `${percentageGoed}%`;

  const label = document.createElementNS(NS, "text");
  label.setAttribute("x", "60"); label.setAttribute("y", "75");
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("font-size", "12"); label.setAttribute("font-weight", "600");
  label.setAttribute("fill", "#5b6472");
  label.textContent = "goed";

  svg.append(bg, fg, text, label);
  wrapper.appendChild(svg);
  return wrapper;
}

/** Bouwt het blok met basisstatistieken (totaal, goed, %, streaks, tijd). */
function bouwBasisBlok(overzicht) {
  const grid = document.createElement("div");
  grid.className = "stat-grid";
  grid.appendChild(maakStatTegeltje(overzicht.totaal, "opgaven gemaakt"));
  grid.appendChild(maakStatTegeltje(overzicht.goed, "goed"));
  grid.appendChild(maakStatTegeltje(`${overzicht.percentage}%`, "percentage goed"));
  grid.appendChild(maakStatTegeltje(overzicht.besteStreak, "beste reeks"));
  grid.appendChild(maakStatTegeltje(overzicht.huidigeStreak, "huidige reeks"));
  grid.appendChild(maakStatTegeltje(formatTijd(overzicht.gemiddeldeTijdMs), "gem. tijd per opgave"));
  return grid;
}

/** Bouwt de uitsplitsing per instelling (bv. per stapgrootte) als balkjes. */
async function bouwUitsplitsingBlok(exerciseId, veldNaam, veldLabel) {
  const rijen = await getUitsplitsingPerVeld(exerciseId, veldNaam);
  const blok = document.createElement("div");
  if (rijen.length === 0) return blok;

  const kop = document.createElement("h3");
  kop.style.fontSize = "17px";
  kop.style.marginTop = "20px";
  kop.textContent = veldLabel;
  blok.appendChild(kop);

  for (const rij of rijen) {
    const rijEl = document.createElement("div");
    rijEl.className = "uitsplitsing-rij";

    const labelEl = document.createElement("span");
    labelEl.className = "uitsplitsing-label";
    labelEl.textContent = rij.waarde;

    const balkAchtergrond = document.createElement("div");
    balkAchtergrond.className = "uitsplitsing-balk-achtergrond";
    const balk = document.createElement("div");
    balk.className = "uitsplitsing-balk";
    balk.style.width = `${rij.percentage}%`;
    balkAchtergrond.appendChild(balk);

    const percentageEl = document.createElement("span");
    percentageEl.className = "uitsplitsing-percentage";
    percentageEl.textContent = `${rij.percentage}%`;

    rijEl.append(labelEl, balkAchtergrond, percentageEl);
    blok.appendChild(rijEl);
  }
  return blok;
}

/** Tekent het volledige statistiekenscherm. */
export async function toonStatistiekenScherm(container) {
  container.innerHTML = "";

  const koppenRij = document.createElement("div");
  koppenRij.className = "kop-balk";
  const titelBlok = document.createElement("div");
  titelBlok.className = "kop-balk__titel";
  const titel = document.createElement("h1");
  titel.textContent = "Statistieken";
  titelBlok.appendChild(titel);
  koppenRij.appendChild(titelBlok);

  const terugLink = document.createElement("a");
  terugLink.className = "knop knop--zacht";
  terugLink.href = "#/";
  terugLink.textContent = "← Terug naar het menu";
  koppenRij.appendChild(terugLink);
  container.appendChild(koppenRij);

  const algemeenOverzicht = await getStatistiekOverzicht();

  if (algemeenOverzicht.totaal === 0) {
    const legeKaart = document.createElement("div");
    legeKaart.className = "kaart";
    const legeMelding = document.createElement("p");
    legeMelding.className = "leeg-melding";
    legeMelding.textContent = "Er zijn nog geen opgaven gemaakt. Ga naar het menu en start een oefening!";
    legeKaart.appendChild(legeMelding);
    container.appendChild(legeKaart);
    return;
  }

  // --- Totaaloverzicht ---
  const totaalKaart = document.createElement("div");
  totaalKaart.className = "kaart";
  const totaalTitel = document.createElement("h2");
  totaalTitel.textContent = "Totaal";
  totaalKaart.appendChild(totaalTitel);
  totaalKaart.appendChild(bouwBasisBlok(algemeenOverzicht));
  container.appendChild(totaalKaart);

  // --- Grafiek laatste 14 dagen ---
  const grafiekKaart = document.createElement("div");
  grafiekKaart.className = "kaart";
  const grafiekTitel = document.createElement("h2");
  grafiekTitel.textContent = "Laatste 14 dagen";
  grafiekKaart.appendChild(grafiekTitel);
  const grafiekHouder = document.createElement("div");
  grafiekHouder.className = "grafiek-houder";
  const dagelijkseStatistieken = await getDagelijkseStatistieken(14);
  grafiekHouder.appendChild(bouwDagelijkseGrafiek(dagelijkseStatistieken));
  grafiekKaart.appendChild(grafiekHouder);
  container.appendChild(grafiekKaart);

  // --- Per oefening met taartdiagram ---
  for (const oefening of EXERCISES) {
    const overzicht = await getStatistiekOverzicht(oefening.id);
    if (overzicht.totaal === 0) continue;

    const kaart = document.createElement("div");
    kaart.className = "kaart";
    const kopEnDiagram = document.createElement("div");
    kopEnDiagram.style.display = "flex";
    kopEnDiagram.style.alignItems = "center";
    kopEnDiagram.style.gap = "20px";
    kopEnDiagram.style.flexWrap = "wrap";

    const kopBlok = document.createElement("div");
    kopBlok.style.flex = "1";
    const kop = document.createElement("h2");
    kop.textContent = oefening.titel;
    kopBlok.appendChild(kop);
    kopBlok.appendChild(bouwBasisBlok(overzicht));
    kopEnDiagram.appendChild(kopBlok);

    // Taartdiagram
    const pct = overzicht.percentage;
    const foutPct = 100 - pct;
    kopEnDiagram.appendChild(bouwTaartDiagram(pct, foutPct));

    kaart.appendChild(kopEnDiagram);

    // Uitsplitsing per instelling — vooral zinvol voor de getallenlijn (stap, opgaveType).
    kaart.appendChild(await bouwUitsplitsingBlok(oefening.id, "stap", "Per stapgrootte"));
    kaart.appendChild(await bouwUitsplitsingBlok(oefening.id, "opgaveType", "Per opgavetype"));

    container.appendChild(kaart);
  }

  // --- Wis-knop ---
  const wisKaart = document.createElement("div");
  wisKaart.className = "kaart";
  const wisKop = document.createElement("h2");
  wisKop.textContent = "Statistieken wissen";
  wisKaart.appendChild(wisKop);
  const wisTekst = document.createElement("p");
  wisTekst.textContent = "Hiermee verwijder je alle opgeslagen resultaten. Dit kan niet ongedaan worden gemaakt.";
  wisKaart.appendChild(wisTekst);

  const wisKnop = document.createElement("button");
  wisKnop.type = "button";
  wisKnop.className = "knop knop--gevaar";
  wisKnop.textContent = "Wis alle statistieken";
  wisKnop.addEventListener("click", async () => {
    const bevestigd = window.confirm(
      "Weet je zeker dat je alle statistieken wilt wissen? Dit kan niet ongedaan worden gemaakt."
    );
    if (bevestigd) {
      await wisAlleStatistieken();
      await toonStatistiekenScherm(container);
    }
  });
  wisKaart.appendChild(wisKnop);
  container.appendChild(wisKaart);
}
