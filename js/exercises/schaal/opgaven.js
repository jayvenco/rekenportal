// exercises/schaal/opgaven.js
// -----------------------------------------------------------------------------
// Opgaven voor "Rekenen op schaal" (groep 8). Zuivere logica, zonder DOM:
// elke opgave bevat de vraag, het juiste antwoord, een info-tekst, een hint,
// de uitleg in stappen en (optioneel) de gegevens voor een afbeelding
// (plattegrond, stadskaart of liniaal met schaalmodel).
//
// Alle berekeningen gaan via centimeters: 1 m = 100 cm, 1 km = 100 000 cm.
// Antwoorden zijn altijd "netjes": hooguit 2 decimalen.
// -----------------------------------------------------------------------------

import { kiesWillekeurig, randomGeheelGetal } from "../../utils/willekeurig.js";

export const CM_PER = { cm: 1, meter: 100, kilometer: 100000 };

export const SOORTEN = ["mix", "plattegrond", "kaart", "model", "reken"];

// ---- Hulpfuncties ------------------------------------------------------------

export function rond(x) {
  return Math.round(x * 1e6) / 1e6;
}

/** Nederlandse notatie: komma als decimaalteken, spatie bij grote getallen. */
export function nl(x) {
  const r = rond(x);
  const [heel, dec] = String(r).split(".");
  const groep = heel.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return dec ? `${groep},${dec}` : groep;
}

/** Schaalgetal met spatie als duizendtalscheiding: 25 000. */
export const g = (n) => nl(n);

export function isNetjes(x, maxDecimalen = 2) {
  const f = 10 ** maxDecimalen;
  return Number.isFinite(x) && Math.abs(x * f - Math.round(x * f)) < 1e-6;
}

const EENHEID_TEKST = { cm: "cm", meter: "meter", kilometer: "kilometer" };

/**
 * Kiest een eenheid waarin `cm` een nette waarde krijgt.
 * @returns {{eenheid:string, waarde:number}|null}
 */
function kiesEenheid(cm, opties, heel = false) {
  const geldig = [];
  for (const eenheid of opties) {
    const w = rond(cm / CM_PER[eenheid]);
    // Alleen een natuurlijke eenheid: geen "150 cm" (dat is 1,5 m) en geen "12 000 m" (dat is 12 km).
    const min = eenheid === "kilometer" ? 0.1 : 1;
    const max = eenheid === "cm" ? 100 : eenheid === "meter" ? 10000 : 99999;
    if (w >= min && w < max && isNetjes(w, heel ? 0 : 2)) geldig.push({ eenheid, waarde: w });
  }
  return geldig.length ? kiesWillekeurig(geldig) : null;
}

function tekenWaarde(niveau, min, max) {
  // Niveau 1: hele cm. Daarboven ook halve cm.
  const w = randomGeheelGetal(min, max);
  if (niveau === 1) return w;
  return Math.random() < 0.4 ? w + 0.5 : w;
}

// ---- Instellingen per niveau ---------------------------------------------------

const SCHALEN = {
  plattegrond: { 1: [50, 100], 2: [50, 100], 3: [50, 100, 200] },
  kaart: { 1: [10000, 100000], 2: [10000, 25000, 50000, 100000], 3: [10000, 25000, 50000, 100000, 200000] },
  reken: { 1: [10, 50, 100], 2: [20, 50, 100, 200, 500], 3: [20, 50, 100, 200, 500, 1000] },
};

const TYPES_PER_NIVEAU = {
  1: ["voor", "voor", "voor", "eenCm"],
  2: ["voor", "voor", "terug", "eenCm"],
  3: ["voor", "terug", "bepaal", "bepaal"],
};

// ---- Stappen/uitleg bouwers ------------------------------------------------------

