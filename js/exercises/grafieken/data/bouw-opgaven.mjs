// Genereert opgaven.json: de 50 opgaven "Grafieken lezen" (groep 8).
// Alle antwoorden worden hier berekend uit de onderliggende dataset, zodat
// grafiek, antwoord en uitleg altijd overeenkomen.
// Uitvoeren: node js/exercises/grafieken/data/bouw-opgaven.mjs

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const nl = (n) => String(Math.round(n * 1e6) / 1e6).replace(".", ",");
const som = (a) => a.reduce((x, y) => x + y, 0);

const NIVEAUS = { 1: "Aflezen", 2: "Vergelijken", 3: "Combineren", 4: "Rekenen", 5: "Redeneren" };
const CAT = {
  A: "Aflezen",
  V: "Vergelijken",
  T: "Trends en verbanden",
  R: "Rekenen met gegevens",
  K: "Kritisch interpreteren",
};

const DAGEN = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
const weken = (n) => Array.from({ length: n }, (_, i) => `Week ${i + 1}`);

// ----------------------------------------------------------------------------
// Datasets / grafieken
// ----------------------------------------------------------------------------
const G = {
  zonnebloem: { type: "lijn", titel: "Hoogte van de zonnebloem", labels: weken(6), reeksen: [{ naam: "Hoogte", waarden: [8, 13, 21, 29, 36, 42] }], xTitel: "Week", yTitel: "Hoogte (cm)", eenheid: "cm", yMin: 0, yMax: 50, stap: 10 },
  temperatuur: { type: "lijn", titel: "Temperatuur per dag", labels: DAGEN, reeksen: [{ naam: "Temperatuur", waarden: [14, 17, 21, 18, 23, 25, 20] }], xTitel: "Dag", yTitel: "Temperatuur (°C)", eenheid: "°C", yMin: 0, yMax: 30, stap: 5 },
  sporten: { type: "staaf", titel: "Leerlingen per sport", labels: ["Voetbal", "Hockey", "Tennis", "Zwemmen", "Judo", "Turnen"], reeksen: [{ naam: "Leerlingen", waarden: [18, 9, 7, 12, 5, 8] }], xTitel: "Sport", yTitel: "Aantal leerlingen", eenheid: "leerlingen", yMin: 0, yMax: 20, stap: 5 },
  ijsjes: { type: "lijn", titel: "Verkochte ijsjes per dag", labels: DAGEN, reeksen: [{ naam: "Ijsjes", waarden: [35, 42, 58, 64, 47, 80, 71] }], xTitel: "Dag", yTitel: "Aantal ijsjes", eenheid: "ijsjes", yMin: 0, yMax: 100, stap: 20 },
  afval: { type: "cirkel", titel: "Verdeling van 200 kg afval", segmenten: [{ label: "Papier", waarde: 25 }, { label: "Plastic", waarde: 30 }, { label: "GFT", waarde: 20 }, { label: "Restafval", waarde: 15 }, { label: "Glas", waarde: 10 }], eenheid: "%" },
  planten: { type: "lijn", titel: "Groei van twee planten", labels: weken(5), reeksen: [{ naam: "Plant A", waarden: [5, 9, 14, 18, 25] }, { naam: "Plant B", waarden: [7, 10, 14, 20, 22] }], xTitel: "Week", yTitel: "Hoogte (cm)", eenheid: "cm", yMin: 0, yMax: 30, stap: 5 },
  huisdieren: { type: "staaf", titel: "Huisdieren in groep 8 (25 kinderen)", labels: ["Hond", "Kat", "Konijn", "Vis", "Cavia", "Geen"], reeksen: [{ naam: "Kinderen", waarden: [8, 6, 4, 3, 2, 2] }], xTitel: "Huisdier", yTitel: "Aantal kinderen", eenheid: "kinderen", yMin: 0, yMax: 10, stap: 2 },
  boeken: { type: "staaf", titel: "Gelezen boeken per maand", labels: ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun"], reeksen: [{ naam: "Boeken", waarden: [4, 6, 5, 9, 7, 5] }], xTitel: "Maand", yTitel: "Aantal boeken", eenheid: "boeken", yMin: 0, yMax: 10, stap: 2 },
  appels: { type: "pictogram", titel: "Geoogste appels per dag", rijen: [{ label: "Maandag", aantal: 4 }, { label: "Dinsdag", aantal: 6 }, { label: "Woensdag", aantal: 5 }, { label: "Donderdag", aantal: 8 }, { label: "Vrijdag", aantal: 7 }], icoon: "🍎", waardePerIcoon: 10, eenheid: "appels" },
  fietsen: { type: "pictogram", titel: "Fietsen op de parkeerplaats", rijen: [{ label: "Maandag", aantal: 6 }, { label: "Dinsdag", aantal: 8 }, { label: "Woensdag", aantal: 7 }, { label: "Donderdag", aantal: 9 }, { label: "Vrijdag", aantal: 10 }], icoon: "🚲", waardePerIcoon: 4, eenheid: "fietsen" },
  opvang: { type: "pictogram", titel: "Dieren in het opvangcentrum", rijen: [{ label: "Honden", aantal: 7, icoon: "🐶" }, { label: "Katten", aantal: 9, icoon: "🐱" }, { label: "Konijnen", aantal: 3, icoon: "🐰" }, { label: "Vogels", aantal: 2, icoon: "🐦" }], icoon: "🐾", waardePerIcoon: 2, eenheid: "dieren" },
  regen: { type: "tabel", titel: "Regenval per maand", kolommen: ["Maand", "Regenval (mm)"], rijen: [["Januari", 68], ["Februari", 52], ["Maart", 60], ["April", 44], ["Mei", 56], ["Juni", 62]] },
  winkel: { type: "tabel", titel: "Verkoop in de schoolwinkel", kolommen: ["Product", "Aantal verkocht", "Prijs per stuk"], rijen: [["Pen", 40, "€ 1,00"], ["Schrift", 25, "€ 2,00"], ["Gum", 30, "€ 0,50"], ["Liniaal", 15, "€ 2,00"]] },
  sprint: { type: "tabel", titel: "Tijden op de 60 meter", kolommen: ["Naam", "Tijd (seconden)"], rijen: [["Lisa", "10,2"], ["Daan", "9,8"], ["Noor", "10,5"], ["Sem", "9,6"], ["Mila", "9,9"]] },
  water: { type: "lijn", titel: "Waterstand van de rivier", labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"], reeksen: [{ naam: "Waterstand", waarden: [2.0, 1.6, 1.2, 1.8, 2.6, 2.2] }], xTitel: "Tijdstip", yTitel: "Waterstand (m)", eenheid: "m", yMin: 0, yMax: 3, stap: 0.5 },
  zwembad: { type: "lijn", titel: "Bezoekers van het zwembad", labels: ["Maart", "April", "Mei", "Juni", "Juli", "Augustus"], reeksen: [{ naam: "Bezoekers", waarden: [400, 650, 1100, 1800, 2400, 2200] }], xTitel: "Maand", yTitel: "Aantal bezoekers", eenheid: "bezoekers", yMin: 0, yMax: 3000, stap: 500 },
  boom: { type: "lijn", titel: "Hoogte van de boom", labels: ["2018", "2019", "2020", "2021", "2022", "2023"], reeksen: [{ naam: "Hoogte", waarden: [0.5, 0.9, 1.4, 1.8, 2.1, 2.3] }], xTitel: "Jaar", yTitel: "Hoogte (m)", eenheid: "m", yMin: 0, yMax: 3, stap: 0.5 },
  tijd: { type: "cirkel", titel: "Een dag van Sara (24 uur)", segmenten: [{ label: "Slapen", waarde: 9 }, { label: "School", waarde: 6 }, { label: "Spelen", waarde: 4 }, { label: "Eten", waarde: 2 }, { label: "Beeldscherm", waarde: 2 }, { label: "Overig", waarde: 1 }], eenheid: "uur" },
  vervoer: { type: "cirkel", titel: "Vervoer naar school (40 kinderen)", segmenten: [{ label: "Fiets", waarde: 40 }, { label: "Lopen", waarde: 25 }, { label: "Auto", waarde: 20 }, { label: "Bus", waarde: 10 }, { label: "Step", waarde: 5 }], eenheid: "%" },
  ijsTemp: { type: "combi", titel: "Temperatuur en ijsverkoop", labels: ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"], staaf: { naam: "Verkochte ijsjes", waarden: [20, 35, 60, 85, 55], yTitel: "Aantal ijsjes", yMax: 100, stap: 20 }, lijn: { naam: "Temperatuur (°C)", waarden: [16, 18, 22, 25, 21], yTitel: "Temperatuur (°C)", yMax: 30, stap: 5 }, xTitel: "Dag" },
  sportMV: { type: "staaf", titel: "Deelname aan sportactiviteiten", labels: ["Voetbal", "Dansen", "Zwemmen", "Tennis"], reeksen: [{ naam: "Jongens", waarden: [14, 3, 8, 5] }, { naam: "Meisjes", waarden: [6, 12, 9, 5] }], xTitel: "Sport", yTitel: "Aantal kinderen", eenheid: "kinderen", yMin: 0, yMax: 16, stap: 4 },
  brood: { type: "staaf", titel: "Verkochte broden per maand", labels: ["Januari", "Februari", "Maart", "April"], reeksen: [{ naam: "Broden", waarden: [94, 95, 98, 99] }], xTitel: "Maand", yTitel: "Aantal broden", eenheid: "broden", yMin: 90, yMax: 100, stap: 2 },
  toetsen: { type: "tabel", titel: "Rapportcijfers van Emre", kolommen: ["Toets", "Cijfer"], rijen: [["Toets 1", 6], ["Toets 2", 8], ["Toets 3", 9], ["Toets 4", "?"]] },
  biebBezoek: { type: "staaf", titel: "Bezoekers van de bibliotheek", labels: ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"], reeksen: [{ naam: "Bezoekers", waarden: [22, 25, 24, 23, 61, 26] }], xTitel: "Dag", yTitel: "Aantal bezoekers", eenheid: "bezoekers", yMin: 0, yMax: 70, stap: 10 },
  dorp: { type: "lijn", titel: "Inwoners van het dorp", labels: ["2018", "2019", "2020", "2021", "2022"], reeksen: [{ naam: "Inwoners", waarden: [1200, 1260, 1330, 1390, 1450] }], xTitel: "Jaar", yTitel: "Aantal inwoners", eenheid: "inwoners", yMin: 0, yMax: 1600, stap: 400 },
};

const val = (g, i, r = 0) => G[g].reeksen[r].waarden[i];
const lab = (g, i) => G[g].labels[i];
const seg = (g, naam) => G[g].segmenten.find((s) => s.label === naam).waarde;
const rij = (g, naam) => G[g].rijen.find((r) => r[0] === naam);
const pict = (g, naam) => G[g].rijen.find((r) => r.label === naam).aantal * G[g].waardePerIcoon;

const HINT = {
  staaf: "Bijna! Kijk nog eens naar de hoogte van de staaf en lees die af op de verticale as.",
  lijn: "Bijna! Kijk nog eens naar de verticale as. Welke waarde hoort bij dit punt?",
  cirkel: "Bijna! Kijk nog eens naar de legenda en het deel van de cirkel dat bij dit onderdeel hoort.",
  pictogram: "Bijna! Kijk nog eens naar de legenda: hoeveel is één plaatje waard?",
  tabel: "Bijna! Zoek de juiste rij en kolom in de tabel nog eens op.",
  combi: "Bijna! Let op: de staven horen bij de linker as, de lijn bij de rechter as.",
};

const lijst = [];
function Q(g, niveau, cat, titel, context, vraag, uitleg, leerdoel, hint) {
  lijst.push({ g, niveau, cat, titel, context, vraag, uitleg, leerdoel, hint });
}
const getal = (tekst, antwoord, eenheid) => ({ type: "getal", tekst, antwoord, ...(eenheid ? { eenheid } : {}) });
const mk = (tekst, opties, juist) => ({ type: "meerkeuze", tekst, opties, antwoord: juist });
const wo = (tekst, antwoord) => ({ type: "waaronwaar", tekst, antwoord });
const meer = (tekst, opties, juist) => ({ type: "meerdere", tekst, opties, antwoord: juist });
const tekst = (tekstV, antwoord, geaccepteerd) => ({ type: "tekst", tekst: tekstV, antwoord, geaccepteerd });

// ----------------------------------------------------------------------------
// Niveau 1: aflezen
// ----------------------------------------------------------------------------
Q("zonnebloem", 1, "A", "Zonnebloem: hoogte aflezen", "Lars meet zes weken lang hoe hoog zijn zonnebloem is.",
  getal("Hoe hoog was de zonnebloem in week 3?", val("zonnebloem", 2), "cm"),
  ["Zoek week 3 op de horizontale as.", "Ga omhoog naar het punt op de lijn en lees de hoogte af op de verticale as.", `In week 3 was de zonnebloem ${val("zonnebloem", 2)} cm hoog.`],
  "Een waarde aflezen uit een lijndiagram");

Q("temperatuur", 1, "A", "De warmste dag", "Een weerstation noteert de temperatuur om 12 uur 's middags.",
  mk("Op welke dag was het het warmst?", ["Woensdag", "Vrijdag", "Zaterdag", "Zondag"], 2),
  ["Zoek het hoogste punt van de lijn.", `Dat punt hoort bij ${lab("temperatuur", 5)}: ${val("temperatuur", 5)} °C.`, "Het was het warmst op zaterdag."],
  "Het hoogste punt in een lijndiagram vinden");

Q("sporten", 1, "A", "Sporten die veel kinderen doen", "De sportclub vroeg 59 leerlingen welke sport ze beoefenen.",
  meer("Welke sporten worden door meer dan 8 leerlingen beoefend? (Meerdere antwoorden mogelijk)", ["Voetbal", "Hockey", "Tennis", "Zwemmen", "Judo", "Turnen"], [0, 1, 3]),
  ["Lees bij elke staaf de hoogte af.", "Voetbal 18, hockey 9, tennis 7, zwemmen 12, judo 5, turnen 8.", "Meer dan 8: voetbal, hockey en zwemmen. Turnen is precies 8 en dus niet meer dan 8."],
  "Meerdere waarden aflezen en vergelijken met een grens");

Q("afval", 1, "A", "Het grootste afvaldeel", "Een school weegt een week lang het afval: 200 kg in totaal.",
  mk("Welke afvalsoort vormt het grootste deel?", ["Papier", "Plastic", "GFT", "Glas"], 1),
  ["Zoek het grootste stuk van de cirkel.", "Plastic is 30%; dat is meer dan papier (25%), GFT (20%) en glas (10%).", "Plastic is het grootste deel."],
  "Het grootste deel in een cirkeldiagram vinden");

Q("huisdieren", 1, "A", "Katten in de klas", "In groep 8 zitten 25 kinderen. Ze tellen hun huisdieren.",
  getal("Hoeveel kinderen hebben een kat?", val("huisdieren", 1), "kinderen"),
  ["Zoek de staaf bij 'Kat'.", "Lees de hoogte af op de verticale as.", `${val("huisdieren", 1)} kinderen hebben een kat.`],
  "Een waarde aflezen uit een staafdiagram");

Q("boeken", 1, "A", "Boeken in mei", "De bibliotheek houdt bij hoeveel boeken groep 8 per maand leest.",
  getal("Hoeveel boeken las de klas in mei?", val("boeken", 4), "boeken"),
  ["Zoek 'Mei' op de horizontale as.", "Lees de hoogte van de staaf af.", `In mei las de klas ${val("boeken", 4)} boeken.`],
  "Een waarde aflezen uit een staafdiagram");

Q("appels", 1, "A", "Appels plukken op donderdag", "Op een boerderij worden appels geplukt. Elke 🍎 staat voor 10 appels.",
  getal("Hoeveel appels werden er donderdag geoogst?", pict("appels", "Donderdag"), "appels"),
  ["Tel de plaatjes bij donderdag: 8.", "Elk plaatje is 10 appels waard.", `8 × 10 = ${pict("appels", "Donderdag")} appels.`],
  "Een pictogram lezen met een legenda");

Q("regen", 1, "A", "Regen in april", "Het KNMI meet de regenval in een tabel.",
  getal("Hoeveel millimeter regen viel er in april?", rij("regen", "April")[1], "mm"),
  ["Zoek de rij 'April' in de tabel.", "Lees de waarde in de kolom 'Regenval (mm)' af.", `In april viel ${rij("regen", "April")[1]} mm regen.`],
  "Een waarde aflezen uit een tabel");

Q("water", 1, "A", "De waterstand om 08:00", "Een meetpaal bij de rivier meldt elke vier uur de waterstand.",
  getal("Wat was de waterstand om 08:00 uur?", val("water", 2), "m"),
  ["Zoek 08:00 op de horizontale as.", "Lees het punt af op de verticale as. Let op: de stappen zijn 0,5 meter.", `De waterstand was ${nl(val("water", 2))} m.`],
  "Een waarde aflezen met een schaalverdeling in halve stappen");

Q("vervoer", 1, "A", "Hoe komen kinderen naar school?", "Er is aan 40 kinderen gevraagd hoe ze naar school komen.",
  mk("Welk vervoermiddel wordt het meest gebruikt?", ["Lopen", "Auto", "Fiets", "Bus"], 2),
  ["Zoek het grootste stuk van de cirkel.", "Fiets is 40%, lopen 25%, auto 20%, bus 10%.", "De fiets wordt het meest gebruikt."],
  "Het grootste deel in een cirkeldiagram vinden");

// ----------------------------------------------------------------------------
// Niveau 2: vergelijken
// ----------------------------------------------------------------------------
{
  const v = val("temperatuur", 4) - val("temperatuur", 0);
  Q("temperatuur", 2, "V", "Maandag en vrijdag vergeleken", "Een weerstation noteert de temperatuur om 12 uur 's middags.",
    getal("Hoeveel graden warmer was het op vrijdag dan op maandag?", v, "graden"),
    [`Maandag: ${val("temperatuur", 0)} °C. Vrijdag: ${val("temperatuur", 4)} °C.`, `Verschil: ${val("temperatuur", 4)} − ${val("temperatuur", 0)} = ${v}.`, `Het was ${v} graden warmer.`],
    "Het verschil tussen twee waarden berekenen");
}
{
  const v = val("sporten", 0) - val("sporten", 2);
  Q("sporten", 2, "V", "Voetbal tegenover tennis", "De sportclub vroeg 59 leerlingen welke sport ze beoefenen.",
    getal("Hoeveel leerlingen meer doen aan voetbal dan aan tennis?", v, "leerlingen"),
    [`Voetbal: ${val("sporten", 0)}. Tennis: ${val("sporten", 2)}.`, `${val("sporten", 0)} − ${val("sporten", 2)} = ${v}`, `${v} leerlingen meer.`],
    "Het verschil tussen twee staven berekenen");
}
Q("ijsjes", 2, "T", "De grootste daling", "Een ijscoman telt een week lang hoeveel ijsjes hij verkoopt.",
  mk("Tussen welke twee dagen was de grootste daling in de verkoop?", ["Woensdag en donderdag", "Donderdag en vrijdag", "Zaterdag en zondag", "Dinsdag en woensdag"], 1),
  ["Een daling zie je aan een lijn die naar beneden loopt.", `Donderdag → vrijdag: ${val("ijsjes", 3)} − ${val("ijsjes", 4)} = ${val("ijsjes", 3) - val("ijsjes", 4)} minder.`, `Zaterdag → zondag: ${val("ijsjes", 5)} − ${val("ijsjes", 6)} = ${val("ijsjes", 5) - val("ijsjes", 6)} minder. Woensdag en dinsdag stijgen juist.`, "De grootste daling was van donderdag naar vrijdag."],
  "De grootste daling in een lijndiagram bepalen");
{
  const kg = (seg("afval", "Plastic") / 100) * 200;
  Q("afval", 2, "R", "Kilo's plastic", "Een school weegt een week lang het afval: 200 kg in totaal.",
    getal("Hoeveel kilogram van het afval is plastic?", kg, "kg"),
    ["Plastic is 30% van 200 kg.", "10% van 200 kg is 20 kg, dus 30% is 3 × 20 kg.", `3 × 20 = ${kg} kg.`],
    "Een percentage van een hoeveelheid berekenen");
}
Q("planten", 2, "V", "Welke plant is het hoogst?", "Mia laat twee planten groeien en meet ze elke week.",
  mk("Welke plant is na week 4 het hoogst?", ["Plant A", "Plant B", "Ze zijn even hoog"], 1),
  [`Week 4: plant A is ${val("planten", 3, 0)} cm en plant B is ${val("planten", 3, 1)} cm.`, `${val("planten", 3, 1)} is meer dan ${val("planten", 3, 0)}.`, "Plant B is het hoogst."],
  "Twee gegevensreeksen in één grafiek vergelijken");
{
  const v = val("planten", 3, 1) - val("planten", 3, 0);
  Q("planten", 2, "V", "Het verschil na week 4", "Mia laat twee planten groeien en meet ze elke week.",
    getal("Hoeveel centimeter verschil is er na week 4 tussen de twee planten?", v, "cm"),
    [`Plant A: ${val("planten", 3, 0)} cm. Plant B: ${val("planten", 3, 1)} cm.`, `${val("planten", 3, 1)} − ${val("planten", 3, 0)} = ${v}`, `Het verschil is ${v} cm.`],
    "Het verschil tussen twee gegevensreeksen berekenen");
}
{
  const v = pict("appels", "Donderdag") - pict("appels", "Maandag");
  Q("appels", 2, "V", "Donderdag tegenover maandag", "Op een boerderij worden appels geplukt. Elke 🍎 staat voor 10 appels.",
    getal("Hoeveel appels meer werden er donderdag geoogst dan maandag?", v, "appels"),
    [`Donderdag: 8 plaatjes = ${pict("appels", "Donderdag")} appels. Maandag: 4 plaatjes = ${pict("appels", "Maandag")} appels.`, `${pict("appels", "Donderdag")} − ${pict("appels", "Maandag")} = ${v}`, `Er werden ${v} appels meer geoogst.`],
    "Pictogrammen vergelijken");
}
{
  const v = pict("opvang", "Katten") - pict("opvang", "Honden");
  Q("opvang", 2, "V", "Katten en honden in het asiel", "In een opvangcentrum zitten dieren. Elk plaatje staat voor 2 dieren.",
    getal("Hoeveel katten meer dan honden zitten er in het opvangcentrum?", v, "dieren"),
    [`Katten: 9 plaatjes × 2 = ${pict("opvang", "Katten")}. Honden: 7 plaatjes × 2 = ${pict("opvang", "Honden")}.`, `${pict("opvang", "Katten")} − ${pict("opvang", "Honden")} = ${v}`, `Er zitten ${v} katten meer dan honden.`],
    "Pictogrammen met een andere waarde per plaatje vergelijken");
}
{
  const r = G.sprint.rijen.map((x) => [x[0], Number(x[1].replace(",", "."))]);
  const snelst = r.reduce((a, b) => (b[1] < a[1] ? b : a));
  Q("sprint", 2, "V", "Wie is het snelst?", "Bij de sportdag lopen vijf kinderen de 60 meter.",
    tekst("Wie liep de 60 meter het snelst? (Typ de naam)", snelst[0], [snelst[0].toLowerCase()]),
    ["Bij een hardloopwedstrijd wint de kleinste tijd.", `De kleinste tijd is ${nl(snelst[1])} seconden.`, `${snelst[0]} was het snelst.`],
    "De laagste waarde in een tabel vinden");
}
Q("sportMV", 2, "V", "Evenveel jongens als meisjes", "Een school telt hoeveel jongens en meisjes meedoen aan sportactiviteiten.",
  tekst("Bij welke sport doen evenveel jongens als meisjes mee?", "Tennis", ["tennis"]),
  ["Vergelijk bij elke sport de blauwe en de oranje staaf.", "Alleen bij tennis zijn ze even hoog: 5 en 5.", "Het antwoord is tennis."],
  "Twee reeksen per categorie vergelijken");

// ----------------------------------------------------------------------------
// Niveau 3: combineren
// ----------------------------------------------------------------------------
{
  const v = val("sporten", 0) + val("sporten", 1);
  Q("sporten", 3, "R", "Voetbal en hockey samen", "De sportclub vroeg 59 leerlingen welke sport ze beoefenen.",
    getal("Hoeveel leerlingen doen samen aan voetbal en hockey?", v, "leerlingen"),
    [`Voetbal: ${val("sporten", 0)}. Hockey: ${val("sporten", 1)}.`, `${val("sporten", 0)} + ${val("sporten", 1)} = ${v}`, `${v} leerlingen.`],
    "Twee waarden uit een staafdiagram optellen");
}
{
  const v = som(G.ijsjes.reeksen[0].waarden);
  Q("ijsjes", 3, "R", "Alle ijsjes van de week", "Een ijscoman telt een week lang hoeveel ijsjes hij verkoopt.",
    getal("Hoeveel ijsjes werden er in totaal verkocht?", v, "ijsjes"),
    ["Lees de waarde van elke dag af: " + G.ijsjes.reeksen[0].waarden.join(", ") + ".", G.ijsjes.reeksen[0].waarden.join(" + ") + ` = ${v}`, `In totaal ${v} ijsjes.`],
    "Alle waarden uit een lijndiagram optellen");
}
{
  const kg = ((seg("afval", "Papier") + seg("afval", "Glas")) / 100) * 200;
  Q("afval", 3, "R", "Papier en glas samen", "Een school weegt een week lang het afval: 200 kg in totaal.",
    getal("Hoeveel kilogram is papier en glas samen?", kg, "kg"),
    ["Papier is 25% en glas is 10%: samen 35%.", "10% van 200 kg is 20 kg, dus 5% is 10 kg.", `35% = 3 × 20 + 10 = ${kg} kg.`],
    "Percentages combineren en omrekenen naar kilogram");
}
{
  const gr = (r) => val("planten", 4, r) - val("planten", 1, r);
  Q("planten", 3, "T", "Wie groeide het meest?", "Mia laat twee planten groeien en meet ze elke week.",
    tekst("Welke plant groeide het meest tussen week 2 en week 5? (Typ Plant A of Plant B)", gr(0) > gr(1) ? "Plant A" : "Plant B", gr(0) > gr(1) ? ["plant a", "a"] : ["plant b", "b"]),
    [`Plant A: ${val("planten", 4, 0)} − ${val("planten", 1, 0)} = ${gr(0)} cm.`, `Plant B: ${val("planten", 4, 1)} − ${val("planten", 1, 1)} = ${gr(1)} cm.`, `${gr(0) > gr(1) ? "Plant A" : "Plant B"} groeide het meest.`],
    "De groei van twee reeksen over een periode vergelijken");
}
{
  const v = G.appels.rijen.reduce((s, r) => s + r.aantal, 0) * 10;
  Q("appels", 3, "R", "De oogst van de hele week", "Op een boerderij worden appels geplukt. Elke 🍎 staat voor 10 appels.",
    getal("Hoeveel appels werden er in totaal geoogst?", v, "appels"),
    ["Tel alle plaatjes: 4 + 6 + 5 + 8 + 7 = 30.", `Elk plaatje is 10 appels: 30 × 10 = ${v}.`, `In totaal ${v} appels.`],
    "Alle plaatjes tellen en vermenigvuldigen met de waarde per plaatje");
}
{
  const v = G.opvang.rijen.reduce((s, r) => s + r.aantal, 0) * 2;
  Q("opvang", 3, "R", "Alle dieren in het opvangcentrum", "In een opvangcentrum zitten dieren. Elk plaatje staat voor 2 dieren.",
    getal("Hoeveel dieren zitten er in totaal in het opvangcentrum?", v, "dieren"),
    ["Tel de plaatjes: 7 + 9 + 3 + 2 = 21.", `21 × 2 = ${v}`, `Er zitten ${v} dieren.`],
    "Een totaal berekenen uit een pictogram");
}
{
  const v = rij("regen", "Januari")[1] + rij("regen", "Februari")[1] + rij("regen", "Maart")[1];
  Q("regen", 3, "R", "Regen in het eerste kwartaal", "Het KNMI meet de regenval in een tabel.",
    getal("Hoeveel millimeter regen viel er in januari, februari en maart samen?", v, "mm"),
    ["Lees de drie waarden af: 68, 52 en 60.", `68 + 52 + 60 = ${v}`, `Er viel ${v} mm regen.`],
    "Meerdere tabelwaarden optellen");
}
{
  const v = G.winkel.rijen.reduce((s, r) => s + r[1], 0);
  Q("winkel", 3, "R", "Alle artikelen die zijn verkocht", "De schoolwinkel houdt bij wat er is verkocht.",
    getal("Hoeveel artikelen zijn er in totaal verkocht?", v, "artikelen"),
    ["Tel de aantallen op: 40 + 25 + 30 + 15.", `40 + 25 = 65, 65 + 30 = 95, 95 + 15 = ${v}`, `Er zijn ${v} artikelen verkocht.`],
    "De kolom 'aantal' van een tabel optellen");
}
{
  const v = val("zwembad", 4) + val("zwembad", 5);
  Q("zwembad", 3, "R", "De zomer in het zwembad", "Een zwembad telt elke maand het aantal bezoekers.",
    getal("Hoeveel bezoekers kwamen er in juli en augustus samen?", v, "bezoekers"),
    [`Juli: ${val("zwembad", 4)}. Augustus: ${val("zwembad", 5)}.`, `${val("zwembad", 4)} + ${val("zwembad", 5)} = ${v}`, `${v} bezoekers.`],
    "Twee waarden uit een lijndiagram optellen");
}
{
  const v = G.sportMV.reeksen[1].waarden.reduce((a, b) => a + b, 0);
  Q("sportMV", 3, "R", "Alle meisjes bij elkaar", "Een school telt hoeveel jongens en meisjes meedoen aan sportactiviteiten.",
    getal("Hoeveel meisjes doen er in totaal mee aan de vier sporten?", v, "meisjes"),
    ["Lees alle oranje staven af: 6, 12, 9 en 5.", `6 + 12 + 9 + 5 = ${v}`, `${v} meisjes.`],
    "Eén gegevensreeks in een gegroepeerd staafdiagram optellen");
}

// ----------------------------------------------------------------------------
// Niveau 4: rekenen
// ----------------------------------------------------------------------------
{
  const v = (val("zonnebloem", 5) - val("zonnebloem", 0)) / 5;
  Q("zonnebloem", 4, "R", "Gemiddelde groei per week", "Lars meet zes weken lang hoe hoog zijn zonnebloem is.",
    getal("Hoeveel centimeter groeide de plant gemiddeld per week tussen week 1 en week 6?", v, "cm"),
    [`Groei: ${val("zonnebloem", 5)} − ${val("zonnebloem", 0)} = ${val("zonnebloem", 5) - val("zonnebloem", 0)} cm.`, "Van week 1 tot week 6 zijn 5 weken verstreken.", `${val("zonnebloem", 5) - val("zonnebloem", 0)} : 5 = ${nl(v)}`, `Gemiddeld ${nl(v)} cm per week.`],
    "Een gemiddelde groei per tijdseenheid berekenen");
}
{
  const v = Math.round((val("huisdieren", 1) / 25) * 100);
  Q("huisdieren", 4, "R", "Welk percentage heeft een kat?", "In groep 8 zitten 25 kinderen. Ze tellen hun huisdieren.",
    getal("Hoeveel procent van de kinderen heeft een kat?", v, "%"),
    [`${val("huisdieren", 1)} van de 25 kinderen heeft een kat.`, "Maak er honderdsten van: 25 × 4 = 100, dus ook 6 × 4.", `6 × 4 = ${v}, dus ${v}%.`],
    "Een deel van een geheel als percentage uitdrukken");
}
{
  const v = som(G.boeken.reeksen[0].waarden) / 6;
  Q("boeken", 4, "R", "Gemiddeld aantal boeken", "De bibliotheek houdt bij hoeveel boeken groep 8 per maand leest.",
    getal("Hoeveel boeken las de klas gemiddeld per maand?", v, "boeken"),
    ["Tel alle maanden op: " + G.boeken.reeksen[0].waarden.join(" + ") + ` = ${som(G.boeken.reeksen[0].waarden)}.`, "Deel door het aantal maanden (6).", `${som(G.boeken.reeksen[0].waarden)} : 6 = ${v}`, `Gemiddeld ${v} boeken per maand.`],
    "Een gemiddelde berekenen uit een staafdiagram");
}
{
  const v = som(G.fietsen.rijen.map((r) => r.aantal * 4)) / 5;
  Q("fietsen", 4, "R", "Gemiddeld aantal fietsen", "Op de fietsenstalling staan elke dag fietsen. Elke 🚲 staat voor 4 fietsen.",
    getal("Hoeveel fietsen stonden er gemiddeld per dag in de stalling?", v, "fietsen"),
    ["Aantal per dag: 6×4=24, 8×4=32, 7×4=28, 9×4=36, 10×4=40.", `24 + 32 + 28 + 36 + 40 = ${som(G.fietsen.rijen.map((r) => r.aantal * 4))}`, `${som(G.fietsen.rijen.map((r) => r.aantal * 4))} : 5 = ${v}`, `Gemiddeld ${v} fietsen per dag.`],
    "Een gemiddelde berekenen uit een pictogram met een eigen schaal");
}
{
  const v = som(G.regen.rijen.map((r) => r[1])) / 6;
  Q("regen", 4, "R", "Gemiddelde regenval", "Het KNMI meet de regenval in een tabel.",
    getal("Wat is de gemiddelde regenval per maand over deze zes maanden?", v, "mm"),
    ["Tel alle maanden op: 68 + 52 + 60 + 44 + 56 + 62 = " + som(G.regen.rijen.map((r) => r[1])) + ".", `${som(G.regen.rijen.map((r) => r[1]))} : 6 = ${v}`, `Gemiddeld ${v} mm per maand.`],
    "Een gemiddelde berekenen uit een tabel");
}
{
  const t = G.sprint.rijen.map((r) => Number(r[1].replace(",", ".")));
  const v = Math.round((som(t) / t.length) * 100) / 100;
  Q("sprint", 4, "R", "De gemiddelde looptijd", "Bij de sportdag lopen vijf kinderen de 60 meter.",
    getal("Wat is de gemiddelde tijd van deze vijf kinderen?", v, "seconden"),
    ["Tel de tijden op: 10,2 + 9,8 + 10,5 + 9,6 + 9,9 = " + nl(som(t)) + ".", `${nl(som(t))} : 5 = ${nl(v)}`, `Gemiddeld ${nl(v)} seconden.`],
    "Een gemiddelde van kommagetallen berekenen");
}
{
  const v = (seg("tijd", "School") / 24) * 100;
  Q("tijd", 4, "R", "Hoeveel van de dag op school?", "Sara schrijft op hoe ze haar 24 uur besteedt.",
    getal("Hoeveel procent van de dag is Sara op school?", v, "%"),
    ["Sara is 6 van de 24 uur op school.", "6 : 24 = 1 : 4, dat is een kwart.", "Een kwart is 25%."],
    "Een deel van een geheel omrekenen naar procenten");
}
{
  const v = (seg("vervoer", "Auto") / 100) * 40;
  Q("vervoer", 4, "R", "Kinderen die met de auto komen", "Er is aan 40 kinderen gevraagd hoe ze naar school komen.",
    getal("Hoeveel kinderen komen met de auto naar school?", v, "kinderen"),
    ["Auto is 20% van 40 kinderen.", "10% van 40 is 4, dus 20% is 2 × 4.", `2 × 4 = ${v} kinderen.`],
    "Een percentage uit een cirkeldiagram omrekenen naar aantallen");
}
{
  const v = 4 * 7 - (6 + 8 + 9);
  Q("toetsen", 4, "R", "Het ontbrekende cijfer", "Emre heeft vier toetsen gemaakt. Zijn gemiddelde is een 7. Het cijfer van toets 4 ontbreekt in de tabel.",
    getal("Welk cijfer haalde Emre voor toets 4?", v),
    ["Gemiddelde 7 over 4 toetsen: totaal = 4 × 7 = 28.", "De bekende cijfers: 6 + 8 + 9 = 23.", `Ontbrekend cijfer: 28 − 23 = ${v}.`],
    "Een ontbrekende waarde afleiden uit een gemiddelde");
}
{
  const v = rij("winkel", "Pen")[1] * 1 + rij("winkel", "Schrift")[1] * 2;
  Q("winkel", 4, "R", "De opbrengst van pennen en schriften", "De schoolwinkel houdt bij wat er is verkocht.",
    getal("Hoeveel euro hebben de pennen en de schriften samen opgebracht?", v, "euro"),
    ["Pennen: 40 × € 1,00 = € 40,00.", "Schriften: 25 × € 2,00 = € 50,00.", `€ 40 + € 50 = € ${v}.`],
    "Rekenen met geld en aantallen uit een tabel");
}

// ----------------------------------------------------------------------------
// Niveau 5: redeneren
// ----------------------------------------------------------------------------
Q("planten", 5, "K", "Wat zegt de grafiek over de planten?", "Mia laat twee planten groeien en meet ze elke week.",
  mk("Welke conclusie wordt door de grafiek ondersteund?", ["Plant B groeit elke week sneller dan plant A.", "Plant A is in week 5 hoger dan plant B.", "Plant A is vanaf week 1 het hoogst.", "In week 3 is plant B hoger dan plant A."], 1),
  ["Controleer elke bewering met de grafiek.", "Tussen week 2 en 3 groeit A 5 cm en B 4 cm: B groeit niet elke week sneller.", "Week 5: A = 25 cm en B = 22 cm, dus A is hoger.", "In week 1 is B hoger (7 tegen 5) en in week 3 zijn ze even hoog (14).", "Alleen de tweede bewering klopt."],
  "Beoordelen of een conclusie door de grafiek wordt ondersteund");
Q("boeken", 5, "K", "Leest de klas steeds meer?", "De juf zegt: 'Jullie lezen elke maand meer boeken.'",
  wo("Waar of niet waar: de klas las elke maand meer boeken dan de maand ervoor.", false),
  ["Vergelijk elke maand met de maand ervoor.", "Van februari naar maart daalt het aantal van 6 naar 5, en van mei naar juni van 7 naar 5.", "De bewering is niet waar."],
  "Een bewering toetsen aan een staafdiagram");
Q("boom", 5, "T", "Hoe hoog wordt de boom?", "Een boom wordt elk jaar gemeten. Het gaat om een eik in een park.",
  mk("Hoe hoog wordt de boom in 2024 ongeveer?", ["1,8 m", "2,4 m", "3,0 m", "3,5 m"], 1),
  ["Bekijk de groei per jaar: 0,4 - 0,5 - 0,4 - 0,3 - 0,2 m.", "De groei wordt kleiner. Volgend jaar groeit de boom dus ongeveer 0,1 tot 0,2 m.", "2,3 + 0,1 tot 0,2 = ongeveer 2,4 m."],
  "Een ontwikkeling voorspellen op basis van een trend");
Q("vervoer", 5, "K", "Zonder auto of bus?", "Er is aan 40 kinderen gevraagd hoe ze naar school komen.",
  wo("Waar of niet waar: meer dan driekwart (75%) van de kinderen komt zonder auto of bus naar school.", false),
  ["Zonder auto of bus: fiets 40% + lopen 25% + step 5% = 70%.", "Driekwart is 75%.", "70% is minder dan 75%, dus de bewering is niet waar."],
  "Percentages combineren en vergelijken met een grens");
Q("ijsTemp", 5, "K", "Warm weer en ijsjes", "De grafiek laat de temperatuur (lijn) en de ijsverkoop (staven) zien.",
  mk("Welke conclusie past bij de grafiek?", ["Hoe warmer het is, hoe meer ijsjes er worden verkocht.", "Door meer ijsverkoop wordt het warmer.", "De temperatuur heeft geen invloed op de ijsverkoop.", "De meeste ijsjes werden op vrijdag verkocht."], 0),
  ["Donderdag is het warmst (25 °C) en dan worden de meeste ijsjes verkocht (85).", "Op maandag is het het koelst (16 °C) en worden de minste ijsjes verkocht (20).", "Warm weer en veel ijsjes horen dus bij elkaar. Vrijdag is niet de topdag.", "Het eerste antwoord klopt."],
  "Twee gegevensreeksen met elkaar in verband brengen");
Q("brood", 5, "K", "Een misleidende grafiek", "Een bakker laat deze grafiek zien om te laten zien hoe goed het gaat.",
  mk("Waarom kan deze grafiek een verkeerde indruk wekken?", ["De verticale as begint bij 90 in plaats van bij 0.", "De staven hebben verschillende kleuren.", "De maanden staan in de verkeerde volgorde.", "Er staan te weinig cijfers in."], 0),
  ["Kijk naar de verticale as: die begint bij 90.", "Daardoor lijken kleine verschillen heel groot.", "Het eerste antwoord klopt."],
  "Herkennen dat een afwijkende schaal de indruk beïnvloedt");
Q("brood", 5, "K", "Twee keer zoveel?", "Dezelfde bakker zegt: 'In maart verkocht ik twee keer zoveel als in januari.'",
  wo("Waar of niet waar: in maart zijn twee keer zoveel broden verkocht als in januari.", false),
  ["De staaf van maart lijkt twee keer zo hoog, maar de as begint bij 90.", `Januari: ${val("brood", 0)} broden, maart: ${val("brood", 2)} broden.`, `Twee keer ${val("brood", 0)} zou ${2 * val("brood", 0)} zijn. Het verschil is maar ${val("brood", 2) - val("brood", 0)} broden.`, "De bewering is niet waar."],
  "Waarden aflezen in plaats van op de hoogte van de staaf te vertrouwen");
Q("biebBezoek", 5, "T", "Een opvallende dag", "Een bibliotheek telt de bezoekers per dag.",
  mk("Welke dag wijkt het sterkst af van de andere dagen?", ["Maandag", "Woensdag", "Vrijdag", "Zaterdag"], 2),
  ["De meeste dagen liggen tussen 22 en 26 bezoekers.", `Vrijdag heeft ${val("biebBezoek", 4)} bezoekers.`, "Vrijdag is een uitschieter."],
  "Een uitschieter herkennen");
{
  const w = G.biebBezoek.reeksen[0].waarden.filter((_, i) => i !== 4);
  Q("biebBezoek", 5, "R", "Gemiddeld zonder de uitschieter", "Een bibliotheek telt de bezoekers per dag. Vrijdag was er een schoolproject.",
    getal("Wat is het gemiddelde aantal bezoekers per dag als je vrijdag niet meetelt?", som(w) / 5, "bezoekers"),
    ["Laat vrijdag weg: " + w.join(", ") + ".", `Som: ${w.join(" + ")} = ${som(w)}`, `${som(w)} : 5 = ${som(w) / 5}`, `Gemiddeld ${som(w) / 5} bezoekers per dag.`],
    "Een gemiddelde berekenen zonder uitschieter");
}
Q("dorp", 5, "K", "Wat weten we zeker?", "De gemeente laat zien hoeveel mensen er in een dorp wonen.",
  meer("Welke beweringen worden door de grafiek ondersteund? (Meerdere antwoorden mogelijk)", ["Het aantal inwoners is elk jaar gestegen.", "In 2022 woonden er 250 mensen meer dan in 2018.", "De stijging komt doordat er een nieuwe wijk is gebouwd.", "In 2023 zijn er precies 1510 inwoners."], [0, 1]),
  ["Elk jaar ligt het punt hoger: dat klopt.", "1450 − 1200 = 250: dat klopt ook.", "De grafiek laat niet zien waaróm het aantal stijgt: dat is een aanname.", "Een voorspelling is nooit precies zeker."],
  "Feiten en aannames uit elkaar houden");

// ----------------------------------------------------------------------------
// Bouwen
// ----------------------------------------------------------------------------
const gesorteerd = [...lijst].sort((a, b) => a.niveau - b.niveau);
const opgaven = gesorteerd.map((o, i) => ({
  id: `G${String(i + 1).padStart(2, "0")}`,
  titel: o.titel,
  niveau: o.niveau,
  categorie: CAT[o.cat],
  leerdoel: o.leerdoel,
  context: o.context,
  grafiek: G[o.g],
  vraag: o.vraag,
  hint: o.hint || HINT[G[o.g].type],
  uitleg: o.uitleg,
}));

const uitvoer = { versie: 1, niveaus: NIVEAUS, categorieen: Object.values(CAT), opgaven };
export { uitvoer };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(join(dirname(fileURLToPath(import.meta.url)), "opgaven.json"), JSON.stringify(uitvoer, null, 1) + "\n");
  console.log(`opgaven.json geschreven: ${opgaven.length} opgaven`);
}
