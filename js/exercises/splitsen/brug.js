// exercises/splitsen/brug.js
// -----------------------------------------------------------------------------
// Weergave van een plus- of minsom die je oplost "via het tiental":
//   38 + 7:  38 + 2 = 40  en  40 + 5 = 45
// Toont de som, een splitsboom van het tweede getal en de twee rekenregels.
// Vakjes vullen zich stap voor stap in naarmate het kind antwoordt.
// -----------------------------------------------------------------------------

import { bouwSplitsboom } from "./splitsboom.js";

const GROEN = "#1f8a4c";
const ROOD = "#c0392b";

function stijl() {
  if (document.getElementById("brug-stijl")) return;
  const s = document.createElement("style");
  s.id = "brug-stijl";
  s.textContent = `
  .brug{display:flex;flex-direction:column;align-items:center;gap:6px;margin:6px 0}
  .brug-som{font-size:2.2rem;font-weight:800;color:#1f2937}
  .brug-regels{display:flex;flex-direction:column;gap:8px;align-items:center;font-size:1.7rem;font-weight:700;color:#1f2937}
  .brug-regel{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center}
  .brug-vak{display:inline-flex;align-items:center;justify-content:center;min-width:2.6em;height:1.7em;border:2px solid #111;border-radius:6px;background:#fff;padding:0 6px}
  .brug-vak--actief{border-color:#2f6fb5;background:#eaf2ff;border-width:3px}
  .brug-vak--goed{color:${GROEN};border-color:${GROEN}}
  .brug-vak--fout{color:${ROOD};border-color:${ROOD}}
  `;
  document.head.appendChild(s);
}

function vak(inhoud, status) {
  const v = document.createElement("span");
  v.className = "brug-vak" + (status ? ` brug-vak--${status}` : "");
  v.textContent = inhoud === null ? "" : String(inhoud);
  return v;
}

function tekst(t) {
  const s = document.createElement("span");
  s.textContent = t;
  return s;
}

/**
 * @param {Object} opgave - een opgave van type "brug" (zie opgaven.js)
 * @returns {{element: HTMLElement, teken: (stapIndex:number, toonAlles?:boolean)=>void}}
 */
export function bouwBrugWeergave(opgave) {
  stijl();
  const { a, b, x, y, tiental, uitkomst, bewerking } = opgave;
  const teken = bewerking === "plus" ? "+" : "−";
  const element = document.createElement("div");
  element.className = "brug";

  /**
   * Tekent de weergave opnieuw.
   * @param {number} stapIndex - de stap die nu beantwoord moet worden (0, 1 of 2; 3 = klaar).
   * @param {boolean} toonAlles - toon de resterende waarden in rood (na een gemiste opgave).
   */
  function tekenOpnieuw(stapIndex, toonAlles = false) {
    element.innerHTML = "";
    // Status per stap: gedaan (groen), nu (blauw), later (leeg), of onthuld (rood).
    const stapStatus = (i) => (i < stapIndex ? "goed" : toonAlles ? "fout" : i === stapIndex ? "actief" : null);
    const waarde = (i, w) => (i < stapIndex || toonAlles ? w : null);

    const som = document.createElement("div");
    som.className = "brug-som";
    som.textContent = `${a} ${teken} ${b} = ${stapIndex >= 3 || toonAlles ? uitkomst : "?"}`;

    const boom = bouwSplitsboom({
      totaal: b,
      links: waarde(0, x),
      rechts: waarde(1, y),
      markeer: toonAlles ? null : stapIndex === 0 ? "links" : stapIndex === 1 ? "rechts" : null,
      klein: true,
    });
    boom.svg.style.maxWidth = "230px";
    if (toonAlles) {
      if (stapIndex < 1) boom.zetWaarde("links", x, false);
      if (stapIndex < 2) boom.zetWaarde("rechts", y, false);
    }

    const regels = document.createElement("div");
    regels.className = "brug-regels";
    const regel1 = document.createElement("div");
    regel1.className = "brug-regel";
    regel1.append(tekst(`${a} ${teken}`), vak(waarde(0, x), stapStatus(0)), tekst(`= ${tiental}`));
    const regel2 = document.createElement("div");
    regel2.className = "brug-regel";
    regel2.append(tekst(`${tiental} ${teken}`), vak(waarde(1, y), stapStatus(1)), tekst("="), vak(waarde(2, uitkomst), stapStatus(2)));
    regels.append(regel1, regel2);

    element.append(som, boom.svg, regels);
  }

  tekenOpnieuw(0);
  return { element, teken: tekenOpnieuw };
}
