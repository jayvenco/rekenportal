// exercises/schaal/afbeeldingen.js
// -----------------------------------------------------------------------------
// SVG-afbeeldingen voor "Rekenen op schaal", als tekst (geen DOM nodig):
//  - plattegrond: woning met muren A, B en C waarvan de maat op de tekening staat;
//  - kaart: stadsplattegrond met twee punten en de gemeten afstand;
//  - liniaal: schaalmodel (auto, boot, trein, vliegtuig) naast een liniaal.
// De lengtes in de tekeningen kloppen met de getoonde maten (px per cm), zodat
// een kind echt kan zien dat 8 cm langer is dan 3,5 cm.
// -----------------------------------------------------------------------------

import { nl, g } from "./opgaven.js";

const INKT = "#2b3340";
const ROOD = "#e0533d";
const BLAUW = "#2f6fb5";
const GROEN = "#2e9e6b";

/** Kleine, deterministische random generator (zelfde seed = zelfde tekening). */
function maakRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (x) => Math.round(x * 10) / 10;

function pijlHoofd(x, y, dx, dy, kleur) {
  // Pijlpunt in richting (dx, dy), punt op (x, y).
  const l = 9, b = 4.5;
  const px = -dy, py = dx;
  return `<polygon points="${f(x)},${f(y)} ${f(x - dx * l + px * b)},${f(y - dy * l + py * b)} ${f(x - dx * l - px * b)},${f(y - dy * l - py * b)}" fill="${kleur}"/>`;
}

/** Maatlijn met pijlpunten aan beide kanten en een label. */
function maatlijn(x1, y1, x2, y2, kleur) {
  const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${kleur}" stroke-width="2.5"/>` +
    pijlHoofd(x2, y2, dx, dy, kleur) + pijlHoofd(x1, y1, -dx, -dy, kleur);
}

function label(x, y, tekst, opties = {}) {
  const { grootte = 17, kleur = INKT, gewicht = 700, anker = "middle" } = opties;
  return `<text x="${f(x)}" y="${f(y)}" text-anchor="${anker}" font-size="${grootte}" font-weight="${gewicht}" fill="${kleur}" font-family="system-ui, sans-serif" paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">${tekst}</text>`;
}

const schaalTekst = (schaal) => (schaal ? `Schaal 1 : ${g(schaal)}` : "Schaal 1 : ?");

// =============================================================================
// Plattegrond
// =============================================================================

export const PLATTEGROND_PX_PER_CM = 20;

