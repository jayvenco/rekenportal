// exercises/splitsen/splitsboom.js
// -----------------------------------------------------------------------------
// Tekent een splitsboom: één getal bovenin, twee pijlen naar twee vakjes.
// -----------------------------------------------------------------------------

const NS = "http://www.w3.org/2000/svg";

function el(naam, attrs = {}, tekst) {
  const e = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (tekst !== undefined) e.textContent = tekst;
  return e;
}

/**
 * @param {{totaal:number|string, links:number|string|null, rechts:number|string|null, markeer?:"links"|"rechts"|null}} opties
 *   null = leeg vakje. `markeer` kleurt het vakje dat ingevuld moet worden.
 * @returns {{svg: SVGSVGElement, zetWaarde: (kant:"links"|"rechts", waarde:string|number, goed?:boolean)=>void}}
 */
export function bouwSplitsboom({ totaal, links, rechts, markeer = null, klein = false }) {
  const svg = el("svg", { viewBox: "0 0 340 230", role: "img", "aria-label": `Splitsboom van ${totaal}` });
  svg.style.width = "100%";
  svg.style.maxWidth = klein ? "180px" : "320px";
  svg.style.height = "auto";

  const marker = el("marker", { id: `sp-pijl-${klein ? "k" : "g"}`, markerWidth: 10, markerHeight: 10, refX: 8, refY: 5, orient: "auto" });
  marker.appendChild(el("path", { d: "M0,0 L10,5 L0,10 Z", fill: "#111" }));
  const defs = el("defs");
  defs.appendChild(marker);
  svg.appendChild(defs);

  const box = (x, y, tekst, kant) => {
    const gemarkeerd = kant && markeer === kant;
    const r = el("rect", { x, y, width: 84, height: 84, fill: gemarkeerd ? "#eaf2ff" : "#fff", stroke: gemarkeerd ? "#2f6fb5" : "#111", "stroke-width": gemarkeerd ? 3 : 2 });
    const t = el("text", { x: x + 42, y: y + 56, "text-anchor": "middle", "font-size": 38, fill: "#111", "font-family": "inherit" }, tekst === null ? "" : String(tekst));
    svg.append(r, t);
    return { r, t };
  };

  box(128, 6, totaal, null);
  for (const [x1, x2] of [[150, 98], [190, 242]]) {
    svg.appendChild(el("line", { x1, y1: 94, x2, y2: 138, stroke: "#111", "stroke-width": 2, "marker-end": `url(#sp-pijl-${klein ? "k" : "g"})` }));
  }
  const l = box(30, 142, links, "links");
  const r = box(226, 142, rechts, "rechts");

  return {
    svg,
    zetWaarde(kant, waarde, goed = true) {
      const b = kant === "links" ? l : r;
      b.t.textContent = String(waarde);
      b.t.setAttribute("fill", goed ? "#1f8a4c" : "#c0392b");
      b.r.setAttribute("stroke", goed ? "#1f8a4c" : "#c0392b");
    },
  };
}
