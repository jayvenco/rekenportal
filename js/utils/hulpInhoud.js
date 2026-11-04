// utils/hulpInhoud.js
// -----------------------------------------------------------------------------
// Inhoud van de Hulp-knop per oefening: uitleg in stappen, visuele voorbeelden
// en tips. Elke inhoud-functie bouwt vers DOM, zodat voorbeelden nooit gedeeld
// worden tussen openingen. Teksten mogen eenvoudige HTML bevatten (<b>, <br>).
// -----------------------------------------------------------------------------

import { bouwGetallenlijn } from "./getallenlijnSvg.js";
import { bouwKlok } from "./klokSvg.js";
import { bouwSplitsboom } from "../exercises/splitsen/splitsboom.js";
import { maakGeldSvg } from "../exercises/geld/geldSvg.js";
import { maakGrafiek, voegGrafiekStijlToe } from "../exercises/grafieken/grafiekWeergave.js";

const BLAUW = "#2f6fb5";
const ROOD = "#e0533d";
const GROEN = "#2e9e6b";
const ORANJE = "#e8913a";

// ---- Kleine visuele bouwstenen --------------------------------------------

function uitSvg(tekst) {
  const d = document.createElement("div");
  d.innerHTML = tekst.trim();
  return d.firstElementChild;
}

function uitHtml(tekst) {
  const d = document.createElement("div");
  d.innerHTML = tekst.trim();
  return d;
}

/** Rij stippen: `n` stippen, de eerste `doorgestreept` krijgen een kruis. */
function stippen(n, kleur = BLAUW, doorgestreept = 0, r = 10) {
  const stap = r * 2 + 5;
  const b = n * stap + 4;
  let s = `<svg viewBox="0 0 ${b} ${r * 2 + 6}" width="${b}" height="${r * 2 + 6}">`;
  for (let i = 0; i < n; i += 1) {
    const x = 2 + r + i * stap;
    s += `<circle cx="${x}" cy="${r + 3}" r="${r}" fill="${i < doorgestreept ? "#e6e9ee" : kleur}"/>`;
    if (i < doorgestreept) s += `<path d="M${x - r + 3} ${3 + 3} L${x + r - 3} ${r * 2 - 3 + 3} M${x + r - 3} ${6} L${x - r + 3} ${r * 2}" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>`;
  }
  return uitSvg(s + "</svg>");
}

/** `groepen` kaders met elk `perGroep` stippen (voor keersommen en verhoudingen). */
function groepen(aantal, perGroep, kleur = BLAUW) {
  const r = 8, stap = 19;
  const bGroep = perGroep * stap + 12;
  const b = aantal * (bGroep + 10);
  let s = `<svg viewBox="0 0 ${b} 44" width="${b}" height="44">`;
  for (let g = 0; g < aantal; g += 1) {
    const x0 = g * (bGroep + 10) + 2;
    s += `<rect x="${x0}" y="2" width="${bGroep}" height="40" rx="10" fill="#eef3fa" stroke="${kleur}" stroke-width="2"/>`;
    for (let i = 0; i < perGroep; i += 1) s += `<circle cx="${x0 + 12 + i * stap}" cy="22" r="${r}" fill="${kleur}"/>`;
  }
  return uitSvg(s + "</svg>");
}

/**
 * Sprongen op een (niet op schaal getekende) lijn.
 * @param {number|string} start
 * @param {Array<{naar:number|string, label:string, kleur?:string}>} stappen
 */
function sprongLijn(start, stappen) {
  const n = stappen.length + 1;
  const b = Math.max(300, n * 120);
  const x = (i) => 50 + (i * (b - 100)) / (n - 1);
  let s = `<svg viewBox="0 0 ${b} 120" width="${b}" height="120" style="max-width:100%">`;
  s += `<line x1="20" y1="85" x2="${b - 20}" y2="85" stroke="#444" stroke-width="3"/>`;
  const punten = [start, ...stappen.map((st) => st.naar)];
  punten.forEach((g, i) => {
    s += `<line x1="${x(i)}" y1="75" x2="${x(i)}" y2="95" stroke="#444" stroke-width="3"/>`;
    s += `<text x="${x(i)}" y="116" text-anchor="middle" font-size="20" font-weight="800">${g}</text>`;
  });
  stappen.forEach((st, i) => {
    const k = st.kleur || (i % 2 ? BLAUW : ROOD);
    const mid = (x(i) + x(i + 1)) / 2;
    s += `<path d="M${x(i)} 72 Q ${mid} 15 ${x(i + 1)} 72" fill="none" stroke="${k}" stroke-width="3"/>`;
    s += `<text x="${mid}" y="30" text-anchor="middle" font-size="19" font-weight="800" fill="${k}">${st.label}</text>`;
  });
  return uitSvg(s + "</svg>");
}