export function plattegrondSvg(afb) {
  const k = PLATTEGROND_PX_PER_CM;
  const { A, B, C } = afb.maten;
  const hb = 5; // hoogte onderste rij (cm op de tekening)
  const H = A + hb;
  const ox = 74, oy = 24;
  const breedte = ox + C * k + 84;
  const hoogte = oy + H * k + 66;
  const X = (cm) => f(ox + cm * k);
  const Y = (cm) => f(oy + cm * k);

  const w1 = Math.round(C * 0.4 * 2) / 2;
  const w2 = Math.round(C * 0.2 * 2) / 2;
  const wk = 4.5; // breedte keuken
  const onbekend = afb.onbekend || null;

  let s = `<svg viewBox="0 0 ${breedte} ${hoogte}" role="img" aria-label="Plattegrond van een woning met de muren A, B en C. ${schaalTekst(afb.schaal)}." style="width:100%;max-width:${breedte}px;height:auto">`;
  s += `<rect width="${breedte}" height="${hoogte}" fill="#fff" rx="12"/>`;

  // Vloeren
  s += `<rect x="${X(0)}" y="${Y(0)}" width="${C * k}" height="${H * k}" fill="#f2e3c8"/>`;
  s += `<rect x="${X(0)}" y="${Y(0)}" width="${w1 * k}" height="${A * k}" fill="#dfe9f7"/>`;
  s += `<rect x="${X(w1)}" y="${Y(0)}" width="${w2 * k}" height="${A * k}" fill="#e3f4f1"/>`;
  s += `<rect x="${X(w1 + w2)}" y="${Y(0)}" width="${(C - w1 - w2) * k}" height="${A * k}" fill="#dfe9f7"/>`;
  s += `<rect x="${X(C - wk)}" y="${Y(H - B)}" width="${wk * k}" height="${B * k}" fill="#eef0f3"/>`;

  // Meubels (bedden, bad, bank, tafel, keukenblok)
  const bed = (x0, breed) => {
    const bw = Math.min(2.6, breed - 0.8), bh = Math.min(3.4, A - 1.2);
    return `<rect x="${X(x0 + (breed - bw) / 2)}" y="${Y(0.6)}" width="${bw * k}" height="${bh * k}" rx="4" fill="#4a6fa5"/>` +
      `<rect x="${X(x0 + (breed - bw) / 2 + 0.2)}" y="${Y(0.8)}" width="${(bw - 0.4) * k}" height="${0.7 * k}" rx="3" fill="#fff"/>`;
  };
  s += bed(0, w1) + bed(w1 + w2, C - w1 - w2);
  s += `<rect x="${X(w1 + 0.4)}" y="${Y(0.4)}" width="${(w2 - 0.8) * k}" height="${1.4 * k}" rx="6" fill="#fff" stroke="#9fb7c9" stroke-width="2"/>`;
  s += `<circle cx="${X(w1 + w2 / 2)}" cy="${Y(A - 1)}" r="${0.45 * k}" fill="#fff" stroke="#9fb7c9" stroke-width="2"/>`;
  const bankY = H - 3.1;
  s += `<rect x="${X(0.6)}" y="${Y(bankY)}" width="${3.8 * k}" height="${1.1 * k}" rx="6" fill="#e8913a"/>`;
  s += `<ellipse cx="${X(2.5)}" cy="${Y(bankY - 1.3)}" rx="${1.3 * k}" ry="${0.7 * k}" fill="#a9703c"/>`;
  s += `<rect x="${X(C - wk + 0.2)}" y="${Y(H - B + 0.2)}" width="${(wk - 0.4) * k}" height="${0.8 * k}" fill="#b8bfc9"/>`;
  s += `<circle cx="${X(C - 1.2)}" cy="${Y(H - B + 0.6)}" r="${0.3 * k}" fill="#8fa1b5"/>`;

  // Binnenmuren (met openingen voor deuren)
  const muur = (x1, y1, x2, y2, dik = 4) =>
    `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${INKT}" stroke-width="${dik}" stroke-linecap="square"/>`;
  s += muur(w1, 0, w1, A - 1.4) + muur(w1 + w2, 0, w1 + w2, A - 1.4);
  s += muur(0, A, w1 * 0.4, A) + muur(w1 * 0.4 + 1, A, w1 + w2 + 0.8, A) + muur(w1 + w2 + 1.8, A, C, A);
  s += muur(C - wk, H - B, C - wk, H - B + B * 0.35) + muur(C - wk, H - B + B * 0.35 + 1.1, C - wk, H);
  s += muur(C - wk, H - B, C, H - B);
  // Deurbogen
  s += `<path d="M ${X(w1 * 0.4)} ${Y(A)} A ${k} ${k} 0 0 1 ${X(w1 * 0.4 + 1)} ${Y(A - 1)}" fill="none" stroke="#7b8794" stroke-width="1.5"/>`;

  // Buitenmuren: A, B, C in een kleur; de rest donker
  s += `<polyline points="${X(0)},${Y(A)} ${X(0)},${Y(H)} ${X(C)},${Y(H)}" fill="none" stroke="${INKT}" stroke-width="7" stroke-linejoin="miter"/>`;
  s += `<polyline points="${X(0)},${Y(0)} ${X(C)},${Y(0)} ${X(C)},${Y(H - B)}" fill="none" stroke="${INKT}" stroke-width="7"/>`;
  s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(A)}" stroke="${ROOD}" stroke-width="7"/>`;
  s += `<line x1="${X(C)}" y1="${Y(H - B)}" x2="${X(C)}" y2="${Y(H)}" stroke="${BLAUW}" stroke-width="7"/>`;
  s += `<line x1="${X(0)}" y1="${Y(H)}" x2="${X(C)}" y2="${Y(H)}" stroke="${GROEN}" stroke-width="7"/>`;

  // Maatlijnen
  const waarde = (letter, cm) => (onbekend === letter ? "? cm" : `${nl(cm)} cm`);
  // A links
  s += maatlijn(ox - 26, oy, ox - 26, oy + A * k, ROOD);
  s += label(ox - 46, oy + (A * k) / 2 - 6, "A", { kleur: ROOD, grootte: 19 });
  s += label(ox - 46, oy + (A * k) / 2 + 14, waarde("A", A), { grootte: 15, anker: "middle" });
  // B rechts
  s += maatlijn(ox + C * k + 24, oy + (H - B) * k, ox + C * k + 24, oy + H * k, BLAUW);
  s += label(ox + C * k + 50, oy + (H - B / 2) * k - 4, "B", { kleur: BLAUW, grootte: 19 });
  s += label(ox + C * k + 50, oy + (H - B / 2) * k + 16, waarde("B", B), { grootte: 15 });
  // C onder
  s += maatlijn(ox, oy + H * k + 22, ox + C * k, oy + H * k + 22, GROEN);
  s += label(ox + (C * k) / 2, oy + H * k + 44, `C  ${waarde("C", C)}`, { kleur: GROEN, grootte: 16 });
  // Schaal
  s += label(breedte - 12, hoogte - 10, schaalTekst(afb.schaal), { grootte: 14, anker: "end", gewicht: 600 });
  return s + "</svg>";
}

