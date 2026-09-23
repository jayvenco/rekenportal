// utils/instellingenSlot.js
// -----------------------------------------------------------------------------
// Kleine "slot" voor het instellingenscherm: één gedeeld wachtwoord ("Kattegat")
// dat toegang geeft tot Instellingen, Beheer, Leerplan en Statistieken. Geen
// echte beveiliging (het wachtwoord staat gewoon in deze broncode) — dit is
// een speedbump voor kinderen, geen login-systeem.
//
// De ontgrendel-status geldt per browsertabblad (sessionStorage), net als het
// actieve profiel: een nieuwe sessie moet opnieuw ontgrendelen.
// -----------------------------------------------------------------------------

const SLEUTEL_ONTGRENDELD = "rekenportal_instellingen_ontgrendeld";
const WACHTWOORD_INSTELLINGEN = "Kattegat";

// Bestemming waar de router naartoe wilde vóór de wachtwoord-gate; wordt na
// een geslaagde ontgrendeling gebruikt om direct door te sturen.
let bestemmingNaOntgrendeling = null;

/** Is het instellingenscherm in deze sessie al ontgrendeld? */
export function isInstellingenOntgrendeld() {
  try {
    return sessionStorage.getItem(SLEUTEL_ONTGRENDELD) === "1";
  } catch (fout) {
    console.warn("Kon ontgrendelstatus niet lezen uit sessionStorage", fout);
    return false;
  }
}

/** Controleert het wachtwoord en ontgrendelt bij een match. Geeft true/false terug. */
export function ontgrendelInstellingen(wachtwoord) {
  if (wachtwoord !== WACHTWOORD_INSTELLINGEN) return false;
  try {
    sessionStorage.setItem(SLEUTEL_ONTGRENDELD, "1");
  } catch (fout) {
    console.warn("Kon ontgrendelstatus niet opslaan in sessionStorage", fout);
  }
  return true;
}

/** Vergrendelt de instellingen weer (bv. via een knop in het scherm zelf). */
export function vergrendelInstellingen() {
  try {
    sessionStorage.removeItem(SLEUTEL_ONTGRENDELD);
  } catch (fout) {
    console.warn("Kon ontgrendelstatus niet verwijderen uit sessionStorage", fout);
  }
}

/** Onthoudt naar welke route de router wilde vóór de gate (voor na het ontgrendelen). */
export function setBestemmingNaOntgrendeling(hash) {
  bestemmingNaOntgrendeling = hash;
}

/** Geeft de onthouden bestemming terug en wist hem meteen (eenmalig gebruik). */
export function haalEnWisBestemmingNaOntgrendeling() {
  const bestemming = bestemmingNaOntgrendeling;
  bestemmingNaOntgrendeling = null;
  return bestemming;
}
