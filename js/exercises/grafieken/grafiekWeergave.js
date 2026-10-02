// exercises/grafieken/grafiekWeergave.js
// -----------------------------------------------------------------------------
// Tekent een grafiek, diagram of tabel (staaf, lijn, cirkel, pictogram, tabel,
// gecombineerd) als echte SVG/HTML, rechtstreeks uit de dataset van de opgave.
// -----------------------------------------------------------------------------

const NS = "http://www.w3.org/2000/svg";
const KLEUREN = ["#2f6fb5", "#e8913a", "#2e9e6b", "#d6477a", "#8a5cc2", "#c9a227"];
const TEKST = "#243b53";
const RASTER = "#d9e2ec";

function el(naam, attrs = {}, tekst) {
  const e = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (tekst !== undefined) e.textContent = tekst;
  return e;
}

const nl = (n) => String(Math.round(n * 1e6) / 1e6).replace(".", ",");

function svgBasis(b, h, titel) {
  const svg = el("svg", { viewBox: `0 0 ${b} ${h}`, role: "img", "aria-label": titel, class: "gr-svg" });
  svg.style.width = "100%";
  svg.style.height = "auto";
  svg.style.fontFamily = "inherit";
  return svg;
}

function legenda(svg, items, x, y, maxX = 440) {
  let cx = x, cy = y;
  for (const [i, naam] of items.entries()) {
    const breedte = 34 + naam.length * 7.4;
    if (cx + breedte > maxX && cx > x) { cx = x; cy += 22; }
    svg.appendChild(el("rect", { x: cx, y: cy - 11, width: 14, height: 14, rx: 3, fill: KLEUREN[i % KLEUREN.length] }));
    svg.appendChild(el("text", { x: cx + 20, y: cy, "font-size": 14, fill: TEKST }, naam));
    cx += breedte;
  }
}

function assen(svg, p, o) {
  const { l, r, t, b, B, H } = p;
  const bereik = o.yMax - o.yMin;
  const yPos = (v) => H - b - ((v - o.yMin) / bereik) * (H - t - b);
  for (let v = o.yMin; v <= o.yMax + 1e-9; v += o.stap) {
    const y = yPos(v);
    svg.appendChild(el("line", { x1: l, x2: B - r, y1: y, y2: y, stroke: RASTER, "stroke-width": 1 }));
    svg.appendChild(el("text", { x: l - 8, y: y + 5, "text-anchor": "end", "font-size": 13, fill: TEKST }, nl(v)));
  }
  svg.appendChild(el("line", { x1: l, x2: l, y1: t, y2: H - b, stroke: TEKST, "stroke-width": 2 }));
  svg.appendChild(el("line", { x1: l, x2: B - r, y1: H - b, y2: H - b, stroke: TEKST, "stroke-width": 2 }));
  const yt = el("text", { x: 14, y: (t + H - b) / 2, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: TEKST, transform: `rotate(-90 14 ${(t + H - b) / 2})` }, o.yTitel);
  svg.appendChild(yt);
  if (o.xTitel) svg.appendChild(el("text", { x: (l + B - r) / 2, y: H - 6, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: TEKST }, o.xTitel));
  return yPos;
}

function labelsOnder(svg, labels, xMidden, y) {
  const lang = labels.some((s) => s.length > 6) && labels.length > 5;
  labels.forEach((s, i) => {
    const t = el("text", { x: xMidden(i), y, "text-anchor": lang ? "end" : "middle", "font-size": 13, fill: TEKST }, s);
    if (lang) t.setAttribute("transform", `rotate(-35 ${xMidden(i)} ${y})`);
    svg.appendChild(t);
  });
}

