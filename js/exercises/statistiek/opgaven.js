// exercises/statistiek/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor statistiek-opgaven (groep 8).
// Vier categorieën: cirkeldiagram/staafgrafiek, gemiddelde/mediaan/modus,
// tabellen aflezen, turven/frequentie.
// Alle antwoorden zijn gehele getallen.
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig, schudArray } from "../../utils/willekeurig.js";

// =============================================================================
// HULP: kleurnamen voor grafieken
// =============================================================================

const KLEUREN = [
  { naam: "rood", hex: "#e74c3c" },
  { naam: "blauw", hex: "#3498db" },
  { naam: "groen", hex: "#2ecc71" },
  { naam: "geel", hex: "#f1c40f" },
  { naam: "paars", hex: "#9b59b6" },
  { naam: "oranje", hex: "#e67e22" },
  { naam: "roze", hex: "#e91e63" },
  { naam: "bruin", hex: "#795548" },
];

const LABELS = [
  "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag",
  "Zaterdag", "Zondag",
  "Jan", "Feb", "Maa", "Apr", "Mei", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dec",
];

// =============================================================================
// CATEGORIE 1 — Cirkeldiagram / Staafgrafiek interpreteren
// =============================================================================

/**
 * Genereert een inline SVG-staafdiagram met 3-5 staven en een vraag.
 * Vraagtypes: "Hoeveel is <label>?" (direct aflezen),
 *             "<A> en <B> samen" (optellen),
 *             "Hoeveel meer <A> dan <B>" (verschil)
 */
function genereerStaafgrafiekOpgave() {
  const aantalStaven = randomGeheelGetal(3, 5);
  const staven = [];
  for (let i = 0; i < aantalStaven; i++) {
    const kleur = kiesWillekeurig(KLEUREN);
    const label = kiesWillekeurig(LABELS);
    const hoogte = randomGeheelGetal(1, 10);
    staven.push({ kleur, label, hoogte });
  }

  // Kies een vraagtype
  const vraagType = randomGeheelGetal(0, 2);

  let vraagTekst, antwoordGoed;
  const svg = maakStaafdiagramSvg(staven);

  if (vraagType === 0) {
    // Direct aflezen van één staaf
    const staaf = kiesWillekeurig(staven);
    vraagTekst = `${svg}<p style="font-size:18px;font-weight:600;margin-top:12px;">Hoeveel eenheden heeft de staaf "${staaf.label}"?</p>`;
    antwoordGoed = staaf.hoogte;
  } else if (vraagType === 1) {
    // Twee staven optellen
    const [a, b] = kiesTweeVerschillend(staven);
    vraagTekst = `${svg}<p style="font-size:18px;font-weight:600;margin-top:12px;">Hoeveel eenheden zijn "${a.label}" en "${b.label}" samen?</p>`;
    antwoordGoed = a.hoogte + b.hoogte;
  } else {
    // Verschil tussen twee staven
    const [a, b] = kiesTweeVerschillend(staven);
    const hoogste = a.hoogte >= b.hoogte ? a : b;
    const laagste = a.hoogte >= b.hoogte ? b : a;
    vraagTekst = `${svg}<p style="font-size:18px;font-weight:600;margin-top:12px;">Hoeveel meer eenheden heeft "${hoogste.label}" dan "${laagste.label}"?</p>`;
    antwoordGoed = hoogste.hoogte - laagste.hoogte;
  }

  return {
    type: "staafgrafiek",
    htmlVraag: true,
    vraagTekst,
    antwoordGoed,
    meta: { categorie: "staafgrafiek" },
  };
}

