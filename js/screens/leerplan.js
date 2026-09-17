// screens/leerplan.js
// -----------------------------------------------------------------------------
// Leercurriculum rekenen — Nederlands basisonderwijs (groep 1 t/m 8).
// Gebaseerd op SLO-kerndoelen, tussendoelen en referentieniveaus.
// Bronnen: SLO (slo.nl), kerndoelen basisonderwijs, conceptkerndoelen 2025.
// -----------------------------------------------------------------------------

/** Geeft een korte kleur per domein. */
function domeinKleur(domein) {
  const kleuren = {
    getallen: "#4f8fe8",
    bewerkingen: "#38b26a",
    meten: "#f5b942",
    meetkunde: "#a56ee2",
    verhoudingen: "#f0883e",
    verbanden: "#e8735a",
  };
  return kleuren[domein] || "#5b6472";
}

const GROEPEN = [
  {
    nr: 1,
    label: "Groep 1 & 2",
    leeftijd: "4–6 jaar",
    semesters: [
      {
        semester: "1e helft",
        domeinen: [
          {
            domein: "getallen",
            titel: "Getallen",
            punten: [
              "Telrij opzeggen t/m 10",
              "Hoeveelheden tot 5 herkennen (subitizeren)",
              "Eerste begrippen: meer/minder, evenveel, groot/klein",
              "Getalbeelden t/m 5 herkennen (dobbelsteen, vingers)",
            ],
          },
          {
            domein: "bewerkingen",
            titel: "Bewerkingen",
            punten: [
              "Concreet handelen met blokjes/knopen: erbij en eraf",
              "Eenvoudige splitsingen tot 5",
              "Vergelijken van verzamelingen",
            ],
          },
          {
            domein: "meten",
            titel: "Meten & Meetkunde",
            punten: [
              "Lengte vergelijken (groter/kleiner, langer/korter)",
              "Eenvoudige bouwsels maken",
              "Ruimtelijke begrippen: links/rechts, voor/achter, onder/op",
            ],
          },
        ],
      },
      {
        semester: "2e helft",
        domeinen: [
          {
            domein: "getallen",
            titel: "Getallen",
            punten: [
              "Telrij opzeggen t/m 20",
              "Hoeveelheden tot 10 structureren (ruitjes, eieren in een doosje)",
              "Getalbeelden t/m 10 herkennen",
              "Ordenen van hoeveelheden",
            ],
          },
          {
            domein: "bewerkingen",
            titel: "Bewerkingen",
            punten: [
              "Splitsingen tot 10",
              "Erbij en eraf binnen 10 met concreet materiaal",
              "Eenvoudige verhaaltjessommen",
            ],
          },
          {
            domein: "meten",
            titel: "Meten & Meetkunde",
            punten: [
              "Tijd: dag/nacht, gisteren/vandaag/morgen, seizoenen",
              "Patronen herkennen en voortzetten",
              "Begrippen: rond, vierkant, driehoek",
            ],
          },
        ],
      },
    ],
  },
  {
    nr: 2,
    label: "Groep 3",
    leeftijd: "6–7 jaar",
    semesters: [
      {
        semester: "1e helft",
        domeinen: [
          {
            domein: "getallen",
            titel: "Getallen",
            punten: [
              "Telrij t/m 100",
              "Getallen lezen en schrijven tot 100",
              "Waarde van cijfers in een getal (tientallen/eenheden)",
              "Getallenlijn tot 100",
            ],
          },
          {
            domein: "bewerkingen",
            titel: "Bewerkingen",
            punten: [
              "Optellen en aftrekken tot 10 (automatiseren)",
              "Splitsingen tot 10 automatiseren",
              "Eraf- en erbij-sommen tot 10",
              "Begin: sommen over het tiental (8 + 5 = 13)",
            ],
          },
        ],
      },
      {
        semester: "2e helft",
        domeinen: [
          {
            domein: "getallen",
            titel: "Getallen",
            punten: [
              "Getallen tot 100 op de getallenlijn plaatsen",
              "Springen op de getallenlijn (5, 10, 2)",
              "Rekenen met geld (euromunten tot €2)",
            ],
          },
          {
            domein: "bewerkingen",
            titel: "Bewerkingen",
            punten: [
              "Optellen en aftrekken tot 20",
              "Sommen over het tiental (13 – 5, 8 + 7)",
              "Omwisselen (5 + 3 = 3 + 5)",
              "Begin: tafels van 1, 2, 5, 10",
            ],
          },
          {
            domein: "meten",
            titel: "Meten",
            punten: [
              "Klokkijken: hele uren, halve uren",
              "Lengte meten in cm (liniaal)",
              "Wegen in kg",
            ],
          },
        ],
      },
    ],
  },
  {
    nr: 3,
    label: "Groep 4",
    leeftijd: "7–8 jaar",
    semesters: [
      {
        semester: "1e helft",
        domeinen: [
          {
            domein: "getallen",
            titel: "Getallen",
            punten: [
              "Getallen tot 200",
              "Getallen splitsen in honderdtallen, tientallen, eenheden",
              "Rekenen met geld tot €10",
            ],
          },
          {
            domein: "bewerkingen",
            titel: "Bewerkingen",
            punten: [
              "Optellen en aftrekken tot 100 (zonder en met overschrijding)",
              "Kolomsgewijs rekenen (introduceren)",
              "Tafels: 1 t/m 5 en 10 automatiseren",
            ],
          },
        ],
      },
      {
        semester: "2e helft",
        domeinen: [
          {
            domein: "getallen",
            titel: "Getallen",
            punten: [
              "Getallen tot 1.000",
              "Getallen afronden op tientallen",
              "Rekenen met geld tot €100",
            ],
          },
          {
            domein: "bewerkingen",
            titel: "Bewerkingen",
            punten: [
              "Optellen en aftrekken tot 100 (cijferend)",
              "Tafels: 6 t/m 10 automatiseren",
              "Delen: uitrekenen via tafel omkeren",
              "Vermenigvuldigen: 1-cijferig × 1-cijferig",
            ],
          },
          {
            domein: "meten",
            titel: "Meten & Meetkunde",
            punten: [
              "Klokkijken: kwartieren, 5 minuten",
              "Kalender: dagen, weken, maanden",
              "Omtrek en oppervlakte (kennismaking)",
              "Eenheden: m, cm, kg, liter, euro",
            ],
          },
        ],
      },
    ],
  },
  {
    nr: 4,
    label: "Groep 5",
    leeftijd: "8–9 jaar",
    semesters: [
      {
        semester: "1e helft",
        domeinen: [
          {
            domein: "getallen",
            titel: "Getallen",
            punten: [
              "Getallen tot 10.000",
              "Getallen afronden op honderdtallen",
              "Negatieve getallen (temperatuur, diepte)",
            ],
          },
          {
            domein: "bewerkingen",
            titel: "Bewerkingen",
            punten: [
              "Optellen en aftrekken tot 1.000 (cijferend)",
              "Vermenigvuldigen: 2-cijferig × 1-cijferig",
              "Delen met rest (13 : 4 = 3 rest 1)",
            ],
          },
        ],
      },
      {
        semester: "2e helft",
        domeinen: [
          {
            domein: "getallen",
            titel: "Getallen",
            punten: [
              "Getallen tot 100.000",
              "Romeinse cijfers (kennismaking)",
              "Kommagetallen: eerste verkenning (€ 1,50)",
            ],
          },
          {
            domein: "bewerkingen",
            titel: "Bewerkingen",
            punten: [
              "Optellen en aftrekken tot 10.000",
              "Vermenigvuldigen: 2-cijferig × 2-cijferig",
              "Delen: staartdeling (kennismaking)",
              "Makkelijk rekenen: 5 × 18 = 5 × 20 – 5 × 2",
            ],
          },
          {
            domein: "breuken",
            titel: "Breuken (intro)",
            punten: [
              "Breukbegrip: ½, ¼, ¾ herkennen en benoemen",
              "Breuken vergelijken (½ is meer dan ¼)",
              "Eenvoudige breuken optellen met concreet materiaal",
            ],
          },
          {
            domein: "meten",
            titel: "Meten & Meetkunde",
            punten: [
              "Omtrek en oppervlakte berekenen (formules)",
              "Inhoud: liter, deciliter, centiliter",
              "Gewicht: gram, kilogram, ton",
              "Tijd: seconden, minuten, uren, digitale klok",
            ],
          },
        ],
      },
    ],
  },
  {
    nr: 5,
    label: "Groep 6",
    leeftijd: "9–10 jaar",
    semesters: [
      {
        semester: "1e helft",
        domeinen: [
          {
            domein: "getallen",
            titel: "Getallen & Bewerkingen",
            punten: [
              "Getallen tot 1.000.000",
              "Kommagetallen tot 2 decimalen",
              "Optellen/aftrekken met kommagetallen",
              "Vermenigvuldigen: 3-cijferig × 2-cijferig",
            ],
          },
          {
            domein: "breuken",
            titel: "Breuken",
            punten: [
              "Breuken vereenvoudigen (6/8 = 3/4)",
              "Breuken optellen met gelijke noemer",
              "Hele getallen en breuken omzetten",
              "Breuken op de getallenlijn plaatsen",
            ],
          },
        ],
      },
      {
        semester: "2e helft",
        domeinen: [
          {
            domein: "verhoudingen",
            titel: "Verhoudingen",
            punten: [
              "Verhoudingstabellen",
              "Procenten: 50%, 25%, 10% (kennismaking)",
              "Kommagetallen, breuken en procenten koppelen",
              "Schaal berekenen (1 : 100 = 1 cm is 1 m)",
            ],
          },
          {
            domein: "delen",
            titel: "Delen",
            punten: [
              "Staartdelingen (3-cijferig ÷ 1-cijferig)",
              "Delen met kommagetallen in uitkomst",
              "Deelbaarheid controleren",
            ],
          },
          {
            domein: "meten",
            titel: "Meten",
            punten: [
              "Oppervlaktematen: m², dm², cm²",
              "Inhoudsmaten: m³, dm³, cm³",
              "Omrekenen tussen maten",
            ],
          },
        ],
      },
    ],
  },
  {
    nr: 6,
    label: "Groep 7",
    leeftijd: "10–11 jaar",
    semesters: [
      {
        semester: "1e helft",
        domeinen: [
          {
            domein: "verhoudingen",
            titel: "Verhoudingen & Procenten",
            punten: [
              "Procenten berekenen (25% van 80 = 20)",
              "Procentuele toe- en afname",
              "Verhoudingstabellen met breuken en procenten",
              "Korting, btw, winst/verlies",
            ],
          },
          {
            domein: "getallen",
            titel: "Getallen",
            punten: [
              "Grote getallen (miljoenen, miljarden)",
              "Negatieve getallen: optellen en aftrekken",
              "Kommagetallen vermenigvuldigen en delen",
            ],
          },
        ],
      },
      {
        semester: "2e helft",
        domeinen: [
          {
            domein: "breuken",
            titel: "Breuken (verdieping)",
            punten: [
              "Breuken optellen/aftrekken met ongelijke noemers",
              "Breuken vermenigvuldigen (½ × ¼ = ⅛)",
              "Breuken delen",
              "Breuken → kommagetallen → procenten",
            ],
          },
          {
            domein: "bewerkingen",
            titel: "Bewerkingen (complex)",
            punten: [
              "Kolomsgewijs en cijferend rekenen tot 1.000.000",
              "Rekenvolgorde: haakjes, × en : voor + en –",
              "Machtigingen en wortels (kennismaking)",
            ],
          },
          {
            domein: "meetkunde",
            titel: "Meetkunde",
            punten: [
              "Graden, hoeken meten met geodriehoek",
              "Coördinaten (x,y), assenstelsel",
              "Symmetrie en spiegeling",
              "Kaartlezen, plattegronden",
            ],
          },
          {
            domein: "verbanden",
            titel: "Verbanden & Data",
            punten: [
              "Tabellen, grafieken, diagrammen lezen",
              "Gemiddelde berekenen",
              "Eenvoudige kansberekening",
            ],
          },
        ],
      },
    ],
  },
  {
    nr: 7,
    label: "Groep 8",
    leeftijd: "11–12 jaar",
    semesters: [
      {
        semester: "1e helft",
        domeinen: [
          {
            domein: "rekenen",
            titel: "Rekenen (voorbeeldopgaven Cito)",
            punten: [
              "Complexe verhaaltjessommen (meer stappen)",
              "Breuken, procenten en kommagetallen combineren",
              "Verhoudingen in praktische context (recepten, schaal)",
              "Meten: omtrek, oppervlakte, inhoud, gewicht, tijd",
            ],
          },
          {
            domein: "verbanden",
            titel: "Verbanden & Data",
            punten: [
              "Cirkeldiagrammen, staafgrafieken interpreteren",
              "Gemiddelde, mediaan, modus",
              "Tabellen aflezen en zelf maken",
              "Eenvoudige statistiek: turven, frequentie",
            ],
          },
        ],
      },
      {
        semester: "2e helft",
        domeinen: [
          {
            domein: "rekenen",
            titel: "Voorbereiding VO",
            punten: [
              "Alle bewerkingen vloeiend kunnen uitvoeren",
              "Rekenen met verhoudingen en procenten (Cito-niveau)",
              "Breuken: optellen, aftrekken, vermenigvuldigen, delen",
              "Kommagetallen: alle bewerkingen",
              "Machtigingen (kwadraten, wortels)",
            ],
          },
          {
            domein: "meetkunde",
            titel: "Meetkunde & Kaartlezen",
            punten: [
              "Oppervlakte en omtrek van samengestelde figuren",
              "Inhoud berekenen (balk, kubus, cilinder intro)",
              "Schatten en precies meten",
            ],
          },
          {
            domein: "verbanden",
            titel: "Verbanden (verdieping)",
            punten: [
              "Verbanden tussen tabellen en grafieken",
              "Eenheid van 1 berekenen (verhoudingstabel)",
              "Praktische opdrachten met data verzamelen",
            ],
          },
        ],
      },
    ],
  },
];

