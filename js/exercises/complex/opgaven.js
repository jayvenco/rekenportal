// exercises/complex/opgaven.js
// -----------------------------------------------------------------------------
// Rekenlogica voor complexe, meerstaps verhaaltjessommen (groep 8).
// Elke opgave vereist 2 of 3 rekenstappen om op te lossen.
// Antwoorden zijn altijd hele getallen.
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";

// -----------------------------------------------------------------------------
// Namen (met geslacht voor voornaamwoorden hij/zij)
// -----------------------------------------------------------------------------
const NAMEN = [
  { naam: "Anna", geslacht: "v" },
  { naam: "Tim", geslacht: "m" },
  { naam: "Sofie", geslacht: "v" },
  { naam: "Daan", geslacht: "m" },
  { naam: "Mila", geslacht: "v" },
  { naam: "Bram", geslacht: "m" },
  { naam: "Nora", geslacht: "v" },
  { naam: "Sem", geslacht: "m" },
  { naam: "Lotte", geslacht: "v" },
  { naam: "Finn", geslacht: "m" },
  { naam: "Eva", geslacht: "v" },
  { naam: "Liam", geslacht: "m" },
  { naam: "Zoë", geslacht: "v" },
  { naam: "Noah", geslacht: "m" },
  { naam: "Julia", geslacht: "v" },
  { naam: "Milan", geslacht: "m" },
  { naam: "Fenna", geslacht: "v" },
  { naam: "Jesse", geslacht: "m" },
];

/** Voornaamwoord: hij/zij, met optioneel een hoofdletter voor het begin van een zin. */
function vw(geslacht, hoofdletter = false) {
  const woord = geslacht === "m" ? "hij" : "zij";
  return hoofdletter ? woord.charAt(0).toUpperCase() + woord.slice(1) : woord;
}

// -----------------------------------------------------------------------------
// Hulpfuncties voor breuk-vragen
// -----------------------------------------------------------------------------

/** Geeft een breuk 1/n terug, waarbij n een deler is van totaal. */
function kiesBreukDeler(totaal) {
  const delers = [];
  for (let d = 2; d <= 10; d++) {
    if (totaal % d === 0) delers.push(d);
  }
  if (delers.length === 0) return 2; // fallback
  return kiesWillekeurig(delers);
}

/** Bereken deel van totaal: totaal / noemer (voor 1/n) */
function deelVanTotaal(totaal, noemer) {
  return Math.floor(totaal / noemer);
}

// -----------------------------------------------------------------------------
// 2-STAP (makkelijk) sjablonen
// -----------------------------------------------------------------------------