/** Bouwt inline SVG voor een staafdiagram. */
function maakStaafdiagramSvg(staven) {
  const breedte = 280;
  const hoogte = 160;
  const margeOnder = 30;
  const margeLinks = 10;
  const margeBoven = 10;
  const plotBreedte = breedte - margeLinks - 10;
  const plotHoogte = hoogte - margeOnder - margeBoven;
  const maxWaarde = Math.max(...staven.map((s) => s.hoogte));
  const staafBreedte = Math.max(20, Math.floor(plotBreedte / staven.length) - 8);

  let svg = `<svg viewBox="0 0 ${breedte} ${hoogte}" style="max-width:${breedte}px;width:100%;height:auto;display:block;margin:0 auto;">`;
  svg += `<rect x="0" y="0" width="${breedte}" height="${hoogte}" fill="#fafafa" rx="4" />`;

  staven.forEach((staaf, i) => {
    const x = margeLinks + i * (staafBreedte + 8) + 4;
    const barHoogte = (staaf.hoogte / maxWaarde) * plotHoogte;
    const y = margeBoven + plotHoogte - barHoogte;
    svg += `<rect x="${x}" y="${y}" width="${staafBreedte}" height="${barHoogte}" rx="3" fill="${staaf.kleur.hex}" opacity="0.85" />`;
    // Label onder de staaf
    svg += `<text x="${x + staafBreedte / 2}" y="${hoogte - 6}" text-anchor="middle" font-size="11" fill="#555">${staaf.label}</text>`;
    // Waarde boven de staaf
    svg += `<text x="${x + staafBreedte / 2}" y="${y - 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#333">${staaf.hoogte}</text>`;
  });

  svg += `</svg>`;
  return svg;
}

/** Kiest twee verschillende elementen uit een array. */
function kiesTweeVerschillend(arr) {
  const [a, b] = schudArray(arr).slice(0, 2);
  return [a, b];
}

/** Genereert een cirkeldiagram-opgave (SVG taartdiagram + vraag). */
function genereerCirkelDiagramOpgave() {
  const aantalSectoren = randomGeheelGetal(3, 5);
  const sectoren = [];
  let totaal = 0;
  for (let i = 0; i < aantalSectoren; i++) {
    const kleur = kiesWillekeurig(KLEUREN);
    const label = kiesWillekeurig(LABELS);
    const waarde = randomGeheelGetal(3, 12);
    sectoren.push({ kleur, label, waarde });
    totaal += waarde;
  }

  const vraagType = randomGeheelGetal(0, 1);
  let vraagTekst, antwoordGoed;
  const svg = maakCirkelDiagramSvg(sectoren, totaal);

  if (vraagType === 0) {
    // Vraag naar één sector
    const sector = kiesWillekeurig(sectoren);
    vraagTekst = `${svg}<p style="font-size:18px;font-weight:600;margin-top:12px;">Hoeveel kinderen kozen "${sector.label}"?</p>`;
    antwoordGoed = sector.waarde;
  } else {
    // Totaal
    vraagTekst = `${svg}<p style="font-size:18px;font-weight:600;margin-top:12px;">Hoeveel kinderen deden mee aan de enquête?</p>`;
    antwoordGoed = totaal;
  }

  return {
    type: "cirkeldiagram",
    htmlVraag: true,
    vraagTekst,
    antwoordGoed,
    meta: { categorie: "cirkeldiagram" },
  };
}

/** Bouwt een cirkeldiagram in SVG. */
function maakCirkelDiagramSvg(sectoren, totaal) {
  const cx = 70, cy = 70, r = 55;
  let svg = `<svg viewBox="0 0 140 140" style="max-width:140px;width:100%;height:auto;display:block;margin:8px auto;">`;

  let startHoek = -90;
  sectoren.forEach((sector) => {
    const hoek = (sector.waarde / totaal) * 360;
    const eindHoek = startHoek + hoek;

    const x1 = cx + r * Math.cos((startHoek * Math.PI) / 180);
    const y1 = cy + r * Math.sin((startHoek * Math.PI) / 180);
    const x2 = cx + r * Math.cos((eindHoek * Math.PI) / 180);
    const y2 = cy + r * Math.sin((eindHoek * Math.PI) / 180);

    const largeArc = hoek > 180 ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
    svg += `<path d="${path}" fill="${sector.kleur.hex}" stroke="#fff" stroke-width="1.5" />`;

    startHoek = eindHoek;
  });

  // Legenda onder het diagram
  let legY = 150;
  svg += `<g font-size="10" fill="#333">`;
  sectoren.forEach((sector, i) => {
    const lx = 10 + (i % 2) * 65;
    const ly = legY + Math.floor(i / 2) * 16;
    svg += `<rect x="${lx}" y="${ly - 8}" width="10" height="10" fill="${sector.kleur.hex}" rx="2" />`;
    svg += `<text x="${lx + 14}" y="${ly}" dominant-baseline="middle">${sector.label} (${sector.waarde})</text>`;
  });
  svg += `</g>`;

  svg += `</svg>`;
  return svg;
}

// =============================================================================
// CATEGORIE 2 — Gemiddelde / Mediaan / Modus
// =============================================================================