/** Bouwt de gekleurde tag voor een domein. */
function maakDomeinTag(domein, titel) {
  const tag = document.createElement("span");
  tag.style.cssText = `display:inline-block;font-size:12px;font-weight:700;padding:2px 10px;border-radius:10px;background:${domeinKleur(domein)}22;color:${domeinKleur(domein)};text-transform:uppercase;letter-spacing:0.5px;`;
  tag.textContent = titel;
  return tag;
}

/** Bouwt het volledige leerplan-scherm. */
export async function toonLeerplanScherm(container) {
  container.innerHTML = "";

  // --- Koppen ---
  const koppenRij = document.createElement("div");
  koppenRij.className = "kop-balk";
  const titelBlok = document.createElement("div");
  titelBlok.className = "kop-balk__titel";
  const titelEl = document.createElement("h1");
  titelEl.textContent = "📚 Leercurriculum Rekenen";
  titelBlok.appendChild(titelEl);
  koppenRij.appendChild(titelBlok);
  const terugLink = document.createElement("a");
  terugLink.className = "knop knop--zacht";
  terugLink.href = "#/";
  terugLink.textContent = "← Terug naar het menu";
  koppenRij.appendChild(terugLink);
  container.appendChild(koppenRij);

  // --- Intro ---
  const intro = document.createElement("div");
  intro.className = "kaart";
  intro.style.fontSize = "15px";
  intro.style.lineHeight = "1.6";
  intro.innerHTML = `
    <p style="margin:0 0 8px;">Dit leerplan volgt de <strong>SLO-kerndoelen</strong> en <strong>referentieniveaus</strong> voor het Nederlandse basisonderwijs.
    Per groep (1 t/m 8) zie je wat een kind per semester leert op het gebied van rekenen.</p>
    <p style="margin:0;color:#5b6472;font-size:14px;">
      🟦 Getallen &nbsp; 🟢 Bewerkingen &nbsp; 🟨 Meten &nbsp; 🟣 Meetkunde &nbsp; 🟧 Verhoudingen &nbsp; 🟥 Data/Verbanden
    </p>
  `;
  container.appendChild(intro);

  // --- Per groep ---
  for (const groep of GROEPEN) {
    const kaart = document.createElement("div");
    kaart.className = "kaart";
    kaart.style.marginBottom = "16px";

    // Groep header
    const header = document.createElement("div");
    header.style.cssText = "display:flex;align-items:baseline;gap:12px;margin-bottom:16px;flex-wrap:wrap;";
    const groepTitel = document.createElement("h2");
    groepTitel.style.cssText = "margin:0;font-size:22px;";
    groepTitel.textContent = groep.label;
    const leeftijdTag = document.createElement("span");
    leeftijdTag.style.cssText = "font-size:14px;color:#5b6472;font-weight:600;";
    leeftijdTag.textContent = `(${groep.leeftijd})`;
    header.append(groepTitel, leeftijdTag);
    kaart.appendChild(header);

    // Semesters
    for (const semester of groep.semesters) {
      const semBlok = document.createElement("div");
      semBlok.style.cssText = "margin-bottom:12px;padding:12px;background:#f6f8fc;border-radius:12px;";

      const semKop = document.createElement("h3");
      semKop.style.cssText = "margin:0 0 10px;font-size:15px;font-weight:700;color:#3a72c4;";
      semKop.textContent = semester.semester;
      semBlok.appendChild(semKop);

      // Per domein
      const domeinGrid = document.createElement("div");
      domeinGrid.style.cssText = "display:grid;grid-template-columns:1fr;gap:8px;";

      for (const domein of semester.domeinen) {
        const item = document.createElement("div");
        item.style.cssText = "padding:8px 10px;background:#ffffff;border-radius:8px;border-left:4px solid " + domeinKleur(domein.domein) + ";";

        const kopRij = document.createElement("div");
        kopRij.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:4px;";
        kopRij.appendChild(maakDomeinTag(domein.domein, domein.titel));
        item.appendChild(kopRij);

        const lijst = document.createElement("ul");
        lijst.style.cssText = "margin:4px 0 0;padding:0 0 0 18px;font-size:14px;line-height:1.5;color:#1f2937;";
        for (const punt of domein.punten) {
          const li = document.createElement("li");
          li.textContent = punt;
          lijst.appendChild(li);
        }
        item.appendChild(lijst);
        domeinGrid.appendChild(item);
      }

      semBlok.appendChild(domeinGrid);
      kaart.appendChild(semBlok);
    }

    container.appendChild(kaart);
  }

  // --- Bronvermelding ---
  const bronKaart = document.createElement("div");
  bronKaart.className = "kaart";
  bronKaart.style.fontSize = "13px";
  bronKaart.style.color = "#5b6472";
  bronKaart.innerHTML = `
    <p style="margin:0;"><strong>Bronnen:</strong> SLO kerndoelen rekenen/wiskunde ·
    Tussendoelen rekenen-wiskunde primair onderwijs (SLO, 2017) ·
    Conceptkerndoelen rekenen (SLO, april 2025) ·
    Referentieniveaus rekenen (1F/1S/2F) ·
    Cito Leerlingvolgsysteem</p>
  `;
  container.appendChild(bronKaart);
}