const TEMPLATES_2_STAP = [
  // --- B1: Breuken — twee delen weggeven ---
  {
    id: "breuk_tweeDelenWeg",
    genereer: () => {
      const totaal = kiesWillekeurig([12, 18, 24, 30, 36, 40, 48, 60]);
      const n1 = kiesBreukDeler(totaal);
      let n2 = kiesBreukDeler(totaal);
      while (n2 === n1) n2 = kiesBreukDeler(totaal);
      const deel1 = totaal / n1;
      const deel2 = totaal / n2;
      const over = totaal - deel1 - deel2;
      const persoon = kiesWillekeurig(NAMEN);
      const voorwerp = kiesWillekeurig(["appels", "koekjes", "knikkers", "snoepjes", "cadeautjes", "bananen", "stickers", "bonbons"]);
      return {
        vraagTekst: `${persoon.naam} heeft ${totaal} ${voorwerp}. ${vw(persoon.geslacht, true)} geeft 1/${n1} aan Marie en 1/${n2} aan Kees. Hoeveel ${voorwerp} houdt ${persoon.naam} zelf over?`,
        antwoordGoed: over,
        meta: { type: "breuk_tweeDelenWeg", totaal, n1, n2, naam: persoon.naam, voorwerp },
      };
    },
  },

  // --- B2: Breuk — eerst opeten, dan weggeven ---
  {
    id: "breuk_eetDanWeg",
    genereer: () => {
      const totaal = kiesWillekeurig([12, 16, 20, 24, 30, 36, 40]);
      const n1 = kiesBreukDeler(totaal);
      const n2 = kiesBreukDeler(totaal);
      const deel1 = totaal / n1;
      const rest = totaal - deel1;
      const nogDelers = [];
      for (let d = 2; d <= 10; d++) {
        if (rest % d === 0) nogDelers.push(d);
      }
      const n2real = nogDelers.length > 0 ? kiesWillekeurig(nogDelers) : 2;
      const deel2 = rest / n2real;
      const over = rest - deel2;
      const persoon = kiesWillekeurig(NAMEN);
      const voorwerp = kiesWillekeurig(["koekjes", "bonbons", "snoepjes", "chocolaatjes", "lolly's"]);
      return {
        vraagTekst: `${persoon.naam} heeft ${totaal} ${voorwerp}. ${vw(persoon.geslacht, true)} eet 1/${n1} op en geeft daarna 1/${n2real} van de overgebleven ${voorwerp} aan een vriendje. Hoeveel ${voorwerp} houdt ${persoon.naam} over?`,
        antwoordGoed: over,
        meta: { type: "breuk_eetDanWeg", totaal, n1, n2real, naam: persoon.naam, voorwerp },
      };
    },
  },

  // --- S1: Snelheid — afstand in deel van de tijd ---
  {
    id: "snelheid_deelTijd",
    genereer: () => {
      // Kies een snelheid die mooie getallen geeft: 60, 80, 100, 120 km in 1,2,3,4 uur
      const paren = [
        [120, 2], [180, 3], [240, 4], [150, 3], [200, 4], [100, 2], [90, 3], [80, 2],
      ];
      const [afstandTotaal, uren] = kiesWillekeurig(paren);
      const snelheid = afstandTotaal / uren; // km/u
      // Deel-tijd in minuten: 15, 30, 45, 60
      const minuten = kiesWillekeurig([15, 30, 45, 60]);
      const afstandDeel = snelheid * (minuten / 60);
      // Afronden naar heel getal (zou al heel moeten zijn met deze getallen)
      const antwoord = Math.round(afstandDeel);
      const voertuig = kiesWillekeurig(["Een trein", "Een auto", "Een bus", "Een fietser"]);
      const voertuigNaam = voertuig === "Een fietser" ? "De fietser" : voertuig;
      return {
        vraagTekst: `${voertuig} rijdt ${afstandTotaal} km in ${uren} uur. Na ${minuten} minuten stoppen. Hoeveel km heeft ${voertuigNaam.toLowerCase()} gereden?`,
        antwoordGoed: antwoord,
        meta: { type: "snelheid_deelTijd", afstandTotaal, uren, minuten, voertuig },
      };
    },
  },

  // --- S2: Snelheid — afgelegde afstand voor pauze ---
  {
    id: "snelheid_voorPauze",
    genereer: () => {
      const paren = [
        [120, 2], [180, 3], [240, 4], [150, 3], [200, 4], [100, 2], [90, 3], [80, 2],
      ];
      const [afstandTotaal, uren] = kiesWillekeurig(paren);
      const snelheid = afstandTotaal / uren;
      const deelUren = kiesWillekeurig([1, 2]);
      const afstand = snelheid * deelUren;
      const voertuig = kiesWillekeurig(["Een trein", "Een auto", "Een bus"]);
      return {
        vraagTekst: `${voertuig} rijdt ${afstandTotaal} km in ${uren} uur. Na ${deelUren} ${deelUren === 1 ? "uur" : "uur"} stopt ${voertuig.toLowerCase()} voor een pauze. Hoeveel km heeft ${voertuig.toLowerCase()} dan gereden?`,
        antwoordGoed: afstand,
        meta: { type: "snelheid_voorPauze", afstandTotaal, uren, deelUren, voertuig },
      };
    },
  },

  // --- G1: Geld — twee aankopen ---
  {
    id: "geld_tweeAankopen",
    genereer: () => {
      const bedrag = kiesWillekeurig([50, 60, 80, 100, 120, 150]);
      const prijs1 = kiesWillekeurig([10, 15, 20, 25, 30]);
      const over1 = bedrag - prijs1;
      const prijs2Opties = [];
      for (let p = 5; p <= over1 && p <= 40; p += 5) {
        if (over1 - p > 0) prijs2Opties.push(p);
      }
      const prijs2 = prijs2Opties.length > 0 ? kiesWillekeurig(prijs2Opties) : 5;
      const over = over1 - prijs2;
      const persoon = kiesWillekeurig(NAMEN);
      const item1 = kiesWillekeurig(["een boek", "een spelletje", "een kleurboek", "een stripboek", "een puzzel"]);
      const item2 = kiesWillekeurig(["een ijsje", "een drinken", "een kleurpotlood", "een gum", "een notitieboekje"]);
      return {
        vraagTekst: `${persoon.naam} heeft €${bedrag}. ${vw(persoon.geslacht, true)} koopt ${item1} van €${prijs1} en daarna ${item2} van €${prijs2}. Hoeveel euro heeft ${persoon.naam} nog over?`,
        antwoordGoed: over,
        meta: { type: "geld_tweeAankopen", bedrag, prijs1, prijs2, naam: persoon.naam },
      };
    },
  },

  // --- G2: Geld — korting eerste, dan tweede aankoop ---
  {
    id: "geld_kortingDanKopen",
    genereer: () => {
      const bedrag = kiesWillekeurig([40, 50, 60, 80, 100]);
      const kortingPct = kiesWillekeurig([10, 20, 25]);
      const korting = Math.floor(bedrag * kortingPct / 100);
      const naKorting = bedrag - korting;
      const prijs = kiesWillekeurig([5, 10, 15, 20].filter(p => p <= naKorting));
      const over = naKorting - prijs;
      const persoon = kiesWillekeurig(NAMEN);
      const artikel = kiesWillekeurig(["spel", "tas", "spaarboek", "cadeaubon", "rugzak"]);
      return {
        vraagTekst: `${persoon.naam} heeft €${bedrag}. ${vw(persoon.geslacht, true)} krijgt ${kortingPct}% korting op een ${artikel} van €${bedrag}. Na de korting koopt ${vw(persoon.geslacht)} er ook nog een cadeautje van €${prijs}. Hoeveel euro heeft ${persoon.naam} nu nog?`,
        antwoordGoed: over,
        meta: { type: "geld_kortingDanKopen", bedrag, kortingPct, prijs, naam: persoon.naam },
      };
    },
  },

  // --- T1: Tijd — dagen berekenen ---
  {
    id: "tijd_dagenWeken",
    genereer: () => {
      const weken = kiesWillekeurig([2, 3, 4, 5, 6]);
      const dagenTotaal = weken * 7;
      const dagenWeg = kiesWillekeurig([3, 5, 7, 10, 14].filter(d => d < dagenTotaal));
      const over = dagenTotaal - dagenWeg;
      const persoon = kiesWillekeurig(NAMEN);
      const activiteit = kiesWillekeurig(["lezen", "tekenen", "knutselen", "puzzelen", "schrijven"]);
      return {
        vraagTekst: `${persoon.naam} gaat ${weken} weken lang elke dag ${activiteit}. Dat zijn ${dagenTotaal} dagen. Maar ${vw(persoon.geslacht)} is ${dagenWeg} dagen op vakantie en kan dan niet ${activiteit}. Hoeveel dagen kan ${persoon.naam} wel ${activiteit}?`,
        antwoordGoed: over,
        meta: { type: "tijd_dagenWeken", weken, dagenWeg, naam: persoon.naam, activiteit },
      };
    },
  },

  // --- T2: Tijd — uren in een dag ---
  {
    id: "tijd_urenDag",
    genereer: () => {
      const slaap = kiesWillekeurig([8, 9, 10]);
      const school = kiesWillekeurig([6, 7, 8].filter(u => u + slaap < 24));
      const over = 24 - slaap - school;
      const kind = kiesWillekeurig(NAMEN);
      return {
        vraagTekst: `${kind.naam} slaapt ${slaap} uur per dag en zit ${school} uur op school. De rest van de dag is vrij. Hoeveel uur heeft ${kind.naam} per dag vrij?`,
        antwoordGoed: over,
        meta: { type: "tijd_urenDag", slaap, school, naam: kind.naam },
      };
    },
  },

  // --- V1: Verhouding — recept verdubbelen/verdrievoudigen ---
  {
    id: "verhouding_recept",
    genereer: () => {
      const factor = kiesWillekeurig([2, 3, 4]);
      const basisM = kiesWillekeurig([2, 3, 4, 5]);
      const totaal = basisM * factor;
      const persoon = kiesWillekeurig(NAMEN);
      const recept = kiesWillekeurig(["pannenkoeken", "cookies", "muffins", "wafels"]);
      return {
        vraagTekst: `${persoon.naam} bakt ${recept}. Voor 1 portie heeft ${vw(persoon.geslacht)} ${basisM} eetlepels bloem nodig. ${vw(persoon.geslacht, true)} wil ${factor} porties maken, maar heeft al ${basisM} eetlepels in de keuken staan. Hoeveel eetlepels bloem moet ${persoon.naam} nog kopen?`,
        antwoordGoed: totaal - basisM,
        meta: { type: "verhouding_recept", factor, basisM, naam: persoon.naam },
      };
    },
  },
];

