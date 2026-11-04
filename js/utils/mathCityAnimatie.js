// utils/mathCityAnimatie.js
// -----------------------------------------------------------------------------
// "Math City – Bouw je eigen stad!" — derde voortgangsanimatie. Een isometrische
// cartoonwereld (SVG) waarin elk beantwoord opgave één gebouw oplevert:
//
//   correctAnswers      -> volledig gebouwd huis/rijtjeshuis/appartement/flat
//   firstAttemptErrors  -> half ingestort gebouw (eerste poging fout, tweede
//                          poging goed: het gebouw kan nog gerepareerd worden)
//   secondAttemptErrors -> volledig ingestort gebouw (ook de tweede poging fout)
//
// Aantal gebouwen en hun toestand komen exact overeen met die drie aantallen.
// Zonder tekstlabels boven gebouwen; de hele stad blijft in één beeld.
//
// API (zelfde vorm als de andere voortgangsanimaties):
//   goedAntwoord(pogingNummer = 1)  - 1: volledig gebouw, 2: half ingestort
//   foutAntwoord()                  - volledig ingestort gebouw
//   reset()
//   zetResultaten({ correctAnswers, firstAttemptErrors, secondAttemptErrors })
// -----------------------------------------------------------------------------

const NS = "http://www.w3.org/2000/svg";
const TW = 72;
const TH = 36;
const OX = 328;
const OY = 120;
const KOLOMMEN = 10;
const RIJEN = 6;
const MAX_GEBOUWEN = KOLOMMEN * RIJEN;

const WANDEN = ["#ff9f80", "#ffd36e", "#8fd3ff", "#b9e68a", "#ffb3d1", "#c9b3ff", "#ffe0a8", "#9be0d0", "#f7a8a8", "#a9c8ff"];
const DAKEN = ["#e0533d", "#c0392b", "#8e5ea2", "#2f6fb5", "#d98c2b", "#4f9d69"];
const TYPES = ["huisje", "appartement", "rijtje", "flat", "huisje", "rijtje", "appartement", "flat"];

const beweegGraag = () => !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

// ---- Kleine hulpfuncties ---------------------------------------------------