function infoTekst(S) {
  if (S === null || S === undefined || S === "?") {
    return `Een <b>schaal 1 : N</b> betekent: <b>1 cm</b> op de tekening is <b>N cm</b> in het echt. ` +
      `Onthoud: 1 m = 100 cm en 1 km = 1000 m = 100 000 cm.`;
  }
  return `<b>Schaal 1 : ${g(S)}</b> betekent: <b>1 cm</b> op de tekening is <b>${g(S)} cm</b> in het echt. ` +
    `Onthoud: 1 m = 100 cm en 1 km = 1000 m = 100 000 cm.`;
}

/** Stappen voor tekening → echt. */
function stappenVoor(d, S, eenheid) {
  const echtCm = rond(d * S);
  const stappen = [
    `Schaal 1 : ${g(S)} betekent: 1 cm op de tekening is ${g(S)} cm in het echt.`,
    `${nl(d)} cm × ${g(S)} = <b>${nl(echtCm)} cm</b> in het echt.`,
  ];
  if (eenheid === "meter") stappen.push(`${nl(echtCm)} cm : 100 = <b>${nl(rond(echtCm / 100))} meter</b>.`);
  if (eenheid === "kilometer") {
    stappen.push(`${nl(echtCm)} cm : 100 = ${nl(rond(echtCm / 100))} meter.`);
    stappen.push(`${nl(rond(echtCm / 100))} m : 1000 = <b>${nl(rond(echtCm / 100000))} kilometer</b>.`);
  }
  return stappen;
}

function hintVoor(d, S, eenheid) {
  let tekst = `Vermenigvuldig ${nl(d)} met ${g(S)}: zo krijg je het antwoord in <b>cm</b>.`;
  if (eenheid === "meter") tekst += " Deel daarna door 100 om meters te krijgen.";
  if (eenheid === "kilometer") tekst += " Deel daarna door 100 (meters) en nog eens door 1000 (kilometers).";
  return tekst;
}

function tabelVoor(d, S, eenheid) {
  const echtCm = rond(d * S);
  const eind = eenheid === "cm" ? `${nl(echtCm)} cm` : `${nl(echtCm)} cm = ${nl(rond(echtCm / CM_PER[eenheid]))} ${eenheid === "meter" ? "m" : "km"}`;
  return [["Op de tekening", "In het echt"], ["1 cm", `${g(S)} cm`], [`${nl(d)} cm`, eind]];
}

/** Stappen voor echt → tekening. */
function stappenTerug(echtWaarde, echtEenheid, S, d) {
  const echtCm = rond(echtWaarde * CM_PER[echtEenheid]);
  const stappen = [];
  if (echtEenheid !== "cm") {
    stappen.push(`Reken eerst om naar cm: ${nl(echtWaarde)} ${echtEenheid === "meter" ? "m" : "km"} = <b>${nl(echtCm)} cm</b>.`);
  }
  stappen.push(`Schaal 1 : ${g(S)} betekent: op de tekening is alles ${g(S)} keer zo klein, dus <b>delen</b>.`);
  stappen.push(`${nl(echtCm)} cm : ${g(S)} = <b>${nl(d)} cm</b> op de tekening.`);
  return stappen;
}

function hintTerug(echtEenheid, S) {
  const eerst = echtEenheid === "cm" ? "" : `Reken eerst de echte lengte om naar <b>cm</b>${echtEenheid === "meter" ? " (× 100)" : " (× 100 000)"}. `;
  return `${eerst}Op de tekening is alles ${g(S)} keer zo klein: <b>deel</b> door ${g(S)}.`;
}

/** Stappen voor het bepalen van de schaal. */
function stappenBepaal(d, echtWaarde, echtEenheid, S) {
  const echtCm = rond(echtWaarde * CM_PER[echtEenheid]);
  const stappen = [];
  if (echtEenheid !== "cm") {
    stappen.push(`Reken de echte lengte om naar cm: ${nl(echtWaarde)} ${echtEenheid === "meter" ? "m" : "km"} = <b>${nl(echtCm)} cm</b>.`);
  }
  stappen.push(`${nl(d)} cm op de tekening is ${nl(echtCm)} cm in het echt.`);
  stappen.push(`Deel: ${nl(echtCm)} : ${nl(d)} = <b>${g(S)}</b>. Dus 1 cm op de tekening is ${g(S)} cm in het echt.`);
  stappen.push(`De schaal is <b>1 : ${g(S)}</b>.`);
  return stappen;
}

