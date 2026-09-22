// exercises/redactiesommen/opgaven.js

// Redactiesommen voor groep 7/8: verhaaltjes met optellen, aftrekken, keer, delen
// Alle antwoorden hele getallen, max 1000

const OPRAVEN = [
  // ====== Basis (groep 7) ======

  // Optelsommen
  { q: "Sara spaart stickers. Ze heeft er 345. Haar vriendin geeft er 128 bij. Hoeveel stickers heeft Sara nu?", a: 473 },
  { q: "In een bibliotheek staan 456 boeken. Er komen 234 nieuwe boeken bij. Hoeveel boeken zijn er nu?", a: 690 },
  { q: "Een fiets kost 389 euro. De zadel kost 67 euro extra. Wat is de totaalprijs?", a: 456 },
  { q: "Tim leest een boek van 250 pagina's. Hij leest er 175. Hoeveel pagina's moet hij nog lezen?", a: 75 },
  { q: "In een park staan 178 bomen. Er worden 96 nieuwe bomen geplant. Hoeveel bomen staan er nu?", a: 274 },

  // Aftreksommen
  { q: "Een trein heeft 320 zitplaatsen. Er zijn 198 bezet. Hoeveel plaatsen zijn nog vrij?", a: 122 },
  { q: "Noah heeft 500 euro. Hij koopt een spelcomputer van 349 euro. Hoeveel geld houdt hij over?", a: 151 },
  { q: "Een bakker bakt 480 koekjes. Hij verkoopt er 295. Hoeveel koekjes zijn er nog?", a: 185 },
  { q: "In een meer zwemmen 600 vissen. Er worden 247 gevangen. Hoeveel vissen blijven er over?", a: 353 },
  { q: "Een boek heeft 280 bladzijden. Lisa leest er 193. Hoeveel bladzijden moet ze nog?", a: 87 },

  // Keersommen
  { q: "Een doos bevat 24 chocolaatjes. Hoeveel chocolaatjes zitten er in 8 dozen?", a: 192 },
  { q: "Een klas heeft 28 leerlingen. Elke leerling krijgt 6 potloden. Hoeveel potloden zijn dat?", a: 168 },
  { q: "Een vrachtwagen vervoert 12 dozen met elk 15 flessen. Hoeveel flessen zijn dat?", a: 180 },
  { q: "In een restaurant zitten 15 tafels met elk 4 stoelen. Hoeveel stoelen zijn er?", a: 60 },
  { q: "Een pak bevat 6 eieren. Hoeveel eieren zitten er in 15 pakken?", a: 90 },

  // Deelsommen
  { q: "240 koekjes worden verdeeld over 8 kinderen. Hoeveel krijgt elk kind?", a: 30 },
  { q: "360 appels worden verpakt in dozen van 12. Hoeveel dozen zijn er nodig?", a: 30 },
  { q: "500 euro wordt verdeeld over 4 kinderen. Hoeveel krijgt elk kind?", a: 125 },
  { q: "144 penningen worden verdeeld over 12 groepen. Hoeveel per groep?", a: 12 },
  { q: "210 stoelen worden verdeeld over 7 rijen. Hoeveel stoelen per rij?", a: 30 },

  // Twee-staps
  { q: "Jan heeft 200 euro. Hij koopt 3 boeken van 35 euro per stuk. Hoeveel geld houdt hij over?", a: 95 },
  { q: "Een school heeft 360 leerlingen verdeeld over 12 klassen. Elke klas heeft evenveel leerlingen. Hoeveel leerlingen per klas? En 3 klassen samen?", a: 90 },
  { q: "Lotte koopt 4 zakken appels met elk 12 appels. Ze geeft 18 appels weg. Hoeveel heeft ze over?", a: 30 },

  // ====== Groep 8 — Extra uitdagend ======
  // Bron: redactiesommen.nl, niveau-14, cat_17/9/18

  // Batch 1 — Getallen, Verhoudingen, Meten
  { q: "In de boomgaard van boer Huub staan 400 appelbomen. Aan iedere boom groeit per seizoen gemiddeld 15 kg appels. Als het fruit geplukt is, blijkt 3,5% rot te zijn. 8 appels wegen gemiddeld een kilo. Hoeveel goede appels houdt boer Huub over?", a: 46320 },
  { q: "7 mensen hadden de 3de prijs in de loterij. Ze delen het geld en ieder krijgt € 3500,-. Hoeveel euro had ieder gekregen als ze het bedrag met 10 mensen hadden moeten delen?", a: 2450 },
  { q: "Livia, Norah en Eva hebben 390 stickers. Ze verdelen de stickers. Livia krijgt 2/5 deel en Norah krijgt 1/3 deel. Hoeveel stickers blijven over voor Eva?", a: 104 },
  { q: "Op een verfblik staat dat 3/5 liter genoeg is voor 10 vierkante meter. Hoeveel liter verf gebruik je voor 15 vierkante meter?", a: 0.9 },
  { q: "In de zomervakantie rijden Kai en zijn ouders met de auto naar Zwitserland. Zijn vader zit 45% van de afstand achter het stuur. Zijn moeder rijdt de rest van de reis. Zij rijdt 550 km. Wat is de totale afstand die ze rijden?", a: 1000 },
  { q: "Voor een recept voor groentesoep van 6 personen heb je 450 gram gesneden groente nodig. Pleun wil voor 15 personen soep maken. Hoeveel kilo gesneden groente heeft ze nodig?", a: 1.125 },
  { q: "Sara koopt een elektrische step. Die is vandaag in de aanbieding voor € 171,- door 5% korting. Hoe duur was de step zonder korting?", a: 180 },
  { q: "De apotheker heeft 0,5 gram van een bepaalde stof. Hij verdeelt dit stofje over 100 tabletten. Hoeveel gram van dit stofje komt er in iedere tablet?", a: 0.005 },
  { q: "De ventieldopjesfabriek produceert per dag 3300000 ventieldopjes. Hoeveel ventieldopjes produceren ze in 5 dagen?", a: 16500000 },
  { q: "Norah en haar moeder gaan winkelen en zoeken een nieuwe rugtas. Er is een goedkope van € 82,65 en een dure van € 104,75. Het verschil in prijs delen ze samen. Hoeveel moet Norah betalen?", a: 11.05 },

  // Batch 2 — Getallen, Verhoudingen, Meten
  { q: "Schrijf 12,55 miljard als getal zonder komma.", a: 12550000000 },
  { q: "Mohamed spaart voor een tennisracket van € 175,-. Met folders rondbrengen verdient hij € 25,- in twee weken. Elke week krijgt hij € 5,- zakgeld. Hoeveel weken moet Mohamed sparen?", a: 10 },
  { q: "In de zomervakantie rijden Christiaan en zijn ouders met de auto naar Zwitserland. Zijn vader zit 25% van de afstand achter het stuur. Zijn moeder rijdt de rest. Zij rijdt 990 km. Wat is de totale afstand?", a: 1320 },
  { q: "Welk getal hoort op de puntjes? 2,345 - 2,36 - ... - 2,39 - 2,405", a: 2.375 },
  { q: "Thomas is aan het ministecken. Hij gebruikt steeds 3 gele en 5 blauwe steentjes. Als hij klaar is heeft hij 1320 steentjes gebruikt. Hoeveel blauwe steentjes heeft Thomas gebruikt?", a: 825 },
  { q: "De aannemer legt een terras met 13 zwarte en 17 rode tegels per rij. Het terras bestaat uit 540 tegels. Hoeveel zwarte tegels heeft de aannemer gebruikt?", a: 234 },
  { q: "Isis koopt een elektrische step. Die is vandaag in de aanbieding voor € 152,- door 5% korting. Hoe duur was de step zonder korting?", a: 160 },

  // Batch 3 — Getallen, Verhoudingen, Meten
  { q: "De koerier heeft 15560 km gereden, verdeeld over 6 weken. Daarvan was hij ook nog een week ziek. Hoeveel km heeft hij gemiddeld per week gereden toen hij niet ziek was?", a: 3112 },
  { q: "Voor de spelen op Koningsdag heeft juf Victoria 1165 meter lint nodig. Er zit 27 meter lint op een rol. Hoeveel meter heeft ze teveel?", a: 23 },
  { q: "Jasper en Benjamin kopen voor hun kat een reismand van € 33,80, een speelmuis van € 6,90 en 8 blikken voer van € 6,25 per blik. Bij de kassa krijgen ze 20% korting. Hoeveel euro moeten ze betalen?", a: 72.56 },
  { q: "Mart betaalt vandaag € 72,- voor een volle tank benzine door 4% vroege vogel korting. Hoe duur zou de benzine zijn zonder korting?", a: 75 },
  { q: "De gemeente heeft besloten om een nieuw woonzorgcomplex te bouwen voor € 4500000,-. Er is al € 2500500,- subsidie binnen. Hoeveel euro moet de gemeente nog betalen?", a: 1999500 },
  { q: "Bij de limonadefabriek worden 16044 flessen limonade verpakt in kratten van 8 flessen. Hoeveel hele kratten kun je vullen?", a: 2005 },
  { q: "Bij het pluimveebedrijf moeten 2240 eieren in dozen verpakt worden. Eerst 120 dozen van 12 eieren. De rest gaat in dozen van 6 eieren. Hoeveel hele dozen kun je dan nog vullen?", a: 133 },
];

export function genereerOpgave(instellingen) {
  const idx = Math.floor(Math.random() * OPRAVEN.length);
  const opgave = OPRAVEN[idx];
  return {
    type: "redactie",
    vraagTekst: opgave.q,
    antwoordGoed: { type: "getal", normaal: opgave.a, display: String(opgave.a) },
    meta: { idx },
  };
}

export function opgaveNaarSleutel(opgave) {
  return `r${opgave.meta.idx}`;
}

export const STANDAARD_INSTELLINGEN = {
  aantalOpgaven: 10,
};
