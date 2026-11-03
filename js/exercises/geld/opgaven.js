// exercises/geld/opgaven.js
// -----------------------------------------------------------------------------
// Opgaven voor "Rekenen met geld":
//   tel    - er ligt geld getoond; hoeveel is het samen?
//   betaal - een bedrag is gegeven; kies/sleep het juiste geld uit de beschikbare
//            biljetten en munten (er is altijd minstens één oplossing).
// Bedragen worden intern in centen bijgehouden.
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";
import { GELDSOORTEN, soortById, formatBedrag } from "./geldSvg.js";

export const MAX_OPTIES = [20, 50, 100, 200];

function toegestaan(maxEuro) {
  // Biljetten alleen als ze in het maximum passen; munten altijd.
  return GELDSOORTEN.filter((g) => g.soort === "munt" || g.cent <= maxEuro * 100);
}

/** Telt de waarde (centen) van een lijst id's of een {id: aantal}-object. */
export function waardeVan(items) {
  if (Array.isArray(items)) return items.reduce((s, id) => s + soortById(id).cent, 0);
  return Object.entries(items).reduce((s, [id, n]) => s + soortById(id).cent * n, 0);
}

function genereerTel(maxEuro) {
  const soorten = toegestaan(maxEuro);
  for (let poging = 0; poging < 200; poging += 1) {
    const aantal = randomGeheelGetal(3, 6);
    const items = Array.from({ length: aantal }, () => kiesWillekeurig(soorten).id);
    const totaal = waardeVan(items);
    if (totaal <= maxEuro * 100 && totaal >= 200) {
      items.sort((a, b) => soortById(b).cent - soortById(a).cent);
      return {
        type: "tel",
        items,
        totaalCenten: totaal,
        antwoordGoed: totaal,
        hint: "Tel eerst de biljetten bij elkaar op en daarna de munten. Twee munten van 50 cent zijn samen 1 euro.",
        meta: { opgaveType: "tel", maxEuro },
      };
    }
  }
  return { type: "tel", items: ["b5", "m100", "m50"], totaalCenten: 650, antwoordGoed: 650, hint: "Tel eerst de biljetten en daarna de munten.", meta: { opgaveType: "tel", maxEuro } };
}

function genereerBetaal(maxEuro) {
  const soorten = toegestaan(maxEuro);
  for (let poging = 0; poging < 300; poging += 1) {
    const voorraad = {};
    const oplossing = {};
    for (const s of soorten) {
      const maxVoorraad = s.soort === "biljet" ? 2 : 3;
      voorraad[s.id] = randomGeheelGetal(1, maxVoorraad);
      oplossing[s.id] = randomGeheelGetal(0, voorraad[s.id]);
    }
    const totaal = waardeVan(oplossing);
    if (totaal >= 300 && totaal <= maxEuro * 100 && Object.values(oplossing).reduce((a, b) => a + b, 0) >= 2) {
      return {
        type: "betaal",
        voorraad,
        oplossing,
        totaalCenten: totaal,
        antwoordGoed: totaal,
        hint: "Begin met de grootste biljetten die nog in het bedrag passen. Maak de rest met kleiner geld.",
        meta: { opgaveType: "betaal", maxEuro },
      };
    }
  }
  const voorraad = { b5: 1, m100: 2, m50: 2 };
  return { type: "betaal", voorraad, oplossing: { b5: 1, m100: 1, m50: 1 }, totaalCenten: 650, antwoordGoed: 650, hint: "Begin met het grootste geld.", meta: { opgaveType: "betaal", maxEuro } };
}

/** @param {{maxEuro:number, opgaveType:"tel"|"betaal"|"alle"}} instellingen */
export function genereerOpgave(instellingen) {
  const max = instellingen.maxEuro || 50;
  const type = instellingen.opgaveType && instellingen.opgaveType !== "alle" ? instellingen.opgaveType : kiesWillekeurig(["tel", "betaal"]);
  return type === "betaal" ? genereerBetaal(max) : genereerTel(max);
}

export function opgaveNaarSleutel(opgave) {
  return `${opgave.type}_${opgave.totaalCenten}_${opgave.items ? opgave.items.join("") : Object.entries(opgave.voorraad).join("")}`;
}

/** Leesbare tekst bij het gevraagde bedrag. */
export function bedragTekst(opgave) {
  return formatBedrag(opgave.totaalCenten);
}

/** Zet een invoerstring ("37,50", "37.5", "€ 37") om naar centen, of null. */
export function parseBedragNaarCenten(invoer) {
  const s = String(invoer ?? "").replace(/[€\s]|euro/gi, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(parseFloat(s) * 100);
}
