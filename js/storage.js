// storage.js
// -----------------------------------------------------------------------------
// Deze module is de ENIGE plek die met de backend-API praat (fetch over HTTP).
// Alle oefeningen en schermen gebruiken alleen de functies hieronder.
// Vroeger (v1) praatte deze module met localStorage; nu praat hij met de
// FastAPI-backend. De publieke functienamen en hun gedrag zijn zoveel
// mogelijk gelijk gebleven, maar alle data-functies zijn nu ASYNC (ze geven
// een Promise terug) omdat ze een netwerkaanroep doen.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// API_BASE — automatisch: als we op een dev-poort zitten (8791/8792) pakken
// we de backend op :8420; in Docker (alles op 1 poort) gebruiken we /api.
const API_BASE = (window.location.port === "8791" || window.location.port === "8792")
  ? "http://localhost:8420/api"
  : "/api";

const SLEUTEL_ACTIEF_PROFIEL = "rekenportal_actief_profiel_id";
let laatsteProfielenLaadfout = null;

const STANDAARD_ALGEMENE_INSTELLINGEN = {
  geluid: false,
};

// -----------------------------------------------------------------------------
// Actief profiel — module-level state, gespiegeld in sessionStorage.
// Bewuste keuze: een nieuw browsertabblad / nieuwe sessie / nieuw apparaat
// moet opnieuw een profiel kiezen. Binnen dezelfde tab overleeft het profiel
// een page-refresh dankzij sessionStorage.
// -----------------------------------------------------------------------------
let actiefProfielId = leesActiefProfielUitSessionStorage();

function leesActiefProfielUitSessionStorage() {
  try {
    const ruw = sessionStorage.getItem(SLEUTEL_ACTIEF_PROFIEL);
    if (ruw === null) return null;
    const getal = Number(ruw);
    return Number.isFinite(getal) ? getal : null;
  } catch (fout) {
    console.warn("Kon actief profiel niet lezen uit sessionStorage", fout);
    return null;
  }
}

/** Geeft het id van het actieve profiel terug, of null als er nog geen gekozen is. */
export function getActiefProfielId() {
  return actiefProfielId;
}

/** Zet het actieve profiel (na keuze in de profielkiezer). */
export function setActiefProfielId(id) {
  actiefProfielId = id;
  try {
    sessionStorage.setItem(SLEUTEL_ACTIEF_PROFIEL, String(id));
  } catch (fout) {
    console.warn("Kon actief profiel niet opslaan in sessionStorage", fout);
  }
}

/** Wist het actieve profiel (bv. bij "wissel van profiel"). */
export function wisActiefProfiel() {
  actiefProfielId = null;
  try {
    sessionStorage.removeItem(SLEUTEL_ACTIEF_PROFIEL);
  } catch (fout) {
    console.warn("Kon actief profiel niet verwijderen uit sessionStorage", fout);
  }
}

/** Geeft het actieve profielId terug, of gooit een duidelijke fout als er geen is. */
function vereisActiefProfielId() {
  if (actiefProfielId === null || actiefProfielId === undefined) {
    throw new Error("Geen actief profiel gekozen");
  }
  return actiefProfielId;
}

// -----------------------------------------------------------------------------
// Kleine fetch-helpers met nette foutafhandeling.
// -----------------------------------------------------------------------------

/** Bouwt een querystring uit een object, laat undefined/null-waarden weg. */
function bouwQuery(params) {
  const gefilterd = Object.entries(params || {}).filter(
    ([, waarde]) => waarde !== undefined && waarde !== null && waarde !== ""
  );
  if (gefilterd.length === 0) return "";
  const zoekParams = new URLSearchParams();
  for (const [sleutel, waarde] of gefilterd) {
    zoekParams.set(sleutel, String(waarde));
  }
  return `?${zoekParams.toString()}`;
}

/** Voert een fetch-aanroep uit en geeft het JSON-resultaat terug (of null bij 204/leeg). */
async function fetchJson(pad, opties = {}) {
  const response = await fetch(`${API_BASE}${pad}`, {
    headers: { "Content-Type": "application/json", ...(opties.headers || {}) },
    ...opties,
  });
  if (!response.ok) {
    let details = "";
    try {
      details = await response.text();
    } catch {
      /* negeren */
    }
    throw new Error(
      `API-aanroep mislukt (${response.status} ${response.statusText}): ${pad} ${details}`
    );
  }
  if (response.status === 204) return null;
  const tekst = await response.text();
  if (!tekst) return null;
  return JSON.parse(tekst);
}

// -----------------------------------------------------------------------------
// Profiel-CRUD
// -----------------------------------------------------------------------------

/** Haalt alle bestaande profielen op. Geeft [] terug als de backend niet bereikbaar is. */
export async function listProfielen() {
  try {
    const resultaat = await fetchJson("/profielen");
    laatsteProfielenLaadfout = null;
    return resultaat || [];
  } catch (fout) {
    console.error("Kon profielen niet ophalen:", fout);
    laatsteProfielenLaadfout = fout;
    return [];
  }
}