/**
 * Genereert een dataset van 5-7 getallen (waarden 1-20).
 * Vraagtypes: gemiddelde (som % aantal == 0), mediaan, modus.
 */
function genereerGemiddeldeOpgave() {
  const aantal = randomGeheelGetal(5, 7);
  const data = genereerDatasetVoorType(aantal, "gemiddelde");
  const vraag = `Bereken het gemiddelde van deze getallen:<br><strong style="font-size:22px;">${data.join(", ")}</strong>`;
  const som = data.reduce((a, b) => a + b, 0);
  return {
    type: "gemiddelde",
    htmlVraag: true,
    vraagTekst: `<p style="font-size:16px;margin-bottom:4px;">${vraag}</p>`,
    antwoordGoed: som / aantal,
    meta: { categorie: "gemiddelde" },
  };
}

function genereerMediaanOpgave() {
  const aantal = randomGeheelGetal(5, 7);
  // Altijd oneven aantal zodat mediaan een getal in de dataset is
  const onevenAantal = aantal % 2 === 0 ? aantal + 1 : aantal;
  const data = genereerDatasetVoorType(onevenAantal, "mediaan");
  const gesorteerd = [...data].sort((a, b) => a - b);
  const vraag = `Bereken de mediaan (het midden) van deze getallen:<br><strong style="font-size:22px;">${data.join(", ")}</strong>`;
  return {
    type: "mediaan",
    htmlVraag: true,
    vraagTekst: `<p style="font-size:16px;margin-bottom:4px;">${vraag}</p>`,
    antwoordGoed: gesorteerd[Math.floor(gesorteerd.length / 2)],
    meta: { categorie: "gemiddelde" },
  };
}

function genereerModusOpgave() {
  const aantal = randomGeheelGetal(5, 7);
  const data = genereerDatasetMetModus(aantal);
  const vraag = `Wat is de modus (het getal dat het vaakst voorkomt)?<br><strong style="font-size:22px;">${data.join(", ")}</strong>`;
  // De modus is het getal dat 2+ keer voorkomt
  const freq = {};
  data.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
  let modus = null;
  let maxFreq = 0;
  for (const [getal, f] of Object.entries(freq)) {
    if (f > maxFreq) { maxFreq = f; modus = Number(getal); }
  }
  return {
    type: "modus",
    htmlVraag: true,
    vraagTekst: `<p style="font-size:16px;margin-bottom:4px;">${vraag}</p>`,
    antwoordGoed: modus,
    meta: { categorie: "gemiddelde" },
  };
}

/**
 * Genereert een dataset waarvan de som deelbaar is door het aantal.
 */
function genereerDatasetVoorType(aantal, type) {
  const data = [];
  for (let i = 0; i < aantal; i++) {
    data.push(randomGeheelGetal(1, 12));
  }

  if (type === "gemiddelde") {
    // Pas laatste waarde aan zodat som % aantal === 0
    const som = data.slice(0, -1).reduce((a, b) => a + b, 0);
    let laatste = randomGeheelGetal(1, 20);
    while ((som + laatste) % aantal !== 0) {
      laatste += 1;
      if (laatste > 30) { laatste = randomGeheelGetal(1, 10); }
    }
    data[data.length - 1] = laatste;
  }

  return schudArray(data);
}

/**
 * Genereert een dataset met één modus (een getal dat 2-3x voorkomt).
 */
function genereerDatasetMetModus(aantal) {
  const data = [];
  // Kies een modus-getal
  const modusGetal = randomGeheelGetal(3, 15);
  // Voeg het 2-3x toe
  const freqModus = randomGeheelGetal(2, 3);
  for (let i = 0; i < freqModus; i++) {
    data.push(modusGetal);
  }
  // Vul de rest met unieke getallen (zodat de modus uniek is)
  const rest = aantal - freqModus;
  for (let i = 0; i < rest; i++) {
    let g;
    do { g = randomGeheelGetal(1, 20); } while (g === modusGetal || data.includes(g));
    data.push(g);
  }
  return schudArray(data);
}

// =============================================================================
// CATEGORIE 3 — Tabellen aflezen
// =============================================================================

/**
 * Genereert een eenvoudige HTML-tabel (3-5 rijen, 2-3 kolommen) en vraagt
 * iets over de data.
 */