// =============================================================================
// Stadskaart
// =============================================================================

export const KAART_PX_PER_CM = 18;
const KAART_BLOB = "M 62 150 C 40 70 150 24 240 32 C 345 22 440 74 424 165 C 446 255 384 352 282 362 C 200 382 112 352 82 282 C 52 244 74 196 62 150 Z";
const KAART_MIDDEN = { x: 242, y: 196, a: 178, b: 146 };

function inBlob(p, factor) {
  const dx = (p.x - KAART_MIDDEN.x) / (KAART_MIDDEN.a * factor);
  const dy = (p.y - KAART_MIDDEN.y) / (KAART_MIDDEN.b * factor);
  return dx * dx + dy * dy <= 1;
}

function plaatsPunten(afstandPx, rnd) {
  for (let i = 0; i < 400; i += 1) {
    const hoek = rnd() * Math.PI * 2;
    const p1 = { x: KAART_MIDDEN.x + (rnd() - 0.5) * 2 * KAART_MIDDEN.a * 0.7, y: KAART_MIDDEN.y + (rnd() - 0.5) * 2 * KAART_MIDDEN.b * 0.7 };
    const p2 = { x: p1.x + Math.cos(hoek) * afstandPx, y: p1.y + Math.sin(hoek) * afstandPx };
    if (inBlob(p1, 0.92) && inBlob(p2, 0.92)) return [p1, p2];
  }
  return [{ x: KAART_MIDDEN.x - afstandPx / 2, y: KAART_MIDDEN.y }, { x: KAART_MIDDEN.x + afstandPx / 2, y: KAART_MIDDEN.y }];
}

const DAKKEN = ["#c8553d", "#b5483a", "#d9774c", "#a8523f", "#cf6a4f"];
const MUREN = ["#e9d9c4", "#f1e6d3", "#e3d0b8", "#ddd2c4"];