/** Geeft de laatste fout bij het ophalen van profielen terug, of null na succes. */
export function getLaatsteProfielenLaadfout() {
  return laatsteProfielenLaadfout;
}

/** Maakt een nieuw profiel aan. Gooit de fout door zodat de UI kan reageren. */
export async function maakProfiel(naam, avatar) {
  try {
    return await fetchJson("/profielen", {
      method: "POST",
      body: JSON.stringify({ naam, avatar }),
    });
  } catch (fout) {
    console.error("Kon profiel niet aanmaken:", fout);
    throw fout;
  }
}

/** Verwijdert een profiel (en cascade alle bijbehorende data). */
export async function verwijderProfiel(profielId) {
  try {
    await fetchJson(`/profielen/${encodeURIComponent(profielId)}`, {
      method: "DELETE",
    });
  } catch (fout) {
    console.error("Kon profiel niet verwijderen:", fout);
    throw fout;
  }
}

/** Volledige URL voor het downloaden van de export van 1 profiel. Gebruik in een <a href download>. */
export function exportUrl(profielId, formaat) {
  return `${API_BASE}/export/profiel/${encodeURIComponent(profielId)}${bouwQuery({ formaat })}`;
}

/** Volledige URL voor het downloaden van de export van alle profielen samen. */
export function exportAlleUrl(formaat) {
  return `${API_BASE}/export/alle${bouwQuery({ formaat })}`;
}

// -----------------------------------------------------------------------------
// Antwoorden (statistiek-ruwdata) — werken altijd op het ACTIEVE profiel.
// -----------------------------------------------------------------------------

/**
 * Slaat één beantwoorde opgave op voor het actieve profiel.
 * @param {Object} gegevens
 * @param {string} gegevens.exerciseId
 * @param {boolean} gegevens.correct
 * @param {number} gegevens.timeMs
 * @param {Object} [gegevens.meta]
 */
export async function recordAnswer({ exerciseId, correct, timeMs, meta }) {
  try {
    const profielId = vereisActiefProfielId();
    return await fetchJson("/antwoorden", {
      method: "POST",
      body: JSON.stringify({
        profielId,
        exerciseId,
        correct: !!correct,
        timeMs: typeof timeMs === "number" && timeMs >= 0 ? timeMs : 0,
        meta: meta || {},
      }),
    });
  } catch (fout) {
    console.error("Kon antwoord niet opslaan:", fout);
    return null;
  }
}

/** Geeft alle opgeslagen antwoorden van het actieve profiel terug, optioneel gefilterd op oefening. */
export async function getAntwoorden(exerciseId) {
  try {
    const profielId = vereisActiefProfielId();
    const resultaat = await fetchJson(
      `/antwoorden${bouwQuery({ profielId, exerciseId })}`
    );
    return resultaat || [];
  } catch (fout) {
    console.error("Kon antwoorden niet ophalen:", fout);
    return [];
  }
}

/** Verwijdert alle opgeslagen antwoorden van het actieve profiel. */
export async function wisAlleStatistieken() {
  try {
    const profielId = vereisActiefProfielId();
    await fetchJson(`/antwoorden${bouwQuery({ profielId })}`, {
      method: "DELETE",
    });
  } catch (fout) {
    console.error("Kon statistieken niet wissen:", fout);
  }
}

// -----------------------------------------------------------------------------
// Instellingen — werken altijd op het ACTIEVE profiel.
// -----------------------------------------------------------------------------

/** Haalt de laatst gekozen instellingen van een oefening op (of null). */
export async function getInstellingen(exerciseId) {
  try {
    const profielId = vereisActiefProfielId();
    return await fetchJson(
      `/instellingen/${encodeURIComponent(profielId)}/exercise/${encodeURIComponent(exerciseId)}`
    );
  } catch (fout) {
    console.error("Kon instellingen niet ophalen:", fout);
    return null;
  }
}

/** Slaat de gekozen instellingen van een oefening op. */
export async function saveInstellingen(exerciseId, instellingen) {
  try {
    const profielId = vereisActiefProfielId();
    return await fetchJson(
      `/instellingen/${encodeURIComponent(profielId)}/exercise/${encodeURIComponent(exerciseId)}`,
      { method: "PUT", body: JSON.stringify(instellingen) }
    );
  } catch (fout) {
    console.error("Kon instellingen niet opslaan:", fout);
    return null;
  }
}

/** Haalt de algemene (globale) instellingen op, bv. geluid aan/uit. */
export async function getAlgemeneInstellingen() {
  try {
    const profielId = vereisActiefProfielId();
    const resultaat = await fetchJson(`/instellingen/${encodeURIComponent(profielId)}/algemeen`);
    return { ...STANDAARD_ALGEMENE_INSTELLINGEN, ...(resultaat || {}) };
  } catch (fout) {
    console.error("Kon algemene instellingen niet ophalen:", fout);
    return { ...STANDAARD_ALGEMENE_INSTELLINGEN };
  }
}