function mix(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  const k = (c) => Math.max(0, Math.min(255, Math.round(factor > 0 ? c + (255 - c) * factor : c * (1 + factor))));
  const r = k((n >> 16) & 255), g = k((n >> 8) & 255), b = k(n & 255);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function rnd(seed) {
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const pt = (i, j, z = 0) => `${(OX + ((i - j) * TW) / 2).toFixed(1)},${(OY + ((i + j) * TH) / 2 - z).toFixed(1)}`;
const poly = (punten, vul, extra = "") => `<polygon points="${punten.join(" ")}" fill="${vul}" ${extra}/>`;

function element(html) {
  const g = document.createElementNS(NS, "g");
  g.innerHTML = html;
  return g;
}

/** Een kubus/blok met drie zichtbare vlakken; geeft de losse vlak-functies terug. */
function blok(ci, cj, w, d, h, z0, kleur, opties = {}) {
  const rechts = [pt(ci + w / 2, cj - d / 2, z0), pt(ci + w / 2, cj + d / 2, z0), pt(ci + w / 2, cj + d / 2, z0 + h), pt(ci + w / 2, cj - d / 2, z0 + h)];
  const links = [pt(ci - w / 2, cj + d / 2, z0), pt(ci + w / 2, cj + d / 2, z0), pt(ci + w / 2, cj + d / 2, z0 + h), pt(ci - w / 2, cj + d / 2, z0 + h)];
  const boven = [pt(ci - w / 2, cj - d / 2, z0 + h), pt(ci + w / 2, cj - d / 2, z0 + h), pt(ci + w / 2, cj + d / 2, z0 + h), pt(ci - w / 2, cj + d / 2, z0 + h)];
  const lijn = opties.rand === false ? "" : 'stroke="rgba(0,0,0,.18)" stroke-width="1" stroke-linejoin="round"';
  return poly(rechts, mix(kleur, -0.12), lijn) + poly(links, mix(kleur, -0.28), lijn) + (opties.zonderTop ? "" : poly(boven, mix(kleur, 0.18), lijn));
}

/** Raam op het rechtervlak (u langs j, v hoogte) of linkervlak (u langs i). */
function raam(ci, cj, w, d, z0, h, vlak, u0, u1, v0, v1, kleur = "#bfe6ff") {
  const f = vlak === "rechts"
    ? (u, v) => pt(ci + w / 2, cj - d / 2 + u * d, z0 + v * h)
    : (u, v) => pt(ci - w / 2 + u * w, cj + d / 2, z0 + v * h);
  const tint = vlak === "rechts" ? mix(kleur, -0.08) : mix(kleur, -0.22);
  return poly([f(u0, v0), f(u1, v0), f(u1, v1), f(u0, v1)], tint, 'stroke="rgba(255,255,255,.75)" stroke-width="1.2"');
}

function raamRooster(ci, cj, w, d, z0, h, kolommen, rijen) {
  let s = "";
  for (const vlak of ["rechts", "links"]) {
    for (let c = 0; c < kolommen; c += 1) {
      for (let r = 0; r < rijen; r += 1) {
        const u0 = (c + 0.2) / kolommen, u1 = (c + 0.8) / kolommen;
        const v0 = (r + 0.25) / rijen, v1 = (r + 0.72) / rijen;
        s += raam(ci, cj, w, d, z0, h, vlak, u0, u1, v0, v1, (c + r) % 5 === 0 ? "#ffe9a8" : "#bfe6ff");
      }
    }
  }
  return s;
}

/** Zadeldak langs de j-as bovenop een blok. */
function zadeldak(ci, cj, w, d, z0, rh, kleur, muur) {
  const o = 0.05;
  const rechtsVlak = [pt(ci + w / 2 + o, cj - d / 2 - o, z0), pt(ci + w / 2 + o, cj + d / 2 + o, z0), pt(ci, cj + d / 2 + o, z0 + rh), pt(ci, cj - d / 2 - o, z0 + rh)];
  const linksVlak = [pt(ci - w / 2 - o, cj + d / 2 + o, z0), pt(ci + w / 2 + o, cj + d / 2 + o, z0), pt(ci, cj + d / 2 + o, z0 + rh)];
  return poly(linksVlak, mix(muur, -0.1), 'stroke="rgba(0,0,0,.15)"') + poly(rechtsVlak, mix(kleur, -0.05), 'stroke="rgba(0,0,0,.2)" stroke-linejoin="round"');
}

function schaduw(ci, cj, w, d) {
  const [x, y] = pt(ci, cj).split(",").map(Number);
  return `<ellipse cx="${x + 6}" cy="${y + 4}" rx="${(w + d) * 22}" ry="${(w + d) * 10}" fill="rgba(0,60,0,.22)"/>`;
}

// ---- Gebouwen --------------------------------------------------------------

function bouwHuisje(ci, cj, k) {
  const w = 0.6, d = 0.62, h = 26;
  const muur = WANDEN[k.muur], dak = DAKEN[k.dak];
  return (
    schaduw(ci, cj, w, d) +
    blok(ci, cj, w, d, h, 0, muur) +
    zadeldak(ci, cj, w, d, h, 18, dak, muur) +
    raam(ci, cj, w, d, 0, h, "rechts", 0.2, 0.42, 0.4, 0.75) +
    raam(ci, cj, w, d, 0, h, "rechts", 0.58, 0.8, 0.4, 0.75) +
    poly([pt(ci - 0.12, cj + d / 2, 0), pt(ci + 0.08, cj + d / 2, 0), pt(ci + 0.08, cj + d / 2, 15), pt(ci - 0.12, cj + d / 2, 15)], "#8a5a34", 'stroke="rgba(0,0,0,.25)"') +
    raam(ci, cj, w, d, 0, h, "links", 0.72, 0.9, 0.42, 0.78) +
    blok(ci + 0.12, cj - 0.1, 0.1, 0.1, 12, h + 6, "#b0603f", { rand: false })
  );
}

function bouwRijtje(ci, cj, k) {
  const w = 0.5, totD = 0.94, n = 3, d = totD / n, h = 24;
  let s = schaduw(ci, cj, w, totD);
  for (let m = 0; m < n; m += 1) {
    const cjm = cj - totD / 2 + d * (m + 0.5);
    const kleur = WANDEN[(k.muur + m * 3) % WANDEN.length];
    s += blok(ci, cjm, w, d, h, 0, kleur);
    s += raam(ci, cjm, w, d, 0, h, "rechts", 0.2, 0.8, 0.4, 0.78);
    s += poly([pt(ci - 0.08, cjm + d / 2 - 0.0, 0), pt(ci + 0.04, cjm + d / 2, 0), pt(ci + 0.04, cjm + d / 2, 13), pt(ci - 0.08, cjm + d / 2, 13)], "#8a5a34", 'stroke="rgba(0,0,0,.2)"');
  }
  s += zadeldak(ci, cj, w, totD, h, 14, DAKEN[k.dak], WANDEN[k.muur]);
  return s;
}

function bouwAppartement(ci, cj, k) {
  const w = 0.8, d = 0.8, h = 46, muur = WANDEN[k.muur];
  return (
    schaduw(ci, cj, w, d) +
    blok(ci, cj, w, d, h, 0, muur) +
    raamRooster(ci, cj, w, d, 0, h, 3, 3) +
    poly([pt(ci - 0.1, cj + d / 2, 0), pt(ci + 0.1, cj + d / 2, 0), pt(ci + 0.1, cj + d / 2, 12), pt(ci - 0.1, cj + d / 2, 12)], "#6b4a2e", 'stroke="rgba(0,0,0,.25)"') +
    blok(ci, cj, w * 0.9, d * 0.9, 4, h, mix(muur, -0.25)) +
    blok(ci + 0.15, cj - 0.1, 0.22, 0.22, 10, h + 4, DAKEN[k.dak])
  );
}

function bouwFlat(ci, cj, k) {
  const w = 0.55, d = 0.55, h = 84, muur = WANDEN[k.muur];
  return (
    schaduw(ci, cj, w, d) +
    blok(ci, cj, w, d, h, 0, muur) +
    raamRooster(ci, cj, w, d, 0, h, 2, 6) +
    poly([pt(ci - 0.08, cj + d / 2, 0), pt(ci + 0.08, cj + d / 2, 0), pt(ci + 0.08, cj + d / 2, 10), pt(ci - 0.08, cj + d / 2, 10)], "#6b4a2e", 'stroke="rgba(0,0,0,.25)"') +
    blok(ci, cj, w * 0.8, d * 0.8, 6, h, DAKEN[k.dak]) +
    `<line x1="${pt(ci, cj, h + 6).split(",")[0]}" y1="${pt(ci, cj, h + 6).split(",")[1]}" x2="${pt(ci, cj, h + 24).split(",")[0]}" y2="${pt(ci, cj, h + 24).split(",")[1]}" stroke="#555" stroke-width="2"/>` +
    `<circle cx="${pt(ci, cj, h + 24).split(",")[0]}" cy="${pt(ci, cj, h + 24).split(",")[1]}" r="2.6" fill="#e0533d"/>`
  );
}

/** Hoopje bakstenen, balken en stukken muur: volledig ingestort. */
function bouwPuin(ci, cj, k, seed) {
  const r = rnd(seed + 7);
  let s = schaduw(ci, cj, 0.8, 0.8);
  const [gx, gy] = pt(ci, cj).split(",").map(Number);
  s += `<ellipse cx="${gx}" cy="${gy + 2}" rx="33" ry="16" fill="#b9a587" opacity=".85"/>`;
  const muur = WANDEN[k.muur];
  // Omgevallen muurplaten (plat op de grond)
  for (let n = 0; n < 2; n += 1) {
    const di = (r() - 0.5) * 0.4, dj = (r() - 0.5) * 0.4;
    const kl = [muur, mix(muur, -0.2)][n];
    s += poly([pt(ci + di - 0.22, cj + dj - 0.08, 3), pt(ci + di + 0.22, cj + dj - 0.1, 3), pt(ci + di + 0.24, cj + dj + 0.1, 5), pt(ci + di - 0.2, cj + dj + 0.12, 4)], kl, 'stroke="rgba(0,0,0,.25)" stroke-linejoin="round"');
    s += raam(ci + di, cj + dj, 0.4, 0.2, 3, 2, "links", 0.3, 0.55, 0, 0, "#bfe6ff");
  }
  // Losse bakstenen
  const brik = ["#c9573d", "#b34a33", "#d9795c", "#9c4a38", "#caa07a"];
  for (let n = 0; n < 15; n += 1) {
    const di = (r() - 0.5) * 0.9, dj = (r() - 0.5) * 0.9;
    s += blok(ci + di, cj + dj, 0.13 + r() * 0.1, 0.09 + r() * 0.07, 4 + r() * 8, 2 + (n % 3) * 3, brik[n % brik.length], { rand: false });
  }
  // Kapot dak (schuin stuk) en balken
  s += poly([pt(ci - 0.3, cj + 0.15, 2), pt(ci - 0.05, cj + 0.3, 10), pt(ci + 0.05, cj + 0.22, 12), pt(ci - 0.18, cj + 0.05, 5)], DAKEN[k.dak], 'stroke="rgba(0,0,0,.25)" stroke-linejoin="round"');
  const [bx, by] = pt(ci + 0.1, cj - 0.1, 6).split(",").map(Number);
  s += `<line x1="${bx - 14}" y1="${by - 8}" x2="${bx + 12}" y2="${by + 4}" stroke="#8a5a34" stroke-width="3.2" stroke-linecap="round"/>`;
  s += `<line x1="${bx - 6}" y1="${by + 4}" x2="${bx + 18}" y2="${by - 6}" stroke="#a87442" stroke-width="2.6" stroke-linecap="round"/>`;
  // Veiligheidskegel (vrolijk, niet eng)
  const [kx, ky] = pt(ci + 0.35, cj + 0.35).split(",").map(Number);
  s += `<polygon points="${kx - 5},${ky} ${kx + 5},${ky} ${kx + 2},${ky - 12} ${kx - 2},${ky - 12}" fill="#ff8a2b"/><rect x="${kx - 3.5}" y="${ky - 7}" width="7" height="2.4" fill="#fff"/>`;
  return s;
}

/** Gedeeltelijk ingestort: muren staan deels nog, dak weg, blauw zeil erover. */
function bouwHalfIngestort(ci, cj, k, seed) {
  const r = rnd(seed + 3);
  const w = 0.62, d = 0.66, h = 30, muur = WANDEN[k.muur];
  const lijn = 'stroke="rgba(0,0,0,.2)" stroke-linejoin="round"';
  let s = schaduw(ci, cj, w, d);
  // Linkerwand (j+): staat nog, met kapot bovenrandje
  const lh = [h, h * 0.92, h * 0.7, h * 0.85, h * 0.5];
  const lPunten = [pt(ci - w / 2, cj + d / 2, 0), pt(ci + w / 2, cj + d / 2, 0)];
  for (let n = 4; n >= 0; n -= 1) lPunten.push(pt(ci - w / 2 + (w * n) / 4, cj + d / 2, lh[4 - n]));
  s += poly(lPunten, mix(muur, -0.28), lijn);
  // Rechterwand (i+): lager, met gat
  const rh = [h * 0.35, h * 0.6, h * 0.3, h * 0.72, h * 0.55];
  const rPunten = [pt(ci + w / 2, cj - d / 2, 0), pt(ci + w / 2, cj + d / 2, 0)];
  for (let n = 4; n >= 0; n -= 1) rPunten.push(pt(ci + w / 2, cj - d / 2 + (d * (4 - n)) / 4, rh[n]));
  s += poly(rPunten, mix(muur, -0.12), lijn);
  // Achterwand-rest (donker, binnenkant)
  s += poly([pt(ci - w / 2, cj - d / 2, 0), pt(ci + w / 2, cj - d / 2, 0), pt(ci + w / 2, cj - d / 2, h * 0.5), pt(ci - w / 2, cj - d / 2, h * 0.75)], mix(muur, -0.42), lijn);
  // Vloer / binnenkant
  s += poly([pt(ci - w / 2, cj - d / 2, 1), pt(ci + w / 2, cj - d / 2, 1), pt(ci + w / 2, cj + d / 2, 1), pt(ci - w / 2, cj + d / 2, 1)], "rgba(60,40,30,.35)");
  // Raam in de nog staande wand
  s += raam(ci, cj, w, d, 0, h * 0.7, "links", 0.15, 0.4, 0.3, 0.8);
  // Neergevallen dakdeel en bakstenen
  s += poly([pt(ci + 0.28, cj + 0.3, 1), pt(ci + 0.55, cj + 0.18, 1), pt(ci + 0.5, cj + 0.5, 9), pt(ci + 0.22, cj + 0.58, 8)], DAKEN[k.dak], lijn);
  const brik = ["#c9573d", "#b34a33", "#d9795c"];
  for (let n = 0; n < 6; n += 1) {
    const di = (r() - 0.5) * 1.0, dj = 0.5 + r() * 0.2;
    s += blok(ci + di, cj + dj, 0.1, 0.07, 3 + r() * 4, 0, brik[n % 3], { rand: false });
  }
  // Blauw zeil over het gat (laat zien dat het gerepareerd wordt)
  s += poly([pt(ci - 0.05, cj - 0.28, h * 0.62), pt(ci + 0.3, cj - 0.28, h * 0.5), pt(ci + 0.3, cj + 0.05, h * 0.42), pt(ci - 0.05, cj + 0.05, h * 0.58)], "#4aa3e8", 'stroke="rgba(255,255,255,.6)" stroke-width="1.5" opacity=".92"');
  // Steigerpaal
  const [px, py] = pt(ci + w / 2 + 0.08, cj + d / 2 + 0.05).split(",").map(Number);
  s += `<line x1="${px}" y1="${py}" x2="${px}" y2="${py - 40}" stroke="#d9a548" stroke-width="3"/><line x1="${px - 8}" y1="${py - 22}" x2="${px + 8}" y2="${py - 22}" stroke="#d9a548" stroke-width="3"/>`;
  return s;
}

function bouwGebouw(status, i, j, index) {
  const k = { muur: (index * 3 + 1) % WANDEN.length, dak: (index * 2 + 1) % DAKEN.length };
  const type = TYPES[index % TYPES.length];
  if (status === "ingestort") return bouwPuin(i, j, k, index);
  if (status === "half") return bouwHalfIngestort(i, j, k, index);
  if (type === "rijtje") return bouwRijtje(i, j, k);
  if (type === "appartement") return bouwAppartement(i, j, k);
  if (type === "flat") return bouwFlat(i, j, k);
  return bouwHuisje(i, j, k);
}

// ---- Bouwmachines en decor ---------------------------------------------------

function sm(naam, attrs, kind = "animate") {
  return `<${kind} ${Object.entries(attrs).map(([a, b]) => `${a}="${b}"`).join(" ")} repeatCount="indefinite"/>`;
}

function torenkraan(beweeg) {
  const animJib = beweeg ? sm("jib", { attributeName: "transform", type: "rotate", values: "-3 0 -128;3 0 -128;-3 0 -128", dur: "9s", calcMode: "spline", keySplines: ".4 0 .6 1;.4 0 .6 1", keyTimes: "0;.5;1" }, "animateTransform") : "";
  const animHaak = beweeg ? sm("haak", { attributeName: "transform", type: "translate", values: "0 0;0 16;0 0", dur: "5s", calcMode: "spline", keySplines: ".4 0 .6 1;.4 0 .6 1", keyTimes: "0;.5;1" }, "animateTransform") : "";
  let steun = "";
  for (let y = 0; y > -118; y -= 16) steun += `<path d="M-6 ${y} L6 ${y - 16} M6 ${y} L-6 ${y - 16}" stroke="#c9961f" stroke-width="1.6" fill="none"/>`;
  return `
  <ellipse cx="4" cy="3" rx="26" ry="9" fill="rgba(0,60,0,.25)"/>
  <polygon points="-18,0 18,0 14,-8 -14,-8" fill="#8f8f98" stroke="rgba(0,0,0,.25)"/>
  <rect x="-6" y="-128" width="12" height="122" fill="#ffc933" stroke="#c9961f" stroke-width="1.5"/>${steun}
  <g>${animJib}
    <rect x="-70" y="-136" width="150" height="9" rx="2" fill="#ffc933" stroke="#c9961f" stroke-width="1.5"/>
    <path d="M-62 -127 L-50 -136 L-38 -127 L-26 -136 L-14 -127 L-2 -136 L10 -127 L22 -136 L34 -127 L46 -136 L58 -127 L70 -136" stroke="#c9961f" stroke-width="1.4" fill="none"/>
    <rect x="-72" y="-133" width="20" height="22" rx="3" fill="#7d8591" stroke="rgba(0,0,0,.3)"/>
    <rect x="-8" y="-146" width="16" height="12" rx="3" fill="#ffd86b" stroke="#c9961f"/>
    <rect x="-3" y="-143" width="8" height="6" fill="#bfe6ff"/>
    <g transform="translate(52 0)"><g>${animHaak}
      <line x1="0" y1="-127" x2="0" y2="-82" stroke="#444" stroke-width="1.6"/>
      <rect x="-9" y="-82" width="18" height="12" rx="2" fill="#c9573d" stroke="rgba(0,0,0,.3)"/>
      <rect x="-9" y="-76" width="18" height="2" fill="#e8d4b0"/>
    </g></g>
  </g>`;
}

function graafmachine(beweeg) {
  const boom = beweeg ? sm("boom", { attributeName: "transform", type: "rotate", values: "-6 12 -26;10 12 -26;-6 12 -26", dur: "6s", calcMode: "spline", keySplines: ".4 0 .6 1;.4 0 .6 1", keyTimes: "0;.5;1" }, "animateTransform") : "";
  const stok = beweeg ? sm("stok", { attributeName: "transform", type: "rotate", values: "6 -26 -52;-14 -26 -52;6 -26 -52", dur: "6s", calcMode: "spline", keySplines: ".4 0 .6 1;.4 0 .6 1", keyTimes: "0;.5;1" }, "animateTransform") : "";
  return `
  <ellipse cx="2" cy="2" rx="36" ry="9" fill="rgba(0,60,0,.25)"/>
  <rect x="-30" y="-12" width="60" height="14" rx="7" fill="#3a3f4a"/>
  <circle cx="-20" cy="-5" r="4" fill="#6b7280"/><circle cx="0" cy="-5" r="4" fill="#6b7280"/><circle cx="20" cy="-5" r="4" fill="#6b7280"/>
  <rect x="-22" y="-30" width="40" height="20" rx="4" fill="#ffc933" stroke="#c9961f" stroke-width="1.5"/>
  <path d="M6 -30 L6 -46 Q6 -50 10 -50 L24 -50 Q28 -50 28 -46 L28 -30 Z" fill="#ffd86b" stroke="#c9961f" stroke-width="1.5"/>
  <rect x="11" y="-46" width="13" height="12" rx="2" fill="#bfe6ff"/>
  <g>${boom}
    <path d="M12 -26 L-26 -52 L-30 -45 L8 -19 Z" fill="#ffc933" stroke="#c9961f" stroke-width="1.5"/>
    <g>${stok}
      <path d="M-26 -52 L-46 -26 L-40 -22 L-20 -48 Z" fill="#ffd86b" stroke="#c9961f" stroke-width="1.5"/>
      <path d="M-46 -26 L-56 -22 L-52 -10 L-38 -14 Z" fill="#6b7280" stroke="#3a3f4a" stroke-width="1.5"/>
    </g>
  </g>
  <rect x="-24" y="-42" width="6" height="12" fill="#444"/>
  ${rook(-21, -44, beweeg)}`;
}

function bulldozer(beweeg) {
  const heen = beweeg ? sm("heen", { attributeName: "transform", type: "translate", values: "0 0;-34 0;0 0", dur: "8s", calcMode: "spline", keySplines: ".4 0 .6 1;.4 0 .6 1", keyTimes: "0;.5;1" }, "animateTransform") : "";
  return `
  <ellipse cx="2" cy="2" rx="36" ry="9" fill="rgba(0,60,0,.25)"/>
  <g>${heen}
    <rect x="-24" y="-12" width="54" height="14" rx="7" fill="#3a3f4a"/>
    <circle cx="-14" cy="-5" r="4" fill="#6b7280"/><circle cx="4" cy="-5" r="4" fill="#6b7280"/><circle cx="22" cy="-5" r="4" fill="#6b7280"/>
    <rect x="-16" y="-30" width="40" height="20" rx="4" fill="#ffc933" stroke="#c9961f" stroke-width="1.5"/>
    <rect x="2" y="-46" width="22" height="18" rx="3" fill="#ffd86b" stroke="#c9961f" stroke-width="1.5"/>
    <rect x="6" y="-43" width="14" height="10" rx="2" fill="#bfe6ff"/>
    <rect x="-24" y="-38" width="5" height="12" fill="#444"/>
    <path d="M-30 -30 L-44 -34 L-46 -6 L-30 -8 Z" fill="#e8913a" stroke="#a8620f" stroke-width="1.5"/>
    ${rook(-21.5, -40, beweeg)}
  </g>`;
}

function betonmixer(beweeg) {
  const draai = beweeg ? sm("draai", { attributeName: "transform", type: "rotate", values: "0 0 0;360 0 0", dur: "3s" }, "animateTransform") : "";
  return `
  <ellipse cx="2" cy="2" rx="42" ry="9" fill="rgba(0,60,0,.25)"/>
  <rect x="-40" y="-14" width="84" height="10" rx="3" fill="#59616f"/>
  <path d="M26 -14 L26 -34 Q26 -38 30 -38 L40 -38 L46 -26 L46 -14 Z" fill="#ff8a2b" stroke="#b85a0b" stroke-width="1.5"/>
  <rect x="32" y="-34" width="9" height="10" fill="#bfe6ff"/>
  <defs><clipPath id="mc-trommel"><ellipse cx="0" cy="0" rx="26" ry="17"/></clipPath></defs>
  <g transform="translate(-6 -30) rotate(-12)">
    <ellipse cx="0" cy="0" rx="26" ry="17" fill="#e6e9ee" stroke="#8d95a3" stroke-width="2"/>
    <g clip-path="url(#mc-trommel)"><g>${draai}
      <path d="M-34 -10 L-10 -22 L-4 -14 L-28 -2 Z M-8 8 L16 -4 L22 4 L-2 16 Z M18 -18 L34 -26 L38 -18 L22 -10 Z" fill="#ff8a2b"/>
    </g></g>
    <ellipse cx="0" cy="0" rx="26" ry="17" fill="none" stroke="#8d95a3" stroke-width="2"/>
  </g>
  <circle cx="-26" cy="-6" r="7" fill="#2c3038"/><circle cx="-26" cy="-6" r="3" fill="#aab"/>
  <circle cx="-6" cy="-6" r="7" fill="#2c3038"/><circle cx="-6" cy="-6" r="3" fill="#aab"/>
  <circle cx="34" cy="-6" r="7" fill="#2c3038"/><circle cx="34" cy="-6" r="3" fill="#aab"/>`;
}

function kiepwagen(kleur = "#ff8a2b") {
  return `
  <ellipse cx="0" cy="2" rx="40" ry="6" fill="rgba(0,0,0,.18)"/>
  <rect x="-40" y="-14" width="80" height="9" rx="3" fill="#59616f"/>
  <path d="M-38 -14 L-34 -34 L8 -34 L12 -14 Z" fill="#b08a5a" stroke="#7a5a30" stroke-width="1.5"/>
  <path d="M-34 -34 L8 -34 L6 -40 L-30 -40 Z" fill="#8a6a40"/>
  <path d="M16 -14 L16 -32 Q16 -36 20 -36 L30 -36 L38 -24 L38 -14 Z" fill="${kleur}" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/>
  <rect x="21" y="-32" width="9" height="9" fill="#bfe6ff"/>
  <circle cx="-26" cy="-5" r="7" fill="#2c3038"/><circle cx="-26" cy="-5" r="3" fill="#aab"/>
  <circle cx="-10" cy="-5" r="7" fill="#2c3038"/><circle cx="-10" cy="-5" r="3" fill="#aab"/>
  <circle cx="28" cy="-5" r="7" fill="#2c3038"/><circle cx="28" cy="-5" r="3" fill="#aab"/>`;
}

function bouwvakker(beweeg, vertraging = 0) {
  const op = beweeg ? sm("w", { attributeName: "transform", type: "translate", values: "0 0;0 -2.5;0 0", dur: "0.9s", begin: `${vertraging}s` }, "animateTransform") : "";
  return `
  <ellipse cx="0" cy="1" rx="6" ry="2.4" fill="rgba(0,0,0,.2)"/>
  <g>${op}
    <rect x="-3.2" y="-8" width="2.6" height="8" rx="1" fill="#2f6fb5"/><rect x="0.6" y="-8" width="2.6" height="8" rx="1" fill="#2f6fb5"/>
    <rect x="-5" y="-17" width="10" height="11" rx="3" fill="#ff8a2b"/>
    <rect x="-5" y="-12" width="10" height="2" fill="#fff59a"/>
    <circle cx="0" cy="-21" r="4.6" fill="#f3c7a2"/>
    <path d="M-5.4 -22 Q0 -29 5.4 -22 Z" fill="#ffd21f" stroke="#c9961f" stroke-width=".8"/>
    <rect x="-6.4" y="-22.4" width="12.8" height="1.8" rx=".8" fill="#ffd21f"/>
  </g>`;
}

function rook(x, y, beweeg) {
  if (!beweeg) return "";
  let s = "";
  for (let n = 0; n < 3; n += 1) {
    s += `<circle cx="${x}" cy="${y}" r="3" fill="#fff" opacity="0">
      ${sm("a", { attributeName: "cy", values: `${y};${y - 22}`, dur: "2.4s", begin: `${n * 0.8}s` })}
      ${sm("a", { attributeName: "r", values: "2;7", dur: "2.4s", begin: `${n * 0.8}s` })}
      ${sm("a", { attributeName: "opacity", values: "0;.75;0", dur: "2.4s", begin: `${n * 0.8}s` })}
    </circle>`;
  }
  return s;
}

function boom(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="3" cy="3" rx="20" ry="6" fill="rgba(0,60,0,.22)"/><rect x="-4" y="-22" width="8" height="24" rx="2" fill="#8a5a34"/>
    <circle cx="0" cy="-36" r="19" fill="#4fae5a"/><circle cx="-12" cy="-26" r="13" fill="#5cc069"/><circle cx="12" cy="-27" r="13" fill="#47a352"/><circle cx="-5" cy="-42" r="9" fill="#6ccb77" opacity=".7"/></g>`;
}

function wolk(x, y, s, dur, begin) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity=".95">${beweegGraag() ? sm("w", { attributeName: "transform", type: "translate", values: `0 0;60 0;0 0`, dur: `${dur}s`, begin: `${begin}s` }, "animateTransform") : ""}
    <ellipse cx="0" cy="0" rx="46" ry="16" fill="#fff"/><ellipse cx="-22" cy="-10" rx="24" ry="17" fill="#fff"/><ellipse cx="14" cy="-14" rx="28" ry="20" fill="#fff"/><ellipse cx="2" cy="6" rx="46" ry="9" fill="#e9f3fb"/></g>`;
}

// ---- Scène -----------------------------------------------------------------

function volgordeLots() {
  const lots = [];
  const r = rnd(42);
  for (let i = 0; i < KOLOMMEN; i += 1) for (let j = 0; j < RIJEN; j += 1) lots.push({ i, j, d: Math.hypot((i - 4.5) * 0.9, (j - 2.5) * 1.5) + r() * 0.9 });
  lots.sort((a, b) => a.d - b.d);
  return lots.map(({ i, j }) => ({ i, j }));
}

function bouwScene(beweeg, metMachines) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 800 460");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Een stad met huisjes en flats; elke goed beantwoorde som is een gebouw, fouten zijn ingestorte of half ingestorte gebouwen.");
  svg.style.width = "100%";
  svg.style.height = "auto";
  svg.style.display = "block";
  svg.style.borderRadius = "16px";

  let tegels = "";
  for (let i = 0; i < KOLOMMEN; i += 1) {
    for (let j = 0; j < RIJEN; j += 1) {
      tegels += poly([pt(i - 0.5, j - 0.5), pt(i + 0.5, j - 0.5), pt(i + 0.5, j + 0.5), pt(i - 0.5, j + 0.5)], (i + j) % 2 ? "#8fdc6a" : "#9be676", 'stroke="rgba(255,255,255,.18)"');
    }
  }
  const hoek = (i, j) => pt(i, j);
  const dikte = 14;
  const [lx, ly] = hoek(-0.5, RIJEN - 0.5).split(",").map(Number);
  const [bx, by] = hoek(KOLOMMEN - 0.5, RIJEN - 0.5).split(",").map(Number);
  const [rx, ry] = hoek(KOLOMMEN - 0.5, -0.5).split(",").map(Number);
  const platform = `
    <polygon points="${lx},${ly} ${bx},${by} ${bx},${by + dikte} ${lx},${ly + dikte}" fill="#7a5a3a"/>
    <polygon points="${bx},${by} ${rx},${ry} ${rx},${ry + dikte} ${bx},${by + dikte}" fill="#8f6b45"/>
    <polygon points="${lx},${ly} ${bx},${by} ${bx},${by + 5} ${lx},${ly + 5}" fill="#6fcf4f"/>
    <polygon points="${bx},${by} ${rx},${ry} ${rx},${ry + 5} ${bx},${by + 5}" fill="#63bf46"/>
    ${tegels}`;

  const bloemen = Array.from({ length: 26 }, (_, n) => {
    const r = rnd(n + 100);
    const x = r() * 800, y = 150 + r() * 300;
    const inPlatform = x > 110 && x < 690 && y > 100 && y < 395;
    return inPlatform ? "" : `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="2.6" fill="${["#fff", "#ffd36e", "#ff9fb8"][n % 3]}"/>`;
  }).join("");

  svg.innerHTML = `
    <defs>
      <linearGradient id="mc-lucht" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58b8f0"/><stop offset="1" stop-color="#bfe8fb"/></linearGradient>
      <linearGradient id="mc-gras" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#79d35a"/><stop offset="1" stop-color="#4fb53f"/></linearGradient>
      <radialGradient id="mc-zon"><stop offset="0" stop-color="#fff7a8"/><stop offset=".55" stop-color="#ffd84a"/><stop offset="1" stop-color="#ffb81f"/></radialGradient>
    </defs>
    <rect width="800" height="460" fill="url(#mc-lucht)"/>
    <g transform="translate(715 62)">
      <g>${beweeg ? sm("z", { attributeName: "transform", type: "rotate", values: "0;360", dur: "90s" }, "animateTransform") : ""}
        ${Array.from({ length: 12 }, (_, n) => `<rect x="-3" y="-52" width="6" height="16" rx="3" fill="#ffd84a" opacity=".7" transform="rotate(${n * 30})"/>`).join("")}
      </g>
      <circle r="31" fill="url(#mc-zon)"/>
      <circle cx="-10" cy="-10" r="8" fill="#fff" opacity=".35"/>
    </g>
    ${wolk(120, 55, 1, 40, 0)}${wolk(380, 40, 0.8, 55, -10)}${wolk(560, 95, 0.65, 48, -20)}
    <ellipse cx="150" cy="140" rx="190" ry="30" fill="#8bd86e"/><ellipse cx="620" cy="138" rx="230" ry="34" fill="#7fd063"/>
    <rect x="0" y="122" width="800" height="338" fill="url(#mc-gras)"/>
    ${bloemen}
    ${boom(40, 160, 0.9)}${boom(760, 175, 1)}${boom(60, 420, 1.1)}${boom(770, 400, 1)}
    <rect x="0" y="404" width="800" height="40" fill="#6b727c"/>
    <rect x="0" y="402" width="800" height="4" fill="#9aa1ab"/><rect x="0" y="442" width="800" height="4" fill="#9aa1ab"/>
    ${Array.from({ length: 14 }, (_, n) => `<rect x="${n * 60 + 8}" y="422" width="34" height="4" rx="2" fill="#f4e36b"/>`).join("")}
    ${platform}
  `;

  const dyn = document.createElementNS(NS, "g");
  svg.appendChild(dyn);

  const statisch = [];
  if (metMachines) {
    const plaats = (html, x, y, schaal = 1, spiegel = false) => {
      const g = document.createElementNS(NS, "g");
      g.setAttribute("transform", `translate(${x} ${y}) scale(${spiegel ? -schaal : schaal} ${schaal})`);
      g.innerHTML = html;
      statisch.push({ y, el: g });
    };
    plaats(torenkraan(beweeg), 86, 205, 1);
    plaats(torenkraan(beweeg), 724, 245, 0.95, true);
    plaats(graafmachine(beweeg), 62, 318, 1);
    plaats(bulldozer(beweeg), 736, 340, 1, true);
    plaats(betonmixer(beweeg), 158, 372, 0.95);
    for (const [x, y, v] of [[118, 268, 0], [196, 345, 0.3], [708, 300, 0.5], [660, 372, 0.2], [120, 338, 0.7]]) plaats(bouwvakker(beweeg, v), x, y, 1.15);
    // Rijdende vrachtwagens op de weg
    const vrachtwagen = (richting, dur, begin, kleur) => {
      const g = document.createElementNS(NS, "g");
      const spiegel = richting < 0 ? "scale(-1 1)" : "";
      g.innerHTML = `<g transform="translate(${richting > 0 ? 0 : 800} 438)"><g>${beweeg ? sm("r", { attributeName: "transform", type: "translate", values: richting > 0 ? "-90 0;890 0" : "90 0;-890 0", dur: `${dur}s`, begin: `${begin}s` }, "animateTransform") : ""}<g transform="${spiegel}">${kiepwagen(kleur)}${rook(-42, -10, beweeg)}</g></g></g>`;
      if (!beweeg) g.firstElementChild.setAttribute("transform", `translate(${richting > 0 ? 300 : 520} 438)`);
      statisch.push({ y: 438, el: g });
    };
    vrachtwagen(1, 16, 0, "#ff8a2b");
    vrachtwagen(-1, 22, -8, "#4aa3e8");
  }

  return { svg, dyn, statisch };
}

