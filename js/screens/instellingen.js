// screens/instellingen.js
// -----------------------------------------------------------------------------
// Instellingenscherm van de portal: geluid, achtergrondmuziek, links naar
// Beheer/Leerplan/Statistieken en het wijzigen van profielwachtwoorden.
// Het hele scherm zit achter een gedeeld wachtwoord ("Kattegat", zie
// utils/instellingenSlot.js) — dat is ook de enige weg naar Beheer, Leerplan
// en Statistieken, die niet meer los in het hoofdmenu staan.
// -----------------------------------------------------------------------------

import { getAlgemeneInstellingen, saveAlgemeneInstellingen, listProfielen, wijzigProfielWachtwoord } from "../storage.js";
import {
  startMuziek, stopMuziek, setVolume, getVolume,
  toggleMute, isMuted, laadMuziek,
  speelTrack, volgendeTrack, vorigeTrack,
  toggleShuffle, getHuidigeTrackNaam,
  getTotaalTracks, getHuidigeTrackIndex,
} from "../utils/muziek.js";
import {
  isInstellingenOntgrendeld,
  ontgrendelInstellingen,
  vergrendelInstellingen,
  haalEnWisBestemmingNaOntgrendeling,
} from "../utils/instellingenSlot.js";

function bouwKopBalk(titelTekst) {
  const koppenRij = document.createElement("div");
  koppenRij.className = "kop-balk";
  const titelBlok = document.createElement("div");
  titelBlok.className = "kop-balk__titel";
  const titel = document.createElement("h1");
  titel.textContent = titelTekst;
  titelBlok.appendChild(titel);
  koppenRij.appendChild(titelBlok);

  const terugLink = document.createElement("a");
  terugLink.className = "knop knop--zacht";
  terugLink.href = "#/";
  terugLink.textContent = "← Terug naar het menu";
  koppenRij.appendChild(terugLink);
  return koppenRij;
}

/** Wachtwoordscherm: moet eerst kloppen voordat Instellingen/Beheer/Leerplan/Statistieken tonen. */
function toonWachtwoordGate(container) {
  container.innerHTML = "";
  container.appendChild(bouwKopBalk("Instellingen"));

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "🔒 Afgeschermd gebied";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Vul het wachtwoord in om bij Instellingen, Beheer, Leerplan of Statistieken te komen.";
  kaart.appendChild(uitleg);

  const vorm = document.createElement("form");
  vorm.noValidate = true;

  const label = document.createElement("label");
  label.className = "profiel-start__label";
  label.textContent = "Wachtwoord";
  label.setAttribute("for", "instellingen-wachtwoord-invoer");
  vorm.appendChild(label);

  const invoer = document.createElement("input");
  invoer.type = "password";
  invoer.id = "instellingen-wachtwoord-invoer";
  invoer.autocomplete = "current-password";
  invoer.className = "profiel-start__naam-invoer";
  vorm.appendChild(invoer);

  const foutEl = document.createElement("p");
  foutEl.className = "profiel-start__fout";
  foutEl.hidden = true;
  vorm.appendChild(foutEl);

  const acties = document.createElement("div");
  acties.className = "profiel-start__acties";
  acties.style.marginTop = "16px";
  const bevestigKnop = document.createElement("button");
  bevestigKnop.type = "submit";
  bevestigKnop.className = "knop knop--primair";
  bevestigKnop.textContent = "Ontgrendelen";
  acties.appendChild(bevestigKnop);
  vorm.appendChild(acties);

  vorm.addEventListener("submit", (event) => {
    event.preventDefault();
    const ok = ontgrendelInstellingen(invoer.value);
    if (ok) {
      toonInstellingenScherm(container);
    } else {
      foutEl.textContent = "Wachtwoord onjuist. Probeer opnieuw.";
      foutEl.hidden = false;
      invoer.value = "";
      invoer.focus();
    }
  });

  kaart.appendChild(vorm);
  container.appendChild(kaart);
  invoer.focus();
}

/** Kaart met snelkoppelingen naar de vroeger losse menu-items + vergrendel-knop. */
function bouwNavigatieKaart() {
  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "Beheer & overzicht";
  kaart.appendChild(titel);

  const rij = document.createElement("div");
  rij.className = "acties-rij";

  const beheerLink = document.createElement("a");
  beheerLink.className = "knop knop--zacht";
  beheerLink.href = "#/beheer";
  beheerLink.textContent = "👪 Beheer";

  const leerplanLink = document.createElement("a");
  leerplanLink.className = "knop knop--zacht";
  leerplanLink.href = "#/leerplan";
  leerplanLink.textContent = "📚 Leerplan";

  const statistiekenLink = document.createElement("a");
  statistiekenLink.className = "knop knop--zacht";
  statistiekenLink.href = "#/statistieken";
  statistiekenLink.textContent = "📊 Statistieken";

  const vergrendelKnop = document.createElement("button");
  vergrendelKnop.type = "button";
  vergrendelKnop.className = "knop knop--zacht";
  vergrendelKnop.textContent = "🔒 Instellingen vergrendelen";
  vergrendelKnop.addEventListener("click", () => {
    vergrendelInstellingen();
    window.location.hash = "#/";
  });

  rij.append(beheerLink, leerplanLink, statistiekenLink, vergrendelKnop);
  kaart.appendChild(rij);
  return kaart;
}