function genereerTabelOpgave() {
  const aantalRijen = randomGeheelGetal(3, 5);
  const rijen = [];

  // Kies een thema
  const thema = kiesWillekeurig([
    { titel: "Verkochte ijsjes per dag", kolom1: "Dag", kolom2: "Ijsjes" },
    { titel: "Punten per team", kolom1: "Team", kolom2: "Punten" },
    { titel: "Boeken gelezen per maand", kolom1: "Maand", kolom2: "Boeken" },
    { titel: "Lengte van leerlingen (cm)", kolom1: "Naam", kolom2: "Lengte" },
    { titel: "Afstand naar school (km)", kolom1: "Naam", kolom2: "Afstand" },
  ]);

  for (let i = 0; i < aantalRijen; i++) {
    const label = kiesWillekeurig(LABELS.filter((l) => !rijen.find((r) => r.label === l)));
    const waarde = randomGeheelGetal(2, 50);
    rijen.push({ label: label || `Rij ${i + 1}`, waarde });
  }

  // Bouw HTML-tabel
  let tabelHtml = `<table style="border-collapse:collapse;margin:8px auto;font-size:16px;">`;
  tabelHtml += `<thead><tr style="background:#f07a3d;color:#fff;">`;
  tabelHtml += `<th style="padding:6px 12px;border:1px solid #ddd;">${thema.kolom1}</th>`;
  tabelHtml += `<th style="padding:6px 12px;border:1px solid #ddd;">${thema.kolom2}</th>`;
  tabelHtml += `</tr></thead><tbody>`;
  rijen.forEach((rij) => {
    tabelHtml += `<tr>`;
    tabelHtml += `<td style="padding:4px 12px;border:1px solid #ddd;font-weight:600;">${rij.label}</td>`;
    tabelHtml += `<td style="padding:4px 12px;border:1px solid #ddd;text-align:center;">${rij.waarde}</td>`;
    tabelHtml += `</tr>`;
  });
  tabelHtml += `</tbody></table>`;

  // Vraagtype
  const vraagType = randomGeheelGetal(0, 2);
  let vraagTekst, antwoordGoed;

  if (vraagType === 0) {
    const rij = kiesWillekeurig(rijen);
    vraagTekst = `${tabelHtml}<p style="font-size:16px;font-weight:600;margin-top:8px;">Hoeveel ${thema.kolom2.toLowerCase()} had "${rij.label}"?</p>`;
    antwoordGoed = rij.waarde;
  } else if (vraagType === 1) {
    const totaal = rijen.reduce((s, r) => s + r.waarde, 0);
    vraagTekst = `${tabelHtml}<p style="font-size:16px;font-weight:600;margin-top:8px;">Wat is het totale aantal ${thema.kolom2.toLowerCase()}?</p>`;
    antwoordGoed = totaal;
  } else {
    // Verschil tussen hoogste en laagste
    const waarden = rijen.map((r) => r.waarde);
    const verschil = Math.max(...waarden) - Math.min(...waarden);
    vraagTekst = `${tabelHtml}<p style="font-size:16px;font-weight:600;margin-top:8px;">Wat is het verschil tussen de hoogste en laagste ${thema.kolom2.toLowerCase()}?</p>`;
    antwoordGoed = verschil;
  }

  return {
    type: "tabel",
    htmlVraag: true,
    vraagTekst,
    antwoordGoed,
    meta: { categorie: "tabel" },
  };
}

// =============================================================================
// CATEGORIE 4 — Turven / Frequentie
// =============================================================================

/**
 * Genereert een frequentietabel met turven en vraagt ernaar.
 */