// ---- Publieke animatie -------------------------------------------------------

let laatsteStatussen = [];

/** Bouwt Math City in `container` en geeft de besturingsfuncties terug. */
export function maakMathCityAnimatie(container, doelAantal) {
  const beweeg = beweegGraag();
  const wrap = document.createElement("div");
  wrap.className = "math-city";
  wrap.style.cssText = "width:100%;max-width:520px;margin:0 auto 10px;position:relative";
  const scene = bouwScene(beweeg, true);
  wrap.appendChild(scene.svg);

  const teller = document.createElement("div");
  teller.style.cssText = "display:flex;gap:14px;justify-content:center;flex-wrap:wrap;font-weight:800;margin-top:6px;font-size:1rem";
  wrap.appendChild(teller);
  container.appendChild(wrap);

  const lots = volgordeLots();
  const items = [];
  const statussen = [];
  const dynamisch = [];

  const invoegen = (item) => {
    let plek = items.findIndex((x) => x.y > item.y);
    if (plek === -1) plek = items.length;
    const ref = items[plek]?.el || null;
    items.splice(plek, 0, item);
    scene.dyn.insertBefore(item.el, ref);
  };
  scene.statisch.forEach(invoegen);

  function bijwerkenTeller() {
    const n = (s) => statussen.filter((x) => x === s).length;
    teller.innerHTML = `<span title="Gebouwd">🏠 ${n("goed")}</span><span title="Half ingestort, te herstellen">🛠️ ${n("half")}</span><span title="Ingestort">🧱 ${n("ingestort")}</span><span style="color:#52667a">${statussen.length} / ${doelAantal}</span>`;
  }

  function voegToe(status, animeren) {
    if (statussen.length >= MAX_GEBOUWEN) return;
    const index = statussen.length;
    const lot = lots[index];
    statussen.push(status);
    laatsteStatussen = [...statussen];

    const buiten = document.createElementNS(NS, "g");
    const binnen = document.createElementNS(NS, "g");
    binnen.innerHTML = bouwGebouw(status, lot.i, lot.j, index);
    buiten.appendChild(binnen);
    const [, gy] = pt(lot.i, lot.j).split(",").map(Number);
    const nieuwItem = { y: gy, el: buiten };
    dynamisch.push(nieuwItem);
    invoegen(nieuwItem);

    if (animeren && beweeg && binnen.animate) {
      if (status === "goed") {
        binnen.animate([{ transform: "translateY(-90px)", opacity: 0 }, { transform: "translateY(4px)", opacity: 1, offset: 0.7 }, { transform: "translateY(0)", opacity: 1 }], { duration: 900, easing: "cubic-bezier(.3,.7,.4,1)" });
      } else {
        binnen.animate([{ transform: "translateY(-60px) scale(1.1)", opacity: 0 }, { transform: "translateY(0) scale(1)", opacity: 1 }], { duration: 650, easing: "ease-in" });
      }
      const [px, py] = pt(lot.i, lot.j).split(",").map(Number);
      const stof = document.createElementNS(NS, "g");
      stof.innerHTML = [-14, 0, 14].map((dx) => `<circle cx="${px + dx}" cy="${py}" r="9" fill="#fff" opacity="0"/>`).join("");
      buiten.appendChild(stof);
      [...stof.children].forEach((c, n) => c.animate([{ opacity: 0.8, transform: "translateY(0) scale(.5)" }, { opacity: 0, transform: "translateY(-26px) scale(1.7)" }], { duration: 1100, delay: 450 + n * 70, easing: "ease-out", fill: "forwards" }).finished?.then(() => c.remove()));
    }
    bijwerkenTeller();
  }

  function wisAlles() {
    for (const item of dynamisch) {
      item.el.remove();
      const n = items.indexOf(item);
      if (n >= 0) items.splice(n, 1);
    }
    dynamisch.length = 0;
    statussen.length = 0;
    laatsteStatussen = [];
    bijwerkenTeller();
  }

  bijwerkenTeller();

  return {
    goedAntwoord(pogingNummer = 1) {
      voegToe(pogingNummer >= 2 ? "half" : "goed", true);
    },
    foutAntwoord() {
      voegToe("ingestort", true);
    },
    reset: wisAlles,
    /** Zet de stad exact op de aangeleverde resultaten (geen animatie). */
    zetResultaten({ correctAnswers = 0, firstAttemptErrors = 0, secondAttemptErrors = 0 }) {
      wisAlles();
      const lijst = [
        ...Array(Math.max(0, correctAnswers)).fill("goed"),
        ...Array(Math.max(0, firstAttemptErrors)).fill("half"),
        ...Array(Math.max(0, secondAttemptErrors)).fill("ingestort"),
      ];
      const r = rnd(7);
      for (let n = lijst.length - 1; n > 0; n -= 1) {
        const m = Math.floor(r() * (n + 1));
        [lijst[n], lijst[m]] = [lijst[m], lijst[n]];
      }
      lijst.forEach((s) => voegToe(s, false));
    },
    element: wrap,
  };
}

