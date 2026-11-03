// exercises/geld/geldSvg.js
// -----------------------------------------------------------------------------
// Tekent euro-biljetten (5, 10, 20, 50, 100) en munten (50 cent, 1 en 2 euro)
// als SVG, en bevat de lijst met alle geldsoorten.
// -----------------------------------------------------------------------------

const NS = "http://www.w3.org/2000/svg";

export const GELDSOORTEN = [
  { id: "b100", cent: 10000, soort: "biljet", label: "€ 100", kleur: "#6fb36a", rand: "#3d7d3a" },
  { id: "b50", cent: 5000, soort: "biljet", label: "€ 50", kleur: "#f0a24a", rand: "#b8691a" },
  { id: "b20", cent: 2000, soort: "biljet", label: "€ 20", kleur: "#6aa7e0", rand: "#2f6fb5" },
  { id: "b10", cent: 1000, soort: "biljet", label: "€ 10", kleur: "#e8756a", rand: "#b53a2f" },
  { id: "b5", cent: 500, soort: "biljet", label: "€ 5", kleur: "#b9bec6", rand: "#6b7480" },
  { id: "m200", cent: 200, soort: "munt", label: "€ 2", buiten: "#d9b44a", binnen: "#d7dbe0" },
  { id: "m100", cent: 100, soort: "munt", label: "€ 1", buiten: "#d7dbe0", binnen: "#d9b44a" },
  { id: "m50", cent: 50, soort: "munt", label: "50 cent", buiten: "#d9b44a", binnen: "#d9b44a" },
];

export const soortById = (id) => GELDSOORTEN.find((g) => g.id === id);

function el(naam, attrs = {}, tekst) {
  const e = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (tekst !== undefined) e.textContent = tekst;
  return e;
}

/** Bedrag in centen naar tekst: 3750 -> "€ 37,50", 500 -> "€ 5". */
export function formatBedrag(cent) {
  const euro = Math.floor(cent / 100);
  const rest = cent % 100;
  return rest ? `€ ${euro},${String(rest).padStart(2, "0")}` : `€ ${euro}`;
}

/** Maakt een SVG voor een geldsoort; `breedte` is de breedte in pixels. */
export function maakGeldSvg(soort, breedte) {
  const g = typeof soort === "string" ? soortById(soort) : soort;
  if (g.soort === "biljet") {
    const w = breedte || 120, h = Math.round(w * 0.55);
    const svg = el("svg", { viewBox: "0 0 120 66", width: w, height: h, role: "img", "aria-label": `Biljet van ${g.label.replace("€ ", "")} euro` });
    svg.appendChild(el("rect", { x: 2, y: 2, width: 116, height: 62, rx: 6, fill: g.kleur, stroke: g.rand, "stroke-width": 3 }));
    svg.appendChild(el("rect", { x: 8, y: 8, width: 104, height: 50, rx: 4, fill: "none", stroke: "#fff", "stroke-opacity": 0.7, "stroke-width": 1.5 }));
    svg.appendChild(el("path", { d: "M70 56 Q80 22 98 18 Q108 30 100 56 Z", fill: "#fff", "fill-opacity": 0.25 }));
    svg.appendChild(el("circle", { cx: 26, cy: 33, r: 13, fill: "#fff", "fill-opacity": 0.45, stroke: g.rand, "stroke-width": 1.5 }));
    svg.appendChild(el("text", { x: 26, y: 40, "text-anchor": "middle", "font-size": 18, "font-weight": 800, fill: g.rand }, "€"));
    svg.appendChild(el("text", { x: 82, y: 42, "text-anchor": "middle", "font-size": 30, "font-weight": 800, fill: "#1f2937", "font-family": "inherit" }, g.label.replace("€ ", "")));
    return svg;
  }
  const d = { m200: 78, m100: 70, m50: 62 }[g.id];
  const w = breedte || d;
  const svg = el("svg", { viewBox: "0 0 80 80", width: w, height: w, role: "img", "aria-label": `Munt van ${g.label}` });
  const r = d / 2 * (80 / 78);
  svg.appendChild(el("circle", { cx: 40, cy: 40, r: Math.min(38, r), fill: g.buiten, stroke: "#8a6d1f", "stroke-width": 2 }));
  if (g.id !== "m50") svg.appendChild(el("circle", { cx: 40, cy: 40, r: Math.min(38, r) * 0.62, fill: g.binnen, stroke: "#8a6d1f", "stroke-width": 1.5 }));
  const tekst = g.id === "m50" ? "50" : g.id === "m100" ? "1" : "2";
  svg.appendChild(el("text", { x: 40, y: g.id === "m50" ? 47 : 49, "text-anchor": "middle", "font-size": g.id === "m50" ? 24 : 30, "font-weight": 800, fill: "#5a4510", "font-family": "inherit" }, tekst));
  if (g.id === "m50") svg.appendChild(el("text", { x: 40, y: 62, "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: "#5a4510" }, "cent"));
  return svg;
}
