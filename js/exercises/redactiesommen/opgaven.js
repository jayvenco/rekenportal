// exercises/redactiesommen/opgaven.js
// -----------------------------------------------------------------------------
// Redactiesommen als GENERATOREN (géén vaste lijst), zodat opgaven echt door
// elkaar gemixt én per groep gescheiden zijn:
//   - groep 7 (basis): optellen, aftrekken, keer, delen en twee-staps (getallen 10-1000).
//   - groep 8 (uitdagend): alles hierboven + breuken, procenten, kommagetallen,
//     omrekenen van breuk/procent/komma, eenheden, oppervlakte en omtrek.
// Elke opgave: { type, vraagTekst, antwoordGoed:{normaal, display}, meta:{categorie} }
// -----------------------------------------------------------------------------

import { randomGeheelGetal, kiesWillekeurig } from "../../utils/willekeurig.js";

const rng = randomGeheelGetal;
const kies = kiesWillekeurig;

/** Rond af naar max 3 decimalen om zwevendekomma-ruis te voorkomen. */
function num(n) {
  return Math.round(n * 1000) / 1000;
}

/** Toonklaar getal: decimale punt wordt komma (0.9 -> "0,9"). */
function disp(n) {
  return String(n).replace(".", ",");
}

/** Bouwt het opgave-object. */
function maak(categorie, vraagTekst, antwoord) {
  const n = num(antwoord);
  return {
    type: "redactie",
    vraagTekst,
    antwoordGoed: { type: "getal", normaal: n, display: disp(n) },
    meta: { categorie },
  };
}

// --- Basis (groep 7) ---------------------------------------------------------

function genOptellen() {
  const a = rng(15, 480);
  const b = rng(15, 480);
  if (a + b > 990) return genOptellen();
  const t = kies([
    `Tijdens de sportdag heeft de klas al ${a} punten verzameld. Bij de estafette komen daar nog ${b} punten bij. Hoeveel punten heeft de klas in totaal?`,
    `Mila spaart voor een nieuwe fiets. In haar spaarpot zit al ${a} euro. Voor haar verjaardag krijgt ze er ${b} euro bij. Hoeveel euro heeft Mila nu gespaard?`,
    `Een bibliotheek heeft ${a} boeken op de jeugdafdeling staan. Vandaag worden er ${b} nieuwe boeken teruggebracht. Hoeveel boeken staan er nu op de jeugdafdeling?`,
    `Het is kermis in het dorp en de loterijkraam is heel populair. Vanmorgen zijn er al ${a} lootjes verkocht. In de middag komen er nog eens ${b} kopers bij die ook een lootje willen. Hoeveel lootjes zijn er die dag in totaal verkocht?`,
    `Op de boerderij van opa worden appels geplukt voor de markt. Gisteren is er al een krat met ${a} appels geplukt. Vandaag plukken de kinderen er nog ${b} extra. Hoeveel appels liggen er nu klaar om verkocht te worden?`,
  ]);
  return maak("optellen", t, a + b);
}

function genAftrekken() {
  const a = rng(60, 990);
  const b = rng(15, a - 10);
  const t = kies([
    `Een bus heeft in totaal ${a} zitplaatsen. Onderweg stappen er ${b} reizigers uit. Hoeveel reizigers blijven er in de bus achter?`,
    `Noah heeft ${a} euro gespaard. Hij koopt een spelcomputer van ${b} euro. Hoeveel geld houdt Noah over?`,
    `In een magazijn liggen ${a} pakketten klaar. Er worden er ${b} opgehaald door de vrachtwagen. Hoeveel pakketten blijven er in het magazijn liggen?`,
    `Op het schoolplein staan ${a} leerlingen klaar voor de grote speurtocht. Halverwege de ochtend geeft de juf aan dat ${b} leerlingen al naar de finish zijn gegaan. Hoeveel leerlingen zijn er onderweg nog aan het speuren?`,
    `Een pretpark heeft die dag ${a} bezoekers over de vloer gehad. Tegen sluitingstijd zijn er al ${b} bezoekers naar huis vertrokken. Hoeveel bezoekers lopen er nog rond in het park?`,
  ]);
  return maak("aftrekken", t, a - b);
}

