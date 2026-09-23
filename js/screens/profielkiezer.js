// screens/profielkiezer.js
// -----------------------------------------------------------------------------
// Eerste scherm van de app: een rustige, visuele profielkeuze met ronde avatars.
// Bestaande profielen verschijnen als cirkels met hun gekozen avatar; daarnaast
// staat altijd een losse plus-cirkel om een nieuw profiel aan te maken.
// -----------------------------------------------------------------------------

import {
  getLaatsteProfielenLaadfout,
  listProfielen,
  maakProfiel,
  setActiefProfielId,
  verifieerProfielWachtwoord,
} from "../storage.js";

const AVATAR_KEUZES = [
  { waarde: "img/profiel-afbeeldingen/anime-meisje-blauw.png?v=1", label: "Anime meisje blauw" },
  { waarde: "img/profiel-afbeeldingen/anime-meisje-roze.png?v=1", label: "Anime meisje roze" },
  { waarde: "img/profiel-afbeeldingen/anime-avonturier.png?v=1", label: "Anime avonturier" },
  { waarde: "img/profiel-afbeeldingen/katje-oranje.png?v=1", label: "Oranje katje" },
  { waarde: "img/profiel-afbeeldingen/katje-grijs.png?v=1", label: "Grijs katje" },
  { waarde: "img/profiel-afbeeldingen/katje-tovenaar.png?v=1", label: "Tovenaar katje" },
  { waarde: "img/profiel-afbeeldingen/prinses-roze.png?v=1", label: "Prinses roze" },
  { waarde: "img/profiel-afbeeldingen/kroon-blauw.png?v=1", label: "Blauwe kroon" },
  { waarde: "img/profiel-afbeeldingen/demon-hunter-blauw.png?v=1", label: "Demon hunter blauw" },
  { waarde: "img/profiel-afbeeldingen/demon-hunter-paars.png?v=1", label: "Demon hunter paars" },
  { waarde: "🧑‍🚀", label: "Ruimtevaarder" },
  { waarde: "⭐", label: "Ster" },
  { waarde: "🌈", label: "Regenboog" },
];