function lijn(g) {
  const B = 460, H = 340, p = { l: 56, r: 14, t: 28, b: g.labels.some((s) => s.length > 6) && g.labels.length > 5 ? 90 : 70, B, H };
  const svg = svgBasis(B, H, g.titel);
  const yPos = assen(svg, p, g);
  const stapX = (B - p.l - p.r) / g.labels.length;
  const xM = (i) => p.l + stapX * (i + 0.5);
  labelsOnder(svg, g.labels, xM, H - p.b + 20);
  g.reeksen.forEach((rs, ri) => {
    const kleur = KLEUREN[ri % KLEUREN.length];
    const pts = rs.waarden.map((v, i) => `${xM(i)},${yPos(v)}`).join(" ");
    svg.appendChild(el("polyline", { points: pts, fill: "none", stroke: kleur, "stroke-width": 3, "stroke-linejoin": "round" }));
    rs.waarden.forEach((v, i) => {
      const c = el("circle", { cx: xM(i), cy: yPos(v), r: 5.5, fill: "#fff", stroke: kleur, "stroke-width": 3 });
      c.appendChild(el("title", {}, `${rs.naam}, ${g.labels[i]}: ${nl(v)} ${g.eenheid}`));
      svg.appendChild(c);
    });
  });
  if (g.reeksen.length > 1) legenda(svg, g.reeksen.map((r) => r.naam), p.l, 14);
  return svg;
}

function staaf(g) {
  const B = 460, H = 340, p = { l: 56, r: 14, t: g.reeksen.length > 1 ? 36 : 28, b: g.labels.some((s) => s.length > 6) && g.labels.length > 5 ? 90 : 70, B, H };
  const svg = svgBasis(B, H, g.titel);
  const yPos = assen(svg, p, g);
  const n = g.labels.length, m = g.reeksen.length;
  const stapX = (B - p.l - p.r) / n;
  const breed = Math.min(54, (stapX * 0.78) / m);
  labelsOnder(svg, g.labels, (i) => p.l + stapX * (i + 0.5), H - p.b + 20);
  g.reeksen.forEach((rs, ri) => {
    rs.waarden.forEach((v, i) => {
      const x = p.l + stapX * (i + 0.5) - (breed * m) / 2 + ri * breed;
      const y = yPos(v);
      const r = el("rect", { x, y, width: breed - 2, height: H - p.b - y, fill: KLEUREN[ri % KLEUREN.length], rx: 3 });
      r.appendChild(el("title", {}, `${rs.naam}, ${g.labels[i]}: ${nl(v)} ${g.eenheid}`));
      svg.appendChild(r);
      svg.appendChild(el("text", { x: x + (breed - 2) / 2, y: y - 6, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: TEKST }, nl(v)));
    });
  });
  if (m > 1) legenda(svg, g.reeksen.map((r) => r.naam), p.l, 16);
  return svg;
}

function combi(g) {
  const B = 460, H = 360, p = { l: 56, r: 56, t: 62, b: 70, B, H };
  const svg = svgBasis(B, H, g.titel);
  const yL = assen(svg, p, { yMin: 0, yMax: g.staaf.yMax, stap: g.staaf.stap, yTitel: g.staaf.yTitel, xTitel: g.xTitel });
  const yR = (v) => H - p.b - (v / g.lijn.yMax) * (H - p.t - p.b);
  for (let v = 0; v <= g.lijn.yMax + 1e-9; v += g.lijn.stap) {
    svg.appendChild(el("text", { x: B - p.r + 8, y: yR(v) + 5, "font-size": 13, fill: KLEUREN[1] }, nl(v)));
  }
  svg.appendChild(el("text", { x: B - 10, y: (p.t + H - p.b) / 2, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: KLEUREN[1], transform: `rotate(90 ${B - 10} ${(p.t + H - p.b) / 2})` }, g.lijn.yTitel));
  const stapX = (B - p.l - p.r) / g.labels.length;
  const xM = (i) => p.l + stapX * (i + 0.5);
  labelsOnder(svg, g.labels, xM, H - p.b + 20);
  g.staaf.waarden.forEach((v, i) => {
    const y = yL(v);
    const r = el("rect", { x: xM(i) - 22, y, width: 44, height: H - p.b - y, fill: KLEUREN[0], rx: 3, opacity: 0.85 });
    r.appendChild(el("title", {}, `${g.labels[i]}: ${nl(v)} ijsjes`));
    svg.appendChild(r);
    svg.appendChild(el("text", { x: xM(i), y: y - 6, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: KLEUREN[0] }, nl(v)));
  });
  svg.appendChild(el("polyline", { points: g.lijn.waarden.map((v, i) => `${xM(i)},${yR(v)}`).join(" "), fill: "none", stroke: KLEUREN[1], "stroke-width": 3 }));
  g.lijn.waarden.forEach((v, i) => {
    const c = el("circle", { cx: xM(i), cy: yR(v), r: 5.5, fill: "#fff", stroke: KLEUREN[1], "stroke-width": 3 });
    c.appendChild(el("title", {}, `${g.labels[i]}: ${nl(v)} °C`));
    svg.appendChild(c);
  });
  legenda(svg, [g.staaf.naam + " (linker as)", g.lijn.naam + " (rechter as)"], p.l, 16);
  return svg;
}