function genKeer() {
  const a = rng(3, 12);
  const b = rng(4, 15);
  if (a * b > 1000) return genKeer();
  const t = kies([
    `Een doos bevat ${b} chocolaatjes. In de winkel staan ${a} van zulke dozen op de plank. Hoeveel chocolaatjes zijn er samen?`,
    `Elke leerling van de klas krijgt ${b} potloden. De klas telt ${a} leerlingen. Hoeveel potloden zijn er in totaal nodig?`,
    `Een vrachtwagen vervoert ${a} pallets. Op elke pallet staan ${b} kratten. Hoeveel kratten vervoert de vrachtwagen in totaal?`,
    `Voor het schoolfeest worden er tafels neergezet in de gymzaal. Aan elke tafel kunnen ${b} kinderen zitten, en er staan ${a} tafels klaar. Voor hoeveel kinderen is er in totaal plek?`,
    `De dierenverzorger vult elke ochtend de voederbakken van de konijnen. Per bak gaat er ${b} gram voer, en er staan ${a} bakken in het konijnenhok. Hoeveel gram voer strooit de verzorger in totaal uit?`,
  ]);
  return maak("vermenigvuldigen", t, a * b);
}

function genDelen() {
  const d = rng(2, 12);
  const q = rng(3, 15);
  const a = d * q;
  const t = kies([
    `${a} koekjes worden eerlijk verdeeld over ${d} kinderen. Hoeveel koekjes krijgt elk kind?`,
    `Een vereniging verkoopt ${a} lootjes. Ze worden in zakjes van ${d} gestopt. Hoeveel volle zakjes kan de vereniging maken?`,
    `${a} appels worden verpakt in dozen van ${d}. Hoeveel volle dozen zijn er nodig?`,
    `Op kamp moeten de begeleiders ${a} broodjes eerlijk verdelen over ${d} tafels, zodat elke tafel evenveel krijgt. Hoeveel broodjes komen er op elke tafel te liggen?`,
    `Voor de schoolmusical zijn er ${a} stoelen neergezet, verdeeld in ${d} rijen die allemaal even lang zijn. Hoeveel stoelen staan er in elke rij?`,
  ]);
  return maak("delen", t, q);
}

function genTweeStaps() {
  const stuks = rng(2, 6);
  const prijs = rng(5, 30);
  const budget = rng(stuks * prijs + 20, 1000);
  const t = kies([
    `Sem heeft ${budget} euro gespaard. Hij koopt ${stuks} boeken van ${prijs} euro per stuk. Hoeveel geld houdt Sem over?`,
    `Lotte heeft ${budget} stickers. Ze plakt er ${stuks} op elke kaart en maakt ${prijs} kaarten. Hoeveel stickers houdt ze over?`,
    `Voor haar verjaardagsfeestje heeft Fenna ${budget} euro van haar ouders gekregen om cadeautjes uit te zoeken voor haar vriendinnetjes. Ze koopt ${stuks} setjes kleurpotloden van ${prijs} euro per setje. Hoeveel euro houdt Fenna over?`,
  ]);
  return maak("optellen", t, budget - stuks * prijs);
}

// --- Klok kijken (tijd optellen/aftrekken, aansluitend op redactiesommen) ----