function genereerTurvenOpgave() {
  const aantalRijen = randomGeheelGetal(3, 5);
  const rijen = [];

  for (let i = 0; i < aantalRijen; i++) {
    const waarde = i + 1; // 1, 2, 3, ...
    const freq = randomGeheelGetal(1, 10);
    rijen.push({ waarde, freq });
  }

  // Bouw HTML-tabel met turven
  let tabelHtml = `<table style="border-collapse:collapse;margin:8px auto;font-size:16px;">`;
  tabelHtml += `<thead><tr style="background:#f07a3d;color:#fff;">`;
  tabelHtml += `<th style="padding:6px 12px;border:1px solid #ddd;">Aantal</th>`;
  tabelHtml += `<th style="padding:6px 12px;border:1px solid #ddd;">Turven</th>`;
  tabelHtml += `<th style="padding:6px 12px;border:1px solid #ddd;">Frequentie</th>`;
  tabelHtml += `</tr></thead><tbody>`;

  rijen.forEach((rij) => {
    const turven = maakTurven(rij.freq);
    tabelHtml += `<tr>`;
    tabelHtml += `<td style="padding:4px 12px;border:1px solid #ddd;font-weight:600;text-align:center;">${rij.waarde}</td>`;
    tabelHtml += `<td style="padding:4px 12px;border:1px solid #ddd;font-size:18px;font-family:monospace;">${turven}</td>`;
    tabelHtml += `<td style="padding:4px 12px;border:1px solid #ddd;text-align:center;"><strong>?</strong></td>`;
    tabelHtml += `</tr>`;
  });
  tabelHtml += `</tbody></table>`;

  // Vraagtypes: direct aflezen of totaal
  const vraagType = randomGeheelGetal(0, 2);
  let vraagTekst, antwoordGoed;

  if (vraagType === 0) {
    const rij = kiesWillekeurig(rijen);
    vraagTekst = `${tabelHtml}<p style="font-size:16px;font-weight:600;margin-top:8px;">Hoe vaak komt ${rij.waarde} voor? (vul de frequentie in)</p>`;
    antwoordGoed = rij.freq;
  } else if (vraagType === 1) {
    const totaal = rijen.reduce((s, r) => s + r.freq, 0);
    vraagTekst = `${tabelHtml}<p style="font-size:16px;font-weight:600;margin-top:8px;">Hoeveel waarnemingen zijn er in totaal?</p>`;
    antwoordGoed = totaal;
  } else {
    // Verschil tussen hoogste en laagste frequentie
    const freqs = rijen.map((r) => r.freq);
    const verschil = Math.max(...freqs) - Math.min(...freqs);
    vraagTekst = `${tabelHtml}<p style="font-size:16px;font-weight:600;margin-top:8px;">Wat is het verschil tussen de hoogste en laagste frequentie?</p>`;
    antwoordGoed = verschil;
  }

  return {
    type: "turven",
    htmlVraag: true,
    vraagTekst,
    antwoordGoed,
    meta: { categorie: "turven" },
  };
}

/**
 * Maakt een turven-string (IIII = 4, doorgestreept op 5).
 */
function maakTurven(aantal) {
  let result = "";
  for (let i = 0; i < aantal; i++) {
    if (i > 0 && i % 5 === 0) {
      // Streep de eerste 4 door
      result = result.slice(0, -5) + "⧸".charAt(0); // use / through
      // Replace with a proper strikethrough representation
    }
    result += "|";
  }
  // Groepeer in blokjes van 5: IIII/  voor elke 5
  const groepen = Math.floor(aantal / 5);
  const rest = aantal % 5;

  let turvenStr = "";
  for (let g = 0; g < groepen; g++) {
    turvenStr += "||||/";
  }
  for (let r = 0; r < rest; r++) {
    turvenStr += "|";
  }
  return turvenStr;
}

// =============================================================================
// EXPORT: genereerOpgave + opgaveNaarSleutel
// =============================================================================

const CATEGORIE_GENERATORS = {
  staafgrafiek: () => {
    // 50/50 staafgrafiek of cirkeldiagram
    return Math.random() < 0.6 ? genereerStaafgrafiekOpgave() : genereerCirkelDiagramOpgave();
  },
  gemiddelde: () => {
    // Evenredig verdelen over gemiddelde, mediaan, modus
    const r = Math.random();
    if (r < 0.4) return genereerGemiddeldeOpgave();
    if (r < 0.7) return genereerMediaanOpgave();
    return genereerModusOpgave();
  },
  tabel: genereerTabelOpgave,
  turven: genereerTurvenOpgave,
};

/**
 * Genereert één opgave op basis van de gekozen instellingen.
 * @param {Object} instellingen - { categorieen: string[], aantalOpgaven: number }
 * @returns {Object} opgave-object.
 */
export function genereerOpgave(instellingen) {
  const categorieen = instellingen.categorieen;
  // Kies willekeurig een categorie uit de geselecteerde
  const categorie = kiesWillekeurig(categorieen);
  return CATEGORIE_GENERATORS[categorie]();
}

/** Maakt een unieke sleutel van een opgave, om herhaling binnen een sessie te voorkomen. */
export function opgaveNaarSleutel(opgave) {
  return `${opgave.type}_${opgave.meta.categorie}_${opgave.vraagTekst.slice(0, 80)}`;
}