const HINT_BEPAAL = "Reken de echte lengte om naar <b>cm</b>. Deel die door het aantal cm op de tekening: het antwoord is het tweede getal van de schaal (1 : ?).";

function tabelBepaal(d, echtCm, S) {
  return [["Op de tekening", "In het echt"], [`${nl(d)} cm`, `${nl(echtCm)} cm`], ["1 cm", `<b>${g(S)} cm</b> (÷ ${nl(d)})`]];
}

// ---- Plattegrond ------------------------------------------------------------------

const MUREN = ["A", "B", "C"];

function plattegrondMaten(niveau) {
  return {
    A: tekenWaarde(niveau, 4, 8),
    B: tekenWaarde(niveau, 2, 4),
    C: tekenWaarde(niveau, 10, 14),
  };
}

function maakPlattegrond(niveau, type) {
  const S = kiesWillekeurig(SCHALEN.plattegrond[niveau]);
  const maten = plattegrondMaten(niveau);
  const muur = kiesWillekeurig(MUREN);
  const seed = randomGeheelGetal(1, 1e6);
  const basis = { soort: "plattegrond", maten, seed };

  if (type === "eenCm") {
    const echtCm = S;
    const k = kiesEenheid(echtCm, ["meter", "cm"]);
    if (!k) return null;
    return {
      afbeelding: { ...basis, schaal: S, gevraagd: null },
      vraag: `1 cm op deze plattegrond is in werkelijkheid?`,
      rapport: `Plattegrond 1 : ${g(S)}. 1 cm op de plattegrond is in werkelijkheid?`,
      eenheid: k.eenheid, antwoordGoed: k.waarde,
      info: infoTekst(S),
      hint: `1 cm op de tekening is ${g(S)} cm in het echt.` + (k.eenheid === "meter" ? " Reken die cm om naar meters: deel door 100." : ""),
      stappen: [`Schaal 1 : ${g(S)} betekent: 1 cm op de plattegrond is <b>${g(S)} cm</b> in het echt.`,
        ...(k.eenheid === "meter" ? [`${g(S)} cm : 100 = <b>${nl(k.waarde)} meter</b>.`] : [])],
      tabel: [["Op de plattegrond", "In het echt"], ["1 cm", k.eenheid === "meter" ? `${g(S)} cm = ${nl(k.waarde)} m` : `${g(S)} cm`]],
      S, type, soortTekst: "plattegrond",
    };
  }

  const d = maten[muur];
  if (type === "voor") {
    const k = kiesEenheid(d * S, ["meter", "cm"], niveau === 1);
    if (!k) return null;
    return {
      afbeelding: { ...basis, schaal: S, gevraagd: muur },
      vraag: `Hoe lang is muur <b>${muur}</b> in werkelijkheid?`,
      rapport: `Plattegrond 1 : ${g(S)}. Muur ${muur} is ${nl(d)} cm op de plattegrond. Hoe lang is muur ${muur} in werkelijkheid?`,
      eenheid: k.eenheid, antwoordGoed: k.waarde,
      info: infoTekst(S), hint: hintVoor(d, S, k.eenheid),
      stappen: stappenVoor(d, S, k.eenheid), tabel: tabelVoor(d, S, k.eenheid),
      S, type, soortTekst: "plattegrond",
    };
  }
  if (type === "terug") {
    const k = kiesEenheid(d * S, ["meter"]);
    if (!k) return null;
    return {
      afbeelding: { ...basis, schaal: S, gevraagd: muur, onbekend: muur },
      vraag: `Muur <b>${muur}</b> is in werkelijkheid <b>${nl(k.waarde)} meter</b> lang. Hoe lang is muur ${muur} op de plattegrond?`,
      rapport: `Plattegrond 1 : ${g(S)}. Muur ${muur} is in werkelijkheid ${nl(k.waarde)} m. Hoe lang is muur ${muur} op de plattegrond?`,
      eenheid: "cm", antwoordGoed: d,
      info: infoTekst(S), hint: hintTerug("meter", S),
      stappen: stappenTerug(k.waarde, "meter", S, d),
      tabel: [["Op de plattegrond", "In het echt"], ["1 cm", `${g(S)} cm`], [`<b>? cm</b>`, `${nl(k.waarde)} m = ${nl(k.waarde * 100)} cm`]],
      S, type, soortTekst: "plattegrond",
    };
  }
  // bepaal de schaal
  const k = kiesEenheid(d * S, ["meter"]);
  if (!k) return null;
  return {
    afbeelding: { ...basis, schaal: null, gevraagd: muur },
    vraag: `Muur <b>${muur}</b> is in werkelijkheid <b>${nl(k.waarde)} meter</b> lang. Wat is de schaal van deze plattegrond?`,
    rapport: `Plattegrond. Muur ${muur} is ${nl(d)} cm op de plattegrond en ${nl(k.waarde)} m in werkelijkheid. Wat is de schaal (1 : ?)`,
    voorvoegsel: "1 :", eenheid: "", antwoordGoed: S,
    info: infoTekst(null),
    hint: HINT_BEPAAL,
    stappen: stappenBepaal(d, k.waarde, "meter", S), tabel: tabelBepaal(d, k.waarde * 100, S),
    S, type, soortTekst: "plattegrond",
  };
}