/** Kaart om per profiel het wachtwoord te wijzigen. */
function bouwWachtwoordKaart(profielen) {
  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const titel = document.createElement("h2");
  titel.textContent = "🔑 Profielwachtwoorden";
  kaart.appendChild(titel);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Wijzig hier het wachtwoord waarmee een profiel gekozen wordt.";
  kaart.appendChild(uitleg);

  if (profielen.length === 0) {
    const leeg = document.createElement("p");
    leeg.className = "leeg-melding";
    leeg.textContent = "Er zijn nog geen profielen aangemaakt.";
    kaart.appendChild(leeg);
    return kaart;
  }

  for (const profiel of profielen) {
    const rij = document.createElement("div");
    rij.style.cssText = "padding:12px 0;border-top:1px solid #e2e8f0;";

    const naamRegel = document.createElement("strong");
    naamRegel.textContent = profiel.naam;
    rij.appendChild(naamRegel);

    const vorm = document.createElement("form");
    vorm.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px;";
    vorm.noValidate = true;

    const nieuwInvoer = document.createElement("input");
    nieuwInvoer.type = "password";
    nieuwInvoer.placeholder = "Nieuw wachtwoord";
    nieuwInvoer.autocomplete = "new-password";
    nieuwInvoer.className = "profiel-start__naam-invoer";
    nieuwInvoer.style.cssText = "min-height:44px;font-size:16px;width:auto;flex:1 1 160px;";

    const bevestigInvoer = document.createElement("input");
    bevestigInvoer.type = "password";
    bevestigInvoer.placeholder = "Herhaal wachtwoord";
    bevestigInvoer.autocomplete = "new-password";
    bevestigInvoer.className = "profiel-start__naam-invoer";
    bevestigInvoer.style.cssText = "min-height:44px;font-size:16px;width:auto;flex:1 1 160px;";

    const opslaanKnop = document.createElement("button");
    opslaanKnop.type = "submit";
    opslaanKnop.className = "knop knop--primair knop--klein";
    opslaanKnop.textContent = "Opslaan";

    const meldingEl = document.createElement("span");
    meldingEl.style.cssText = "font-size:13px;font-weight:700;";

    vorm.append(nieuwInvoer, bevestigInvoer, opslaanKnop, meldingEl);
    rij.appendChild(vorm);
    kaart.appendChild(rij);

    vorm.addEventListener("submit", async (event) => {
      event.preventDefault();
      meldingEl.textContent = "";
      meldingEl.style.color = "";
      if (!nieuwInvoer.value) {
        meldingEl.textContent = "Vul een wachtwoord in.";
        meldingEl.style.color = "#c0392b";
        return;
      }
      if (nieuwInvoer.value !== bevestigInvoer.value) {
        meldingEl.textContent = "Wachtwoorden komen niet overeen.";
        meldingEl.style.color = "#c0392b";
        return;
      }
      opslaanKnop.disabled = true;
      try {
        await wijzigProfielWachtwoord(profiel.id, nieuwInvoer.value);
        meldingEl.textContent = "Opgeslagen!";
        meldingEl.style.color = "#2f8f5b";
        nieuwInvoer.value = "";
        bevestigInvoer.value = "";
      } catch (fout) {
        console.error("Kon profielwachtwoord niet wijzigen:", fout);
        meldingEl.textContent = "Opslaan mislukt.";
        meldingEl.style.color = "#c0392b";
      } finally {
        opslaanKnop.disabled = false;
      }
    });
  }

  return kaart;
}

export async function toonInstellingenScherm(container) {
  if (!isInstellingenOntgrendeld()) {
    toonWachtwoordGate(container);
    return;
  }

  const bestemming = haalEnWisBestemmingNaOntgrendeling();
  if (bestemming) {
    window.location.hash = bestemming;
    return;
  }

  container.innerHTML = "";
  container.appendChild(bouwKopBalk("Instellingen"));
  container.appendChild(bouwNavigatieKaart());

  const profielen = await listProfielen();
  container.appendChild(bouwWachtwoordKaart(profielen));

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
