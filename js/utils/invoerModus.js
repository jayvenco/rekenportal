// utils/invoerModus.js
// -----------------------------------------------------------------------------
// Gedeelde invoermodi voor alle oefeningen.
// Twee modi: cijfer-invoer (uitdagend) en meerkeuze (makkelijk).
// -----------------------------------------------------------------------------

import { randomGeheelGetal } from "./willekeurig.js";

// -----------------------------------------------------------------------------
// Modus 1: Cijfer-invoer (uitdagend)
// Toont cijferpad + invoerscherm + bevestigknop.
// -----------------------------------------------------------------------------

/**
 * Bouwt een cijferinvoer met numeriek toetsenbord.
 * @param {HTMLElement} invoerVlak - container voor de invoer
 * @param {Function} opGeantwoord - callback(antwoord: number)
 * @param {() => boolean} getBezigMetFeedback - functie die true geeft als feedback actief is
 * @param {number} [maxCijfers=3] - maximaal aantal cijfers
 * @returns {Function} opruimfunctie (keydown listener verwijderen)
 */
export function bouwCijferInvoer(invoerVlak, opGeantwoord, getBezigMetFeedback, maxCijfers = 3) {
  invoerVlak.innerHTML = "";
  let huidigeWaarde = "";

  const scherm = document.createElement("div");
  scherm.className = "antwoord-scherm";
  scherm.setAttribute("aria-label", "Jouw antwoord");
  invoerVlak.appendChild(scherm);

  const pad = document.createElement("div");
  pad.className = "cijfer-pad";

  function toonWaarde() {
    scherm.textContent = huidigeWaarde;
  }

  function voegCijferToe(c) {
    if (huidigeWaarde.length < maxCijfers) {
      huidigeWaarde += String(c);
      toonWaarde();
    }
  }

  for (const cijfer of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "cijfer-toets";
    knop.textContent = String(cijfer);
    knop.setAttribute("aria-label", `Cijfer ${cijfer}`);
    knop.addEventListener("click", () => voegCijferToe(cijfer));
    pad.appendChild(knop);
  }

  const wisKnop = document.createElement("button");
  wisKnop.type = "button";
  wisKnop.className = "cijfer-toets";
  wisKnop.textContent = "⌫";
  wisKnop.setAttribute("aria-label", "Verwijder laatste cijfer");
  wisKnop.addEventListener("click", () => {
    huidigeWaarde = huidigeWaarde.slice(0, -1);
    toonWaarde();
  });
  pad.appendChild(wisKnop);

  const nulKnop = document.createElement("button");
  nulKnop.type = "button";
  nulKnop.className = "cijfer-toets";
  nulKnop.textContent = "0";
  nulKnop.setAttribute("aria-label", "Cijfer 0");
  nulKnop.addEventListener("click", () => voegCijferToe(0));
  pad.appendChild(nulKnop);

  const bevestigKnop = document.createElement("button");
  bevestigKnop.type = "button";
  bevestigKnop.className = "cijfer-toets";
  bevestigKnop.style.background = "#38b26a";
  bevestigKnop.style.color = "#ffffff";
  bevestigKnop.textContent = "✓";
  bevestigKnop.setAttribute("aria-label", "Antwoord bevestigen");
  bevestigKnop.addEventListener("click", () => {
    if (huidigeWaarde === "") return;
    opGeantwoord(Number(huidigeWaarde));
  });
  pad.appendChild(bevestigKnop);

  invoerVlak.appendChild(pad);

  function toetsHandler(gebeurtenis) {
    if (getBezigMetFeedback()) return;
    if (/^[0-9]$/.test(gebeurtenis.key)) {
      voegCijferToe(gebeurtenis.key);
    } else if (gebeurtenis.key === "Backspace") {
      huidigeWaarde = huidigeWaarde.slice(0, -1);
      toonWaarde();
    } else if (gebeurtenis.key === "Enter" && huidigeWaarde !== "") {
      opGeantwoord(Number(huidigeWaarde));
    }
  }
  document.addEventListener("keydown", toetsHandler);
  invoerVlak.dataset.actief = "true";
  return () => document.removeEventListener("keydown", toetsHandler);
}

