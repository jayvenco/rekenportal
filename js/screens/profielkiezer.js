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
  logo.src = "img/logo.png?v=2";
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
  });

  acties.append(bevestigKnop, annuleerKnop);
  formulierKaart.appendChild(acties);
  shell.appendChild(formulierKaart);

  function voegPlusCirkelToe() {
    const plusKnop = document.createElement("button");
    plusKnop.type = "button";
    plusKnop.className = "profiel-start__profiel profiel-start__profiel--nieuw";
    plusKnop.setAttribute("aria-label", "Nieuw profiel aanmaken");

    const cirkel = maakElement("span", "profiel-start__cirkel", "+");
    const label = maakElement("span", "profiel-start__profielnaam", "Nieuw");
    plusKnop.append(cirkel, label);
    plusKnop.addEventListener("click", () => toonFormulier(formulierKaart, naamInvoer, foutmeldingEl));
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
        setActiefProfielId(profiel.id);
        window.location.hash = "#/";
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
    if (!naam) {
      foutmeldingEl.textContent = "Vul eerst je naam in.";
      foutmeldingEl.hidden = false;
      naamInvoer.focus();
      return;
    }

    bevestigKnop.disabled = true;
    foutmeldingEl.hidden = true;
    try {
      const nieuwProfiel = await maakProfiel(naam, gekozenAvatar);
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
