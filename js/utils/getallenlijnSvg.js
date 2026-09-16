// utils/getallenlijnSvg.js
// -----------------------------------------------------------------------------
// Tekent een horizontale getallenlijn in SVG die meeschaalt met de schermbreedte.
// Wordt gebruikt door alle opgavetypes van de getallenlijn-module.
// -----------------------------------------------------------------------------

const SVG_NS = "http://www.w3.org/2000/svg";
const BREEDTE_VIEWBOX = 1000;
const HOOGTE_VIEWBOX = 220;
const MARGE_LINKS = 60;
const MARGE_RECHTS = 60;
const LIJN_Y = 120;

function svgEl(tag, attributen = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [naam, waarde] of Object.entries(attributen)) {
    el.setAttribute(naam, String(waarde));
  }
  return el;
}

/** Zet een getal (tussen min en max) om naar een X-coördinaat op de SVG-lijn. */
function getalNaarX(getal, min, max) {
  const breedteLijn = BREEDTE_VIEWBOX - MARGE_LINKS - MARGE_RECHTS;
  const verhouding = max === min ? 0 : (getal - min) / (max - min);
  return MARGE_LINKS + verhouding * breedteLijn;
}

/**
 * Bouwt een SVG getallenlijn.
 * @param {Object} opties
 * @param {number} opties.min - begingetal van de lijn.
 * @param {number} opties.max - eindgetal van de lijn.
 * @param {number} opties.stap - afstand tussen streepjes.
 * @param {number[]} [opties.verborgenGetallen] - getallen waarvan het label verborgen moet worden ("vul aan").
 * @param {Array} [opties.markeringen] - lijst met { getal, kleur, label, pijl } om te tonen.
 * @returns {{ svg: SVGSVGElement, getalNaarX: Function }}
 */
export function bouwGetallenlijn({ min, max, stap, verborgenGetallen = [], markeringen = [] }) {
  const svg = svgEl("svg", {
    viewBox: `0 0 ${BREEDTE_VIEWBOX} ${HOOGTE_VIEWBOX}`,
    role: "img",
    "aria-label": `Getallenlijn van ${min} tot ${max}`,
  });

  // Hoofdlijn
  svg.appendChild(
    svgEl("line", {
      x1: getalNaarX(min, min, max),
      y1: LIJN_Y,
      x2: getalNaarX(max, min, max),
      y2: LIJN_Y,
      stroke: "#5b6472",
      "stroke-width": 4,
      "stroke-linecap": "round",
    })
  );

  const verborgenSet = new Set(verborgenGetallen);

  // Streepjes en labels op elke stap
  for (let getal = min; getal <= max; getal += stap) {
    const x = getalNaarX(getal, min, max);
    const isRond = getal % (stap * 5 === 0 ? stap * 5 : stap) === 0;
    const isTiental = getal % 10 === 0;
    const lang = isTiental || getal === min || getal === max;
    const streepjeHoogte = lang ? 20 : 12;

    svg.appendChild(
      svgEl("line", {
        x1: x,
        y1: LIJN_Y - streepjeHoogte / 2,
        x2: x,
        y2: LIJN_Y + streepjeHoogte / 2,
        stroke: "#5b6472",
        "stroke-width": lang ? 3 : 2,
      })
    );

    if (!verborgenSet.has(getal) && (lang || stap >= 5)) {
      svg.appendChild(
        svgEl("text", {
          x,
          y: LIJN_Y + streepjeHoogte / 2 + 22,
          "text-anchor": "middle",
          "font-size": lang ? 22 : 18,
          "font-weight": lang ? 800 : 600,
          fill: "#1f2937",
        })
      ).textContent = String(getal);
    } else if (verborgenSet.has(getal)) {
      // Toon een leeg vakje in plaats van het getal, zodat het kind ziet waar iets moet komen.
      svg.appendChild(
        svgEl("rect", {
          x: x - 18,
          y: LIJN_Y + streepjeHoogte / 2 + 8,
          width: 36,
          height: 24,
          rx: 6,
          fill: "#eaf2ff",
          stroke: "#4f8fe8",
          "stroke-width": 2,
        })
      );
    }
  }

  // Begin- en eindlabel altijd tonen, ook als die niet op een 'stap'-punt liggen.
  for (const grensGetal of [min, max]) {
    if (grensGetal % stap !== 0) {
      const x = getalNaarX(grensGetal, min, max);
      svg.appendChild(
        svgEl("text", {
          x,
          y: LIJN_Y + 42,
          "text-anchor": "middle",
          "font-size": 22,
          "font-weight": 800,
          fill: "#1f2937",
        })
      ).textContent = String(grensGetal);
    }
  }

  // Extra markeringen: pijlen, gekleurde stippen met eigen label (voor antwoorden, vraagpunten).
  for (const markering of markeringen) {
    const x = getalNaarX(markering.getal, min, max);
    const kleur = markering.kleur || "#4f8fe8";

    if (markering.pijl) {
      // Pijl die van boven naar het punt op de lijn wijst.
      svg.appendChild(
        svgEl("line", {
          x1: x,
          y1: LIJN_Y - 55,
          x2: x,
          y2: LIJN_Y - 14,
          stroke: kleur,
          "stroke-width": 4,
          "marker-end": "url(#pijlpunt)",
        })
      );
    } else {
      svg.appendChild(
        svgEl("circle", {
          cx: x,
          cy: LIJN_Y,
          r: 9,
          fill: kleur,
          stroke: "#ffffff",
          "stroke-width": 2,
        })
      );
    }

    if (markering.label !== undefined) {
      svg.appendChild(
        svgEl("text", {
          x,
          y: LIJN_Y - 62,
          "text-anchor": "middle",
          "font-size": 24,
          "font-weight": 800,
          fill: kleur,
        })
      ).textContent = String(markering.label);
    }
  }

  // Pijlpunt-definitie (herbruikt door alle pijl-markeringen).
  const defs = svgEl("defs");
  const marker = svgEl("marker", {
    id: "pijlpunt",
    markerWidth: 10,
    markerHeight: 10,
    refX: 5,
    refY: 9,
    orient: "auto",
  });
  marker.appendChild(svgEl("path", { d: "M0,0 L10,0 L5,10 Z", fill: "#4f8fe8" }));
  defs.appendChild(marker);
  svg.insertBefore(defs, svg.firstChild);

  return { svg, getalNaarX: (getal) => getalNaarX(getal, min, max) };
}

/**
 * Zet klikcoordinaten op de SVG om naar het dichtstbijzijnde geldige getal
 * (afgerond op de gekozen stapgrootte), voor de "plaats het getal"-opgave.
 */
export function xNaarGetal(clientX, svgElement, min, max, stap) {
  const rect = svgElement.getBoundingClientRect();
  const verhoudingInPixels = (clientX - rect.left) / rect.width;
  const xInViewbox = verhoudingInPixels * BREEDTE_VIEWBOX;
  const breedteLijn = BREEDTE_VIEWBOX - MARGE_LINKS - MARGE_RECHTS;
  const verhouding = (xInViewbox - MARGE_LINKS) / breedteLijn;
  const ruwGetal = min + verhouding * (max - min);
  const afgerond = Math.round(ruwGetal / stap) * stap;
  return Math.min(max, Math.max(min, afgerond));
}