/** Slaat de algemene instellingen op (gemerged met wat er al stond). */
export async function saveAlgemeneInstellingen(instellingen) {
  try {
    const profielId = vereisActiefProfielId();
    return await fetchJson(`/instellingen/${encodeURIComponent(profielId)}/algemeen`, {
      method: "PUT",
      body: JSON.stringify(instellingen),
    });
  } catch (fout) {
    console.error("Kon algemene instellingen niet opslaan:", fout);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Statistieken — werken altijd op het ACTIEVE profiel.
// -----------------------------------------------------------------------------

const LEEG_OVERZICHT = {
  totaal: 0,
  goed: 0,
  percentage: 0,
  gemiddeldeTijdMs: 0,
  besteStreak: 0,
  huidigeStreak: 0,
};

/**
 * Geeft een compleet statistiekenoverzicht terug voor het actieve profiel.
 * Als exerciseId is meegegeven, alleen voor die oefening; anders algeheel.
 */
export async function getStatistiekOverzicht(exerciseId) {
  try {
    const profielId = vereisActiefProfielId();
    const resultaat = await fetchJson(
      `/statistieken/${encodeURIComponent(profielId)}/overzicht${bouwQuery({ exerciseId })}`
    );
    return resultaat || { ...LEEG_OVERZICHT };
  } catch (fout) {
    console.error("Kon statistiekoverzicht niet ophalen:", fout);
    return { ...LEEG_OVERZICHT };
  }
}

/** Geeft een lijst van alle exerciseId's die minstens één antwoord hebben (actief profiel). */
export async function getGebruikteOefenIds() {
  try {
    const profielId = vereisActiefProfielId();
    const resultaat = await fetchJson(
      `/statistieken/${encodeURIComponent(profielId)}/gebruikte-oefeningen`
    );
    return resultaat || [];
  } catch (fout) {
    console.error("Kon gebruikte oefeningen niet ophalen:", fout);
    return [];
  }
}

/**
 * Geeft per dag (laatste `aantalDagen` dagen, inclusief vandaag) het aantal
 * gemaakte opgaven en het percentage goed terug voor het actieve profiel.
 */
export async function getDagelijkseStatistieken(aantalDagen = 14, exerciseId) {
  try {
    const profielId = vereisActiefProfielId();
    const resultaat = await fetchJson(
      `/statistieken/${encodeURIComponent(profielId)}/dagelijks${bouwQuery({
        dagen: aantalDagen,
        exerciseId,
      })}`
    );
    return resultaat || [];
  } catch (fout) {
    console.error("Kon dagelijkse statistieken niet ophalen:", fout);
    return [];
  }
}

/** Hoeveel opgaven zijn er vandaag goed gemaakt voor een specifieke oefening (actief profiel)? */
export async function getAantalGoedVandaag(exerciseId) {
  try {
    const profielId = vereisActiefProfielId();
    const resultaat = await fetchJson(
      `/statistieken/${encodeURIComponent(profielId)}/vandaag${bouwQuery({ exerciseId })}`
    );
    return resultaat ? resultaat.aantalGoed : 0;
  } catch (fout) {
    console.error("Kon aantal goed vandaag niet ophalen:", fout);
    return 0;
  }
}

/**
 * Splitst de antwoorden van een oefening uit naar een meta-veld (actief profiel),
 * zodat je kunt zien waar het moeilijk is.
 */
export async function getUitsplitsingPerVeld(exerciseId, veldNaam) {
  try {
    const profielId = vereisActiefProfielId();
    const resultaat = await fetchJson(
      `/statistieken/${encodeURIComponent(profielId)}/uitsplitsing${bouwQuery({
        exerciseId,
        veld: veldNaam,
      })}`
    );
    return resultaat || [];
  } catch (fout) {
    console.error("Kon uitsplitsing niet ophalen:", fout);
    return [];
  }
}

// -----------------------------------------------------------------------------
// Statistiek-variant met EXPLICIET profielId — voor het beheerscherm, waar we
// per profiel (niet per se het actieve) een overzicht willen tonen zonder het
// actieve profiel te moeten overriden.
// -----------------------------------------------------------------------------

/** Zelfde als getStatistiekOverzicht(), maar voor een expliciet opgegeven profielId. */
export async function getStatistiekOverzichtVoorProfiel(profielId, exerciseId) {
  try {
    const resultaat = await fetchJson(
      `/statistieken/${encodeURIComponent(profielId)}/overzicht${bouwQuery({ exerciseId })}`
    );
    return resultaat || { ...LEEG_OVERZICHT };
  } catch (fout) {
    console.error("Kon statistiekoverzicht voor profiel niet ophalen:", fout);
    return { ...LEEG_OVERZICHT };
  }
}