// ---- Stadskaart ------------------------------------------------------------------------

const KAART_SCENARIOS = [
  { naam: "Anne", plaats: "school", label: "School", lidwoord: "de" },
  { naam: "Jayden", plaats: "park", label: "Park", lidwoord: "het" },
  { naam: "Lotte", plaats: "bibliotheek", label: "Bibliotheek", lidwoord: "de" },
  { naam: "Daan", plaats: "voetbalclub", label: "Voetbalclub", lidwoord: "de" },
  { naam: "Mila", plaats: "zwembad", label: "Zwembad", lidwoord: "het" },
  { naam: "Sem", plaats: "station", label: "Station", lidwoord: "het" },
];

function maakKaart(niveau, type) {
  const S = kiesWillekeurig(SCHALEN.kaart[niveau]);
  const sc = kiesWillekeurig(KAART_SCENARIOS);
  const d = tekenWaarde(niveau, 3, 13);
  const seed = randomGeheelGetal(1, 1e6);
  const basis = { soort: "kaart", seed, van: `Huis van ${sc.naam}`, naar: sc.label, afstand: d };
  const echtCm = d * S;

  if (type === "eenCm") {
    const k = kiesEenheid(S, ["meter", "kilometer"]);
    if (!k) return null;
    return {
      afbeelding: { ...basis, schaal: S, afstand: 1, toonAfstand: "1 cm" },
      vraag: `1 cm op deze kaart is in werkelijkheid?`,
      rapport: `Kaart 1 : ${g(S)}. 1 cm op de kaart is in werkelijkheid?`,
      eenheid: k.eenheid, antwoordGoed: k.waarde,
      info: infoTekst(S), hint: `1 cm op de kaart is ${g(S)} cm in het echt. Reken om naar ${k.eenheid === "meter" ? "meters (deel door 100)" : "kilometers (deel door 100 000)"}.`,
      stappen: [`Schaal 1 : ${g(S)} betekent: 1 cm op de kaart is <b>${g(S)} cm</b> in het echt.`,
        `${g(S)} cm : ${k.eenheid === "meter" ? "100" : "100 000"} = <b>${nl(k.waarde)} ${k.eenheid}</b>.`],
      tabel: [["Op de kaart", "In het echt"], ["1 cm", `${g(S)} cm = ${nl(k.waarde)} ${k.eenheid === "meter" ? "m" : "km"}`]],
      S, type, soortTekst: "kaart",
    };
  }

  if (type === "voor") {
    const k = kiesEenheid(echtCm, ["meter", "kilometer"], niveau === 1);
    if (!k) return null;
    const eenheidsWoord = k.eenheid === "meter" ? "meters" : "kilometers";
    return {
      afbeelding: { ...basis, schaal: S },
      vraag: `${sc.naam} kijkt naar de stadsplattegrond. De afstand van haar huis naar ${sc.lidwoord} ${sc.plaats} is op deze kaart <b>${nl(d)} cm</b>. Hoe ver woont ${sc.naam} van ${sc.lidwoord} ${sc.plaats} in ${eenheidsWoord}?`,
      rapport: `Kaart 1 : ${g(S)}. De afstand van het huis van ${sc.naam} naar ${sc.lidwoord} ${sc.plaats} is ${nl(d)} cm op de kaart. Hoe ver in ${eenheidsWoord}?`,
      eenheid: k.eenheid, antwoordGoed: k.waarde,
      info: infoTekst(S), hint: hintVoor(d, S, k.eenheid),
      stappen: stappenVoor(d, S, k.eenheid), tabel: tabelVoor(d, S, k.eenheid),
      S, type, soortTekst: "kaart",
    };
  }
  if (type === "terug") {
    const k = kiesEenheid(echtCm, ["meter", "kilometer"]);
    if (!k) return null;
    return {
      afbeelding: { ...basis, schaal: S, toonAfstand: "? cm" },
      vraag: `In het echt is de afstand van het huis van ${sc.naam} naar ${sc.lidwoord} ${sc.plaats} <b>${nl(k.waarde)} ${k.eenheid === "meter" ? "meter" : "kilometer"}</b>. Hoeveel cm is dat op deze kaart?`,
      rapport: `Kaart 1 : ${g(S)}. De afstand van het huis van ${sc.naam} naar ${sc.lidwoord} ${sc.plaats} is in het echt ${nl(k.waarde)} ${k.eenheid}. Hoeveel cm op de kaart?`,
      eenheid: "cm", antwoordGoed: d,
      info: infoTekst(S), hint: hintTerug(k.eenheid, S),
      stappen: stappenTerug(k.waarde, k.eenheid, S, d),
      tabel: [["Op de kaart", "In het echt"], ["1 cm", `${g(S)} cm`], ["<b>? cm</b>", `${nl(k.waarde)} ${k.eenheid === "meter" ? "m" : "km"} = ${nl(rond(echtCm))} cm`]],
      S, type, soortTekst: "kaart",
    };
  }
  const k = kiesEenheid(echtCm, ["kilometer", "meter"]);
  if (!k) return null;
  return {
    afbeelding: { ...basis, schaal: null },
    vraag: `Op deze kaart is de afstand van het huis van ${sc.naam} naar ${sc.lidwoord} ${sc.plaats} <b>${nl(d)} cm</b>. In het echt is dat <b>${nl(k.waarde)} ${k.eenheid === "meter" ? "meter" : "kilometer"}</b>. Wat is de schaal van de kaart?`,
    rapport: `Kaart. ${nl(d)} cm op de kaart is in het echt ${nl(k.waarde)} ${k.eenheid}. Wat is de schaal (1 : ?)`,
    voorvoegsel: "1 :", eenheid: "", antwoordGoed: S,
    info: infoTekst(null),
    hint: HINT_BEPAAL,
    stappen: stappenBepaal(d, k.waarde, k.eenheid, S), tabel: tabelBepaal(d, echtCm, S),
    S, type, soortTekst: "kaart",
  };
}