export function kaartSvg(afb) {
  const rnd = maakRandom(afb.seed || 1);
  const k = KAART_PX_PER_CM;
  const eenCm = afb.toonAfstand === "1 cm";
  const afstandPx = afb.afstand * k;
  const [p1, p2] = eenCm ? [null, null] : plaatsPunten(afstandPx, rnd);
  const clipId = `kaartklip-${afb.seed || 0}`;

  let s = `<svg viewBox="0 0 480 400" role="img" aria-label="Stadskaart. ${schaalTekst(afb.schaal)}." style="width:100%;max-width:480px;height:auto">`;
  s += `<defs><clipPath id="${clipId}"><path d="${KAART_BLOB}"/></clipPath></defs>`;
  s += `<rect width="480" height="400" fill="#fff" rx="12"/>`;
  s += `<path d="${KAART_BLOB}" fill="#7bb15a" stroke="#4f8a3a" stroke-width="3"/>`;
  s += `<g clip-path="url(#${clipId})">`;

  // Gebouwen
  for (let i = 0; i < 90; i += 1) {
    const x = 40 + rnd() * 400, y = 30 + rnd() * 340;
    if (!inBlob({ x, y }, 1.02)) continue;
    const w = 12 + rnd() * 12, h = 10 + rnd() * 10;
    const muur = MUREN[Math.floor(rnd() * MUREN.length)];
    const dak = DAKKEN[Math.floor(rnd() * DAKKEN.length)];
    s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="2" fill="${muur}" stroke="#8a7a66" stroke-width="1"/>`;
    s += `<polygon points="${f(x - 2)},${f(y + 2)} ${f(x + w + 2)},${f(y + 2)} ${f(x + w / 2)},${f(y - 6)}" fill="${dak}" opacity="0.9"/>`;
  }
  // Wegen (breed beige, over de gebouwen heen)
  const wegen = [
    "M 40 120 C 150 160 250 90 450 130",
    "M 60 260 C 160 220 300 290 440 240",
    "M 150 20 C 170 120 140 250 190 380",
    "M 300 20 C 280 120 330 250 290 380",
    "M 80 70 C 200 40 330 60 430 110",
    "M 110 330 C 220 300 300 330 400 310",
    "M 40 190 C 160 200 320 180 450 200",
  ];
  for (const d of wegen) {
    s += `<path d="${d}" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round"/>`;
    s += `<path d="${d}" fill="none" stroke="#f3dfb8" stroke-width="11" stroke-linecap="round"/>`;
  }
  // Park met vijver en bomen
  s += `<ellipse cx="344" cy="296" rx="38" ry="26" fill="#5f9f48"/><ellipse cx="338" cy="300" rx="16" ry="9" fill="#6db8e6" stroke="#fff" stroke-width="2"/>`;
  for (let i = 0; i < 9; i += 1) {
    const x = 310 + rnd() * 70, y = 276 + rnd() * 44;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(5 + rnd() * 3)}" fill="#3d7f34"/>`;
  }
  s += `<ellipse cx="130" cy="130" rx="30" ry="20" fill="#5f9f48"/>`;
  for (let i = 0; i < 6; i += 1) s += `<circle cx="${f(112 + rnd() * 36)}" cy="${f(118 + rnd() * 24)}" r="${f(5 + rnd() * 2)}" fill="#3d7f34"/>`;
  s += `</g>`;

  if (eenCm) {
    // Referentiebalk van 1 cm
    const x0 = 120, y0 = 210;
    s += `<rect x="${x0 - 14}" y="${y0 - 36}" width="${k + 28}" height="58" rx="8" fill="#fff" opacity="0.92"/>`;
    s += maatlijn(x0, y0, x0 + k, y0, ROOD);
    s += label(x0 + k / 2, y0 - 12, "1 cm", { kleur: ROOD, grootte: 16 });
  } else {
    // Twee punten met de gemeten afstand
    s += `<line x1="${f(p1.x)}" y1="${f(p1.y)}" x2="${f(p2.x)}" y2="${f(p2.y)}" stroke="${ROOD}" stroke-width="3" stroke-dasharray="7 5"/>`;
    const markering = (p, tekst, kleur, icoon) =>
      `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="13" fill="${kleur}" stroke="#fff" stroke-width="3"/>` +
      `<text x="${f(p.x)}" y="${f(p.y + 5)}" text-anchor="middle" font-size="15">${icoon}</text>` +
      label(p.x, p.y + 32, tekst, { grootte: 14 });
    s += markering(p1, afb.van, "#2f6fb5", "🏠");
    s += markering(p2, afb.naar, "#e8913a", "📍");
    const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
    const tekst = afb.toonAfstand || `${nl(afb.afstand)} cm`;
    s += `<rect x="${f(mx - 30)}" y="${f(my - 14)}" width="60" height="24" rx="12" fill="#fff" stroke="${ROOD}" stroke-width="2"/>`;
    s += `<text x="${f(mx)}" y="${f(my + 3)}" text-anchor="middle" font-size="15" font-weight="800" fill="${ROOD}" font-family="system-ui, sans-serif">${tekst}</text>`;
  }
  s += label(466, 392, schaalTekst(afb.schaal), { grootte: 14, anker: "end", gewicht: 600 });
  return s + "</svg>";
}

