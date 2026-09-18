// screens/oefeningScherm.js
// -----------------------------------------------------------------------------
// Generiek scherm dat een gekozen oefening "mount"'t (uit het register).
// Toont een kleine kopregel met terug-link, en laat de oefening zelf de rest
// van het scherm vullen via zijn mount(container, settings)-functie.
// -----------------------------------------------------------------------------

import { vindOefening } from "../exercises.js";
import { getInstellingen } from "../storage.js";

const OPGAVE_ACHTERGRONDEN = {
  getallenlijn: "/img/opgave-achtergronden/natuur-bos.png?v=1",
  tafels: "/img/opgave-achtergronden/ruimte.png?v=1",
  plusmin: "/img/opgave-achtergronden/anime-fantasie.png?v=1",
  verhaaltjes: "/img/opgave-achtergronden/onderwater.png?v=1",
  standaard: "/img/opgave-achtergronden/bergen.png?v=1",
};

function achtergrondVoorOefening(exerciseId) {
  return OPGAVE_ACHTERGRONDEN[exerciseId] || OPGAVE_ACHTERGRONDEN.standaard;
}

/**
 * Toont een specifieke oefening.
 * @param {HTMLElement} container
 * @param {string} exerciseId
 */
export async function toonOefeningScherm(container, exerciseId) {
  container.innerHTML = "";
  container.classList.add("opgave-pagina");
  container.style.setProperty("--opgave-achtergrond", `url("${achtergrondVoorOefening(exerciseId)}")`);
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
  terugRij.className = "opgave-pagina__terug";
  terugRij.style.marginBottom = "16px";
  const terugLink = document.createElement("a");
  terugLink.className = "terug-link";
  terugLink.href = "#/";
  terugLink.textContent = "← Terug naar het menu";
  terugRij.appendChild(terugLink);
  container.appendChild(terugRij);

  const oefenContainer = document.createElement("div");
  oefenContainer.className = "opgave-pagina__inhoud";
  container.appendChild(oefenContainer);

  const settings = (await getInstellingen(oefening.id)) || {};
  oefening.mount(oefenContainer, settings);
}
