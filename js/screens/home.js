// screens/home.js
// -----------------------------------------------------------------------------
// De homepage van de Rekenportal: genereert automatisch een tegel per
// geregistreerde oefening (uit exercises.js), plus een kop-balk met het
// actieve profiel, een knop om te wisselen van profiel, een link naar het
// ouder/beheer-scherm, en de bestaande Statistieken/Instellingen-knoppen.
// -----------------------------------------------------------------------------

import { EXERCISES } from "../exercises.js";
import { listProfielen, getActiefProfielId } from "../storage.js";
import { haalProfielRewards, toonBadgeCollectie } from "../utils/rewards.js";

/** Zoekt het huidige actieve profiel op in de lijst van profielen (of null). */
async function haalActiefProfielOp() {
  const profielId = getActiefProfielId();
  if (profielId === null) return null;
  const profielen = await listProfielen();
  return profielen.find((p) => p.id === profielId) || null;
}

function isAfbeeldingAvatar(avatar) {
  return typeof avatar === "string" && avatar.includes("img/profiel-afbeeldingen/");
}

function vulProfielBadge(badge, profiel) {
  if (isAfbeeldingAvatar(profiel.avatar)) {
    const img = document.createElement("img");
    img.className = "profiel-badge__avatar";
    img.src = profiel.avatar;
    img.alt = "";
    img.loading = "lazy";
    badge.append(img, document.createTextNode(profiel.naam));
  } else {
    badge.textContent = `${profiel.avatar} ${profiel.naam}`;
  }
}

function vulAvatarCirkel(cirkel, profiel) {
  cirkel.innerHTML = "";
  if (isAfbeeldingAvatar(profiel.avatar)) {
    const img = document.createElement("img");
    img.className = "profiel-badge__avatar";
    img.src = profiel.avatar;
    img.alt = "";
    img.loading = "lazy";
    cirkel.appendChild(img);
  } else {
    cirkel.textContent = profiel.avatar || "⭐";
  }
}

/** Tekent de homepage in de gegeven container. */
export async function toonHomepage(container) {
  container.innerHTML = "";

  const koppenRij = document.createElement("div");
  koppenRij.className = "kop-balk";

  const titelBlok = document.createElement("div");
  titelBlok.className = "kop-balk__titel";
  const logoImg = document.createElement("img");
  logoImg.src = "img/logo.png?v=3";
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
    vulProfielBadge(profielBadge, actiefProfiel);
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

  if (actiefProfiel) {
    const rewards = await haalProfielRewards(actiefProfiel.id).catch(() => null);
    if (rewards) {
      const profielKaart = document.createElement("section");
      profielKaart.className = "hero-profile-card";
      profielKaart.innerHTML = `
        <div class="hero-profile-card__avatar"></div>
        <div class="hero-profile-card__body">
          <p>Math Hero profiel</p>
          <h2>${actiefProfiel.naam}</h2>
          <div class="hero-profile-card__stats">
            <strong>🪙 ${rewards.coins}</strong>
            <strong>⚡ Power level ${rewards.level}</strong>
            <strong>🏆 ${rewards.earnedBadgeCount}/${rewards.totalBadgeCount}</strong>
          </div>
          <div class="hero-profile-card__badges"></div>
        </div>
        <button type="button" class="knop knop--primair">Badge collection</button>
      `;
      vulAvatarCirkel(profielKaart.querySelector(".hero-profile-card__avatar"), actiefProfiel);
      const badgesRij = profielKaart.querySelector(".hero-profile-card__badges");
      for (const badge of rewards.badges.slice(0, 10)) {
        const item = document.createElement("span");
        item.className = `hero-profile-card__badge ${badge.earned ? "" : "hero-profile-card__badge--locked"}`;
        if (badge.earned && badge.visual) {
          const img = document.createElement("img");
          img.className = "badge-icon-img";
          img.src = badge.visual;
          img.alt = "";
          img.loading = "lazy";
          item.appendChild(img);
        } else {
          item.textContent = badge.earned ? badge.icon : "🔒";
        }
        item.title = badge.name;
        badgesRij.appendChild(item);
      }
      profielKaart.querySelector("button").addEventListener("click", toonBadgeCollectie);
      container.appendChild(profielKaart);
    }
  }

  // Groep-tabs
  const groepen = [...new Set(EXERCISES.map((e) => e.groep))].sort();
  let actieveGroep = groepen[0] || 4;
  const tabRij = document.createElement("div");
  tabRij.className = "groep-tabs";
  tabRij.style.cssText = "display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;";
  const tabKnoppen = [];
  for (const g of groepen) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "knop knop--klein";
    knop.textContent = `Groep ${g}`;
    knop.dataset.groep = String(g);
    if (g === actieveGroep) knop.classList.add("knop--primair");
    else knop.classList.add("knop--zacht");
    knop.addEventListener("click", () => {
      actieveGroep = g;
      for (const k of tabKnoppen) {
        k.classList.toggle("knop--primair", Number(k.dataset.groep) === g);
        k.classList.toggle("knop--zacht", Number(k.dataset.groep) !== g);
      }
      filterOefeningen();
    });
    tabKnoppen.push(knop);
    tabRij.appendChild(knop);
  }
  container.appendChild(tabRij);

  const grid = document.createElement("div");
  grid.className = "tegel-grid";

  function filterOefeningen() {
    grid.innerHTML = "";
    for (const oefening of EXERCISES) {
      if (oefening.groep !== actieveGroep) continue;
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

      const voortgangEl = document.createElement("span");
      voortgangEl.className = "tegel__voortgang";
      voortgangEl.textContent = "nog niet geoefend vandaag";
      tegel.appendChild(voortgangEl);

      grid.appendChild(tegel);
    }
  }

  filterOefeningen();
  container.appendChild(grid);
}