// =============================================================================
// Schaalmodel naast een liniaal
// =============================================================================

export const LINIAAL_PX_PER_CM = 44;

function modelSvg(model, kleur) {
  const sw = `stroke="${INKT}" stroke-width="2" vector-effect="non-scaling-stroke"`;
  switch (model) {
    case "boot":
      return { h: 0.34, svg:
        `<path d="M0 0.2 L1 0.2 L0.88 0.32 L0.1 0.32 Z" fill="${kleur}" ${sw}/>` +
        `<rect x="0.36" y="0.12" width="0.26" height="0.08" fill="#fff" ${sw}/>` +
        `<line x1="0.5" y1="0.0" x2="0.5" y2="0.12" ${sw}/>` +
        `<path d="M0.52 0.0 L0.52 0.11 L0.8 0.11 Z" fill="#fff" ${sw}/>` };
    case "trein":
      return { h: 0.34, svg:
        `<rect x="0" y="0.04" width="1" height="0.22" rx="0.03" fill="${kleur}" ${sw}/>` +
        [0.1, 0.27, 0.44, 0.61, 0.78].map((x) => `<rect x="${x}" y="0.09" width="0.1" height="0.08" fill="#dff1ff" ${sw}/>`).join("") +
        `<line x1="0" y1="0.22" x2="1" y2="0.22" ${sw}/>` +
        `<circle cx="0.14" cy="0.3" r="0.04" fill="${INKT}"/><circle cx="0.3" cy="0.3" r="0.04" fill="${INKT}"/>` +
        `<circle cx="0.7" cy="0.3" r="0.04" fill="${INKT}"/><circle cx="0.86" cy="0.3" r="0.04" fill="${INKT}"/>` };
    case "vliegtuig":
      return { h: 0.4, svg:
        `<path d="M0.06 0.2 L0.0 0.04 L0.16 0.2 Z" fill="${kleur}" ${sw}/>` +
        `<ellipse cx="0.52" cy="0.2" rx="0.48" ry="0.065" fill="#fff" ${sw}/>` +
        `<path d="M0.4 0.23 L0.62 0.23 L0.5 0.4 L0.38 0.4 Z" fill="${kleur}" ${sw}/>` +
        `<path d="M0.4 0.17 L0.6 0.17 L0.5 0.03 L0.38 0.03 Z" fill="${kleur}" opacity="0.7" ${sw}/>` +
        [0.62, 0.68, 0.74, 0.8].map((x) => `<circle cx="${x}" cy="0.19" r="0.012" fill="${INKT}"/>`).join("") };
    default: // auto
      return { h: 0.4, svg:
        `<rect x="0" y="0.17" width="1" height="0.13" rx="0.03" fill="${kleur}" ${sw}/>` +
        `<path d="M0.2 0.17 L0.3 0.04 L0.66 0.04 L0.8 0.17 Z" fill="${kleur}" ${sw}/>` +
        `<path d="M0.27 0.16 L0.34 0.07 L0.47 0.07 L0.47 0.16 Z M0.5 0.16 L0.5 0.07 L0.63 0.07 L0.72 0.16 Z" fill="#dff1ff" ${sw}/>` +
        `<circle cx="0.2" cy="0.31" r="0.065" fill="${INKT}"/><circle cx="0.8" cy="0.31" r="0.065" fill="${INKT}"/>` +
        `<circle cx="0.2" cy="0.31" r="0.025" fill="#fff"/><circle cx="0.8" cy="0.31" r="0.025" fill="#fff"/>` };
  }
}

