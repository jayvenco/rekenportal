// screens/profielkiezer.js
// -----------------------------------------------------------------------------
// Profielkiezer: het EERSTE scherm dat een kind ziet als er nog geen actief
// profiel gekozen is. Toont bestaande profielen als grote klikbare tegels en
// biedt een simpel formulier om een nieuw profiel aan te maken. Geen
// PIN/wachtwoord — dit is een schoolvoorbeeld-app op een lokaal netwerk en
// kinderen moeten dit zelf met 1 klik kunnen doen.
// -----------------------------------------------------------------------------

import { listProfielen, maakProfiel, setActiefProfielId } from "../storage.js";

const AVATAR_KEUZES = ["🧑‍🚀", "👧", "👦", "🦸", "🐱", "🐶", "⭐", "🌈"];

/** Tekent het profielkiezer-scherm in de gegeven container. */
export async function toonProfielkiezerScherm(container) {
  container.innerHTML = "";

  const koppenRij = document.createElement("div");
  koppenRij.className = "kop-balk";
  const titelBlok = document.createElement("div");
  titelBlok.className = "kop-balk__titel";
  const titel = document.createElement("h1");
  titel.textContent = "Wie ben jij?";
  titelBlok.appendChild(titel);
  koppenRij.appendChild(titelBlok);
  container.appendChild(koppenRij);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Kies je eigen profiel, of maak een nieuw profiel aan.";
  uitleg.style.marginBottom = "24px";
  container.appendChild(uitleg);

  const profielen = await listProfielen();

  const grid = document.createElement("div");
  grid.className = "tegel-grid";

  for (const profiel of profielen) {
    const tegel = document.createElement("button");
    tegel.type = "button";
    tegel.className = "tegel";
    tegel.setAttribute("aria-label", `Ga verder als ${profiel.naam}`);
    tegel.addEventListener("click", () => {
      setActiefProfielId(profiel.id);
      window.location.hash = "#/";
    });

    const icoonVlak = document.createElement("div");
    icoonVlak.className = "tegel__icoon";
    icoonVlak.style.background = "#4f8fe822";
    icoonVlak.style.fontSize = "40px";
    icoonVlak.textContent = profiel.avatar;
    tegel.appendChild(icoonVlak);

    const titelEl = document.createElement("h2");
    titelEl.className = "tegel__titel";
    titelEl.textContent = profiel.naam;
    tegel.appendChild(titelEl);

    grid.appendChild(tegel);
  }

  // --- Tegel om een nieuw profiel te starten ---
  const nieuwTegel = document.createElement("button");
  nieuwTegel.type = "button";
  nieuwTegel.className = "tegel";
  nieuwTegel.setAttribute("aria-label", "Nieuw profiel aanmaken");

  const nieuwIcoonVlak = document.createElement("div");
  nieuwIcoonVlak.className = "tegel__icoon";
  nieuwIcoonVlak.style.background = "#38b26a22";
  nieuwIcoonVlak.style.fontSize = "40px";
  nieuwIcoonVlak.textContent = "➕";
  nieuwTegel.appendChild(nieuwIcoonVlak);

  const nieuwTitelEl = document.createElement("h2");
  nieuwTitelEl.className = "tegel__titel";
  nieuwTitelEl.textContent = "Nieuw profiel";
  nieuwTegel.appendChild(nieuwTitelEl);

  grid.appendChild(nieuwTegel);
  container.appendChild(grid);

  // --- Formulier voor een nieuw profiel (standaard verborgen) ---
  const formulierKaart = document.createElement("div");
  formulierKaart.className = "kaart";
  formulierKaart.style.display = "none";
  formulierKaart.style.marginTop = "24px";

  const formulierTitel = document.createElement("h2");
  formulierTitel.textContent = "Nieuw profiel aanmaken";
  formulierKaart.appendChild(formulierTitel);

  const naamGroep = document.createElement("div");
  naamGroep.className = "instel-groep";
  const naamLabel = document.createElement("label");
  naamLabel.className = "instel-groep__label";
  naamLabel.textContent = "Hoe heet je?";
  naamLabel.setAttribute("for", "profielkiezer-naam-invoer");
  naamGroep.appendChild(naamLabel);

  const naamInvoer = document.createElement("input");
  naamInvoer.type = "text";
  naamInvoer.id = "profielkiezer-naam-invoer";
  naamInvoer.maxLength = 40;
  naamInvoer.setAttribute("aria-label", "Jouw naam");
  naamInvoer.style.minHeight = "44px";
  naamInvoer.style.fontSize = "var(--font-groot)";
  naamInvoer.style.padding = "8px 12px";
  naamInvoer.style.borderRadius = "var(--radius-sm)";
  naamInvoer.style.border = "2px solid var(--kleur-rand)";
  naamInvoer.style.width = "100%";
  naamInvoer.style.maxWidth = "320px";
  naamGroep.appendChild(naamInvoer);
  formulierKaart.appendChild(naamGroep);

  const avatarGroep = document.createElement("div");
  avatarGroep.className = "instel-groep";
  const avatarLabel = document.createElement("span");
  avatarLabel.className = "instel-groep__label";
  avatarLabel.textContent = "Kies je avatar";
  avatarGroep.appendChild(avatarLabel);

  const avatarRij = document.createElement("div");
  avatarRij.className = "keuze-rij avatar-keuze-rij";
  avatarRij.setAttribute("role", "radiogroup");
  avatarRij.setAttribute("aria-label", "Avatar kiezen");

  let gekozenAvatar = AVATAR_KEUZES[0];
  const avatarKnoppen = [];
  for (const avatarEmoji of AVATAR_KEUZES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "keuze-knop avatar-keuze-knop";
    knop.textContent = avatarEmoji;
    knop.setAttribute("role", "radio");
    knop.setAttribute("aria-label", `Avatar ${avatarEmoji}`);
    knop.setAttribute("aria-checked", String(avatarEmoji === gekozenAvatar));
    knop.setAttribute("aria-pressed", String(avatarEmoji === gekozenAvatar));
    knop.addEventListener("click", () => {
      gekozenAvatar = avatarEmoji;
      for (const item of avatarKnoppen) {
        const actief = item.avatarEmoji === avatarEmoji;
        item.knop.setAttribute("aria-checked", String(actief));
        item.knop.setAttribute("aria-pressed", String(actief));
      }
    });
    avatarKnoppen.push({ knop, avatarEmoji });
    avatarRij.appendChild(knop);
  }
  avatarGroep.appendChild(avatarRij);
  formulierKaart.appendChild(avatarGroep);

  const foutmeldingEl = document.createElement("p");
  foutmeldingEl.className = "leeg-melding";
  foutmeldingEl.style.display = "none";
  foutmeldingEl.style.color = "var(--kleur-fout)";
  formulierKaart.appendChild(foutmeldingEl);

  const acties = document.createElement("div");
  acties.className = "acties-rij";

  const bevestigKnop = document.createElement("button");
  bevestigKnop.type = "button";
  bevestigKnop.className = "knop knop--primair";
  bevestigKnop.textContent = "Maak profiel aan";
  bevestigKnop.addEventListener("click", async () => {
    const naam = naamInvoer.value.trim();
    if (!naam) {
      foutmeldingEl.textContent = "Vul eerst je naam in.";
      foutmeldingEl.style.display = "block";
      naamInvoer.focus();
      return;
    }
    try {
      const nieuwProfiel = await maakProfiel(naam, gekozenAvatar);
      setActiefProfielId(nieuwProfiel.id);
      window.location.hash = "#/";
    } catch (fout) {
      console.error("Kon profiel niet aanmaken:", fout);
      foutmeldingEl.textContent = "Er ging iets mis bij het aanmaken van je profiel. Probeer het nog eens.";
      foutmeldingEl.style.display = "block";
    }
  });

  const annuleerKnop = document.createElement("button");
  annuleerKnop.type = "button";
  annuleerKnop.className = "knop knop--zacht";
  annuleerKnop.textContent = "Annuleren";
  annuleerKnop.addEventListener("click", () => {
    formulierKaart.style.display = "none";
    naamInvoer.value = "";
    foutmeldingEl.style.display = "none";
  });

  acties.append(bevestigKnop, annuleerKnop);
  formulierKaart.appendChild(acties);
  container.appendChild(formulierKaart);

  nieuwTegel.addEventListener("click", () => {
    formulierKaart.style.display = "block";
    naamInvoer.focus();
  });
}