// -----------------------------------------------------------------------------
// 3-STAP (uitdagend) sjablonen
// -----------------------------------------------------------------------------

const TEMPLATES_3_STAP = [
  // --- B3: Breuk — drie delen weggeven ---
  {
    id: "breuk_drieDelenWeg",
    genereer: () => {
      const totaal = kiesWillekeurig([24, 30, 36, 48, 60]);
      let delers = [];
      for (let d = 2; d <= 10; d++) {
        if (totaal % d === 0) delers.push(d);
      }
      // Kies 3 unieke delers, waarbij de som van 1/n1 + 1/n2 + 1/n3 ≤ 1
      const gekozen = [];
      const copy = [...delers];
      while (gekozen.length < 3 && copy.length > 0) {
        const idx = randomGeheelGetal(0, copy.length - 1);
        const kandidaat = copy[idx];
        const testOver = totaal - (totaal / kandidaat) - gekozen.reduce((s, d) => s + totaal / d, 0);
        if (testOver > 0) {
          gekozen.push(kandidaat);
        }
        copy.splice(idx, 1);
      }
      if (gekozen.length < 3) return TEMPLATES_3_STAP[0].genereer(); // retry
      const [n1, n2, n3] = gekozen;
      const over = totaal - (totaal / n1) - (totaal / n2) - (totaal / n3);
      const persoon = kiesWillekeurig(NAMEN);
      const voorwerp = kiesWillekeurig(["appels", "koekjes", "knikkers", "snoepjes", "stickers", "bonbons"]);
      return {
        vraagTekst: `${persoon.naam} heeft ${totaal} ${voorwerp}. ${vw(persoon.geslacht, true)} geeft 1/${n1} aan Marie, 1/${n2} aan Kees en 1/${n3} aan Sam. Hoeveel ${voorwerp} houdt ${persoon.naam} zelf over?`,
        antwoordGoed: over,
        meta: { type: "breuk_drieDelenWeg", totaal, n1, n2, n3, naam: persoon.naam, voorwerp },
      };
    },
  },

  // --- S3: Snelheid — rit met pauze, dan nog een stuk ---
  {
    id: "snelheid_ritMetPauze",
    genereer: () => {
      const paren = [
        [120, 2], [180, 3], [240, 4], [150, 3], [200, 4], [100, 2],
      ];
      const [afstandTotaal, uren] = kiesWillekeurig(paren);
      const snelheid = afstandTotaal / uren;
      const eersteUren = kiesWillekeurig([1, 2].filter(u => u < uren));
      const eersteAfstand = snelheid * eersteUren;
      const pauzeMin = kiesWillekeurig([15, 30]);
      const restUren = uren - eersteUren;
      const tweedeAfstand = snelheid * restUren;
      const antwoord = eersteAfstand + tweedeAfstand;
      const voertuig = kiesWillekeurig(["Een trein", "Een auto", "Een bus"]);
      return {
        vraagTekst: `${voertuig} rijdt ${afstandTotaal} km in ${uren} uur. Na ${eersteUren} ${eersteUren === 1 ? "uur" : "uur"} stopt ${voertuig.toLowerCase()} ${pauzeMin} minuten. Daarna rijdt ${voertuig.toLowerCase()} nog ${restUren} ${restUren === 1 ? "uur" : "uur"} door. Hoeveel km heeft ${voertuig.toLowerCase()} in totaal gereden?`,
        antwoordGoed: antwoord,
        meta: { type: "snelheid_ritMetPauze", afstandTotaal, uren, eersteUren, pauzeMin, restUren, voertuig },
      };
    },
  },

  // --- G3: Geld — sparen, uitgeven, nog een keer ---
  {
    id: "geld_sparenUitgeven",
    genereer: () => {
      const start = kiesWillekeurig([50, 60, 80, 100, 120, 150]);
      const weekGeld = kiesWillekeurig([5, 10, 15, 20].filter(w => w < start));
      const weken = kiesWillekeurig([3, 4, 5]);
      const gespaard = start + weekGeld * weken;
      const uitgave = kiesWillekeurig([20, 25, 30, 35, 40, 50].filter(u => u < gespaard));
      const over = gespaard - uitgave;
      const persoon = kiesWillekeurig(NAMEN);
      const product = kiesWillekeurig(["een skateboard", "een spelcomputer", "een nieuwe telefoon", "een fiets", "een drone"]);
      return {
        vraagTekst: `${persoon.naam} heeft €${start} gespaard. ${vw(persoon.geslacht, true)} krijgt elke week €${weekGeld} zakgeld. Na ${weken} weken spaart ${vw(persoon.geslacht)} ook nog het zakgeld. Dan koopt ${vw(persoon.geslacht)} ${product} van €${uitgave}. Hoeveel euro heeft ${persoon.naam} dan nog over?`,
        antwoordGoed: over,
        meta: { type: "geld_sparenUitgeven", start, weekGeld, weken, uitgave, naam: persoon.naam },
      };
    },
  },

  // --- T3: Tijd — uren/minuten optellen ---
  {
    id: "tijd_urenOptellen",
    genereer: () => {
      const activiteiten = [
        { naam: "huiswerk", uren: 1, min: 15 },
        { naam: "sporten", uren: 1, min: 30 },
        { naam: "tv kijken", uren: 1, min: 0 },
        { naam: "piano oefenen", uren: 0, min: 45 },
        { naam: "lezen", uren: 0, min: 30 },
        { naam: "gamen", uren: 1, min: 0 },
        { naam: "tekenen", uren: 0, min: 45 },
        { naam: "muziek luisteren", uren: 0, min: 30 },
      ];
      const gekozen = [];
      const copy = [...activiteiten];
      while (gekozen.length < 3) {
        const idx = randomGeheelGetal(0, copy.length - 1);
        gekozen.push(copy[idx]);
        copy.splice(idx, 1);
      }
      const totaalMin = gekozen.reduce((s, a) => s + a.uren * 60 + a.min, 0);
      const antwoordUren = Math.floor(totaalMin / 60);
      const antwoordMin = totaalMin % 60;
      // We vragen naar minuten totaal (hele getallen)
      const persoon = kiesWillekeurig(NAMEN);
      const beschrijving = gekozen.map(a => `${a.naam} (${a.uren > 0 ? a.uren + ' uur' : ''}${a.uren > 0 && a.min > 0 ? ' en ' : ''}${a.min > 0 ? a.min + ' min' : ''})`).join(', ');
      return {
        vraagTekst: `${persoon.naam} doet elke dag ${gekozen.length} dingen: ${beschrijving}. Hoeveel minuten kost dit ${persoon.naam} in totaal?`,
        antwoordGoed: totaalMin,
        meta: { type: "tijd_urenOptellen", totaalMin, naam: persoon.naam },
      };
    },
  },

  // --- V3: Verhouding — groep verdelen over dagen ---
  {
    id: "verhouding_groepVerdelen",
    genereer: () => {
      const totaal = kiesWillekeurig([60, 72, 84, 96, 108, 120]);
      const dagen = kiesWillekeurig([3, 4, 6].filter(d => totaal % d === 0));
      const perDag = totaal / dagen;
      const eersteDagen = kiesWillekeurig([1, 2].filter(d => d < dagen));
      const eersteDeel = perDag * eersteDagen;
      const restDagen = dagen - eersteDagen;
      const restDeel = perDag * restDagen;
      const persoon = kiesWillekeurig(NAMEN);
      const activiteit = kiesWillekeurig(["sommen", "woordjes leren", "vraagjes", "oefeningen", "pagina's lezen"]);
      return {
        vraagTekst: `${persoon.naam} moet in ${dagen} dagen in totaal ${totaal} ${activiteit} maken. Elke dag evenveel. Na ${eersteDagen} ${eersteDagen === 1 ? "dag" : "dagen"} stopt ${vw(persoon.geslacht)} even. Hoeveel ${activiteit} heeft ${persoon.naam} dan al gemaakt en hoeveel moet ${vw(persoon.geslacht)} nog maken? Tel ze bij elkaar op.`,
        antwoordGoed: totaal, // want het totaal is het antwoord (eersteDeel + restDeel = totaal)
        meta: { type: "verhouding_groepVerdelen", totaal, dagen, perDag, eersteDagen, naam: persoon.naam },
      };
    },
  },

  // --- B4: Breuk + verhouding gecombineerd ---
  {
    id: "breuk_verhoudingGemengd",
    genereer: () => {
      const totaal = kiesWillekeurig([20, 24, 30, 36, 40]);
      const n1 = kiesBreukDeler(totaal);
      const deel1 = totaal / n1;
      const rest = totaal - deel1;
      // Verdeel rest in 2:3 of 1:2 of 3:4
      const verhoudingOpties = [
        [1, 2, rest / 3, (rest / 3) * 2],
        [2, 3, (rest / 5) * 2, (rest / 5) * 3],
        [1, 3, rest / 4, (rest / 4) * 3],
        [3, 4, (rest / 7) * 3, (rest / 7) * 4],
      ];
      const bruikbaar = verhoudingOpties.filter(o => Number.isInteger(o[2]) && Number.isInteger(o[3]));
      if (bruikbaar.length === 0) return TEMPLATES_3_STAP[4].genereer(); // fallback
      const [v1, v2, a, b] = kiesWillekeurig(bruikbaar);
      const persoon = kiesWillekeurig(NAMEN);
      const voorwerp = kiesWillekeurig(["knikkers", "stickers", "cadeautjes", "foto's", "kaarten"]);
      return {
        vraagTekst: `${persoon.naam} heeft ${totaal} ${voorwerp}. ${vw(persoon.geslacht, true)} geeft 1/${n1} aan een vriend. De ${voorwerp} die overblijven verdeelt ${vw(persoon.geslacht)} in een verhouding van ${v1}:${v2} over twee broertjes. Hoeveel ${voorwerp} krijgt het tweede broertje?`,
        antwoordGoed: b,
        meta: { type: "breuk_verhoudingGemengd", totaal, n1, v1, v2, antwoord: b, naam: persoon.naam, voorwerp },
      };
    },
  },
];

// -----------------------------------------------------------------------------
// Generator entry points
// -----------------------------------------------------------------------------

const ALLE_TEMPLATES = {
  makkelijk: TEMPLATES_2_STAP,
  uitdagend: TEMPLATES_3_STAP,
};

/**
 * Genereert één complexe opgave.
 * @param {Object} instellingen - { moeilijkheid: "makkelijk"|"uitdagend" }
 * @returns {Object} { type, vraagTekst, antwoordGoed, meta }
 */
export function genereerOpgave(instellingen) {
  const moeilijkheid = instellingen.moeilijkheid || "makkelijk";
  const templates = ALLE_TEMPLATES[moeilijkheid] || TEMPLATES_2_STAP;
  const template = kiesWillekeurig(templates);
  const opgave = template.genereer();
  return {
    type: opgave.meta.type,
    vraagTekst: opgave.vraagTekst,
    antwoordGoed: opgave.antwoordGoed,
    meta: { ...opgave.meta },
  };
}

/** Maakt een unieke sleutel van een opgave, om herhaling binnen een sessie te voorkomen. */
export function opgaveNaarSleutel(opgave) {
  return `${opgave.type}_${JSON.stringify(opgave.meta)}`;
}