// ---- Schaalmodel op een liniaal ----------------------------------------------------------

const MODELLEN = [
  { id: "auto", naam: "auto", art: "de", schalen: [20, 25, 40, 50], min: 6, max: 10 },
  { id: "boot", naam: "boot", art: "de", schalen: [50, 100, 200], min: 5, max: 10 },
  { id: "trein", naam: "treinwagon", art: "de", schalen: [50, 87, 100], min: 6, max: 10 },
  { id: "vliegtuig", naam: "vliegtuig", art: "het", schalen: [100, 200, 400], min: 4, max: 10 },
];

function maakModel(niveau, type) {
  const m = kiesWillekeurig(MODELLEN);
  const S = type === "bepaal" ? kiesWillekeurig(m.schalen.filter((x) => x !== 87)) : kiesWillekeurig(m.schalen.filter((x) => x !== 87 || niveau === 3));
  const L = tekenWaarde(niveau, m.min, m.max);
  const echtCm = L * S;
  const k = kiesEenheid(echtCm, ["meter"], niveau === 1);
  if (!k) return null;
  const afbeelding = { soort: "liniaal", model: m.id, lengte: L };

  if (type === "bepaal") {
    return {
      afbeelding: { ...afbeelding, schaal: null },
      vraag: `Hier zie je een schaalmodel van een ${m.naam}. ${m.art[0].toUpperCase()}${m.art.slice(1)} echte ${m.naam} is <b>${nl(k.waarde)} meter</b> lang. Lees de lengte van het model af. Wat is de schaal?`,
      rapport: `Schaalmodel (${m.naam}) op een liniaal. Lengte model afgelezen: ${nl(L)} cm. Echt: ${nl(k.waarde)} m. Wat is de schaal (1 : ?)`,
      voorvoegsel: "1 :", eenheid: "", antwoordGoed: S,
      info: infoTekst(null),
      hint: `Lees eerst af hoeveel cm het model is (begin bij de <b>0</b> van de liniaal). ${HINT_BEPAAL}`,
      stappen: [`Het model is <b>${nl(L)} cm</b> lang (afgelezen).`, ...stappenBepaal(L, k.waarde, "meter", S)],
      tabel: tabelBepaal(L, echtCm, S),
      S, type, soortTekst: "model", modelNaam: m.naam,
    };
  }
  const stappen = [`Lees de liniaal af: het model is <b>${nl(L)} cm</b> lang.`, ...stappenVoor(L, S, "meter")];
  return {
    afbeelding: { ...afbeelding, schaal: S },
    vraag: `Dit is een schaalmodel van een ${m.naam}. De schaal is <b>1 : ${g(S)}</b>. Lees de lengte van het model af. Hoe lang is ${m.art} echte ${m.naam} in meters?`,
    rapport: `Schaalmodel (${m.naam}) 1 : ${g(S)} op een liniaal. Lengte model afgelezen: ${nl(L)} cm. Hoe lang is ${m.art} echte ${m.naam} in meters?`,
    eenheid: "meter", antwoordGoed: k.waarde,
    info: infoTekst(S),
    hint: `Lees eerst af hoeveel cm het model is (begin bij de <b>0</b> van de liniaal). ${hintVoor(L, S, "meter")}`,
    stappen, tabel: tabelVoor(L, S, "meter"),
    S, type: "voor", soortTekst: "model", modelNaam: m.naam,
  };
}

