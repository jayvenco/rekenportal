# Rekenportal

Een frontend-only webapplicatie voor kinderen (groep 5) om te oefenen met rekenen.
Geen backend, geen build-stap, geen frameworks: alleen HTML, CSS en vanilla
JavaScript (ES modules). Werkt volledig offline door `index.html` te openen.

## Bestandsstructuur

```
rekenportal/
├── index.html                     # Enige HTML-pagina, laadt js/main.js
├── README.md
├── css/
│   └── stijl.css                  # Design system: CSS-variabelen + alle stijlen
└── js/
    ├── main.js                    # Kleine hash-router (#/, #/oefening/<id>, ...)
    ├── exercises.js                # ⭐ CENTRAAL REGISTER van alle oefeningen
    ├── storage.js                  # ⭐ ENIGE plek die met localStorage praat
    ├── screens/
    │   ├── home.js                 # Homepage: genereert tegels uit exercises.js
    │   ├── oefeningScherm.js       # Generiek scherm dat een oefening "mount"
    │   ├── statistieken.js         # Statistiekenscherm
    │   └── instellingen.js         # Algemene instellingen (bv. geluid aan/uit)
    ├── utils/
    │   ├── willekeurig.js          # Random getallen + voorkomen van herhaling
    │   ├── complimenten.js         # Wisselende Nederlandse complimenten/foutmeldingen
    │   ├── geluid.js                # Kleine geluidjes via Web Audio API
    │   ├── raketAnimatie.js        # Motiverende raket-naar-de-maan animatie
    │   ├── getallenlijnSvg.js      # SVG-tekenfuncties voor de getallenlijn
    │   ├── grafiekSvg.js           # SVG-grafiek voor de statistieken
    │   └── iconen.js                # Zelfgetekende SVG-icoontjes voor de tegels
    └── exercises/
        ├── getallenlijn/           # Module 1: de getallenlijn
        │   ├── index.js            # mount() + registratie-object
        │   ├── instelscherm.js     # Instelscherm (bereik, stap, aantal, type)
        │   ├── oefenscherm.js      # Het daadwerkelijke oefenen + feedback
        │   └── opgaven.js          # Rekenlogica: genereert de 5 opgavetypes
        ├── tafels/                 # Module 2: de tafels van 1 t/m 10
        │   ├── index.js            # mount() + registratie-object
        │   ├── instelscherm.js     # Instelscherm (welke tafel(s), aantal opgaven)
        │   ├── oefenscherm.js      # Het daadwerkelijke oefenen + feedback
        │   └── opgaven.js          # Rekenlogica: genereert keersommen
        ├── plusmin/                # Module 3: plus en min tot 100
        │   ├── index.js            # mount() + registratie-object
        │   ├── instelscherm.js     # Instelscherm (bereik, plus/min/beide, aantal)
        │   ├── oefenscherm.js      # Het daadwerkelijke oefenen + feedback
        │   └── opgaven.js          # Rekenlogica: genereert plus- en minsommen
        └── verhaaltjes/            # Module 4: verhaaltjessommen tot 10
            ├── index.js            # mount() + registratie-object
            ├── instelscherm.js     # Instelscherm (aantal opgaven)
            ├── oefenscherm.js      # Het daadwerkelijke oefenen + feedback
            └── opgaven.js          # Verhaaltjes-sjablonen + generatielogica
```

## Hoe werkt de architectuur?

- **`storage.js`** is de enige module die `localStorage` aanroept. Elke oefening
  levert resultaten aan via **`recordAnswer({ exerciseId, correct, timeMs, meta })`**.
  Daardoor werken de statistieken automatisch voor élke oefening, en kunnen we
  later `storage.js` vervangen door een versie die met een Flask/SQLite-backend
  praat (bv. via `fetch()`), zonder dat er iets in de oefeningen zelf verandert.
- **`exercises.js`** is het centrale register. De homepage (`screens/home.js`)
  genereert de menutegels automatisch uit deze lijst. Oefeningen weten niets van
  elkaar en delen geen state — de enige gedeelde interface is `recordAnswer()`.
- Elke oefening levert een object met: `id`, `titel`, `omschrijving`, `icoonSvg`
  (inline SVG-string), `kleurthema` (hex-kleur), `instelbareOpties` (korte tekst)
  en een `mount(container, settings)`-functie die de hele oefening in de
  meegegeven container tekent.

## Zo voeg je een nieuwe oefening toe (stap voor stap)

Stel je wilt een oefening "Klokkijken" toevoegen.

