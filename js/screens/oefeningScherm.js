// screens/oefeningScherm.js
// -----------------------------------------------------------------------------
// Generiek scherm dat een gekozen oefening "mount"'t (uit het register).
// Toont een kleine kopregel met terug-link, en laat de oefening zelf de rest
// van het scherm vullen via zijn mount(container, settings)-functie.
// -----------------------------------------------------------------------------

import { vindOefening } from "../exercises.js";
import { getInstellingen } from "../storage.js";

/**
 * Toont een specifieke oefening.
 * @param {HTMLElement} container
 * @param {string} exerciseId
 */
export async function toonOefeningScherm(container, exerciseId) {
  container.innerHTML = "";
  const oefening = vindOefening(exerciseId);

  if (!oefening) {
    const kaart = document.createElement("div");
    kaart.className = "kaart";
    kaart.innerHTML = "<p>Deze oefening bestaat niet (meer).</p>";
    const terugLink = document.createElement("a");
    terugLink.className = "terug-link";
    terugLink.href = "#/";
    terugLink.textContent = "← Terug naar het menu";
    kaart.appendChild(terugLink);
    container.appendChild(kaart);
    return;
  }

  const terugRij = document.createElement("div");
  terugRij.style.marginBottom = "16px";
  const terugLink = document.createElement("a");
  terugLink.className = "terug-link";
  terugLink.href = "#/";
  terugLink.textContent = "← Terug naar het menu";
  terugRij.appendChild(terugLink);
  container.appendChild(terugRij);

  const oefenContainer = document.createElement("div");
  container.appendChild(oefenContainer);

  const settings = (await getInstellingen(oefening.id)) || {};
  oefening.mount(oefenContainer, settings);
}