// ---- Rekenen zonder afbeelding --------------------------------------------------------------

const ONDERDELEN = [
  { zin: "de woonkamer", maat: "lang" }, { zin: "de tuin", maat: "breed" }, { zin: "de garage", maat: "lang" },
  { zin: "de gevel van het huis", maat: "breed" }, { zin: "het zwembad", maat: "lang" }, { zin: "de schuur", maat: "breed" },
];

const WERKELIJKE_DINGEN = [
  { naam: "een auto", metersLijst: [3.6, 4, 4.5, 5] },
  { naam: "een bus", metersLijst: [12, 15, 18] },
  { naam: "een basketbalveld", metersLijst: [28] },
  { naam: "een zwembad", metersLijst: [25, 50] },
  { naam: "een voetbalveld", metersLijst: [100, 105] },
  { naam: "een flatgebouw (hoogte)", metersLijst: [30, 45, 60] },
  { naam: "een vliegtuig", metersLijst: [30, 40, 60] },
  { naam: "een boom (hoogte)", metersLijst: [8, 10, 12, 15] },
];

const ROUTES = [
  { zin: "een wandelroute", op: "wandelkaart" },
  { zin: "een fietsroute", op: "fietskaart" },
  { zin: "de weg naar het strand", op: "kaart" },
  { zin: "de afstand tussen twee dorpen", op: "kaart" },
];

