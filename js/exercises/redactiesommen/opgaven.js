// exercises/redactiesommen/opgaven.js

// Redactiesommen voor groep 7/8: verhaaltjes met optellen, aftrekken, keer, delen
// Alle antwoorden hele getallen, max 1000

const OPRAVEN = [
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