/** Horizontale staafjes om twee waarden te vergelijken. */
function balkjes(items, max) {
  let s = `<svg viewBox="0 0 420 ${items.length * 40 + 6}" width="420" style="max-width:100%">`;
  items.forEach((it, i) => {
    const w = (it.waarde / max) * 250;
    s += `<text x="4" y="${i * 40 + 26}" font-size="16" font-weight="700">${it.naam}</text>`;
    s += `<rect x="90" y="${i * 40 + 8}" width="${w}" height="26" rx="5" fill="${it.kleur || BLAUW}"/>`;
    s += `<text x="${96 + w}" y="${i * 40 + 27}" font-size="17" font-weight="800">${it.waarde}</text>`;
  });
  return uitSvg(s + "</svg>");
}

/** Blokje-tientallen: `staven` x 10 en `los` x 1, de eerste `gekleurd` staven oranje. */
function tientallen(staven, los, gekleurd = 0) {
  const b = staven * 26 + los * 18 + 20;
  let s = `<svg viewBox="0 0 ${b} 76" width="${b}" height="76">`;
  for (let i = 0; i < staven; i += 1) {
    s += `<rect x="${4 + i * 26}" y="4" width="20" height="68" rx="3" fill="${i < gekleurd ? ORANJE : BLAUW}"/>`;
    for (let k = 1; k < 10; k += 1) s += `<line x1="${4 + i * 26}" x2="${24 + i * 26}" y1="${4 + k * 6.8}" y2="${4 + k * 6.8}" stroke="#fff"/>`;
  }
  for (let i = 0; i < los; i += 1) s += `<rect x="${staven * 26 + 8 + i * 18}" y="46" width="14" height="14" rx="2" fill="${GROEN}"/>`;
  return uitSvg(s + "</svg>");
}

/** Taartdiagram van een breuk: `deel` van `totaal` gekleurd. */
function breukTaart(deel, totaal, r = 38) {
  let s = `<svg viewBox="0 0 90 90" width="90" height="90"><circle cx="45" cy="45" r="${r}" fill="#eef3fa" stroke="${BLAUW}" stroke-width="2"/>`;
  for (let i = 0; i < totaal; i += 1) {
    const a0 = (i / totaal) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / totaal) * 2 * Math.PI - Math.PI / 2;
    const p = `M45 45 L${45 + r * Math.cos(a0)} ${45 + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${45 + r * Math.cos(a1)} ${45 + r * Math.sin(a1)} Z`;
    s += `<path d="${p}" fill="${i < deel ? ORANJE : "none"}" stroke="${BLAUW}" stroke-width="2"/>`;
  }
  return s + "</svg>";
}

function rij(...delen) {
  const d = document.createElement("div");
  d.style.cssText = "display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:center";
  for (const x of delen) d.appendChild(typeof x === "string" ? uitHtml(x) : x);
  return d;
}

function tabel(kop, rijen) {
  return uitHtml(`<table class="hulp-tabel"><tr>${kop.map((k) => `<th>${k}</th>`).join("")}</tr>${rijen.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`);
}

/** Stappenketting: [{tekst, groot?}] met pijltjes ertussen. */
function keten(items) {
  const d = document.createElement("div");
  d.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center";
  items.forEach((it, i) => {
    if (i) d.appendChild(uitHtml('<span style="font-size:1.6rem;color:#9a5410">➜</span>'));
    d.appendChild(uitHtml(`<span style="background:${it.kleur || "#eef3fa"};border:2px solid #d9e2ec;border-radius:12px;padding:8px 12px;font-size:1.1rem;font-weight:700;text-align:center">${it.tekst}</span>`));
  });
  return d;
}

function lijn(opties) {
  const { svg } = bouwGetallenlijn(opties);
  svg.style.width = "100%";
  svg.style.maxWidth = "560px";
  return svg;
}

// ---- Inhoud per oefening ---------------------------------------------------