function maakReken(niveau, type) {
  const S = kiesWillekeurig(SCHALEN.reken[niveau]);
  const kaartSchaal = kiesWillekeurig(SCHALEN.kaart[niveau]);

  if (type === "eenCm") type = "voor";

  if (type === "voor") {
    if (Math.random() < 0.5) {
      const o = kiesWillekeurig(ONDERDELEN);
      const d = tekenWaarde(niveau, 2, 16);
      const k = kiesEenheid(d * S, ["meter", "cm"], niveau === 1);
      if (!k) return null;
      return {
        afbeelding: null,
        vraag: `Op een bouwtekening met schaal <b>1 : ${g(S)}</b> is ${o.zin} <b>${nl(d)} cm</b> ${o.maat}. Hoe ${o.maat} is ${o.zin} in werkelijkheid? (in ${k.eenheid === "meter" ? "meters" : "cm"})`,
        rapport: `Bouwtekening 1 : ${g(S)}. ${o.zin} is ${nl(d)} cm ${o.maat} op de tekening. Hoe ${o.maat} in werkelijkheid (${k.eenheid})?`,
        eenheid: k.eenheid, antwoordGoed: k.waarde,
        info: infoTekst(S), hint: hintVoor(d, S, k.eenheid),
        stappen: stappenVoor(d, S, k.eenheid), tabel: tabelVoor(d, S, k.eenheid),
        S, type, soortTekst: "reken",
      };
    }
    const r = kiesWillekeurig(ROUTES);
    const d = tekenWaarde(niveau, 2, 15);
    const k = kiesEenheid(d * kaartSchaal, ["kilometer", "meter"], niveau === 1);
    if (!k) return null;
    return {
      afbeelding: null,
      vraag: `Op een ${r.op} met schaal <b>1 : ${g(kaartSchaal)}</b> is ${r.zin} <b>${nl(d)} cm</b>. Hoe lang is dat in werkelijkheid? (in ${k.eenheid === "meter" ? "meters" : "kilometers"})`,
      rapport: `Kaart 1 : ${g(kaartSchaal)}. ${r.zin} is ${nl(d)} cm op de kaart. Hoe lang in werkelijkheid (${k.eenheid})?`,
      eenheid: k.eenheid, antwoordGoed: k.waarde,
      info: infoTekst(kaartSchaal), hint: hintVoor(d, kaartSchaal, k.eenheid),
      stappen: stappenVoor(d, kaartSchaal, k.eenheid), tabel: tabelVoor(d, kaartSchaal, k.eenheid),
      S: kaartSchaal, type, soortTekst: "reken",
    };
  }

  if (type === "terug") {
    const ding = kiesWillekeurig(WERKELIJKE_DINGEN);
    const meters = kiesWillekeurig(ding.metersLijst);
    const d = rond(meters * 100 / S);
    if (!isNetjes(d, 2) || d < 1 || d > 30) return null;
    return {
      afbeelding: null,
      vraag: `Je tekent ${ding.naam} op schaal <b>1 : ${g(S)}</b>. In het echt is het <b>${nl(meters)} meter</b>. Hoeveel cm is dat op je tekening?`,
      rapport: `Schaal 1 : ${g(S)}. ${ding.naam} is in het echt ${nl(meters)} m. Hoeveel cm op de tekening?`,
      eenheid: "cm", antwoordGoed: d,
      info: infoTekst(S), hint: hintTerug("meter", S),
      stappen: stappenTerug(meters, "meter", S, d),
      tabel: [["Op de tekening", "In het echt"], ["1 cm", `${g(S)} cm`], ["<b>? cm</b>", `${nl(meters)} m = ${nl(meters * 100)} cm`]],
      S, type, soortTekst: "reken",
    };
  }

  // bepaal: een kamer van 3 tot 12 m op een bouwtekening
  const echtM = kiesWillekeurig([3, 3.5, 4, 4.5, 5, 6, 7, 7.5, 8, 9, 10, 12]);
  const Sb = kiesWillekeurig([50, 100, 200]);
  const d = rond(echtM * 100 / Sb);
  if (!isNetjes(d, 2) || d < 2 || d > 24) return null;
  const k = { waarde: echtM };
  return {
    afbeelding: null,
    vraag: `Een kamer is op de tekening <b>${nl(d)} cm</b> lang. In werkelijkheid is de kamer <b>${nl(k.waarde)} meter</b> lang. Wat is de schaal van de tekening?`,
    rapport: `Een kamer is ${nl(d)} cm op de tekening en ${nl(k.waarde)} m in werkelijkheid. Wat is de schaal (1 : ?)`,
    voorvoegsel: "1 :", eenheid: "", antwoordGoed: Sb,
    info: infoTekst(null),
    hint: HINT_BEPAAL,
    stappen: stappenBepaal(d, k.waarde, "meter", Sb), tabel: tabelBepaal(d, k.waarde * 100, Sb),
    S: Sb, type, soortTekst: "reken",
  };
}