function tijdString(minutenSindsMidnacht) {
  const u = Math.floor(minutenSindsMidnacht / 60) % 24;
  const m = minutenSindsMidnacht % 60;
  return `${String(u).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function genKlokEindtijd() {
  const startUur = rng(8, 19);
  const startMin = kies([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  const duur = rng(10, 120);
  const start = startUur * 60 + startMin;
  const eind = start + duur;
  const eindUur = Math.floor(eind / 60) % 24;
  const eindMin = eind % 60;
  const instructie = " Typ je antwoord als cijfers zonder dubbele punt (bijvoorbeeld 930 voor 09:30 uur).";
  const t = kies([
    `De voetbaltraining van Teun begint om ${tijdString(start)} uur en duurt ${duur} minuten. Hoe laat is de training afgelopen?${instructie}`,
    `Een film in de bioscoop begint om ${tijdString(start)} uur. De film duurt ${duur} minuten. Hoe laat is de film afgelopen?${instructie}`,
    `De trein vertrekt om ${tijdString(start)} uur vanaf het station. De reis duurt ${duur} minuten. Hoe laat komt de trein aan?${instructie}`,
    `Juf start de proefwerkweek-toets om ${tijdString(start)} uur. De kinderen krijgen ${duur} minuten de tijd. Hoe laat moet iedereen klaar zijn?${instructie}`,
  ]);
  return {
    type: "redactie",
    vraagTekst: t,
    antwoordGoed: { type: "getal", normaal: eindUur * 100 + eindMin, display: tijdString(eind) },
    meta: { categorie: "klok" },
  };
}

function genKlokDuur() {
  const startUur = rng(8, 18);
  const startMin = kies([0, 15, 30, 45]);
  const duurMin = rng(1, 3) * 15 + kies([0, 15]);
  const start = startUur * 60 + startMin;
  const eind = start + duurMin;
  const t = kies([
    `Zwemles begint om ${tijdString(start)} uur en eindigt om ${tijdString(eind)} uur. Hoeveel minuten duurt de zwemles?`,
    `De pauze op school begint om ${tijdString(start)} uur en duurt tot ${tijdString(eind)} uur. Hoeveel minuten pauze hebben de kinderen?`,
    `Een concert begint om ${tijdString(start)} uur en is afgelopen om ${tijdString(eind)} uur. Hoeveel minuten duurt het concert?`,
  ]);
  return maak("klok", t, duurMin);
}

// --- Uitdagend (groep 8) -------------------------------------------------------

function genBreukDeel() {
  const noemer = kies([2, 3, 4, 5, 10]);
  const teller = rng(1, noemer - 1);
  const perDeel = kies([10, 20, 25, 40, 50]);
  const geheel = noemer * perDeel; // zodat geheel <= 500 en (teller/noemer)*geheel heel is
  const t = kies([
    `Een school heeft ${geheel} stoelen in de aula. ${teller}/${noemer} deel van de stoelen is blauw. Hoeveel stoelen zijn blauw?`,
    `Juf heeft ${geheel} knikkers. Ze geeft ${teller}/${noemer} deel daarvan aan de klas. Hoeveel knikkers geeft ze weg?`,
  ]);
  return maak("breuken", t, teller * perDeel);
}

function genProcentVan() {
  const p = kies([10, 20, 25, 50, 75]);
  const k = rng(1, 9);
  const geheel = k * 100;
  const t = kies([
    `Een winkel heeft ${geheel} klanten op een dag. ${p}% van de klanten koopt iets. Hoeveel klanten hebben iets gekocht?`,
    `Van de ${geheel} ballen in de gymzaal is ${p}% rood. Hoeveel ballen zijn rood?`,
  ]);
  return maak("procenten", t, (geheel / 100) * p);
}

function genKorting() {
  const orig = rng(1, 10) * 100;
  const p = kies([10, 20, 25, 50]);
  const t = kies([
    `Een step kost normaal ${orig} euro. Vandaag is er ${p}% korting. Hoeveel euro kost de step nu?`,
    `Een jas kost ${orig} euro. In de uitverkoop krijg je ${p}% korting. Wat is de nieuwe prijs?`,
  ]);
  return maak("procenten", t, orig * (1 - p / 100));
}

function genBreukProcentKomma() {
  const soort = kies(["breukNaarProcent", "procentNaarKomma", "kommaNaarProcent", "kommaNaarBreuk100"]);
  if (soort === "breukNaarProcent") {
    const noemer = kies([2, 4, 5, 10, 20, 25, 50]);
    const teller = rng(1, noemer - 1);
    return maak("omrekenen", `Schrijf ${teller}/${noemer} als percentage.`, teller * (100 / noemer));
  }
  if (soort === "procentNaarKomma") {
    const p = kies([5, 10, 20, 25, 40, 50, 75]);
    return maak("omrekenen", `Schrijf ${p}% als kommagetal.`, p / 100);
  }
  if (soort === "kommaNaarProcent") {
    const d = kies([0.1, 0.2, 0.25, 0.4, 0.5, 0.6, 0.75]);
    return maak("omrekenen", `Schrijf ${disp(d)} als percentage.`, d * 100);
  }
  const h = rng(5, 95);
  return maak("omrekenen", `Schrijf 0,${h} als breuk met noemer 100.`, h);
}

function genKommaRekenen() {
  const soort = kies(["geldPlus", "geldMin", "kommaKeer", "kommaDeel"]);
  if (soort === "geldPlus") {
    const a = rng(1, 40) + rng(0, 99) / 100;
    const b = rng(1, 30) + rng(0, 99) / 100;
    const t = `Een broodje kost € ${disp(num(a))} en een beker drinken kost € ${disp(num(b))}. Wat betaal je samen aan de kassa?`;
    return maak("kommagetallen", t, a + b);
  }
  if (soort === "geldMin") {
    const a = rng(20, 60) + rng(0, 99) / 100;
    const b = rng(1, Math.floor(a - 5)) + rng(0, 99) / 100;
    const t = `In je portemonnee zit € ${disp(num(a))}. Je koopt een boek van € ${disp(num(b))}. Hoeveel geld houd je over?`;
    return maak("kommagetallen", t, a - b);
  }
  if (soort === "kommaKeer") {
    const f = kies([0.5, 1.5, 2.5]);
    const n = rng(2, 20);
    const t = `Een fles bevat ${disp(f)} liter. Hoeveel liter zit er in ${n} van zulke flessen samen?`;
    return maak("kommagetallen", t, f * n);
  }
  const heel = kies([5, 7, 9, 11, 13, 15]);
  const t = `${disp(num(heel/2))} meter lint wordt in twee gelijke stukken geknipt. Hoeveel meter is elk stuk?`;
  return maak("kommagetallen", t, heel / 2);
}

function genEenheidOmrekenen() {
  const soort = kies(["mNaarCm", "kmNaarM", "kgNaarG", "lNaarMl", "uurNaarMin"]);
  if (soort === "mNaarCm") {
    const m = kies([1, 2, 3, 4, 5, 6, 8]) + kies([0, 0.5]);
    return maak("meten", `Een touw is ${disp(num(m))} meter lang. Hoeveel centimeter is dat?`, m * 100);
  }
  if (soort === "kmNaarM") {
    const km = rng(2, 12);
    return maak("meten", `De fietstocht is ${km} kilometer lang. Hoeveel meter fiets je dan?`, km * 1000);
  }
  if (soort === "kgNaarG") {
    const kg = kies([1, 2, 3, 5]) + kies([0, 0.5]);
    return maak("meten", `Een zak aardappelen weegt ${disp(num(kg))} kilogram. Hoeveel gram weegt de zak?`, kg * 1000);
  }
  if (soort === "lNaarMl") {
    const l = kies([1, 2, 3, 5]) + kies([0, 0.5]);
    return maak("meten", `Een kan bevat ${disp(num(l))} liter water. Hoeveel milliliter is dat?`, l * 1000);
  }
  const uur = kies([2, 3, 4, 5, 6]);
  return maak("meten", `Een film duurt ${uur} uur. Hoeveel minuten duurt de film?`, uur * 60);
}

function genOppervlakte() {
  const l = rng(3, 15);
  const b = rng(3, 15);
  const t = kies([
    `De moestuin van opa is ${l} meter lang en ${b} meter breed. Wat is de oppervlakte van de moestuin in vierkante meter?`,
    `Een slaapkamer is ${l} meter bij ${b} meter. Hoeveel vierkante meter is de vloer?`,
  ]);
  return maak("oppervlakte", t, l * b);
}

function genOmtrek() {
  const l = rng(4, 20);
  const b = rng(4, 20);
  const t = kies([
    `Rond een zandbak van ${l} meter bij ${b} meter komt een hekje. Hoeveel meter hek is er nodig?`,
    `Een weiland is ${l} meter lang en ${b} meter breed. Hoeveel meter is de omtrek van het weiland?`,
  ]);
  return maak("meten", t, 2 * (l + b));
}

// --- Pools per groep ----------------------------------------------------------

const BASIS = [genOptellen, genAftrekken, genKeer, genDelen, genTweeStaps, genKlokEindtijd, genKlokDuur];

const UITDAGEND = [
  genOptellen, genAftrekken, genKeer, genDelen, genTweeStaps,
  genKlokEindtijd, genKlokDuur,
  genBreukDeel, genProcentVan, genKorting, genBreukProcentKomma,
  genKommaRekenen, genEenheidOmrekenen, genOppervlakte, genOmtrek,
];

export function genereerOpgave(instellingen) {
  const pool = instellingen.groep === 8 ? UITDAGEND : BASIS;
  return kies(pool)();
}

export function opgaveNaarSleutel(opgave) {
  return opgave.vraagTekst;
}

export const STANDAARD_INSTELLINGEN = {
  aantalOpgaven: 10,
  groep: 7,
};