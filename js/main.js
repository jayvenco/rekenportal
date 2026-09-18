// main.js
// -----------------------------------------------------------------------------
// Kleine hash-router voor de Rekenportal. Leest window.location.hash en
// tekent het bijbehorende scherm in de hoofdcontainer. Geen framework nodig
// voor zo'n klein aantal schermen.
//
// Routes:
//   #/                      -> homepage met tegels
//   #/oefening/<id>         -> een specifieke oefening
//   #/statistieken          -> statistiekenscherm
//   #/instellingen          -> instellingenscherm
//   #/profielen             -> profielkiezer (wie ben jij?)
//   #/beheer                -> ouder/beheer-scherm (altijd toegankelijk)
//
// BELANGRIJK: als er nog geen actief profiel gekozen is, wordt ALTIJD de
// profielkiezer getoond, ongeacht welke route er gevraagd werd — behalve
// voor #/beheer, die moet altijd toegankelijk blijven (ook zonder profiel,
// want daar kun je profielen beheren/verwijderen).
// -----------------------------------------------------------------------------

import { toonHomepage } from "./screens/home.js";
import { toonOefeningScherm } from "./screens/oefeningScherm.js";
import { toonStatistiekenScherm } from "./screens/statistieken.js";
import { toonInstellingenScherm } from "./screens/instellingen.js";
import { toonProfielkiezerScherm } from "./screens/profielkiezer.js";
import { toonBeheerScherm } from "./screens/beheer.js";
import { toonLeerplanScherm } from "./screens/leerplan.js";
import { getActiefProfielId } from "./storage.js";
import { initialiseerCoinCounter, verversCoinCounter } from "./utils/rewards.js";

const hoofdContainer = document.getElementById("app");

async function verwerkRoute() {
  const hash = window.location.hash || "#/";
  const oefeningMatch = hash.match(/^#\/oefening\/(.+)$/);

  window.scrollTo(0, 0);
  hoofdContainer.className = "pagina";
  initialiseerCoinCounter();
  verversCoinCounter();

  // Cruciale gate: geen actief profiel en geen beheer-route? Toon de profielkiezer.
  if (hash !== "#/profielen" && hash !== "#/beheer" && hash !== "#/leerplan" && getActiefProfielId() === null) {
    await toonProfielkiezerScherm(hoofdContainer);
    return;
  }

  if (hash === "#/" || hash === "" || hash === "#") {
    await toonHomepage(hoofdContainer);
  } else if (oefeningMatch) {
    await toonOefeningScherm(hoofdContainer, decodeURIComponent(oefeningMatch[1]));
  } else if (hash === "#/statistieken") {
    await toonStatistiekenScherm(hoofdContainer);
  } else if (hash === "#/instellingen") {
    await toonInstellingenScherm(hoofdContainer);
  } else if (hash === "#/profielen") {
    await toonProfielkiezerScherm(hoofdContainer);
  } else if (hash === "#/beheer") {
    await toonBeheerScherm(hoofdContainer);
  } else if (hash === "#/leerplan") {
    await toonLeerplanScherm(hoofdContainer);
  } else {
    await toonHomepage(hoofdContainer);
  }
}

window.addEventListener("hashchange", verwerkRoute);
window.addEventListener("DOMContentLoaded", verwerkRoute);

// Direct uitvoeren voor het geval DOMContentLoaded al is geweest
// (bv. bij een script met defer dat na het event laadt in sommige browsers).
if (document.readyState === "interactive" || document.readyState === "complete") {
  verwerkRoute();
}
