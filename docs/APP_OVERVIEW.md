# Rekenportal

Rekenportal is een web-based rekenoefen-app voor kinderen (groep 3-8), gemaakt voor de 7-jarige dochter van de ontwikkelaar.  
Het combineert een **FastAPI backend** (Python) met een **vanilla JS frontend** (geen framework) in een Docker-container.

---

## Technische componenten

### Backend
| Component | Technologie |
|-----------|-------------|
| Framework | **FastAPI** + Uvicorn |
| Database | **SQLite** via SQLAlchemy ORM |
| Migraties | `Base.metadata.create_all()` bij startup (geen Alembic) |
| Python | 3.11 (slim Docker image) |
| Structuur | `backend/app/` — main.py, database.py, models/, routes/ |

### Frontend
| Component | Technologie |
|-----------|-------------|
| UI | **Vanilla HTML/CSS/JS** — geen framework, geen build-stap |
| Modules | Native ES modules (`type="module"`) |
| SVG | Inline SVG voor iconen, raket-animatie, sterren, grafieken |
| Styling | CSS custom properties (design system in `:root`), flexbox, keyframe animaties |
| Structuur | `js/` — screens/, exercises/, utils/ — per oefening een mapje |

### Infrastructuur
| Component | Technologie |
|-----------|-------------|
| Container | **Docker** (single container: backend + frontend) |
| Registry | **GHCR** (ghcr.io/jayvenco/rekenportal) |
| CI/CD | **GitHub Actions** — push naar staging bouwt image |
| Deployment | **Unraid** — handmatige pull via deploy-script |
| Git | `staging` (werkbranch) + `main` (prod, beschermd) |
| Repo | github.com/jayvenco/rekenportal (public) |

---

## Features (compleet overzicht)

### 1. Oefeningen
Vier oefentypes, elk met eigen opgavegenerator, instelscherm en oefenscherm:

| Oefening | ID | Beschrijving |
|----------|-----|-------------|
| **Plus en min** | `plusmin` | Optellen en aftrekken, instelbaar bereik (1–100) |
| **Tafels** | `tafels` | Keersommen 1–10, per tafel te kiezen |
| **Getallenlijn** | `getallenlijn` | Opgavetypes: welkGetal, plaatsGetal, vulAan, telDoor, sprongen |
| **Verhaaltjessommen** | `verhaaltjes` | Korte verhaaltjes met plus/minsommen tot 10 |

Elke oefening heeft:
- `index.js` — mount()-functie voor register, regelt overgang instel → oefen
- `instelscherm.js` — instellingen voor deze oefening (bereik, stappen, aantal)
- `opgaven.js` — gegenereer opgaven (vraagTekst, antwoordGoed, meta)
- `oefenscherm.js` — speelt opgaven af, feedback, raket-animatie, punten

### 2. Antwoordmodi (🌟 Makkelijk / 🚀 Uitdagend)
Per oefening te kiezen in het instelscherm:
- **🌟 Makkelijk** — 4 meerkeuze-knoppen (Fisher-Yates geschud)
- **🚀 Uitdagend** — numeriek toetsenbord + cijferinvoer

Gedeelde module: `js/utils/invoerModus.js`
- `bouwCijferInvoer(invoerVlak, opGeantwoord, getBezigMetFeedback, maxCijfers)`
- `bouwMeerkeuzeInvoer(invoerVlak, opGeantwoord, juistAntwoord, fouteAntwoorden, aantalOpties)`
- `genereerFouteKeerAntwoorden(juist, tafel)` — voor tafels
- `genereerFoutePlusMinAntwoorden(juist)` — voor plusmin/verhaaltjes

### 3. Beloningssysteem (🪙 Punten)
Na elke sessie worden punten berekend en opgeslagen.

**Score → Punten:**
| Score | Punten |
|-------|--------|
| < 50% | **−5** (aftrek) |
| 50–69% | **0** (neutraal) |
| 70–99% | **5 + bonus** (lineair naar 10) |
| 100% | **10** (max) |

Module: `js/utils/punten.js`
- `berekenPunten(aantalGoed, totaal)` → `{ punten, percentage, label }`
- `slaSessieOp(profielId, exerciseId, aantalGoed, totaal)` → API POST
- `haalMaandOverzicht(profielId, jaar, maand)` → API GET
- `haalTotaalPunten(profielId)` → API GET
- `toonPuntenAnimatie(container, punten, label)` — munt-teller die oploopt