const INHOUD = {
  getallenlijn: () => ({
    titel: "Getallenlijn",
    intro: "Op een getallenlijn staan getallen op volgorde, van klein naar groot. Elk streepje is een getal.",
    stappen: [
      "Kijk goed naar de getallen op de lijn en naar de <b>stapgrootte</b>: hoeveel gaat het van het ene streepje naar het volgende?",
      "Lees de opdracht: <b>plaats</b> een getal (klik op de juiste plek), <b>vul aan</b> (welk getal hoort in het lege vakje), <b>tel door</b> of maak <b>sprongen</b>.",
      "Controleer je antwoord door te kijken of het past tussen de getallen links en rechts.",
    ],
    voorbeelden: [
      {
        kop: "Vul aan",
        tekst: "Links van het lege vakje staat <b>5</b> en rechts staat <b>7</b>. Dus hoort er <b>6</b>.",
        visual: lijn({ min: 3, max: 9, stap: 1, verborgenGetallen: [6], markeringen: [{ getal: 6, pijl: true, kleur: ROOD }] }),
      },
      {
        kop: "Sprongen",
        tekst: "Begin bij <b>10</b> en maak <b>3 sprongen van 5</b>: 10 → 15 → 20 → 25. Je komt uit op <b>25</b>.",
        visual: sprongLijn(10, [{ naar: 15, label: "+5" }, { naar: 20, label: "+5" }, { naar: 25, label: "+5" }]),
      },
      {
        kop: "Plaats het getal",
        tekst: "Zoek <b>40</b>: de lijn loopt in stappen van 10. Het streepje met 40 zit precies tussen 30 en 50.",
        visual: lijn({ min: 0, max: 100, stap: 10, markeringen: [{ getal: 40, kleur: ROOD, label: "40" }] }),
      },
    ],
    tips: [
      "Is de lijn een stukje uit een langere lijn? Dat klopt: je ziet alleen het stuk waar het om gaat.",
      "Tel de stapjes tussen twee getallen, bijvoorbeeld in 2'en of in 5'en.",
      "Bij <b>tel door</b> kijk je naar het verschil tussen de getallen: dat is de stap.",
    ],
  }),

  tafels: () => ({
    titel: "Tafels",
    intro: "Een keersom is een som met <b>gelijke groepjes</b>.",
    stappen: [
      "Lees de som: <b>4 × 6</b> betekent <b>4 groepjes van 6</b>.",
      "Tel de groepjes bij elkaar: 6 + 6 + 6 + 6, of weet het antwoord uit je hoofd.",
      "Typ of kies het antwoord.",
    ],
    voorbeelden: [
      { kop: "3 × 4", tekst: "3 groepjes van 4 stippen: 4 + 4 + 4 = <b>12</b>.", visual: groepen(3, 4) },
      { kop: "Wisselen mag", tekst: "3 × 4 en 4 × 3 hebben hetzelfde antwoord: <b>12</b>.", visual: rij(groepen(3, 4), "<b style='font-size:1.4rem'>=</b>", groepen(4, 3)) },
    ],
    tips: [
      "<b>× 10</b>: zet er een 0 achter (6 × 10 = 60).",
      "<b>× 5</b>: neem de helft van × 10 (6 × 5 = 30, want de helft van 60).",
      "<b>× 2</b> is het dubbele; <b>× 4</b> is twee keer het dubbele.",
      "Ken je 3 × 7 niet? Probeer 7 × 3: dat is soms makkelijker.",
    ],
  }),

  plusmin: () => ({
    titel: "Plus en min",
    intro: "Rekenen met optellen (+) en aftrekken (−) tot 100.",
    stappen: [
      "Kijk of de som een <b>plus</b> (erbij) of een <b>min</b> (eraf) is.",
      "Splits de getallen in <b>tientallen en eenheden</b> of maak sprongen over het tiental.",
      "Reken stap voor stap en controleer het antwoord: bij een plussom kun je terugrekenen met min.",
    ],
    voorbeelden: [
      {
        kop: "47 + 26",
        tekst: "Eerst de tientallen: 40 + 20 = 60. Dan de eenheden: 7 + 6 = 13. Samen: 60 + 13 = <b>73</b>.",
        visual: rij(tientallen(4, 7), "<b style='font-size:1.4rem'>+</b>", tientallen(2, 6)),
      },
      {
        kop: "83 − 27",
        tekst: "Eerst 20 eraf: 83 − 20 = 63. Dan nog 7 eraf: 63 − 7 = <b>56</b>.",
        visual: sprongLijn(83, [{ naar: 63, label: "−20", kleur: ROOD }, { naar: 56, label: "−7", kleur: ROOD }]),
      },
    ],
    tips: [
      "Over het tiental heen? Maak eerst het tiental vol: 38 + 5 → 38 + 2 = 40, dan nog 3 erbij = 43.",
      "Controleer met de omgekeerde som: 56 + 27 = 83 ✔",
      "Gebruik eventueel het telraam rechtsonder.",
    ],
  }),

  getallenvolgorde: () => ({
    titel: "Getallen op volgorde",
    intro: "Zet de getallen op volgorde van <b>klein naar groot</b>. Tik de lelieblaadjes aan en de kikker springt!",
    stappen: [
      "Kijk naar alle getallen en zoek het <b>kleinste</b> getal.",
      "Tik dat blaadje aan. Zoek dan het kleinste getal dat overblijft.",
      "Ga zo door tot alle blaadjes gehad zijn.",
    ],
    voorbeelden: [
      {
        kop: "17, 5, 42, 9",
        tekst: "Kleinste eerst: <b>5, 9, 17, 42</b>.",
        visual: keten([{ tekst: "5" }, { tekst: "9" }, { tekst: "17" }, { tekst: "42" }]),
      },
    ],
    tips: [
      "Een getal met <b>meer cijfers</b> is groter (42 is groter dan 9).",
      "Hebben getallen evenveel cijfers? Vergelijk eerst de tientallen: 42 is kleiner dan 57, want 4 is kleiner dan 5.",
      "Tik je een verkeerd blaadje aan? Dan springt de kikker niet: probeer het kleinere getal.",
    ],
  }),

  meerminder: () => ({
    titel: "Meer of minder?",
    intro: "Vergelijk twee getallen en kies wie of wat <b>meer, minder, groter, kleiner, hoger of lager</b> is.",
    stappen: [
      "Lees de vraag goed: zoek naar wat er gevraagd wordt (meer of minder, groter of kleiner, hoger of lager).",
      "Zoek de twee getallen in het verhaaltje.",
      "Vergelijk de getallen en kies het juiste antwoord.",
    ],
    voorbeelden: [
      {
        kop: "Wie heeft er meer?",
        tekst: "Anna heeft 12 appels. Bram heeft 9 appels. 12 is meer dan 9, dus <b>Anna</b> heeft er meer.",
        visual: balkjes([{ naam: "Anna", waarde: 12 }, { naam: "Bram", waarde: 9, kleur: ORANJE }], 14),
      },
    ],
    tips: [
      "Let op het woord in de vraag: 'meer' en 'minder' zijn tegenovergesteld!",
      "Teken twee streepjes of balkjes als je het niet ziet.",
    ],
  }),

  verhaaltjes: () => ({
    titel: "Verhaaltjessommen",
    intro: "In een verhaaltje zit een som verstopt. Ontdek wat er gebeurt.",
    stappen: [
      "Lees het verhaaltje rustig. Wat gebeurt er?",
      "Komt er iets <b>bij</b>? Dan reken je <b>plus</b>. Gaat er iets <b>weg</b>? Dan reken je <b>min</b>.",
      "Reken de som uit en geef het antwoord.",
    ],
    voorbeelden: [
      {
        kop: "Erbij → plus",
        tekst: "Tim heeft 4 appels. Hij krijgt er 3 bij. 4 + 3 = <b>7</b>.",
        visual: rij(stippen(4, ROOD), "<b>+</b>", stippen(3, ROOD)),
      },
      {
        kop: "Eraf → min",
        tekst: "Sofie heeft 8 koekjes. Ze eet er 3 op. 8 − 3 = <b>5</b>.",
        visual: stippen(8, ORANJE, 3),
      },
    ],
    tips: ["Teken het verhaaltje met stippen of streepjes.", "Tel op je vingers als dat helpt.", "Vraag jezelf: zijn het er na afloop meer of minder?"],
  }),

  rekendetectives: () => ({
    titel: "Rekendetectives",
    intro: "Jij bent de detective: ontdek zelf welke som bij het verhaaltje hoort.",
    stappen: [
      "Lees het verhaaltje goed en bedenk wat er gebeurt.",
      "Kies: komen er dingen <b>bij</b> (plus), gaan er dingen <b>weg</b> of is er een <b>verschil</b> (min), of zijn er <b>gelijke groepjes</b> (keer).",
      "Typ dan het antwoord op de som.",
    ],
    voorbeelden: [
      { kop: "➕ Er komen dingen bij", tekst: "9 kinderen zitten op de mat, er komen er 6 bij. 9 + 6 = <b>15</b>.", visual: rij(stippen(9, BLAUW, 0, 7), "<b>+</b>", stippen(6, GROEN, 0, 7)) },
      { kop: "➖ Er gaat iets weg of er is een verschil", tekst: "Lisa heeft 14 stickers en Noor heeft er 9. Hoeveel meer heeft Lisa? 14 − 9 = <b>5</b>.", visual: balkjes([{ naam: "Lisa", waarde: 14 }, { naam: "Noor", waarde: 9, kleur: ORANJE }], 16) },
      { kop: "✖️ Gelijke groepjes", tekst: "4 zakjes met elk 3 snoepjes. 4 × 3 = <b>12</b>.", visual: groepen(4, 3) },
    ],
    tips: [
      "Pas op voor valkuilen: het woord 'samen' kan ook bij een <b>verschil</b> horen, en 'meer' kan bij een plussom horen.",
      "Vraag jezelf niet 'welk woord staat er?' maar 'wat gebeurt er echt?'.",
    ],
  }),

  splitsen: () => ({
    titel: "Splitsen",
    intro: "Bij splitsen haal je een getal uit elkaar in twee delen. Samen zijn de delen weer het getal.",
    stappen: [
      "Boven in de splitsboom staat het hele getal. Eén van de twee delen eronder is al gegeven.",
      "Bedenk hoeveel er nog bij moet om het hele getal te maken.",
      "Vul het lege vakje in.",
    ],
    voorbeelden: [
      {
        kop: "Klein getal: 12 = 5 + ?",
        tekst: "Wat moet er bij 5 om 12 te maken? 5 + 7 = 12, dus het antwoord is <b>7</b>.",
        visual: bouwSplitsboom({ totaal: 12, links: 5, rechts: 7, klein: true }).svg,
      },
      {
        kop: "Groter getal: 47 = 38 + ? (eerst afronden naar tientallen)",
        tekst: "Van 38 naar het volgende tiental (40) is <b>+2</b>. Van 40 naar 47 is <b>+7</b>. Samen 2 + 7 = <b>9</b>.",
        visual: sprongLijn(38, [{ naar: 40, label: "+2" }, { naar: 47, label: "+7" }]),
      },
    ],
    tips: [
      "Weet je de splitsingen van 10 goed (6 + 4, 7 + 3)? Dan helpen die bij alle grotere getallen.",
      "Controleer: tel de twee delen op. Komt het hele getal eruit?",
      "Meer uitleg met plaatjes staat in het instelscherm bij <b>📖 Uitleg</b>.",
    ],
  }),

  geld: () => ({
    titel: "Rekenen met geld",
    intro: "Je werkt met biljetten van 5, 10, 20, 50 en 100 euro en munten van 50 cent, 1 en 2 euro.",
    stappen: [
      "<b>Tel het geld:</b> tel eerst de biljetten bij elkaar, daarna de munten. Typ het totaal (met een komma voor centen).",
      "<b>Betaal het bedrag:</b> kies uit het geld dat je hebt het juiste bedrag. Tik op het geld of sleep het naar het betaalvak.",
      "Klopt het totaal precies? Klik op <b>Controleer</b>.",
    ],
    voorbeelden: [
      {
        kop: "Tel het geld",
        tekst: "10 + 2 + 2 + 0,50 = <b>€ 14,50</b>. Twee munten van 50 cent zijn samen 1 euro.",
        visual: rij(maakGeldSvg("b10", 100), maakGeldSvg("m200"), maakGeldSvg("m200"), maakGeldSvg("m50")),
      },
      {
        kop: "Betaal € 7,50",
        tekst: "5 + 2 + 0,50 = 7,50. Je betaalt een biljet van 5, een munt van 2 en een munt van 50 cent.",
        visual: rij(maakGeldSvg("b5", 100), maakGeldSvg("m200"), maakGeldSvg("m50")),
      },
    ],
    tips: [
      "Begin bij het betaalvak met het grootste biljet dat nog in het bedrag past.",
      "Te veel geld gekozen? Tik op een biljet of munt in het betaalvak om het terug te leggen.",
      "Centen schrijf je met een komma: € 12,50.",
    ],
  }),

  klokkijken: () => ({
    titel: "Klokkijken",
    intro: "De klok heeft twee wijzers: de <b>korte</b> wijzer geeft het uur aan, de <b>lange</b> wijzer de minuten.",
    stappen: [
      "Kijk eerst naar de <b>korte wijzer</b>: bij welk getal staat hij?",
      "Kijk dan naar de <b>lange wijzer</b>: wijst hij naar de 12, dan is het een <b>heel uur</b>. Wijst hij naar de 6, dan is het <b>half</b>.",
      "Lezen: kies de juiste tijd. Tekenen: zet de wijzers op de juiste plek.",
    ],
    voorbeelden: [
      { kop: "Hele uur: 3 uur", tekst: "De lange wijzer staat op de 12 en de korte wijzer op de 3: het is <b>3 uur</b>.", visual: (() => { const k = bouwKlok({ uur: 3, minuten: 0 }); k.style.width = "180px"; return k; })() },
      { kop: "Half uur: half vier", tekst: "De lange wijzer staat op de 6. De korte wijzer staat tussen de 3 en de 4: het is <b>half vier</b> (3:30).", visual: (() => { const k = bouwKlok({ uur: 3, minuten: 30 }); k.style.width = "180px"; return k; })() },
    ],
    tips: [
      "Bij <b>half vier</b> is het eigenlijk 3:30: een half uur vóór vier uur.",
      "De lange wijzer doet er 60 minuten over om rond te gaan: één rondje is een uur.",
    ],
  }),

  complex: () => ({
    titel: "Meerstaps-verhaaltjes",
    intro: "Bij deze opgaven heb je meer dan één rekenstap nodig. Pak ze stap voor stap aan.",
    stappen: [
      "<b>Lees</b> het verhaaltje twee keer en onderstreep de getallen.",
      "Bedenk: <b>welke stappen</b> heb ik nodig? Wat reken ik eerst uit?",
      "Reken <b>stap voor stap</b> en schrijf tussenantwoorden op.",
      "Lees de vraag nog eens en controleer of je antwoord daarop past.",
    ],
    voorbeelden: [
      {
        kop: "Een fiets kost € 120. Er is 25% korting. Hoeveel betaal je?",
        tekst: "Stap 1: 25% van 120 is een kwart: 120 : 4 = 30. Stap 2: 120 − 30 = <b>90</b>.",
        visual: keten([{ tekst: "25% van 120<br>= 30" }, { tekst: "120 − 30<br>= € 90", kleur: "#dff3e6" }]),
      },
    ],
    tips: ["Een tussenstap opschrijven voorkomt fouten.", "Let op de eenheid (euro, minuten, kilometer) in het antwoord.", "Zoek de vraag in de laatste zin: die vertelt wat je moet berekenen."],
  }),

  breuken: () => ({
    titel: "Breuken, procenten en kommagetallen",
    intro: "Dezelfde hoeveelheid kun je op drie manieren schrijven: als breuk, als procent en als kommagetal.",
    stappen: [
      "<b>Breuk → procent:</b> maak de noemer 100. 1/4 = 25/100 = <b>25%</b>.",
      "<b>Procent → kommagetal:</b> deel door 100. 30% = 30 : 100 = <b>0,30</b>.",
      "<b>Kommagetal → breuk:</b> schrijf het als honderdsten en vereenvoudig. 0,75 = 75/100 = <b>3/4</b>.",
    ],
    voorbeelden: [
      {
        kop: "Handige rijtjes",
        visual: rij(
          uitHtml(`<div style="text-align:center">${breukTaart(1, 2)}<br><b>1/2 = 50% = 0,5</b></div>`),
          uitHtml(`<div style="text-align:center">${breukTaart(1, 4)}<br><b>1/4 = 25% = 0,25</b></div>`),
          uitHtml(`<div style="text-align:center">${breukTaart(3, 4)}<br><b>3/4 = 75% = 0,75</b></div>`),
        ),
        na: "Ook handig: 1/10 = 10% = 0,1 en 1/5 = 20% = 0,2.",
      },
    ],
    tips: ["Leer de rijtjes 1/2, 1/4, 3/4, 1/10 en 1/5 uit je hoofd.", "Procent betekent 'per honderd'."],
  }),

  meten: () => ({
    titel: "Meten",
    intro: "Je rekent met lengte, omtrek, oppervlakte, inhoud, gewicht en tijd. Let op de eenheden!",
    stappen: [
      "Lees welke eenheid er gevraagd wordt (cm, m², liter, kg, minuten).",
      "Reken eerst alles om naar <b>dezelfde eenheid</b>.",
      "Gebruik de juiste rekenregel en schrijf de eenheid in je antwoord.",
    ],
    voorbeelden: [
      {
        kop: "Omtrek en oppervlakte van een rechthoek van 5 bij 3",
        tekst: "<b>Omtrek</b> = alle zijden samen: 5 + 3 + 5 + 3 = <b>16</b>.<br><b>Oppervlakte</b> = lengte × breedte: 5 × 3 = <b>15 vierkantjes</b>.",
        visual: uitSvg(`<svg viewBox="0 0 220 130" width="220" height="130"><rect x="20" y="15" width="150" height="90" fill="#eef3fa" stroke="${BLAUW}" stroke-width="3"/>${[1, 2, 3, 4].map((i) => `<line x1="${20 + i * 30}" y1="15" x2="${20 + i * 30}" y2="105" stroke="${BLAUW}" stroke-opacity=".4"/>`).join("")}${[1, 2].map((i) => `<line x1="20" y1="${15 + i * 30}" x2="170" y2="${15 + i * 30}" stroke="${BLAUW}" stroke-opacity=".4"/>`).join("")}<text x="95" y="124" text-anchor="middle" font-size="16" font-weight="800">5</text><text x="190" y="64" text-anchor="middle" font-size="16" font-weight="800">3</text></svg>`),
      },
      {
        kop: "Omrekenen",
        visual: tabel(["Soort", "Handig om te weten"], [["Gewicht", "1 kg = 1000 g"], ["Inhoud", "1 l = 10 dl = 100 cl = 1000 ml"], ["Lengte", "1 m = 100 cm, 1 km = 1000 m"], ["Tijd", "1 uur = 60 min, 1 dag = 24 uur"]]),
      },
    ],
    tips: ["Oppervlakte heeft vierkante eenheden (cm², m²).", "Teken de vorm als je het niet ziet."],
  }),

  verhoudingen: () => ({
    titel: "Verhoudingen",
    intro: "Bij verhoudingen verandert alles in dezelfde mate: als je twee keer zoveel neemt, krijg je ook twee keer zoveel.",
    stappen: [
      "Zoek de twee dingen die bij elkaar horen (bijvoorbeeld personen en gram).",
      "Bepaal met welk getal je moet <b>vermenigvuldigen of delen</b>.",
      "Doe dat met beide getallen.",
    ],
    voorbeelden: [
      {
        kop: "Recept voor 4 personen: 200 g pasta. Hoeveel voor 8 personen?",
        tekst: "Van 4 naar 8 personen is × 2. Dus ook de pasta × 2: 200 × 2 = <b>400 g</b>.",
        visual: tabel(["Personen", "Pasta"], [["4", "200 g"], ["8 <b style='color:#e0533d'>(× 2)</b>", "400 g <b style='color:#e0533d'>(× 2)</b>"]]),
      },
      {
        kop: "Schaal: 1 cm op de kaart is 5 km echt",
        tekst: "4 cm op de kaart is 4 × 5 = <b>20 km</b> in het echt.",
        visual: tabel(["Kaart", "Echt"], [["1 cm", "5 km"], ["4 cm", "20 km"]]),
      },
    ],
    tips: ["Een verhoudingstabel helpt: zet de getallen onder elkaar.", "Zoek eerst de rij met <b>1</b> (1 persoon, 1 cm)."],
  }),

  statistiek: () => ({
    titel: "Statistiek en data",
    intro: "Je leest grafieken en tabellen en rekent met gemiddelde, mediaan en modus.",
    stappen: [
      "Lees de titel en de assen of kolommen: waar gaat het over?",
      "Lees de gevraagde waarden af en schrijf ze op.",
      "Reken: <b>gemiddelde</b> (optellen, delen), <b>mediaan</b> (middelste), <b>modus</b> (meest voorkomend).",
    ],
    voorbeelden: [
      {
        kop: "Getallen: 3, 5, 5, 7, 10",
        tekst: "<b>Gemiddelde:</b> 3 + 5 + 5 + 7 + 10 = 30, en 30 : 5 = <b>6</b>.<br><b>Mediaan:</b> het middelste getal (op volgorde): <b>5</b>.<br><b>Modus:</b> het getal dat het vaakst voorkomt: <b>5</b>.",
        visual: keten([{ tekst: "3" }, { tekst: "5", kleur: "#fff4e4" }, { tekst: "5", kleur: "#fff4e4" }, { tekst: "7" }, { tekst: "10" }]),
      },
      {
        kop: "Turven",
        tekst: "Vier streepjes met een streep erdoor is <b>5</b>. Hier staat 5 + 2 = <b>7</b>.",
        visual: uitSvg(`<svg viewBox="0 0 150 50" width="150" height="50" stroke="#243b53" stroke-width="3" stroke-linecap="round"><path d="M10 8V42M26 8V42M42 8V42M58 8V42M2 38L66 12"/><path d="M84 8V42M100 8V42"/></svg>`),
      },
    ],
    tips: ["Een gemiddelde ligt altijd tussen het kleinste en het grootste getal.", "Zet getallen voor de mediaan eerst op volgorde.", "Bij een cirkeldiagram horen alle delen samen bij 100%."],
  }),

  procenten: () => ({
    titel: "Procenten",
    intro: "Procent betekent 'per honderd'. 1% is 1 van de 100.",
    stappen: [
      "Zoek eerst <b>10%</b>: deel het getal door 10.",
      "Maak daarmee het gevraagde percentage (20% = 2 × 10%).",
      "Bij <b>korting</b> trek je het bedrag van de prijs af; bij <b>toename</b> tel je het erbij op.",
    ],
    voorbeelden: [
      {
        kop: "20% van 80",
        tekst: "10% van 80 = 8. Dus 20% = 8 + 8 = <b>16</b>.",
        visual: uitSvg(`<svg viewBox="0 0 330 56" width="330" height="56">${Array.from({ length: 10 }, (_, i) => `<rect x="${4 + i * 32}" y="6" width="28" height="30" rx="4" fill="${i < 2 ? ORANJE : "#eef3fa"}" stroke="${BLAUW}"/>`).join("")}<text x="165" y="52" text-anchor="middle" font-size="14" font-weight="700">elk blokje = 10% = 8</text></svg>`),
      },
      {
        kop: "Korting: een jas van € 60 met 25% korting",
        tekst: "25% is een kwart: 60 : 4 = 15 korting. Je betaalt 60 − 15 = <b>€ 45</b>.",
        visual: keten([{ tekst: "25% van 60<br>= 15" }, { tekst: "60 − 15<br>= € 45", kleur: "#dff3e6" }]),
      },
    ],
    tips: ["<b>50%</b> = de helft, <b>25%</b> = een kwart, <b>10%</b> = delen door 10, <b>1%</b> = delen door 100.", "Controleer of de uitkomst logisch is: korting maakt het goedkoper."],
  }),

  "grote-getallen": () => ({
    titel: "Grote getallen",
    intro: "Grote getallen lees je in groepjes van drie cijfers: eenheden, duizendtallen, miljoenen, miljarden.",
    stappen: [
      "Splits het getal in groepjes van <b>drie cijfers</b> (van rechts naar links).",
      "Zeg bij elk groepje de naam: duizend, miljoen, miljard.",
      "Bij 'hoeveel nullen' tel je de nullen: <b>duizend</b> heeft 3, <b>miljoen</b> heeft 6, <b>miljard</b> heeft 9 nullen.",
    ],
    voorbeelden: [
      {
        kop: "3.250.000 is drie miljoen tweehonderdvijftigduizend",
        visual: tabel(["miljoen", "duizend", "eenheden"], [["3", "250", "000"]]),
      },
      {
        kop: "Nullen",
        visual: tabel(["Getal", "Schrijfwijze", "Nullen"], [["duizend", "1.000", "3"], ["een miljoen", "1.000.000", "6"], ["een miljard", "1.000.000.000", "9"]]),
      },
    ],
    tips: ["De puntjes in een groot getal staan om het lezen makkelijker te maken.", "Bij optellen: zet de cijfers netjes onder elkaar op dezelfde plek."],
  }),

  getallen: () => ({
    titel: "Negatieve getallen en kommagetallen",
    intro: "Je rekent met getallen onder de nul en met komma's.",
    stappen: [
      "<b>Negatieve getallen:</b> teken een getallenlijn. Plus betekent naar rechts, min naar links.",
      "<b>Komma keer heel getal:</b> reken eerst zonder komma en zet de komma daarna terug.",
      "<b>Komma gedeeld door komma:</b> maak beide getallen 10 keer groter (of 100 keer) zodat de komma verdwijnt.",
    ],
    voorbeelden: [
      { kop: "−3 + 5", tekst: "Begin bij −3 en ga 5 naar rechts: −3 → 0 → 2. Het antwoord is <b>2</b>.", visual: sprongLijn("−3", [{ naar: 0, label: "+3" }, { naar: 2, label: "+2" }]) },
      { kop: "0,3 × 4", tekst: "Eerst 3 × 4 = 12. Eén cijfer achter de komma: <b>1,2</b>." },
      { kop: "2,4 : 0,6", tekst: "Maal beide met 10: 24 : 6 = <b>4</b>." },
    ],
    tips: ["Min een negatief getal werkt als plus: 5 − (−2) = 7.", "Controleer of het antwoord logisch is: 0,3 × 4 is ongeveer 1."],
  }),

  redactiesommen: () => ({
    titel: "Redactiesommen",
    intro: "Een redactiesom is een rekenverhaal. Met een vast stappenplan los je het op.",
    stappen: [
      "<b>Lees</b> het verhaal twee keer.",
      "<b>Onderstreep</b> de getallen en de vraag.",
      "Bedenk welke <b>som</b> erbij hoort (+ − × ÷) en of er meer stappen nodig zijn.",
      "<b>Reken</b> de som uit.",
      "<b>Controleer</b>: past het antwoord bij de vraag? Staat de eenheid erbij?",
    ],
    voorbeelden: [
      {
        kop: "Een tas kost € 24,50. Je koopt er 3. Hoeveel betaal je?",
        tekst: "3 tassen van € 24,50: dat zijn gelijke groepjes, dus <b>keer</b>. 3 × 24,50 = 73,50. Je betaalt <b>€ 73,50</b>.",
        visual: keten([{ tekst: "Lees" }, { tekst: "3 × 24,50" }, { tekst: "= € 73,50", kleur: "#dff3e6" }]),
      },
    ],
    tips: ["Zit je vast? Gebruik de <b>Hint</b>-knop in de oefening voor een tip over de aanpak.", "Verdeel een moeilijke som in kleinere sommen.", "Schrijf je tussenstappen op."],
  }),

  grafieken: () => {
    voegGrafiekStijlToe();
    const voorbeeld = maakGrafiek({
      type: "staaf", titel: "Leerlingen per sport", labels: ["Voetbal", "Hockey", "Tennis"],
      reeksen: [{ naam: "Leerlingen", waarden: [18, 9, 7] }], xTitel: "Sport", yTitel: "Aantal leerlingen", eenheid: "leerlingen", yMin: 0, yMax: 20, stap: 5,
    });
    voorbeeld.style.margin = "0";
    return {
      titel: "Grafieken lezen",
      intro: "Een grafiek, diagram of tabel laat gegevens zien. Jij leest ze af en rekent ermee.",
      stappen: [
        "Lees de <b>titel</b> en de <b>assen</b>: waar gaat het over en in welke eenheid?",
        "Kijk naar de <b>schaalverdeling</b>: hoeveel is één streepje op de as?",
        "Lees de gevraagde waarde af, of reken met meerdere waarden (verschil, totaal, gemiddelde).",
        "Controleer of je antwoord bij de vraag past. Gebruik de uitleg na afloop om te zien hoe het kan.",
      ],
      voorbeelden: [
        {
          kop: "Hoeveel meer leerlingen doen er voetbal dan tennis?",
          tekst: "Voetbal: 18. Tennis: 7. Het verschil is 18 − 7 = <b>11</b> leerlingen.",
          visual: voorbeeld,
        },
      ],
      tips: [
        "Bij een <b>lijndiagram</b> lees je de hoogte van het punt af op de verticale as.",
        "Bij een <b>cirkeldiagram</b> horen alle delen samen bij 100% (het hele geheel).",
        "Bij een <b>pictogram</b> kijk je eerst hoeveel één plaatje voorstelt.",
        "Begint de verticale as niet bij 0? Dan lijken verschillen groter dan ze zijn.",
      ],
    };
  },
};

/** Is er hulp voor deze oefening? */
export function heeftHulp(exerciseId) {
  return Object.prototype.hasOwnProperty.call(INHOUD, exerciseId);
}

/** Bouwt de inhoud voor het hulpvenster, of null. */
export function bouwHulpInhoud(exerciseId) {
  return heeftHulp(exerciseId) ? INHOUD[exerciseId]() : null;
}