// -----------------------------------------------------------------------------
// Modus 2: Meerkeuze (makkelijk)
// Toont een raster van antwoordknoppen. Eén is goed, de rest is fout.
// -----------------------------------------------------------------------------

/**
 * Bouwt een meerkeuze-invoer.
 * @param {HTMLElement} invoerVlak
 * @param {Function} opGeantwoord - callback(antwoord: number)
 * @param {number} juistAntwoord - het goede antwoord
 * @param {number[]} fouteAntwoorden - lijst met 2-3 foute antwoorden
 * @param {number} [aantalOpties=4] - totaal aantal knoppen
 * @returns {Function} opruimfunctie
 */
export function bouwMeerkeuzeInvoer(invoerVlak, opGeantwoord, juistAntwoord, fouteAntwoorden, aantalOpties = 4) {
  invoerVlak.innerHTML = "";

  // Bouw de opties: 1 goed + unieke foute antwoorden
  const opties = new Set();
  opties.add(juistAntwoord);
  for (const fout of fouteAntwoorden) {
    if (opties.size < aantalOpties && !opties.has(fout)) {
      opties.add(fout);
    }
  }
  // Vul aan als we er niet genoeg hebben
  let vulOp = 1;
  while (opties.size < aantalOpties) {
    const extra = juistAntwoord + vulOp;
    if (!opties.has(extra) && extra >= 0) opties.add(extra);
    vulOp += 1 + vulOp; // 1, 2, 4, 7, 11...
  }

  // Shuffle (Fisher-Yates)
  const optiesLijst = [...opties];
  for (let i = optiesLijst.length - 1; i > 0; i--) {
    const j = randomGeheelGetal(0, i);
    [optiesLijst[i], optiesLijst[j]] = [optiesLijst[j], optiesLijst[i]];
  }

  const grid = document.createElement("div");
  grid.className = "meerkeuze-grid";

  for (const optie of optiesLijst) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "meerkeuze-knop";
    knop.textContent = String(optie);
    knop.setAttribute("aria-label", `Antwoord ${optie}`);
    knop.addEventListener("click", () => opGeantwoord(optie));
    grid.appendChild(knop);
  }

  invoerVlak.appendChild(grid);
  return () => {}; // geen event listeners om op te ruimen
}

// -----------------------------------------------------------------------------
// Foute-antwoord generators per oefeningtype
// -----------------------------------------------------------------------------

/** Genereert 3 foute antwoorden voor een keersom (tafels). */
export function genereerFouteKeerAntwoorden(juistAntwoord, tafel) {
  const fouten = new Set();
  // Naburige tafel (bv. 7x6=42 → 7x5=35 of 7x7=49)
  fouten.add(juistAntwoord + tafel);
  fouten.add(juistAntwoord - tafel);
  // Eén van de factoren ±1 (bv. 6x6=36 of 8x6=48)
  fouten.add(juistAntwoord + (juistAntwoord / tafel));
  // Naburig getal
  fouten.add(juistAntwoord + 1);
  fouten.add(juistAntwoord - 1);
  fouten.delete(juistAntwoord);
  return [...fouten].filter((f) => f > 0).slice(0, 3);
}

/** Genereert 3 foute antwoorden voor een plus/min/verhaaltjessom. */
export function genereerFoutePlusMinAntwoorden(juistAntwoord) {
  const fouten = new Set();
  fouten.add(juistAntwoord + 1);
  fouten.add(juistAntwoord - 1);
  fouten.add(juistAntwoord + 10);
  fouten.add(juistAntwoord - 10);
  fouten.add(juistAntwoord + 2);
  fouten.add(juistAntwoord - 2);
  fouten.delete(juistAntwoord);
  return [...fouten].filter((f) => f >= 0).slice(0, 3);
}