// ---- Publieke API ------------------------------------------------------------------------------

function genereerEen(instellingen) {
  const niveau = [1, 2, 3].includes(instellingen.niveau) ? instellingen.niveau : 2;
  let soort = SOORTEN.includes(instellingen.soort) ? instellingen.soort : "mix";
  if (soort === "mix") soort = kiesWillekeurig(["plattegrond", "kaart", "model", "reken", "plattegrond", "kaart"]);
  const type = kiesWillekeurig(TYPES_PER_NIVEAU[niveau]);

  const opgave = soort === "plattegrond" ? maakPlattegrond(niveau, type)
    : soort === "kaart" ? maakKaart(niveau, type)
    : soort === "model" ? maakModel(niveau, type === "terug" || type === "eenCm" ? "voor" : type)
    : maakReken(niveau, type);
  if (!opgave) return null;
  return {
    ...opgave,
    vraagTekst: opgave.vraag,
    meta: { categorie: "schaal", opgaveType: opgave.soortTekst, vraagType: opgave.type, niveau, stap: opgave.S },
  };
}

/**
 * Genereert één opgave.
 * @param {{soort?: string, niveau?: number}} instellingen
 */
export function genereerOpgave(instellingen = {}) {
  for (let i = 0; i < 500; i += 1) {
    const o = genereerEen(instellingen);
    if (o) return o;
  }
  throw new Error("Kon geen schaalopgave maken");
}

export function opgaveNaarSleutel(o) {
  return `${o.soortTekst}|${o.type}|${o.S}|${o.rapport}`;
}

/** Controleert het antwoord van het kind (tolerantie voor afrondingsverschillen). */
export function isAntwoordGoed(ingave, opgave) {
  const x = Number(String(ingave).replace(",", "."));
  return Number.isFinite(x) && Math.abs(x - opgave.antwoordGoed) < 1e-6;
}

/** Antwoord met eenheid als tekst (voor feedback en rapport). */
export function antwoordTekst(opgave, waarde = opgave.antwoordGoed) {
  if (opgave.voorvoegsel) return `${opgave.voorvoegsel} ${nl(waarde)}`;
  return `${nl(waarde)} ${EENHEID_TEKST[opgave.eenheid] || opgave.eenheid}`.trim();
}
