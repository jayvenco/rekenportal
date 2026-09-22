// utils/klokSvg.js
// -----------------------------------------------------------------------------
// Tekent een analoge klok met een grote (minuut)wijzer en een kleine (uur)wijzer.
// Wordt gebruikt door de klokkijken-oefening. Duidelijke wijzerplaat met de
// cijfers 1 t/m 12, zodat een kind hele en halve uren kan aflezen.
// - uur:     1 t/m 12 (het 'vorige' hele uur bij halve uren, bv. 3 voor "half 4")
// - minuten: 0 (heel uur) of 30 (half uur)
// -----------------------------------------------------------------------------

const SVG_NS = "http://www.w3.org/2000/svg";
const CX = 120;
const CY = 120;
const STRAAL = 108;

function svgEl(tag, attributen = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [naam, waarde] of Object.entries(attributen)) {
    el.setAttribute(naam, String(waarde));
  }
  return el;
}

/** Zet een 'klokhoek' (0 = 12 uur, 90 = 3 uur, met de klok mee) om naar een SVG-coördinaat. */
function puntOpKlok(hoekGraad, straal) {
  const rad = ((hoekGraad - 90) * Math.PI) / 180;
  return {
    x: CX + straal * Math.cos(rad),
    y: CY + straal * Math.sin(rad),
  };
}

/**
 * Bouwt een SVG-klok.
 * @param {Object} opties
 * @param {number} opties.uur - uurcijfer (1-12) voor de kleine wijzer.
 * @param {number} opties.minuten - 0 of 30 voor de grote wijzer.
 * @returns {SVGSVGElement}
 */
export function bouwKlok({ uur, minuten }) {
  const svg = svgEl("svg", {
    viewBox: "0 0 240 240",
    role: "img",
    "aria-label": "Een analoge klok met wijzers",
  });

  // Wijzerplaat (buitenring + binnenring)
  svg.appendChild(
    svgEl("circle", {
      cx: CX,
      cy: CY,
      r: STRAAL,
      fill: "#ffffff",
      stroke: "#374151",
      "stroke-width": 8,
    })
  );
  svg.appendChild(
    svgEl("circle", {
      cx: CX,
      cy: CY,
      r: STRAAL - 14,
      fill: "#ffffff",
      stroke: "#d6dee7",
      "stroke-width": 2,
    })
  );

  // Uurmarkeringen en cijfers 1 t/m 12
  for (let h = 1; h <= 12; h += 1) {
    const hoek = h * 30;
    const buiten = puntOpKlok(hoek, STRAAL - 12);
    const binnen = puntOpKlok(hoek, STRAAL - 26);
    svg.appendChild(
      svgEl("line", {
        x1: binnen.x,
        y1: binnen.y,
        x2: buiten.x,
        y2: buiten.y,
        stroke: "#5b6472",
        "stroke-width": 5,
        "stroke-linecap": "round",
      })
    );
    const cijfer = puntOpKlok(hoek, STRAAL - 46);
    const tekst = svgEl("text", {
      x: cijfer.x,
      y: cijfer.y,
      "text-anchor": "middle",
      "dominant-baseline": "central",
      "font-size": "30",
      "font-weight": "800",
      fill: "#1f2937",
    });
    tekst.textContent = String(h);
    svg.appendChild(tekst);
  }

  // Kleine wijzer = uurwijzer (kort, dik, rood)
  const uurHoek = (uur % 12) * 30 + minuten * 0.5;
  const uurPunt = puntOpKlok(uurHoek, STRAAL * 0.5);
  svg.appendChild(
    svgEl("line", {
      x1: CX,
      y1: CY,
      x2: uurPunt.x,
      y2: uurPunt.y,
      stroke: "#e8735a",
      "stroke-width": 13,
      "stroke-linecap": "round",
    })
  );

  // Grote wijzer = minuutwijzer (lang, dun, blauw)
  const minuutHoek = minuten * 6;
  const minuutPunt = puntOpKlok(minuutHoek, STRAAL * 0.74);
  svg.appendChild(
    svgEl("line", {
      x1: CX,
      y1: CY,
      x2: minuutPunt.x,
      y2: minuutPunt.y,
      stroke: "#4f8fe8",
      "stroke-width": 8,
      "stroke-linecap": "round",
    })
  );

  // Middelpunt
  svg.appendChild(svgEl("circle", { cx: CX, cy: CY, r: 8, fill: "#1f2937" }));

  return svg;
}