function cirkel(g) {
  const B = 460, cx = 230, cy = 140, R = 120;
  const n = g.segmenten.length;
  const kolommen = n > 4 ? 2 : 1;
  const H = 322 + (Math.ceil(n / kolommen) - 1) * 30 + 24;
  const svg = svgBasis(B, H, g.titel);
  const totaal = g.segmenten.reduce((s, x) => s + x.waarde, 0);
  let hoek = -Math.PI / 2;
  g.segmenten.forEach((s, i) => {
    const d = (s.waarde / totaal) * Math.PI * 2;
    const x1 = cx + R * Math.cos(hoek), y1 = cy + R * Math.sin(hoek);
    const x2 = cx + R * Math.cos(hoek + d), y2 = cy + R * Math.sin(hoek + d);
    const pad = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${d > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`;
    const w = el("path", { d: pad, fill: KLEUREN[i % KLEUREN.length], stroke: "#fff", "stroke-width": 3 });
    w.appendChild(el("title", {}, `${s.label}: ${nl(s.waarde)} ${g.eenheid}`));
    svg.appendChild(w);
    if (s.waarde / totaal >= 0.07) {
      const mh = hoek + d / 2;
      const txt = g.eenheid === "%" ? `${nl(s.waarde)}%` : `${Math.round((s.waarde / totaal) * 100)}%`;
      svg.appendChild(el("text", { x: cx + R * 0.64 * Math.cos(mh), y: cy + R * 0.64 * Math.sin(mh) + 5, "text-anchor": "middle", "font-size": 16, "font-weight": 800, fill: "#fff" }, txt));
    }
    hoek += d;
  });
  svg.appendChild(el("text", { x: 20, y: 296, "font-size": 15, "font-weight": 700, fill: TEKST }, "Legenda"));
  const perKolom = Math.ceil(n / kolommen);
  g.segmenten.forEach((s, i) => {
    const kol = Math.floor(i / perKolom), rij = i % perKolom;
    const x = 20 + kol * 220, y = 322 + rij * 30;
    svg.appendChild(el("rect", { x, y: y - 14, width: 18, height: 18, rx: 4, fill: KLEUREN[i % KLEUREN.length] }));
    const waarde = g.eenheid === "%" ? `${nl(s.waarde)}%` : `${nl(s.waarde)} ${g.eenheid} (${Math.round((s.waarde / totaal) * 100)}%)`;
    svg.appendChild(el("text", { x: x + 26, y, "font-size": 14, fill: TEKST }, `${s.label}: ${waarde}`));
  });
  return svg;
}

function htmlBlok(klasse) {
  const d = document.createElement("div");
  d.className = klasse;
  return d;
}

function pictogram(g) {
  const wrap = htmlBlok("gr-pict");
  const leg = document.createElement("p");
  leg.className = "gr-pict__legenda";
  leg.innerHTML = `<strong>Legenda:</strong> één ${g.icoon} = ${g.waardePerIcoon} ${g.eenheid}`;
  wrap.appendChild(leg);
  const t = document.createElement("table");
  t.className = "gr-pict__tabel";
  for (const r of g.rijen) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = r.label;
    const td = document.createElement("td");
    const icoon = r.icoon || g.icoon;
    const heel = Math.floor(r.aantal);
    td.textContent = icoon.repeat(heel);
    if (r.aantal % 1 !== 0) {
      const half = document.createElement("span");
      half.textContent = icoon;
      half.style.cssText = "display:inline-block;width:0.6em;overflow:hidden;vertical-align:bottom;";
      td.appendChild(half);
    }
    td.setAttribute("aria-label", `${r.label}: ${r.aantal} keer ${g.waardePerIcoon}`);
    tr.append(th, td);
    t.appendChild(tr);
  }
  wrap.appendChild(t);
  return wrap;
}

function tabel(g) {
  const wrap = htmlBlok("gr-tabel-wrap");
  const t = document.createElement("table");
  t.className = "gr-tabel";
  const kop = document.createElement("tr");
  for (const k of g.kolommen) {
    const th = document.createElement("th");
    th.textContent = k;
    kop.appendChild(th);
  }
  t.appendChild(kop);
  for (const r of g.rijen) {
    const tr = document.createElement("tr");
    for (const c of r) {
      const td = document.createElement("td");
      td.textContent = String(c);
      tr.appendChild(td);
    }
    t.appendChild(tr);
  }
  wrap.appendChild(t);
  return wrap;
}

/** Bouwt het element voor een grafiek-object uit de opgavendata. */
export function maakGrafiek(g) {
  const houder = document.createElement("figure");
  houder.className = "gr-figuur";
  const cap = document.createElement("figcaption");
  cap.className = "gr-titel";
  cap.textContent = g.titel;
  houder.appendChild(cap);
  const types = { lijn, staaf, cirkel, pictogram, tabel, combi };
  houder.appendChild(types[g.type](g));
  return houder;
}

/** Eenmalig de CSS voor deze oefening toevoegen. */
export function voegGrafiekStijlToe() {
  if (document.getElementById("grafieken-stijl")) return;
  const s = document.createElement("style");
  s.id = "grafieken-stijl";
  s.textContent = `
  .gr-figuur{margin:12px 0;padding:12px;background:#fff;border:2px solid #d9e2ec;border-radius:16px}
  .gr-titel{font-weight:800;font-size:1.1rem;margin-bottom:6px;color:#243b53}
  .gr-svg{max-width:680px;display:block;margin:0 auto}
  .gr-pict__legenda{background:#fff7e0;border-radius:10px;padding:8px 12px;font-size:1.05rem}
  .gr-pict__tabel{border-collapse:collapse;width:100%}
  .gr-pict__tabel th{text-align:left;padding:6px 10px 6px 0;white-space:nowrap;font-size:1.05rem}
  .gr-pict__tabel td{font-size:1.7rem;letter-spacing:2px;padding:4px 0;border-bottom:1px solid #e4ebf2}
  .gr-tabel{border-collapse:collapse;margin:0 auto;font-size:1.1rem}
  .gr-tabel th{background:#2f6fb5;color:#fff;padding:8px 18px}
  .gr-tabel td{padding:8px 18px;border:1px solid #d9e2ec;text-align:center}
  .gr-tabel tr:nth-child(even) td{background:#f3f7fb}
  .gr-vraag{font-size:1.2rem;font-weight:700;margin:12px 0}
  .gr-context{color:#52667a;margin:4px 0}
  .gr-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px}
  .gr-badge{background:#eef3fa;border-radius:20px;padding:2px 12px;font-size:.9rem;font-weight:700;color:#2f6fb5}
  .gr-opties{display:flex;flex-direction:column;gap:8px;margin:8px 0}
  .gr-optie{display:flex;gap:10px;align-items:center;padding:10px 14px;border:2px solid #d9e2ec;border-radius:12px;background:#fff;font-size:1.1rem;cursor:pointer;text-align:left}
  .gr-optie[aria-pressed="true"]{border-color:#2f6fb5;background:#e8f1fb}
  .gr-invoer{font-size:1.4rem;padding:10px 14px;border:2px solid #9fb3c8;border-radius:12px;width:min(260px,100%)}
  .gr-uitleg{background:#f3f7fb;border-left:5px solid #2f6fb5;border-radius:8px;padding:10px 16px;margin:10px 0}
  .gr-uitleg ol{margin:6px 0 0 20px;padding:0}
  .gr-balk{height:12px;background:#e4ebf2;border-radius:8px;overflow:hidden}
  .gr-balk>span{display:block;height:100%;background:#2e9e6b}
  .gr-dash-rij{display:grid;grid-template-columns:150px 1fr 56px;gap:10px;align-items:center;margin:6px 0}
  @media (max-width:520px){.gr-dash-rij{grid-template-columns:110px 1fr 48px}.gr-pict__tabel td{font-size:1.3rem}}
  `;
  document.head.appendChild(s);
}
