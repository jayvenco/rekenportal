// utils/grafiekSvg.js
// -----------------------------------------------------------------------------
// Tekent een eenvoudige gecombineerde staaf/lijn-grafiek in SVG voor het
// statistiekenscherm: staven voor aantal opgaven per dag, lijn voor percentage
// goed per dag. Geen externe libraries.
// -----------------------------------------------------------------------------

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attributen = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [naam, waarde] of Object.entries(attributen)) {
    el.setAttribute(naam, String(waarde));
  }
  return el;
}

/**
 * Bouwt de dagelijkse grafiek.
 * @param {Array<{dag: string, totaal: number, percentage: number}>} dagData
 * @returns {SVGSVGElement}
 */
export function bouwDagelijkseGrafiek(dagData) {
  const breedte = 900;
  const hoogte = 260;
  const margeOnder = 40;
  const margeBoven = 20;
  const margeZij = 30;
  const svg = svgEl("svg", {
    viewBox: `0 0 ${breedte} ${hoogte}`,
    role: "img",
    "aria-label": "Grafiek van de laatste 14 dagen: aantal opgaven en percentage goed",
  });

  const beschikbareBreedte = breedte - margeZij * 2;
  const beschikbareHoogte = hoogte - margeBoven - margeOnder;
  const aantalDagen = dagData.length || 1;
  const kolomBreedte = beschikbareBreedte / aantalDagen;
  const maxTotaal = Math.max(1, ...dagData.map((d) => d.totaal));

  // Basislijn
  svg.appendChild(
    svgEl("line", {
      x1: margeZij,
      y1: hoogte - margeOnder,
      x2: breedte - margeZij,
      y2: hoogte - margeOnder,
      stroke: "#e2e8f0",
      "stroke-width": 2,
    })
  );

  const lijnPunten = [];

  dagData.forEach((dag, index) => {
    const xMidden = margeZij + index * kolomBreedte + kolomBreedte / 2;
    const staafHoogte = (dag.totaal / maxTotaal) * beschikbareHoogte;
    const staafBreedte = kolomBreedte * 0.5;

    // Staaf: aantal opgaven per dag.
    svg.appendChild(
      svgEl("rect", {
        x: xMidden - staafBreedte / 2,
        y: hoogte - margeOnder - staafHoogte,
        width: staafBreedte,
        height: staafHoogte,
        rx: 4,
        fill: "#cfe2fb",
      })
    );

    // Punt voor de percentage-lijn.
    const yPercentage = hoogte - margeOnder - (dag.percentage / 100) * beschikbareHoogte;
    lijnPunten.push(`${xMidden},${yPercentage}`);

    // Dag-label (alleen om de paar dagen tonen, anders wordt het te druk).
    if (index % 2 === 0 || aantalDagen <= 7) {
      const dagNummer = dag.dag.slice(8, 10);
      svg.appendChild(
        svgEl("text", {
          x: xMidden,
          y: hoogte - margeOnder + 18,
          "text-anchor": "middle",
          "font-size": 13,
          fill: "#5b6472",
        })
      ).textContent = dagNummer;
    }
  });

  // Percentage-lijn.
  svg.appendChild(
    svgEl("polyline", {
      points: lijnPunten.join(" "),
      fill: "none",
      stroke: "#38b26a",
      "stroke-width": 3,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    })
  );

  // Puntjes op de lijn.
  dagData.forEach((dag, index) => {
    const xMidden = margeZij + index * kolomBreedte + kolomBreedte / 2;
    const yPercentage = hoogte - margeOnder - (dag.percentage / 100) * beschikbareHoogte;
    svg.appendChild(
      svgEl("circle", {
        cx: xMidden,
        cy: yPercentage,
        r: 4,
        fill: "#38b26a",
      })
    );
  });

  // Legenda
  const legendaY = margeBoven - 4;
  svg.appendChild(
    svgEl("rect", { x: margeZij, y: legendaY, width: 14, height: 14, rx: 3, fill: "#cfe2fb" })
  );
  svg.appendChild(
    svgEl("text", { x: margeZij + 20, y: legendaY + 11, "font-size": 13, fill: "#5b6472" })
  ).textContent = "Aantal opgaven";
  svg.appendChild(
    svgEl("circle", { cx: margeZij + 190, cy: legendaY + 7, r: 5, fill: "#38b26a" })
  );
  svg.appendChild(
    svgEl("text", { x: margeZij + 200, y: legendaY + 11, "font-size": 13, fill: "#5b6472" })
  ).textContent = "% goed";

  return svg;
}
