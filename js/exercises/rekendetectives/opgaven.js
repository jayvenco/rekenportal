// exercises/rekendetectives/opgaven.js
// -----------------------------------------------------------------------------
// Vaste set van 40 verhaalsommen voor groep 4 (optellen, aftrekken en
// vermenigvuldigen binnen 20). Het kind bepaalt zelf welke bewerking nodig is.
// bewerking: "plus" | "min" | "keer"
// -----------------------------------------------------------------------------

import { schudArray } from "../../utils/willekeurig.js";

export const OPGAVEN = [
  {
    "id": 1,
    "bewerking": "keer",
    "thema": "Snoep",
    "emoji": "🍬🍬🍬",
    "tekst": "Mila neemt 4 zakjes mee naar school. In ieder zakje zitten 3 snoepjes. Hoeveel snoepjes heeft Mila bij zich?",
    "som": "4 × 3 = 12",
    "antwoord": 12,
    "uitleg": "Er zijn 4 zakjes met ieder evenveel snoepjes: gelijke groepjes, dus vermenigvuldigen."
  },
  {
    "id": 2,
    "bewerking": "plus",
    "thema": "School",
    "emoji": "🧒👧🧒",
    "tekst": "In de klas zitten 9 kinderen op de mat. Even later komen er nog 6 kinderen binnen lopen. Hoeveel kinderen zijn er nu in de klas?",
    "som": "9 + 6 = 15",
    "antwoord": 15,
    "uitleg": "Er komen kinderen bij, dus optellen."
  },
  {
    "id": 3,
    "bewerking": "min",
    "thema": "Stickers",
    "emoji": "⭐🌟",
    "tekst": "Lisa heeft 14 stickers. Noor heeft er 9. Hoeveel stickers heeft Lisa meer dan Noor?",
    "som": "14 − 9 = 5",
    "antwoord": 5,
    "uitleg": "Je zoekt het verschil tussen twee hoeveelheden, dus aftrekken."
  },
  {
    "id": 4,
    "bewerking": "plus",
    "thema": "Dieren",
    "emoji": "🐇🐇",
    "tekst": "Opa heeft 8 konijnen in de tuin. De buurman brengt er 7 konijnen bij. Hoeveel konijnen zijn er nu?",
    "som": "8 + 7 = 15",
    "antwoord": 15,
    "uitleg": "Er komen konijnen bij, dus optellen."
  },
  {
    "id": 5,
    "bewerking": "keer",
    "thema": "Buitenspelen",
    "emoji": "🪢🧒",
    "tekst": "Op het schoolplein staan 5 groepjes kinderen. In elk groepje springen 3 kinderen touwtje. Hoeveel kinderen springen touwtje?",
    "som": "5 × 3 = 15",
    "antwoord": 15,
    "uitleg": "5 gelijke groepjes van 3 kinderen: vermenigvuldigen."
  },
  {
    "id": 6,
    "bewerking": "min",
    "thema": "Feestje",
    "emoji": "🎈💥",
    "tekst": "Fenna heeft 16 ballonnen opgehangen voor haar feestje. Er knappen er 7. Hoeveel ballonnen zijn nog heel?",
    "som": "16 − 7 = 9",
    "antwoord": 9,
    "uitleg": "Er gaan ballonnen kapot (weg), dus aftrekken."
  },
  {
    "id": 7,
    "bewerking": "plus",
    "thema": "Fruit",
    "emoji": "🍌🍎",
    "tekst": "In de fruitmand liggen 7 bananen en 5 appels. Hoeveel stuks fruit liggen er in de mand?",
    "som": "7 + 5 = 12",
    "antwoord": 12,
    "uitleg": "Twee hoeveelheden worden samengevoegd, dus optellen."
  },
  {
    "id": 8,
    "bewerking": "keer",
    "thema": "Pretpark",
    "emoji": "🎢🧒",
    "tekst": "In de achtbaan zitten 6 wagentjes. In elk wagentje zitten 2 kinderen. Hoeveel kinderen zitten er in de achtbaan?",
    "som": "6 × 2 = 12",
    "antwoord": 12,
    "uitleg": "6 gelijke wagentjes met ieder 2 kinderen: vermenigvuldigen."
  },
  {
    "id": 9,
    "bewerking": "min",
    "thema": "Geld",
    "emoji": "💶🐷",
    "tekst": "Daan heeft 15 euro in zijn spaarpot. Hij koopt een puzzel van 8 euro. Hoeveel euro houdt hij over?",
    "som": "15 − 8 = 7",
    "antwoord": 7,
    "uitleg": "Er gaat geld uit de spaarpot, dus aftrekken."
  },
  {
    "id": 10,
    "bewerking": "plus",
    "thema": "Verjaardag",
    "emoji": "🎂🎉",
    "tekst": "Tess trakteert 12 kinderen uit haar klas en 5 kinderen uit de buurt. Hoeveel kinderen trakteert Tess?",
    "som": "12 + 5 = 17",
    "antwoord": 17,
    "uitleg": "De twee groepen kinderen worden samengevoegd, dus optellen."
  },
  {
    "id": 11,
    "bewerking": "min",
    "thema": "Dieren",
    "emoji": "🐟🐠",
    "tekst": "In de vijver zwemmen 18 goudvissen. Opa verhuist 5 goudvissen naar een andere vijver. Hoeveel goudvissen zwemmen er nog in de eerste vijver?",
    "som": "18 − 5 = 13",
    "antwoord": 13,
    "uitleg": "Er gaan vissen weg, dus aftrekken."
  },
  {
    "id": 12,
    "bewerking": "keer",
    "thema": "Koekjes",
    "emoji": "🍪🍪",
    "tekst": "Mama bakt 3 bakjes koekjes. In ieder bakje liggen 5 koekjes. Hoeveel koekjes heeft mama gebakken?",
    "som": "3 × 5 = 15",
    "antwoord": 15,
    "uitleg": "3 gelijke bakjes met 5 koekjes: vermenigvuldigen."
  },
  {
    "id": 13,
    "bewerking": "plus",
    "thema": "Verzamelkaarten",
    "emoji": "🃏🃏",
    "tekst": "Jasper heeft 11 voetbalplaatjes. Zijn broer heeft er 8 meer dan Jasper. Hoeveel plaatjes heeft zijn broer?",
    "som": "11 + 8 = 19",
    "antwoord": 19,
    "uitleg": "Het woord 'meer' is hier een valkuil: de broer heeft er 8 bij t.o.v. Jasper, dus optellen."
  },
  {
    "id": 14,
    "bewerking": "min",
    "thema": "Speelgoed",
    "emoji": "🧸🧸",
    "tekst": "In de speelhoek liggen 20 knuffels. 12 knuffels zijn van groep 3, de rest is van groep 4. Hoeveel knuffels zijn van groep 4?",
    "som": "20 − 12 = 8",
    "antwoord": 8,
    "uitleg": "Je zoekt het deel dat overblijft als je een deel wegneemt, dus aftrekken."
  },
  {
    "id": 15,
    "bewerking": "keer",
    "thema": "Dieren",
    "emoji": "🐟🐟",
    "tekst": "In de dierenwinkel staan 5 aquaria. In elk aquarium zwemmen 4 visjes. Hoeveel visjes zijn er in de winkel?",
    "som": "5 × 4 = 20",
    "antwoord": 20,
    "uitleg": "5 gelijke aquaria met 4 visjes: vermenigvuldigen."
  },
  {
    "id": 16,
    "bewerking": "plus",
    "thema": "Zwemmen",
    "emoji": "🏊🏊",
    "tekst": "Bij zwemles zijn 13 kinderen in het diepe bad en 4 kinderen in het ondiepe bad. Hoeveel kinderen hebben zwemles?",
    "som": "13 + 4 = 17",
    "antwoord": 17,
    "uitleg": "De twee groepen worden samengevoegd, dus optellen."
  },
  {
    "id": 17,
    "bewerking": "min",
    "thema": "Knikkers",
    "emoji": "🔮🔮",
    "tekst": "Bram heeft 17 knikkers. Hij speelt een potje en verliest er 9. Hoeveel knikkers heeft hij nu nog?",
    "som": "17 − 9 = 8",
    "antwoord": 8,
    "uitleg": "Er gaan knikkers weg, dus aftrekken."
  },
  {
    "id": 18,
    "bewerking": "keer",
    "thema": "School",
    "emoji": "✏️✏️",
    "tekst": "Juf koopt 3 pakken potloden voor de klas. In elk pak zitten 6 potloden. Hoeveel potloden koopt juf?",
    "som": "3 × 6 = 18",
    "antwoord": 18,
    "uitleg": "3 gelijke pakken met 6 potloden: vermenigvuldigen."
  },
  {
    "id": 19,
    "bewerking": "plus",
    "thema": "Geld",
    "emoji": "💶💶",
    "tekst": "Emma heeft 9 euro. Van oma krijgt ze 8 euro. Hoeveel euro heeft Emma nu?",
    "som": "9 + 8 = 17",
    "antwoord": 17,
    "uitleg": "Er komt geld bij, dus optellen."
  },
  {
    "id": 20,
    "bewerking": "min",
    "thema": "Familie en vrienden",
    "emoji": "🐕🦴",
    "tekst": "Max en Lotte gaan samen wandelen met hun honden. Max heeft 7 hondenkoekjes en Lotte heeft er 12. Hoeveel koekjes heeft Lotte meer dan Max?",
    "som": "12 − 7 = 5",
    "antwoord": 5,
    "uitleg": "'Samen' is hier een valkuil: de vraag gaat over het verschil, dus aftrekken."
  },
  {
    "id": 21,
    "bewerking": "plus",
    "thema": "Sport",
    "emoji": "🚲🏊",
    "tekst": "Pien fietst eerst 9 minuten naar school. Na schooltijd fietst ze 7 minuten naar het zwembad. Hoeveel minuten fietst Pien?",
    "som": "9 + 7 = 16",
    "antwoord": 16,
    "uitleg": "De twee fietstijden komen na elkaar en worden bij elkaar gedaan, dus optellen."
  },
  {
    "id": 22,
    "bewerking": "keer",
    "thema": "Stickers",
    "emoji": "⭐⭐",
    "tekst": "Yara plakt 4 rijtjes stickers in haar boekje. In elk rijtje zitten 4 stickers. Hoeveel stickers plakt Yara?",
    "som": "4 × 4 = 16",
    "antwoord": 16,
    "uitleg": "4 gelijke rijtjes met 4 stickers: vermenigvuldigen."
  },
  {
    "id": 23,
    "bewerking": "min",
    "thema": "Fruit",
    "emoji": "🍉🍉",
    "tekst": "Een kraam op de markt heeft 19 meloenen. Aan het einde van de dag zijn er nog 8 over. Hoeveel meloenen zijn er verkocht?",
    "som": "19 − 8 = 11",
    "antwoord": 11,
    "uitleg": "Het woord 'over' is een valkuil: je zoekt wat er verdwenen (verkocht) is, dus aftrekken."
  },
  {
    "id": 24,
    "bewerking": "plus",
    "thema": "Dieren",
    "emoji": "🐔🦆",
    "tekst": "Op het erf van de boer lopen 6 kippen en 8 eenden. Hoeveel dieren lopen er op het erf?",
    "som": "6 + 8 = 14",
    "antwoord": 14,
    "uitleg": "Twee soorten dieren worden samengevoegd, dus optellen."
  },
  {
    "id": 25,
    "bewerking": "keer",
    "thema": "Verjaardag",
    "emoji": "🎁🎀",
    "tekst": "Kees pakt 6 cadeautjes in. Op ieder cadeautje plakt hij 3 stickers. Hoeveel stickers plakt Kees?",
    "som": "6 × 3 = 18",
    "antwoord": 18,
    "uitleg": "6 gelijke cadeautjes met 3 stickers: vermenigvuldigen."
  },
  {
    "id": 26,
    "bewerking": "min",
    "thema": "Boeken",
    "emoji": "📖📖",
    "tekst": "Het boek van Lotte heeft 20 bladzijden. Ze heeft er al 13 gelezen. Hoeveel bladzijden moet ze nog lezen?",
    "som": "20 − 13 = 7",
    "antwoord": 7,
    "uitleg": "Je haalt het gelezen deel van het geheel af, dus aftrekken."
  },
  {
    "id": 27,
    "bewerking": "plus",
    "thema": "Sport",
    "emoji": "⚽🥅",
    "tekst": "Bij het schoolvoetbal scoort Ravi 4 doelpunten voor de pauze en 3 doelpunten na de pauze. Hoeveel doelpunten maakt Ravi?",
    "som": "4 + 3 = 7",
    "antwoord": 7,
    "uitleg": "De doelpunten van twee helften worden samengevoegd, dus optellen."
  },
  {
    "id": 28,
    "bewerking": "keer",
    "thema": "Fruit",
    "emoji": "🍌🍌",
    "tekst": "Sven geeft 7 vriendjes ieder 2 bananen. Hoeveel bananen geeft Sven weg?",
    "som": "7 × 2 = 14",
    "antwoord": 14,
    "uitleg": "7 vriendjes met ieder 2 bananen: gelijke groepjes, dus vermenigvuldigen. ('Weggeven' is een valkuil.)"
  },
  {
    "id": 29,
    "bewerking": "min",
    "thema": "Pretpark",
    "emoji": "🎠🎠",
    "tekst": "In de rij voor de draaimolen staan 15 kinderen. In de eerste ronde mogen 9 kinderen mee. Hoeveel kinderen moeten nog wachten?",
    "som": "15 − 9 = 6",
    "antwoord": 6,
    "uitleg": "Je haalt de kinderen die mee mogen van de rij af, dus aftrekken."
  },
  {
    "id": 30,
    "bewerking": "plus",
    "thema": "Huisdieren",
    "emoji": "🐱🐈",
    "tekst": "Poes Mimi heeft 5 kittens en haar zus Kiki heeft er 9. Hoeveel kittens zijn dat?",
    "som": "5 + 9 = 14",
    "antwoord": 14,
    "uitleg": "De kittens van beide poezen worden samengevoegd, dus optellen."
  },
  {
    "id": 31,
    "bewerking": "keer",
    "thema": "Eten",
    "emoji": "🍕🍕",
    "tekst": "Juf bestelt 2 pizza's voor het klassenfeest. Elke pizza is in 8 stukken gesneden. Hoeveel stukken pizza zijn er?",
    "som": "2 × 8 = 16",
    "antwoord": 16,
    "uitleg": "2 gelijke pizza's met 8 stukken: vermenigvuldigen."
  },
  {
    "id": 32,
    "bewerking": "min",
    "thema": "School",
    "emoji": "🚌🧒",
    "tekst": "In de schoolbus zitten 19 kinderen. Bij het zwembad stappen er 12 kinderen uit. Hoeveel kinderen zitten er nog in de bus?",
    "som": "19 − 12 = 7",
    "antwoord": 7,
    "uitleg": "Er gaan kinderen weg, dus aftrekken."
  },
  {
    "id": 33,
    "bewerking": "plus",
    "thema": "Speelgoed",
    "emoji": "🧩🧩",
    "tekst": "Noa legt 8 puzzelstukjes in het hoekje en 9 stukjes langs de rand. Hoeveel puzzelstukjes heeft Noa gelegd?",
    "som": "8 + 9 = 17",
    "antwoord": 17,
    "uitleg": "De stukjes uit twee delen worden samengevoegd, dus optellen."
  },
  {
    "id": 34,
    "bewerking": "min",
    "thema": "School",
    "emoji": "🎨🖌️",
    "tekst": "Juf heeft 20 potjes verf. Aan het eind van de les zijn er 6 potjes leeg. Hoeveel potjes zijn nog vol?",
    "som": "20 − 6 = 14",
    "antwoord": 14,
    "uitleg": "Je haalt de lege potjes van het totaal af, dus aftrekken."
  },
  {
    "id": 35,
    "bewerking": "keer",
    "thema": "School",
    "emoji": "🖍️🖍️",
    "tekst": "In de kast staan 2 dozen krijtjes. In elke doos zitten 10 krijtjes. Hoeveel krijtjes zijn dat?",
    "som": "2 × 10 = 20",
    "antwoord": 20,
    "uitleg": "2 gelijke dozen met 10 krijtjes: vermenigvuldigen."
  },
  {
    "id": 36,
    "bewerking": "plus",
    "thema": "Geld",
    "emoji": "💶🚗",
    "tekst": "Anouk heeft 10 euro gespaard. Ze krijgt 7 euro voor het wassen van papa's auto. Hoeveel euro heeft Anouk nu?",
    "som": "10 + 7 = 17",
    "antwoord": 17,
    "uitleg": "Er komt geld bij, dus optellen."
  },
  {
    "id": 37,
    "bewerking": "keer",
    "thema": "Verjaardag",
    "emoji": "🎈🎈",
    "tekst": "Op het feestje mogen 3 kinderen ieder 3 ballonnen uitzoeken. Hoeveel ballonnen zijn dat?",
    "som": "3 × 3 = 9",
    "antwoord": 9,
    "uitleg": "3 kinderen met ieder 3 ballonnen: gelijke groepjes, vermenigvuldigen."
  },
  {
    "id": 38,
    "bewerking": "min",
    "thema": "Boeken",
    "emoji": "📚📚",
    "tekst": "In het boekenkastje staan 18 boeken. Juf leent er 7 uit aan groep 5. Hoeveel boeken staan er nog in het kastje?",
    "som": "18 − 7 = 11",
    "antwoord": 11,
    "uitleg": "Er gaan boeken weg, dus aftrekken."
  },
  {
    "id": 39,
    "bewerking": "plus",
    "thema": "Buitenspelen",
    "emoji": "🏃⚽",
    "tekst": "In de pauze spelen 6 kinderen tikkertje en 10 kinderen voetballen. Hoeveel kinderen spelen buiten?",
    "som": "6 + 10 = 16",
    "antwoord": 16,
    "uitleg": "De twee groepen worden samengevoegd, dus optellen."
  },
  {
    "id": 40,
    "bewerking": "keer",
    "thema": "Pretpark",
    "emoji": "🎠🎟️",
    "tekst": "Papa koopt 4 kaartjes voor de draaimolen. Elk kaartje kost 5 euro. Hoeveel euro kost dat?",
    "som": "4 × 5 = 20",
    "antwoord": 20,
    "uitleg": "4 gelijke kaartjes van 5 euro: vermenigvuldigen."
  }
];

/** Trekt `aantal` unieke opgaven in willekeurige volgorde. */
export function kiesOpgaven(aantal) {
  return schudArray([...OPGAVEN]).slice(0, aantal);
}
