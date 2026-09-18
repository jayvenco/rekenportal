// screens/instellingen.js
// -----------------------------------------------------------------------------
// Algemeen instellingenscherm van de portal: op dit moment alleen de
// geluid-aan/uit-schakelaar (standaard uit). Alle instellingen worden nu
// via de backend-API bewaard, gekoppeld aan het actieve profiel.
// -----------------------------------------------------------------------------

import { getAlgemeneInstellingen, saveAlgemeneInstellingen } from "../storage.js";
import {
  startMuziek, stopMuziek, setVolume, getVolume,
  toggleMute, isMuted, laadMuziek,
  speelTrack, volgendeTrack, vorigeTrack,
  toggleShuffle, getHuidigeTrackNaam,
  getTotaalTracks, getHuidigeTrackIndex,
} from "../utils/muziek.js";

export async function toonInstellingenScherm(container) {
  container.innerHTML = "";

  const koppenRij = document.createElement("div");
  koppenRij.className = "kop-balk";
  const titelBlok = document.createElement("div");
  titelBlok.className = "kop-balk__titel";
  const titel = document.createElement("h1");
  titel.textContent = "Instellingen";
  titelBlok.appendChild(titel);
  koppenRij.appendChild(titelBlok);

  const terugLink = document.createElement("a");
  terugLink.className = "knop knop--zacht";
  terugLink.href = "#/";
  terugLink.textContent = "← Terug naar het menu";
  koppenRij.appendChild(terugLink);
  container.appendChild(koppenRij);

  // --- Geluidjes ---
  const geluidKaart = document.createElement("div");
  geluidKaart.className = "kaart";

  const geluidRij = document.createElement("div");
  geluidRij.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:12px 0;";

  const geluidLabelBlok = document.createElement("div");
  const geluidTitel = document.createElement("strong");
  geluidTitel.textContent = "Geluidjes";
  const geluidUitleg = document.createElement("p");
  geluidUitleg.style.cssText = "margin:4px 0 0;";
  geluidUitleg.textContent = "Speel een klein geluidje bij een goed of fout antwoord.";
  geluidLabelBlok.append(geluidTitel, geluidUitleg);

  const wisselLabel = document.createElement("label");
  wisselLabel.className = "wissel";
  const wisselInvoer = document.createElement("input");
  wisselInvoer.type = "checkbox";
  wisselInvoer.setAttribute("aria-label", "Geluidjes aan of uit");
  const huidigeAlgemeneInstellingen = await getAlgemeneInstellingen();
  wisselInvoer.checked = huidigeAlgemeneInstellingen.geluid;
  wisselInvoer.addEventListener("change", async () => {
    try {
      await saveAlgemeneInstellingen({ geluid: wisselInvoer.checked });
    } catch (fout) {
      console.error("Kon geluid-instelling niet opslaan:", fout);
    }
  });
  wisselLabel.appendChild(wisselInvoer);

  geluidRij.append(geluidLabelBlok, wisselLabel);
  geluidKaart.appendChild(geluidRij);
  container.appendChild(geluidKaart);

  // --- Achtergrondmuziek ---
  const muziekKaart = document.createElement("div");
  muziekKaart.className = "kaart";

  const muziekKop = document.createElement("h2");
  muziekKop.textContent = "🎵 Achtergrondmuziek";
  muziekKaart.appendChild(muziekKop);

  const muziekUitleg = document.createElement("p");
  muziekUitleg.textContent = "Zet achtergrondmuziek aan tijdens het oefenen.";
  muziekKaart.appendChild(muziekUitleg);

  // Status + knoppenrij
  const statusRij = document.createElement("div");
  statusRij.style.cssText = "display:flex;align-items:center;gap:12px;flex-wrap:wrap;";

  const aanUitKnop = document.createElement("button");
  aanUitKnop.type = "button";
  aanUitKnop.className = "knop knop--primair";
  aanUitKnop.textContent = "▶️ Start muziek";
  statusRij.appendChild(aanUitKnop);

  const muteKnop = document.createElement("button");
  muteKnop.type = "button";
  muteKnop.className = "knop knop--zacht";
  muteKnop.textContent = "🔊 Dempen";
  muteKnop.disabled = true;
  statusRij.appendChild(muteKnop);

  // Volume slider
  const volGroep = document.createElement("div");
  volGroep.style.cssText = "display:flex;align-items:center;gap:8px;margin-top:8px;";

  const volLabel = document.createElement("span");
  volLabel.textContent = "🔊";
  volLabel.style.fontSize = "20px";
  volGroep.appendChild(volLabel);

  const volSlider = document.createElement("input");
  volSlider.type = "range";
  volSlider.min = "0";
  volSlider.max = "100";
  volSlider.value = String(getVolume());
  volSlider.className = "volume-slider";
  volSlider.setAttribute("aria-label", "Muziekvolume");
  volSlider.disabled = true;
  volGroep.appendChild(volSlider);

  const volWaarde = document.createElement("span");
  volWaarde.textContent = `${getVolume()}%`;
  volWaarde.style.cssText = "font-size:18px;font-weight:600;min-width:48px;text-align:right;";
  volGroep.appendChild(volWaarde);

  statusRij.appendChild(volGroep);
  muziekKaart.appendChild(statusRij);
  container.appendChild(muziekKaart);

  // Statusmelding of bestand ontbreekt
  const statusMelding = document.createElement("p");
  statusMelding.style.cssText = "margin:8px 0 0;font-size:13px;color:#5b6472;";
  statusMelding.textContent = "Plaats een .mp3 bestand in img/muziek/achtergrond.mp3 om muziek te kunnen afspelen.";
  muziekKaart.appendChild(statusMelding);

  let muziekAan = false;

  // Track info
  const trackInfo = document.createElement("p");
  trackInfo.style.cssText = "margin:10px 0 4px;font-size:14px;font-weight:600;color:#3a72c4;";
  trackInfo.textContent = "🎵 Track 1/8";
  muziekKaart.appendChild(trackInfo);

  // Playlist-knoppen
  const playlistRij = document.createElement("div");
  playlistRij.style.cssText = "display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap;";

  const prevKnop = document.createElement("button");
  prevKnop.type = "button";
  prevKnop.className = "knop knop--zacht knop--klein";
  prevKnop.textContent = "⏮ Vorige";
  prevKnop.disabled = true;
  playlistRij.appendChild(prevKnop);

  const shuffleKnop = document.createElement("button");
  shuffleKnop.type = "button";
  shuffleKnop.className = "knop knop--zacht knop--klein";
  shuffleKnop.textContent = "🔀 Shuffle";
  shuffleKnop.disabled = true;
  playlistRij.appendChild(shuffleKnop);

  const nextKnop = document.createElement("button");
  nextKnop.type = "button";
  nextKnop.className = "knop knop--zacht knop--klein";
  nextKnop.textContent = "Volgende ⏭";
  nextKnop.disabled = true;
  playlistRij.appendChild(nextKnop);

  muziekKaart.appendChild(playlistRij);

  aanUitKnop.addEventListener("click", async () => {
    if (!muziekAan) {
      const geladen = await laadMuziek();
      if (geladen) {
        startMuziek();
        muziekAan = true;
        aanUitKnop.textContent = "⏹️ Stop muziek";
        muteKnop.disabled = false;
        volSlider.disabled = false;
        prevKnop.disabled = false;
        shuffleKnop.disabled = false;
        nextKnop.disabled = false;
        setVolume(Number(volSlider.value));
        trackInfo.textContent = `🎵 ${getHuidigeTrackNaam()} (1/${getTotaalTracks()})`;
        statusMelding.textContent = "🎵 Muziek speelt!";
      } else {
        statusMelding.textContent = "⚠️ Geen muziekbestanden gevonden in img/muziek/";
      }
    } else {
      stopMuziek();
      muziekAan = false;
      aanUitKnop.textContent = "▶️ Start muziek";
      muteKnop.disabled = true;
      volSlider.disabled = true;
      prevKnop.disabled = true;
      shuffleKnop.disabled = true;
      nextKnop.disabled = true;
      statusMelding.textContent = "Muziek gestopt.";
    }
  });

  prevKnop.addEventListener("click", async () => {
    await vorigeTrack();
    trackInfo.textContent = `🎵 ${getHuidigeTrackNaam()} (${getHuidigeTrackIndex() + 1}/${getTotaalTracks()})`;
  });

  nextKnop.addEventListener("click", async () => {
    await volgendeTrack();
    trackInfo.textContent = `🎵 ${getHuidigeTrackNaam()} (${getHuidigeTrackIndex() + 1}/${getTotaalTracks()})`;
  });

  shuffleKnop.addEventListener("click", () => {
    const aan = toggleShuffle();
    shuffleKnop.textContent = aan ? "🔀 Shuffle aan" : "🔀 Shuffle";
    shuffleKnop.className = aan ? "knop knop--primair knop--klein" : "knop knop--zacht knop--klein";
  });

  muteKnop.addEventListener("click", () => {
    const muted = toggleMute();
    muteKnop.textContent = muted ? "🔇 Gedempt" : "🔊 Dempen";
  });

  volSlider.addEventListener("input", () => {
    const vol = Number(volSlider.value);
    setVolume(vol);
    volWaarde.textContent = `${vol}%`;
    // Als volume naar 0 gaat, update mute knop
    if (vol === 0) {
      muteKnop.textContent = "🔇 Gedempt";
    } else if (vol > 0 && isMuted()) {
      toggleMute(); // un-mute bij volume > 0
      muteKnop.textContent = "🔊 Dempen";
    }
  });
}
