// utils/geluid.js
// -----------------------------------------------------------------------------
// Heel eenvoudige geluidjes met de Web Audio API (geen externe bestanden nodig).
// Wordt alleen gebruikt als de gebruiker geluid heeft aangezet in de instellingen.
//
// speelGoedGeluid() en speelFoutGeluid() zijn async (ze moeten eerst de
// algemene instellingen ophalen via de API), maar zijn bedoeld om
// "fire-and-forget" aangeroepen te worden vanuit event-handlers: de aanroeper
// hoeft NIET te awaiten. Een eventuele fout wordt hier zelf afgevangen zodat
// er geen unhandled promise rejection ontstaat.
// -----------------------------------------------------------------------------

import { getAlgemeneInstellingen } from "../storage.js";

let audioContext = null;

function haalAudioContext() {
  if (!audioContext) {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    audioContext = new Context();
  }
  return audioContext;
}

/** Speelt een kort toontje. frequentie in Hz, duur in seconden. */
function speelToon(frequentie, duur, golfType = "sine") {
  const context = haalAudioContext();
  if (!context) return;
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  oscillator.type = golfType;
  oscillator.frequency.value = frequentie;
  volume.gain.setValueAtTime(0.15, context.currentTime);
  volume.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duur);
  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duur);
}

/** Speelt het "goed" geluidje, als geluid aan staat in de instellingen. */
export async function speelGoedGeluid() {
  try {
    const instellingen = await getAlgemeneInstellingen();
    if (!instellingen.geluid) return;
    speelToon(660, 0.12);
    setTimeout(() => speelToon(880, 0.18), 90);
  } catch (fout) {
    console.error("Kon 'goed'-geluidje niet afspelen:", fout);
  }
}

/** Speelt het "fout" geluidje, als geluid aan staat in de instellingen. */
export async function speelFoutGeluid() {
  try {
    const instellingen = await getAlgemeneInstellingen();
    if (!instellingen.geluid) return;
    speelToon(220, 0.25, "triangle");
  } catch (fout) {
    console.error("Kon 'fout'-geluidje niet afspelen:", fout);
  }
}