function maakElement(tag, className, textContent = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

function profielAvatar(profiel) {
  return profiel.avatar || "⭐";
}

function isAfbeeldingAvatar(avatar) {
  return typeof avatar === "string" && avatar.includes("img/profiel-afbeeldingen/");
}

function vulAvatarElement(element, avatar, alt = "") {
  element.textContent = "";
  if (isAfbeeldingAvatar(avatar)) {
    const img = document.createElement("img");
    img.className = "profiel-start__avatar-img";
    img.src = avatar;
    img.alt = alt;
    img.loading = "lazy";
    element.appendChild(img);
  } else {
    element.textContent = avatar || "⭐";
  }
}

function toonFormulier(formulierKaart, naamInvoer, foutmeldingEl) {
  formulierKaart.hidden = false;
  foutmeldingEl.hidden = true;
  naamInvoer.focus();
}

/** Tekent het profielkiezer-scherm in de gegeven container. */
export async function toonProfielkiezerScherm(container) {
  container.innerHTML = "";
  container.classList.add("profiel-start");

  const shell = maakElement("section", "profiel-start__shell");
  shell.setAttribute("aria-labelledby", "profiel-start-titel");
  container.appendChild(shell);

  const kop = maakElement("div", "profiel-start__kop");
  const logoRij = maakElement("div", "profiel-start__logo-rij");
  const logo = document.createElement("img");
  logo.className = "profiel-start__logo";
  logo.src = "img/logo.png?v=3";
  logo.alt = "";
  logo.loading = "eager";

  const titelBlok = maakElement("div", "");
  const titel = maakElement("h1", "profiel-start__titel", "Wie gaat er rekenen?");
  titel.id = "profiel-start-titel";
  const subtitel = maakElement("p", "profiel-start__subtitel", "Kies je profiel of maak een nieuwe aan.");
  titelBlok.append(titel, subtitel);
  logoRij.append(logo, titelBlok);
  kop.appendChild(logoRij);

  const beheerLink = document.createElement("a");
  beheerLink.className = "profiel-start__beheer";
  beheerLink.href = "#/beheer";
  beheerLink.textContent = "Beheer";
  kop.appendChild(beheerLink);
  shell.appendChild(kop);

  const profielenRij = maakElement("div", "profiel-start__profielen");
  profielenRij.setAttribute("aria-label", "Profielen kiezen");
  shell.appendChild(profielenRij);

  const statusRegel = maakElement("p", "profiel-start__status");
  statusRegel.setAttribute("aria-live", "polite");
  statusRegel.textContent = "Profielen laden...";
  shell.appendChild(statusRegel);

  const formulierKaart = maakElement("form", "profiel-start__formulier");
  formulierKaart.hidden = true;
  formulierKaart.noValidate = true;

  const formulierTitel = maakElement("h2", "profiel-start__formulier-titel", "Nieuw profiel");
  formulierKaart.appendChild(formulierTitel);

  const naamLabel = maakElement("label", "profiel-start__label", "Naam");
  naamLabel.setAttribute("for", "profielkiezer-naam-invoer");
  formulierKaart.appendChild(naamLabel);

  const naamInvoer = document.createElement("input");
  naamInvoer.type = "text";
  naamInvoer.id = "profielkiezer-naam-invoer";
  naamInvoer.maxLength = 40;
  naamInvoer.autocomplete = "off";
  naamInvoer.placeholder = "Bijvoorbeeld: Sam";
  naamInvoer.className = "profiel-start__naam-invoer";
  formulierKaart.appendChild(naamInvoer);

  const wachtwoordNieuwLabel = maakElement("label", "profiel-start__label", "Wachtwoord");
  wachtwoordNieuwLabel.setAttribute("for", "profielkiezer-nieuw-wachtwoord");
  formulierKaart.appendChild(wachtwoordNieuwLabel);

  const wachtwoordNieuwInvoer = document.createElement("input");
  wachtwoordNieuwInvoer.type = "password";
  wachtwoordNieuwInvoer.id = "profielkiezer-nieuw-wachtwoord";
  wachtwoordNieuwInvoer.autocomplete = "new-password";
  wachtwoordNieuwInvoer.className = "profiel-start__naam-invoer";
  formulierKaart.appendChild(wachtwoordNieuwInvoer);

  const wachtwoordBevestigLabel = maakElement("label", "profiel-start__label", "Herhaal wachtwoord");
  wachtwoordBevestigLabel.setAttribute("for", "profielkiezer-nieuw-wachtwoord-bevestig");
  formulierKaart.appendChild(wachtwoordBevestigLabel);

  const wachtwoordBevestigInvoer = document.createElement("input");
  wachtwoordBevestigInvoer.type = "password";
  wachtwoordBevestigInvoer.id = "profielkiezer-nieuw-wachtwoord-bevestig";
  wachtwoordBevestigInvoer.autocomplete = "new-password";
  wachtwoordBevestigInvoer.className = "profiel-start__naam-invoer";
  formulierKaart.appendChild(wachtwoordBevestigInvoer);

  const avatarLabel = maakElement("span", "profiel-start__label", "Kies een afbeelding");
  formulierKaart.appendChild(avatarLabel);

  const avatarRij = maakElement("div", "profiel-start__avatar-rij");
  avatarRij.setAttribute("role", "radiogroup");
  avatarRij.setAttribute("aria-label", "Avatar kiezen");
  let gekozenAvatar = AVATAR_KEUZES[0].waarde;
  const avatarKnoppen = [];

  for (const avatarKeuze of AVATAR_KEUZES) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "profiel-start__avatar-keuze";
    knop.setAttribute("role", "radio");
    knop.setAttribute("aria-label", `Avatar ${avatarKeuze.label}`);
    knop.setAttribute("aria-checked", String(avatarKeuze.waarde === gekozenAvatar));
    vulAvatarElement(knop, avatarKeuze.waarde, avatarKeuze.label);
    knop.addEventListener("click", () => {
      gekozenAvatar = avatarKeuze.waarde;
      for (const item of avatarKnoppen) {
        item.knop.setAttribute("aria-checked", String(item.waarde === avatarKeuze.waarde));
      }
    });
    avatarKnoppen.push({ knop, waarde: avatarKeuze.waarde });
    avatarRij.appendChild(knop);
  }
  formulierKaart.appendChild(avatarRij);

  const foutmeldingEl = maakElement("p", "profiel-start__fout");
  foutmeldingEl.hidden = true;
  formulierKaart.appendChild(foutmeldingEl);

  const acties = maakElement("div", "profiel-start__acties");
  const bevestigKnop = document.createElement("button");
  bevestigKnop.type = "submit";
  bevestigKnop.className = "knop knop--primair";
  bevestigKnop.textContent = "Maak profiel";

  const annuleerKnop = document.createElement("button");
  annuleerKnop.type = "button";
  annuleerKnop.className = "knop knop--zacht";
  annuleerKnop.textContent = "Annuleren";
  annuleerKnop.addEventListener("click", () => {
    formulierKaart.hidden = true;
    foutmeldingEl.hidden = true;
    naamInvoer.value = "";
    wachtwoordNieuwInvoer.value = "";
    wachtwoordBevestigInvoer.value = "";
  });

  acties.append(bevestigKnop, annuleerKnop);
  formulierKaart.appendChild(acties);
  shell.appendChild(formulierKaart);

  // --- Wachtwoord-prompt voor een bestaand profiel ---------------------------
  const wachtwoordFormulier = maakElement("form", "profiel-start__formulier");
  wachtwoordFormulier.hidden = true;
  wachtwoordFormulier.noValidate = true;

  const wachtwoordFormulierTitel = maakElement("h2", "profiel-start__formulier-titel", "Wachtwoord");
  wachtwoordFormulier.appendChild(wachtwoordFormulierTitel);

  const wachtwoordNaamRegel = maakElement("p", "profiel-start__subtitel", "");
  wachtwoordFormulier.appendChild(wachtwoordNaamRegel);

  const wachtwoordLabel = maakElement("label", "profiel-start__label", "Wachtwoord");
  wachtwoordLabel.setAttribute("for", "profielkiezer-wachtwoord-invoer");
  wachtwoordFormulier.appendChild(wachtwoordLabel);

  const wachtwoordInvoer = document.createElement("input");
  wachtwoordInvoer.type = "password";
  wachtwoordInvoer.id = "profielkiezer-wachtwoord-invoer";
  wachtwoordInvoer.autocomplete = "current-password";
  wachtwoordInvoer.className = "profiel-start__naam-invoer";
  wachtwoordFormulier.appendChild(wachtwoordInvoer);

  const wachtwoordFoutEl = maakElement("p", "profiel-start__fout");
  wachtwoordFoutEl.hidden = true;
  wachtwoordFormulier.appendChild(wachtwoordFoutEl);

  const wachtwoordActies = maakElement("div", "profiel-start__acties");
  const wachtwoordBevestigKnop = document.createElement("button");
  wachtwoordBevestigKnop.type = "submit";
  wachtwoordBevestigKnop.className = "knop knop--primair";
  wachtwoordBevestigKnop.textContent = "Verder";

  const wachtwoordAnnuleerKnop = document.createElement("button");
  wachtwoordAnnuleerKnop.type = "button";
  wachtwoordAnnuleerKnop.className = "knop knop--zacht";
  wachtwoordAnnuleerKnop.textContent = "Annuleren";

  wachtwoordActies.append(wachtwoordBevestigKnop, wachtwoordAnnuleerKnop);
  wachtwoordFormulier.appendChild(wachtwoordActies);
  shell.appendChild(wachtwoordFormulier);

  let gekozenProfielVoorWachtwoord = null;

  function sluitWachtwoordFormulier() {
    wachtwoordFormulier.hidden = true;
    wachtwoordFoutEl.hidden = true;
    wachtwoordInvoer.value = "";
    gekozenProfielVoorWachtwoord = null;
  }

  wachtwoordAnnuleerKnop.addEventListener("click", sluitWachtwoordFormulier);

  wachtwoordFormulier.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!gekozenProfielVoorWachtwoord) return;
    const wachtwoord = wachtwoordInvoer.value;
    wachtwoordBevestigKnop.disabled = true;
    wachtwoordFoutEl.hidden = true;
    try {
      const ok = await verifieerProfielWachtwoord(gekozenProfielVoorWachtwoord.id, wachtwoord);
      if (ok) {
        setActiefProfielId(gekozenProfielVoorWachtwoord.id);
        window.location.hash = "#/";
      } else {
        wachtwoordFoutEl.textContent = "Wachtwoord onjuist. Probeer opnieuw.";
        wachtwoordFoutEl.hidden = false;
        wachtwoordInvoer.value = "";
        wachtwoordInvoer.focus();
      }
    } catch (fout) {
      console.error("Kon wachtwoord niet controleren:", fout);
      wachtwoordFoutEl.textContent = "Controleren mislukt. Controleer of de server draait.";
      wachtwoordFoutEl.hidden = false;
    } finally {
      wachtwoordBevestigKnop.disabled = false;
    }
  });

  function voegPlusCirkelToe() {
    const plusKnop = document.createElement("button");
    plusKnop.type = "button";
    plusKnop.className = "profiel-start__profiel profiel-start__profiel--nieuw";
    plusKnop.setAttribute("aria-label", "Nieuw profiel aanmaken");

    const cirkel = maakElement("span", "profiel-start__cirkel", "+");
    const label = maakElement("span", "profiel-start__profielnaam", "Nieuw");
    plusKnop.append(cirkel, label);
    plusKnop.addEventListener("click", () => {
      sluitWachtwoordFormulier();
      toonFormulier(formulierKaart, naamInvoer, foutmeldingEl);
    });
    profielenRij.appendChild(plusKnop);
  }

  function tekenProfielen(profielen) {
    profielenRij.innerHTML = "";
    for (const profiel of profielen) {
      const knop = document.createElement("button");
      knop.type = "button";
      knop.className = "profiel-start__profiel";
      knop.setAttribute("aria-label", `Ga verder als ${profiel.naam}`);
      knop.addEventListener("click", () => {
        formulierKaart.hidden = true;
        foutmeldingEl.hidden = true;
        gekozenProfielVoorWachtwoord = profiel;
        wachtwoordNaamRegel.textContent = `Vul het wachtwoord van ${profiel.naam} in.`;
        wachtwoordFoutEl.hidden = true;
        wachtwoordInvoer.value = "";
        wachtwoordFormulier.hidden = false;
        wachtwoordInvoer.focus();
      });

      const cirkel = maakElement("span", "profiel-start__cirkel");
      vulAvatarElement(cirkel, profielAvatar(profiel), profiel.naam);
      const naam = maakElement("span", "profiel-start__profielnaam", profiel.naam);
      knop.append(cirkel, naam);
      profielenRij.appendChild(knop);
    }
    voegPlusCirkelToe();
  }

  let profielen = [];
  try {
    profielen = await listProfielen();
  } catch (fout) {
    console.error("Kon profielen niet laden:", fout);
  }

  tekenProfielen(profielen);
  const laadfout = getLaatsteProfielenLaadfout();
  if (laadfout) {
    statusRegel.textContent = "Profielen konden niet geladen worden. Controleer de server of probeer opnieuw.";
  } else {
    statusRegel.textContent = profielen.length === 0
      ? "Nog geen profiel? Tik op de plus om te beginnen."
      : "Tik op jouw cirkel om verder te gaan.";
  }

  const herlaadKnop = document.createElement("button");
  herlaadKnop.type = "button";
  herlaadKnop.className = "profiel-start__herlaad";
  herlaadKnop.textContent = "Opnieuw laden";
  herlaadKnop.addEventListener("click", () => toonProfielkiezerScherm(container));
  statusRegel.append(" ", herlaadKnop);

  formulierKaart.addEventListener("submit", async (event) => {
    event.preventDefault();
    const naam = naamInvoer.value.trim();
    const wachtwoord = wachtwoordNieuwInvoer.value;
    const wachtwoordBevestig = wachtwoordBevestigInvoer.value;
    if (!naam) {
      foutmeldingEl.textContent = "Vul eerst je naam in.";
      foutmeldingEl.hidden = false;
      naamInvoer.focus();
      return;
    }
    if (!wachtwoord) {
      foutmeldingEl.textContent = "Kies een wachtwoord.";
      foutmeldingEl.hidden = false;
      wachtwoordNieuwInvoer.focus();
      return;
    }
    if (wachtwoord !== wachtwoordBevestig) {
      foutmeldingEl.textContent = "De wachtwoorden komen niet overeen.";
      foutmeldingEl.hidden = false;
      wachtwoordBevestigInvoer.focus();
      return;
    }

    bevestigKnop.disabled = true;
    foutmeldingEl.hidden = true;
    try {
      const nieuwProfiel = await maakProfiel(naam, gekozenAvatar, wachtwoord);
      setActiefProfielId(nieuwProfiel.id);
      window.location.hash = "#/";
    } catch (fout) {
      console.error("Kon profiel niet aanmaken:", fout);
      foutmeldingEl.textContent = "Het profiel kon niet worden opgeslagen. Controleer of de server draait en probeer opnieuw.";
      foutmeldingEl.hidden = false;
      bevestigKnop.disabled = false;
    }
  });
}
