// utils/muziek.js
// -----------------------------------------------------------------------------
// Achtergrondmuziekmanager voor Rekenportal.
// Gebruikt Web Audio API voor loopende muziek met volume- en mute-control.
// Ondersteunt een playlist: tracks worden na elkaar afgespeeld.
// -----------------------------------------------------------------------------

const STANDAARD_BESTAND = "img/muziek/06-sweden.mp3";

const PLAYLIST = [
  "img/muziek/01-subwoofer-lullaby.mp3",
  "img/muziek/02-moog-city.mp3",
  "img/muziek/03-haggstrom.mp3",
  "img/muziek/04-minecraft.mp3",
  "img/muziek/05-mice-on-venus.mp3",
  "img/muziek/06-sweden.mp3",
  "img/muziek/07-haunt-muskie.mp3",
  "img/muziek/08-mutation.mp3",
];

let audioContext = null;
let audioBuffer = null;
let sourceNode = null;
let gainNode = null;
let isPlaying = false;
let isMutedState = false;
let currentVolume = 50; // 0-100
let isLoading = false;
let currentTrackIndex = 0;
let isShuffled = false;
let playQueue = []; // indices in shuffled mode

/**
 * Initialiseert de audio context (moet door user interactie starten).
 */
function initContext() {
  if (audioContext) return audioContext;
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return null;
  audioContext = new Context();
  gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  setVolume(currentVolume);
  return audioContext;
}

/**
 * Kiest de volgende track (shuffle-aware).
 */
function kiesVolgende() {
  if (isShuffled && playQueue.length > 0) {
    // Verwijder huidige uit queue
    playQueue = playQueue.filter((i) => i !== currentTrackIndex);
    if (playQueue.length === 0) {
      // Als alles geweest is, opnieuw schudden
      playQueue = maakShuffleQueue();
    }
    return playQueue[0];
  }
  return (currentTrackIndex + 1) % PLAYLIST.length;
}

function maakShuffleQueue() {
  const indices = PLAYLIST.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

/**
 * Laadt een audiobestand en decodeert het naar een buffer.
 * @param {string} [bestand] - pad naar audiobestand, standaard img/muziek/achtergrond.mp3
 * @returns {Promise<boolean>} - true als gelukt
 */
export async function laadMuziek(bestand = STANDAARD_BESTAND) {
  if (isLoading) return false;
  isLoading = true;
  try {
    const ctx = initContext();
    if (!ctx) return false;

    const response = await fetch(bestand);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    console.log("Muziek geladen:", bestand);
    return true;
  } catch (fout) {
    console.warn("Kon muziek niet laden:", fout);
    audioBuffer = null;
    return false;
  } finally {
    isLoading = false;
  }
}

/**
 * Start het afspelen van de geladen muziek.
 * Als de track eindigt, wordt automatisch de volgende geladen en gespeeld.
 */
export function speelMuziek() {
  if (!audioContext || !audioBuffer) return;
  if (isPlaying) return;

  sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.loop = false; // Niet loopen, we spelen de volgende track
  sourceNode.connect(gainNode);

  // Als track eindigt, speel de volgende
  sourceNode.onended = () => {
    if (isPlaying) {
      volgendeTrack();
    }
  };

  sourceNode.start(0);
  isPlaying = true;

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

/**
 * Speelt een specifieke track uit de playlist.
 * @param {number} index - index in PLAYLIST
 */
export async function speelTrack(index) {
  currentTrackIndex = Math.max(0, Math.min(index, PLAYLIST.length - 1));
  const geladen = await laadMuziek(PLAYLIST[currentTrackIndex]);
  if (geladen) {
    stopMuziek();
    speelMuziek();
  }
}

/**
 * Speelt de volgende track in de playlist (of shuffle).
 */
export function volgendeTrack() {
  stopMuziek();
  currentTrackIndex = kiesVolgende();
  speelTrack(currentTrackIndex);
}

/**
 * Speelt de vorige track.
 */
export function vorigeTrack() {
  stopMuziek();
  currentTrackIndex = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
  speelTrack(currentTrackIndex);
}

/**
 * Zet shuffle aan/uit.
 */
export function toggleShuffle() {
  isShuffled = !isShuffled;
  if (isShuffled) {
    playQueue = maakShuffleQueue();
    // Zorg dat huidige track niet in queue zit of als eerste komt
    playQueue = playQueue.filter((i) => i !== currentTrackIndex);
    playQueue.unshift(currentTrackIndex);
  } else {
    playQueue = [];
  }
  return isShuffled;
}

/**
 * Geeft de naam van de huidige track.
 */
export function getHuidigeTrackNaam() {
  const bestand = PLAYLIST[currentTrackIndex] || STANDAARD_BESTAND;
  return bestand.replace("img/muziek/", "").replace(".mp3", "");
}

/**
 * Geeft het totaal aantal tracks.
 */
export function getTotaalTracks() {
  return PLAYLIST.length;
}

/**
 * Geeft de huidige track index (0-based).
 */
export function getHuidigeTrackIndex() {
  return currentTrackIndex;
}

/**
 * Stop het afspelen van muziek.
 */
export function stopMuziek() {
  if (sourceNode) {
    try { sourceNode.stop(); } catch (e) { /* al gestopt */ }
    sourceNode.disconnect();
    sourceNode = null;
  }
  isPlaying = false;
}

/**
 * Zet het volume (0 = stil, 100 = max).
 * @param {number} vol - 0 tot 100
 */
export function setVolume(vol) {
  currentVolume = Math.max(0, Math.min(100, vol));
  if (gainNode) {
    // Logaritmische schaal voor natuurlijk aanvoelend volume
    const linearVolume = Math.pow(currentVolume / 100, 2);
    gainNode.gain.setValueAtTime(
      isMutedState ? 0 : linearVolume,
      audioContext ? audioContext.currentTime : 0
    );
  }
}

/**
 * Geeft het huidige volume terug (0-100).
 */
export function getVolume() {
  return currentVolume;
}

/**
 * Schakelt mute aan/uit. Volume blijft behouden.
 */
export function toggleMute() {
  isMutedState = !isMutedState;
  if (gainNode && audioContext) {
    gainNode.gain.setValueAtTime(
      isMutedState ? 0 : Math.pow(currentVolume / 100, 2),
      audioContext.currentTime
    );
  }
  return isMutedState;
}

/**
 * Is de muziek gemute?
 */
export function isMuted() {
  return isMutedState;
}

/**
 * Speelt de muziek af als deze geladen is, laadt hem anders eerst.
 * Handig voor 1-click init.
 */
export async function startMuziek(bestand = STANDAARD_BESTAND) {
  if (isPlaying) return;
  if (!audioBuffer) {
    const geladen = await laadMuziek(bestand);
    if (!geladen) return;
  }
  speelMuziek();
}

/**
 * Reset alles (bv. bij tabblad sluiten of herladen).
 */
export function reset() {
  stopMuziek();
  audioBuffer = null;
  isLoading = false;
}