export function liniaalSvg(afb) {
  const k = LINIAAL_PX_PER_CM;
  const L = afb.lengte;
  const W = L * k;
  const x0 = 28;
  const maxCm = Math.ceil(L) + 1;
  const kleuren = { auto: "#e0533d", boot: "#2f6fb5", trein: "#2e9e6b", vliegtuig: "#e8913a" };
  const m = modelSvg(afb.model, kleuren[afb.model] || "#2f6fb5");
  const hObj = m.h * W;
  const yRuler = 16 + hObj + 14;
  const breedte = x0 + maxCm * k + 50;
  const hoogte = yRuler + 62;

  let s = `<svg viewBox="0 0 ${breedte} ${hoogte}" role="img" aria-label="Een schaalmodel naast een liniaal. ${schaalTekst(afb.schaal)}." style="width:100%;max-width:${breedte}px;height:auto">`;
  s += `<rect width="${breedte}" height="${hoogte}" fill="#fff" rx="12"/>`;
  // Model (staat op de liniaal, linkerkant precies bij de 0)
  s += `<g transform="translate(${x0} 16) scale(${f(W)})">${m.svg}</g>`;
  // Hulplijnen aan beide kanten van het model
  s += `<line x1="${x0}" y1="${f(16 + hObj)}" x2="${x0}" y2="${yRuler}" stroke="${ROOD}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  s += `<line x1="${f(x0 + W)}" y1="${f(16 + hObj)}" x2="${f(x0 + W)}" y2="${yRuler}" stroke="${ROOD}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  // Liniaal
  s += `<rect x="${x0 - 16}" y="${yRuler}" width="${maxCm * k + 52}" height="46" rx="4" fill="#ffe28a" stroke="#b58900" stroke-width="2"/>`;
  for (let mm = 0; mm <= maxCm * 10; mm += 1) {
    const x = x0 + (mm / 10) * k;
    const len = mm % 10 === 0 ? 20 : mm % 5 === 0 ? 14 : 8;
    s += `<line x1="${f(x)}" y1="${yRuler}" x2="${f(x)}" y2="${yRuler + len}" stroke="${INKT}" stroke-width="${mm % 10 === 0 ? 2 : 1}"/>`;
    if (mm % 10 === 0) s += `<text x="${f(x)}" y="${yRuler + 38}" text-anchor="middle" font-size="15" font-weight="700" fill="${INKT}" font-family="system-ui, sans-serif">${mm / 10}</text>`;
  }
  s += `<text x="${x0 + maxCm * k + 16}" y="${yRuler + 38}" text-anchor="start" font-size="13" font-weight="700" fill="#7a5a00" font-family="system-ui, sans-serif">cm</text>`;
  s += label(breedte - 10, 16, schaalTekst(afb.schaal), { grootte: 14, anker: "end", gewicht: 600 });
  return s + "</svg>";
}

// =============================================================================

/** Geeft de SVG-tekst voor een opgave-afbeelding, of "" als er geen is. */
export function afbeeldingSvg(afb) {
  if (!afb) return "";
  if (afb.soort === "plattegrond") return plattegrondSvg(afb);
  if (afb.soort === "kaart") return kaartSvg(afb);
  if (afb.soort === "liniaal") return liniaalSvg(afb);
  return "";
}