/** Eindscherm: de stad zoals die gebouwd is, met het behaalde percentage. */
export function toonMathCityEindAnimatie(container, pct) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "width:100%;max-width:600px;margin:8px auto";
  const scene = bouwScene(beweegGraag(), true);
  wrap.appendChild(scene.svg);
  const lots = volgordeLots();
  const items = [];
  const invoegen = (item) => {
    let plek = items.findIndex((x) => x.y > item.y);
    if (plek === -1) plek = items.length;
    items.splice(plek, 0, item);
    scene.dyn.insertBefore(item.el, items[plek + 1]?.el || null);
  };
  scene.statisch.forEach(invoegen);
  laatsteStatussen.slice(0, MAX_GEBOUWEN).forEach((status, index) => {
    const lot = lots[index];
    const g = element(bouwGebouw(status, lot.i, lot.j, index));
    invoegen({ y: Number(pt(lot.i, lot.j).split(",")[1]), el: g });
  });
  const tekst = document.createElement("p");
  tekst.style.cssText = "text-align:center;font-weight:800;font-size:1.2rem;margin:6px 0";
  tekst.textContent = `${laatsteStatussen.filter((s) => s === "goed").length} gebouwen gebouwd — ${Math.round(pct)}% goed!`;
  wrap.appendChild(tekst);
  container.appendChild(wrap);
  return wrap;
}
