// utils/klokSvg.js
// -----------------------------------------------------------------------------
// Tekent een analoge klok voor de klokkijken-oefening. Biedt twee varianten:
//   - bouwKlok({ uur, minuten })     : volledige klok met beide wijzers (aflezen).
//   - bouwTekenKlok({ uurHoek, minuutHoek }) : wijzerplaat met optionele wijzers,
//     plus halfuur-stippen als richtpunten (om de tijd zelf te tekenen).
// Conventie: hoekgraad 0 = 12 uur, 90 = 3 uur, met de klok mee.
// -----------------------------------------------------------------------------

const SVG_NS = "http://www.w3.org/2000/svg";
const CX = 160;
const CY = 160;
const STRAAL = 120;
const VIEWBOX = 320;
// Cijfers staan buiten de wijzerplaat, zodat de wijzers goed leesbaar blijven.
const CIJFER_STRAAL = STRAAL + 16;

function svgEl(tag, attributen = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [naam, waarde] of Object.entries(attributen)) {
    el.setAttribute(naam, String(waarde));
  }
  return el;
}

/** Zet een 'klokhoek' (0 = 12 uur, 90 = 3 uur) om naar een SVG-coördinaat. */
function puntOpKlok(hoekGraad, straal) {
  const rad = ((hoekGraad - 90) * Math.PI) / 180;
  return {
    x: CX + straal * Math.cos(rad),
    y: CY + straal * Math.sin(rad),
  };
}

// --- Gedeelde bouwstenen ----------------------------------------------------

function tekenWijzerplaat(svg) {
  // Buitenring + binnenring
  svg.appendChild(svgEl("circle", { cx: CX, cy: CY, r: STRAAL, fill: "#ffffff", stroke: "#374151", "stroke-width": 8 }));
  svg.appendChild(svgEl("circle", { cx: CX, cy: CY, r: STRAAL - 14, fill: "#ffffff", stroke: "#d6dee7", "stroke-width": 2 }));

  // Uurmarkeringen en cijfers 1 t/m 12
  for (let h = 1; h <= 12; h += 1) {
    const hoek = h * 30;
    const buiten = puntOpKlok(hoek, STRAAL - 12);
    const binnen = puntOpKlok(hoek, STRAAL - 26);
    svg.appendChild(svgEl("line", {
      x1: binnen.x, y1: binnen.y, x2: buiten.x, y2: buiten.y,
      stroke: "#5b6472", "stroke-width": 5, "stroke-linecap": "round",
    }));
    const cijfer = puntOpKlok(hoek, CIJFER_STRAAL);
    const tekst = svgEl("text", {
      x: cijfer.x, y: cijfer.y,
      "text-anchor": "middle", "dominant-baseline": "central",
      "font-size": "26", "font-weight": "800", fill: "#1f2937",
    });
    tekst.textContent = String(h);
    svg.appendChild(tekst);
  }
}

function tekenUurWijzer(svg, hoek) {
  const p = puntOpKlok(hoek, STRAAL * 0.5);
  svg.appendChild(svgEl("line", {
    x1: CX, y1: CY, x2: p.x, y2: p.y,
    stroke: "#e8735a", "stroke-width": 13, "stroke-linecap": "round", opacity: "0.7",
  }));
}

function tekenMinuutWijzer(svg, hoek) {
  const p = puntOpKlok(hoek, STRAAL * 0.74);
  svg.appendChild(svgEl("line", {
    x1: CX, y1: CY, x2: p.x, y2: p.y,
    stroke: "#4f8fe8", "stroke-width": 8, "stroke-linecap": "round", opacity: "0.7",
  }));
}

function tekenMiddelpunt(svg) {
  svg.appendChild(svgEl("circle", { cx: CX, cy: CY, r: 8, fill: "#1f2937" }));
}

// --- Publieke API -----------------------------------------------------------

/** Volledige klok met beide wijzers, voor het 'aflezen'-opgavetype. */
export function bouwKlok({ uur, minuten }) {
  const svg = svgEl("svg", { viewBox: `0 0 ${VIEWBOX} ${VIEWBOX}`, role: "img", "aria-label": "Een analoge klok met wijzers" });
  tekenWijzerplaat(svg);
  tekenUurWijzer(svg, (uur % 12) * 30 + minuten * 0.5);
  tekenMinuutWijzer(svg, minuten * 6);
  tekenMiddelpunt(svg);
  return svg;
}

/**
 * Wijzerplaat voor het 'tekenen'-opgavetype. Wijzers verschijnen pas als er
 * een hoek is doorgegeven; halfuur-stippen dienen als richtpunten.
 * @param {{uurHoek?: number|null, minuutHoek?: number|null}} opties
 */
export function bouwTekenKlok({ uurHoek = null, minuutHoek = null }) {
  const svg = svgEl("svg", { viewBox: `0 0 ${VIEWBOX} ${VIEWBOX}`, role: "img", "aria-label": "Teken de wijzers op de klok" });
  tekenWijzerplaat(svg);

  // Halfuur-stippen (richtpunten tussen de uren)
  for (let m = 0; m < 12; m += 1) {
    const p = puntOpKlok(m * 30 + 15, STRAAL - 26);
    svg.appendChild(svgEl("circle", { cx: p.x, cy: p.y, r: 5, fill: "#cbd5e1" }));
  }

  if (uurHoek != null) tekenUurWijzer(svg, uurHoek);
  if (minuutHoek != null) tekenMinuutWijzer(svg, minuutHoek);
  tekenMiddelpunt(svg);
  return svg;
}

/** Rekent een tijd (uur + minuten) om naar wijzerhoeken in graden. */
export function tijdNaarHoeken(uur, minuten) {
  return { uurHoek: (uur % 12) * 30 + minuten * 0.5, minuutHoek: minuten * 6 };
}

/** Zet een klikpositie (in pixels) om naar een klokhoek in graden (0 = 12 uur). */
export function klikNaarHoek(clientX, clientY, svgElement) {
  const rect = svgElement.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * VIEWBOX;
  const y = ((clientY - rect.top) / rect.height) * VIEWBOX;
  const dx = x - CX;
  const dy = y - CY;
  const hoek = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  return ((hoek % 360) + 360) % 360;
}