Backend routes: `backend/app/routes/sessies.py`
- `POST /api/sessies` — sla sessie op
- `GET /api/sessies/maand/{id}?jaar=&maand=` — maandoverzicht
- `GET /api/sessies/totaal/{id}` — totaal aller tijden

Model: `backend/app/models/sessie.py` — Sessie (profiel_id, exercise_id, aantal_goed, aantal_totaal, percentage, punten, tijdstip)

### 4. Raket-animatie (🚀)
Motiverende animatie boven in het oefenscherm. De raket stijgt bij elk goed antwoord.

Module: `js/utils/raketAnimatie.js`
- `maakRaketAnimatie(container, aantalOpgaven)` — start animatie
  - `raket.goedAntwoord()` — vonken + vuurwerk, raket stijgt
  - `raket.foutAntwoord()` — zwarte rookwolken + rood knipperend zwaailicht
  - `raket.reset()` — begin opnieuw
- `toonEindAnimatie(container, percentageGoed)` — eindscherm met astronaut

### 5. Voortgangssterretjes (⭐)
Rij van SVG-sterren boven in het oefenscherm, één per opgave.

Module: `js/utils/voortgangCirkels.js`
- `maakVoortgangCirkels(container, aantalOpgaven)` → `{ element, zetStatus }`
- Status: `"goed"` (groen), `"tweedePogingGoed"` (oranje), `"fout"` (rood)

### 6. Persoonlijke complimenten
Module: `js/utils/complimenten.js`
- `geefCompliment(naam?)` — 50% kans op persoonlijk compliment met profielnaam
- Persoonlijke variaties: `"{naam} goed zo!"`, `"{naam} topper!"`, etc.
- `geefFoutmelding()` — vriendelijke foutmelding

### 7. Profielen (👤)
Meerdere kindprofielen, elk met eigen statistieken.