1. **Maak een map** `js/exercises/klokkijken/` met minstens een `index.js`.
2. **Schrijf de `mount`-functie** die de oefening in de gegeven `container`
   tekent, bijvoorbeeld:

   ```js
   // js/exercises/klokkijken/index.js
   import { recordAnswer } from "../../storage.js";

   export function mount(container, settings) {
     container.innerHTML = "<p>Hier komt de klok-oefening...</p>";
     // Gebruik recordAnswer({ exerciseId: "klokkijken", correct, timeMs, meta })
     // telkens als het kind een opgave heeft beantwoord.
   }

   export const klokkijkenOefening = {
     id: "klokkijken",
     titel: "Klokkijken",
     omschrijving: "Oefen met hele en halve uren.",
     icoonSvg: `<svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
       <circle cx="32" cy="32" r="28" fill="none" stroke="#4f8fe8" stroke-width="4" />
     </svg>`,
     kleurthema: "#4f8fe8",
     mount,
   };
   ```

3. **Registreer de oefening** in `js/exercises.js`: importeer het object en zet
   het in de `EXERCISES`-lijst.

   ```js
   import { klokkijkenOefening } from "./exercises/klokkijken/index.js";

   export const EXERCISES = [
     // ...bestaande oefeningen...
     { ...klokkijkenOefening, instelbareOpties: "Hele/halve uren" },
   ];
   ```

4. **Klaar.** De tegel verschijnt automatisch op de homepage, met icoon, titel,
   omschrijving en een voortgangsindicatie ("vandaag X goed") — zonder dat je
   iets aan `home.js`, `statistieken.js` of andere bestanden hoeft aan te passen.
   Zodra de oefening via `recordAnswer()` resultaten doorgeeft, werkt het
   statistiekenscherm er ook automatisch voor.

Zie `js/exercises/plusmin/index.js` voor een compact voorbeeld met een eigen
instelscherm (bereik + bewerkingskeuze), en `js/exercises/getallenlijn/` voor
een volledig uitgewerkt voorbeeld met meerdere opgavetypes en SVG-tekenwerk.

## Opslag en later overstappen naar een backend

Alles wordt nu bewaard in `localStorage`, via `storage.js`:
- `recordAnswer(...)` — slaat één beantwoorde opgave op.
- `getStatistiekOverzicht(exerciseId?)` — totalen, streaks, gemiddelde tijd.
- `getDagelijkseStatistieken(dagen, exerciseId?)` — data voor de 14-dagen-grafiek.
- `getUitsplitsingPerVeld(exerciseId, veldNaam)` — bv. percentage goed per stapgrootte.
- `getInstellingen(exerciseId)` / `saveInstellingen(exerciseId, instellingen)`.
- `getAlgemeneInstellingen()` / `saveAlgemeneInstellingen(instellingen)`.
- `wisAlleStatistieken()`.

Wil je later Flask + SQLite gebruiken? Vervang de binnenkant van deze functies
door `fetch()`-aanroepen naar je API. De rest van de app (oefeningen, schermen)
blijft ongewijzigd, omdat die alleen deze functies aanroepen en niet weten hoe
de data daadwerkelijk wordt opgeslagen.

## Starten

Geen build-stap nodig. Open gewoon `index.html` in de browser, of start een
kleine lokale webserver (nodig omdat ES modules niet altijd werken via
`file://` in elke browser):

```bash
cd rekenportal
python3 -m http.server 8000
# open http://localhost:8000 in de browser
```

## Toegankelijkheid

- Alle knoppen zijn minimaal 44×44px (touch-vriendelijk).
- Kleuren hebben voldoende contrast.
- Alle interactieve elementen zijn met het toetsenbord te bedienen (Tab, Enter).
- `aria-label` en `aria-live` worden gebruikt waar dat zinvol is (feedback,
  voortgang, SVG-afbeeldingen).
- Animaties respecteren `prefers-reduced-motion`.

## Modules

- **Getallenlijn** — alle vijf gevraagde opgavetypes: welk getal is dit, plaats
  het getal, vul aan, tel door en sprongen. Instellingen (bereik, stapgrootte,
  aantal opgaven, opgavetype) worden onthouden via `storage.js`.
- **Tafels** — keersommen van de tafels 1 t/m 10, zelf te kiezen welke tafel(s)
  (of "alle tafels").
- **Plus en min** — optellen en aftrekken tussen 1 en 100, met een zelf
  gekozen bereik (snelkeuzes of eigen invoer) en keuze tussen plus, min of
  beide gemengd.
- **Verhaaltjessommen** — korte Nederlandse verhaaltjes met plus- en
  minsommen tot 10, met wisselende namen en voorwerpen.
