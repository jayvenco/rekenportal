// utils/voortgangAnimatie.js
// -----------------------------------------------------------------------------
// Dispatcher die om en om tussen drie voortgangsanimaties kiest:
//   - de mijntunnel-animatie (mijnTunnelAnimatie.js)
//   - de ruimte-missie-animatie (ruimteMissieAnimatie.js)
//   - Math City, de bouwende stad (mathCityAnimatie.js)
// De keuze wordt bijgehouden in localStorage zodat opeenvolgende
// oefensessies (ook na een pagina-herlaad) elkaar afwisselen.
//
// De publieke API (maakRaketAnimatie / toonEindAnimatie) is bewust
// ongewijzigd gebleven zodat alle oefenschermen die deze module gebruiken
// niet aangepast hoeven worden.
// -----------------------------------------------------------------------------

import { maakMijnTunnelAnimatie, toonMijnTunnelEindAnimatie } from "./mijnTunnelAnimatie.js";
import { maakRuimteMissieAnimatie, toonRuimteMissieEindAnimatie } from "./ruimteMissieAnimatie.js";
import { maakMathCityAnimatie, toonMathCityEindAnimatie } from "./mathCityAnimatie.js";

const SLEUTEL_TELLER = "rekenportal_voortgang_animatie_teller";

// Onthoudt welk thema het laatst gekozen is, zodat toonEindAnimatie() (die
// los van maakRaketAnimatie() wordt aangeroepen, aan het eind van de sessie)
// hetzelfde thema laat zien in plaats van opnieuw te wisselen.
let huidigThema = "mijn";

function bepaalEnRegistreerThema() {
  let teller = 0;
  try {
    teller = Number(localStorage.getItem(SLEUTEL_TELLER)) || 0;
  } catch (fout) {
    console.warn("Kon animatie-teller niet lezen uit localStorage", fout);
  }

  huidigThema = ["mijn", "ruimte", "stad"][teller % 3];

  try {
    localStorage.setItem(SLEUTEL_TELLER, String(teller + 1));
  } catch (fout) {
    console.warn("Kon animatie-teller niet opslaan in localStorage", fout);
  }

  return huidigThema;
}

/** Bouwt om de beurt de mijntunnel-, ruimte-missie- of Math City-animatie. */
export function maakRaketAnimatie(container, doelAantal) {
  const thema = bepaalEnRegistreerThema();
  if (thema === "ruimte") return maakRuimteMissieAnimatie(container, doelAantal);
  if (thema === "stad") return maakMathCityAnimatie(container, doelAantal);
  return maakMijnTunnelAnimatie(container, doelAantal);
}

/** Toont het eindscherm van het thema dat voor deze sessie gekozen is. */
export function toonEindAnimatie(container, pct) {
  if (huidigThema === "ruimte") return toonRuimteMissieEindAnimatie(container, pct);
  if (huidigThema === "stad") return toonMathCityEindAnimatie(container, pct);
  return toonMijnTunnelEindAnimatie(container, pct);
}