Componenten:
- `js/screens/profielkiezer.js` — kies of maak profiel (avatar emoji's)
- `js/screens/beheer.js` — ouder/beheer: per profiel stats, verwijderen, export
- Backend API: CRUD profielen, cascade-delete van gerelateerde data
- Session storage voor actief profiel per tabblad

### 8. Statistieken (📊)
Module: `js/screens/statistieken.js`
- Totaaloverzicht (opgaven, goed, %, streaks, gem. tijd)
- Grafiek laatste 14 dagen (SVG staafdiagram)
- Per oefening: basis stats + **donut-diagram** (% goed)
- Uitsplitsing per instelling (stapgrootte, opgavetype)
- Wis-knop voor alle statistieken

### 9. Leercurriculum (📚)
Module: `js/screens/leerplan.js`
- Volledig Nederlands rekencurriculum groep 1 t/m 8
- Per groep: 2 semesters met domeinen (getallen, bewerkingen, meten, meetkunde, verhoudingen, verbanden)
- Gebaseerd op SLO-kerndoelen + referentieniveaus
- Toegankelijk zonder profiel via `#/leerplan`

### 10. API-routes (backend)
| Route | Beschrijving |
|-------|-------------|
| `GET /api/health` | Health check |
| `GET /api/profielen` | Lijst profielen |
| `POST /api/profielen` | Nieuw profiel |
| `DELETE /api/profielen/{id}` | Verwijder profiel (+ cascade) |
| `POST /api/antwoorden` | Antwoord opslaan |
| `GET /api/antwoorden?profielId=&exerciseId=` | Antwoorden ophalen |
| `DELETE /api/antwoorden?profielId=` | Wis alle antwoorden |
| `GET /api/statistieken/{id}/overzicht` | Statistiekoverzicht |
| `GET /api/statistieken/{id}/dagelijks?dagen=&exerciseId=` | Dagelijkse data |
| `GET /api/statistieken/{id}/vandaag?exerciseId=` | Vandaag |
| `GET /api/statistieken/{id}/gebruikte-oefeningen` | Gebruikte IDs |
| `GET /api/statistieken/{id}/uitsplitsing?exerciseId=&veld=` | Uitsplitsing |
| `GET /api/instellingen/{id}/exercise/{exId}` | Instellingen lezen |
| `PUT /api/instellingen/{id}/exercise/{exId}` | Instellingen opslaan |
| `GET /api/instellingen/{id}/algemeen` | Algemene instellingen |
| `PUT /api/instellingen/{id}/algemeen` | Algemene inst. opslaan |
| `GET /api/export/profiel/{id}?formaat=` | Export (json/csv) |
| `GET /api/export/alle?formaat=` | Export alle profielen |
| `POST /api/sessies` | Sessie met punten opslaan |
| `GET /api/sessies/maand/{id}?jaar=&maand=` | Maandoverzicht |
| `GET /api/sessies/totaal/{id}` | Totaal punten |

### 11. Gezondheid & foutafhandeling
- **Alle** API-aanroepen in `storage.js` hebben `vereisActiefProfielId()` **binnen** try/catch
- `verwerkAntwoord` in oefenschermen heeft extra try/catch laag
- Bij fout: feedback wordt getoond + volgende opgave (geen vastloper)
- `set -euo pipefail` in deploy script
- Docker HEALTHCHECK op `/api/health`

### 12. Logo & favicon
- `img/logo.png` — logo in homepage header
- `img/favicon.png` — favicon + apple-touch-icon

---

## Projectstructuur (verkort)
```
rekenportal/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py              # FastAPI app + route-registratie
│       ├── database.py          # SQLAlchemy engine + session
│       ├── models/              # SQLAlchemy modellen
│       │   ├── profiel.py
│       │   ├── antwoord.py
│       │   ├── instelling.py
│       │   └── sessie.py
│       └── routes/              # API-routers
│           ├── profielen.py
│           ├── antwoorden.py
│           ├── statistieken.py
│           ├── instellingen.py
│           ├── export.py
│           └── sessies.py
├── index.html
├── css/
│   └── stijl.css                # Design system + alle component-stijlen
├── js/
│   ├── main.js                  # Hash-router + gate
│   ├── storage.js               # API-koppeling (alleen hier fetch)
│   ├── exercises.js             # Register van alle oefeningen
│   ├── screens/
│   │   ├── home.js              # Homepage met tegels
│   │   ├── profielkiezer.js     # Profiel kiezen / aanmaken
│   │   ├── statistieken.js      # Statistieken + donut-diagram
│   │   ├── instellingen.js      # Algemene instellingen (geluid)
│   │   ├── beheer.js            # Ouder/beheer + maandpunten
│   │   ├── oefeningScherm.js    # Generiek oefenscherm
│   │   └── leerplan.js          # Leercurriculum overzicht
│   ├── exercises/
│   │   ├── plusmin/             # Plus en min
│   │   ├── tafels/              # Tafels
│   │   ├── getallenlijn/        # Getallenlijn
│   │   └── verhaaltjes/         # Verhaaltjessommen
│   └── utils/
│       ├── complimenten.js      # Complimenten + foutmeldingen
│       ├── willekeurig.js       # Random helpers
│       ├── geluid.js            # Web Audio API geluidjes
│       ├── raketAnimatie.js     # Raket + vuurwerk + rook
│       ├── voortgangCirkels.js  # SVG sterretjes
│       ├── punten.js            # Puntenberekening + animatie
│       ├── invoerModus.js       # Cijfer-invoer + meerkeuze
│       ├── getallenlijnSvg.js   # SVG getallenlijn
│       ├── grafiekSvg.js        # SVG staafdiagram
│       ├── iconen.js            # SVG iconen voor tegels
│       └── complimenten.js      # Complimenten
├── deploy-rekenportal.sh        # Unraid deploy script
└── .github/workflows/
    └── docker-publish.yml        # GH Actions → GHCR build
```

---

## Ontwerpkeuzes

- **`API_BASE` is dynamisch**: detecteert dev-poort (8791/8792 → localhost:8420) vs Docker (andere poort → `/api`)
- **Hash-routing** (`#/route`): geen server-side SPA config nodig
- **Single container**: backend serveert frontend via FastAPI `StaticFiles` mount
- **Geen framework**: bewuste keuze — klein, snel, geen build-stap, geen dependencies
- **SVG voor graphics**: schaalt mooi, geen externe assets nodig
- **SQLite met volume**: data persistent op Unraid via `/mnt/user/appdata/rekenportal/data/`