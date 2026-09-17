// screens/home.js
// -----------------------------------------------------------------------------
// De homepage van de Rekenportal: genereert automatisch een tegel per
// geregistreerde oefening (uit exercises.js), plus een kop-balk met het
// actieve profiel, een knop om te wisselen van profiel, een link naar het
// ouder/beheer-scherm, en de bestaande Statistieken/Instellingen-knoppen.
// -----------------------------------------------------------------------------

import { EXERCISES } from "../exercises.js";
import { getAantalGoedVandaag, listProfielen, getActiefProfielId } from "../storage.js";

/** Zoekt het huidige actieve profiel op in de lijst van profielen (of null). */
async function haalActiefProfielOp() {
  const profielId = getActiefProfielId();
  if (profielId === null) return null;
  const profielen = await listProfielen();
  return profielen.find((p) => p.id === profielId) || null;
}

/** Tekent de homepage in de gegeven container. */
export async function toonHomepage(container) {
  container.innerHTML = "";

  const koppenRij = document.createElement("div");
  koppenRij.className = "kop-balk";

  const titelBlok = document.createElement("div");
  titelBlok.className = "kop-balk__titel";
  const logoImg = document.createElement("img");
  logoImg.src = "img/logo.png";
  logoImg.style.cssText = "height:48px;width:48px;border-radius:12px;vertical-align:middle;margin-right:10px;";
  logoImg.alt = "Rekenportal logo";
  const titel = document.createElement("h1");
  titel.style.cssText = "display:inline;vertical-align:middle;";
  titel.textContent = "Rekenportal";
  titelBlok.appendChild(logoImg);
  titelBlok.appendChild(titel);
  koppenRij.appendChild(titelBlok);

  const actiesBlok = document.createElement("div");
  actiesBlok.className = "kop-balk__acties";

  const actiefProfiel = await haalActiefProfielOp();
  if (actiefProfiel) {
    const profielBadge = document.createElement("span");
    profielBadge.className = "knop knop--zacht knop--klein";
    profielBadge.setAttribute("aria-label", `Actief profiel: ${actiefProfiel.naam}`);
    profielBadge.textContent = `${actiefProfiel.avatar} ${actiefProfiel.naam}`;
    actiesBlok.appendChild(profielBadge);
  }

  const wisselProfielKnop = document.createElement("a");
  wisselProfielKnop.className = "knop knop--zacht";
  wisselProfielKnop.href = "#/profielen";
  wisselProfielKnop.textContent = "🔄 Wissel profiel";
  actiesBlok.appendChild(wisselProfielKnop);

  const beheerLink = document.createElement("a");
  beheerLink.className = "knop knop--zacht";
  beheerLink.href = "#/beheer";
  beheerLink.textContent = "👪 Beheer";
  actiesBlok.appendChild(beheerLink);

  const leerplanLink = document.createElement("a");
  leerplanLink.className = "knop knop--zacht";
  leerplanLink.href = "#/leerplan";
  leerplanLink.textContent = "📚 Leerplan";
  actiesBlok.appendChild(leerplanLink);

  const statistiekenKnop = document.createElement("a");
  statistiekenKnop.className = "knop knop--zacht";
  statistiekenKnop.href = "#/statistieken";
  statistiekenKnop.textContent = "📊 Statistieken";

  const instellingenKnop = document.createElement("a");
  instellingenKnop.className = "knop knop--zacht";
  instellingenKnop.href = "#/instellingen";
  instellingenKnop.textContent = "⚙️ Instellingen";

  actiesBlok.append(statistiekenKnop, instellingenKnop);
  koppenRij.appendChild(actiesBlok);
  container.appendChild(koppenRij);

  const introTekst = document.createElement("p");
  introTekst.textContent = "Kies een oefening om mee te beginnen.";
  introTekst.style.marginBottom = "24px";
  container.appendChild(introTekst);

  const grid = document.createElement("div");
  grid.className = "tegel-grid";

  for (const oefening of EXERCISES) {
    const tegel = document.createElement(oefening.mount ? "button" : "div");
    tegel.className = "tegel";
    tegel.type = "button";
    tegel.setAttribute("aria-label", `Start de oefening ${oefening.titel}`);
    tegel.addEventListener("click", () => {
      window.location.hash = `#/oefening/${oefening.id}`;
    });

    const icoonVlak = document.createElement("div");
    icoonVlak.className = "tegel__icoon";
    icoonVlak.style.background = `${oefening.kleurthema}22`;
    icoonVlak.innerHTML = oefening.icoonSvg;
    tegel.appendChild(icoonVlak);

    const titelEl = document.createElement("h2");
    titelEl.className = "tegel__titel";
    titelEl.textContent = oefening.titel;
    tegel.appendChild(titelEl);

    const omschrijvingEl = document.createElement("p");
    omschrijvingEl.className = "tegel__omschrijving";
    omschrijvingEl.textContent = oefening.omschrijving;
    tegel.appendChild(omschrijvingEl);

    const aantalGoedVandaag = await getAantalGoedVandaag(oefening.id);
    const voortgangEl = document.createElement("span");
    voortgangEl.className = "tegel__voortgang";
    voortgangEl.textContent =
      aantalGoedVandaag > 0 ? `vandaag ${aantalGoedVandaag} goed` : "nog niet geoefend vandaag";
    tegel.appendChild(voortgangEl);

    grid.appendChild(tegel);
  }

  container.appendChild(grid);
}
