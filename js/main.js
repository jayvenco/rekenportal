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
import {
  startMuziek, stopMuziek, setVolume, getVolume,
  toggleMute, isMuted, laadMuziek,
  volgendeTrack, vorigeTrack, toggleShuffle,
  getHuidigeTrackNaam, getTotaalTracks, getHuidigeTrackIndex,
} from "./utils/muziek.js";
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

// -----------------------------------------------------------------------------
// Floating muziek-bar initialisatie (altijd zichtbaar na load)
// -----------------------------------------------------------------------------
function initMuziekBar() {
  const bar = document.getElementById("muziek-bar");
  const toggle = document.getElementById("muziek-toggle");
  const mute = document.getElementById("muziek-mute");
  const track = document.getElementById("muziek-track");
  const vol = document.getElementById("muziek-volume");

  if (!bar || !toggle || !mute || !track || !vol) return;

  let muziekAan = false;

  toggle.textContent = "🎵";
  toggle.title = "Muziek starten";
  bar.classList.add("muziek-bar--hidden");
  mute.textContent = "🔊";
  vol.value = String(getVolume());

  // Toon bar na 1 seconde (kleine vertraging voor UX)
  setTimeout(() => bar.classList.remove("muziek-bar--hidden"), 1000);

  function updateTrackInfo() {
    if (muziekAan) {
      track.textContent = `${getHuidigeTrackNaam()} (${getHuidigeTrackIndex() + 1}/${getTotaalTracks()})`;
    } else {
      track.textContent = "–";
    }
  }

  toggle.addEventListener("click", async () => {
    if (!muziekAan) {
      const geladen = await laadMuziek();
      if (geladen) {
        startMuziek();
        muziekAan = true;
        toggle.textContent = "⏸";
        toggle.title = "Muziek stoppen";
        updateTrackInfo();
      }
    } else {
      stopMuziek();
      muziekAan = false;
      toggle.textContent = "🎵";
      toggle.title = "Muziek starten";
      updateTrackInfo();
    }
  });

  mute.addEventListener("click", () => {
    const muted = toggleMute();
    mute.textContent = muted ? "🔇" : "🔊";
  });

  vol.addEventListener("input", () => {
    setVolume(Number(vol.value));
    if (Number(vol.value) === 0) {
      mute.textContent = "🔇";
    } else if (isMuted()) {
      toggleMute();
      mute.textContent = "🔊";
    }
  });

  // Update track info als een track wisselt (polling-vrij: via interval voor simpelheid)
  let laatsteTrack = "";
  setInterval(() => {
    if (muziekAan) {
      const huidig = getHuidigeTrackNaam();
      if (huidig !== laatsteTrack) {
        laatsteTrack = huidig;
        updateTrackInfo();
      }
    }
  }, 1000);
}

// Start muziekbar zodra DOM klaar is
if (document.readyState === "complete") {
  initMuziekBar();
} else {
  document.addEventListener("DOMContentLoaded", initMuziekBar);
}
