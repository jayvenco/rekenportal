// screens/beheer.js
// -----------------------------------------------------------------------------
// Ouder/beheer-scherm: apart van het kind-menu, alleen bereikbaar via
// Instellingen (afgeschermd met het instellingen-wachtwoord, zie
// utils/instellingenSlot.js). Toont alle profielen met hun statistieken,
// biedt verwijderen en exporteren (JSON/CSV) per profiel, en een export van
// alle profielen samen.
// -----------------------------------------------------------------------------

import {
  listProfielen,
  verwijderProfiel,
  exportUrl,
  exportAlleUrl,
  getStatistiekOverzichtVoorProfiel,
  getActiefProfielId,
  wisActiefProfiel,
} from "../storage.js";
import { haalMaandOverzicht, haalTotaalPunten, haalRecenteSessies } from "../utils/punten.js";
import { EXERCISES } from "../exercises.js";

function formatTijd(ms) {
  if (!ms) return "–";
  return `${(ms / 1000).toFixed(1)}s`;
}

function isAfbeeldingAvatar(avatar) {
  return typeof avatar === "string" && avatar.includes("img/profiel-afbeeldingen/");
}

function vulProfielTitel(element, profiel) {
  if (isAfbeeldingAvatar(profiel.avatar)) {
    const img = document.createElement("img");
    img.className = "profiel-badge__avatar";
    img.src = profiel.avatar;
    img.alt = "";
    img.loading = "lazy";
    element.append(img, document.createTextNode(profiel.naam));
  } else {
    element.textContent = `${profiel.avatar} ${profiel.naam}`;
  }
}

/** Bouwt de rij met exportknoppen (JSON + CSV) als <a download>-links. */
function bouwExportRij(jsonHref, csvHref) {
  const rij = document.createElement("div");
  rij.className = "acties-rij";

  const jsonLink = document.createElement("a");
  jsonLink.className = "knop knop--zacht knop--klein";
  jsonLink.href = jsonHref;
  jsonLink.setAttribute("download", "");
  jsonLink.textContent = "⬇️ Exporteer JSON";

  const csvLink = document.createElement("a");
  csvLink.className = "knop knop--zacht knop--klein";
  csvLink.href = csvHref;
  csvLink.setAttribute("download", "");
  csvLink.textContent = "⬇️ Exporteer CSV";

  rij.append(jsonLink, csvLink);
  return rij;
}

/** Tekent het volledige beheerscherm. */
const DAG_NAMEN = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

function lokaleDagSleutel(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDuur(sec) {
  if (sec === null || sec === undefined) return "–";
  const m = Math.floor(sec / 60);
  return m > 0 ? `${m} min ${sec % 60} s` : `${sec} s`;
}

function oefeningNaam(id) {
  return EXERCISES.find((o) => o.id === id)?.titel || id;
}

/** Kaart met alle sessies van de afgelopen 7 dagen, per dag gegroepeerd. */
async function bouwWeekOverzicht() {
  const kaart = document.createElement("div");
  kaart.className = "kaart";
  const titel = document.createElement("h2");
  titel.textContent = "📅 Sessies afgelopen 7 dagen";
  kaart.appendChild(titel);

  let sessies;
  try {
    sessies = await haalRecenteSessies(7);
  } catch (fout) {
    console.error(fout);
    const p = document.createElement("p");
    p.textContent = "De sessies konden niet geladen worden.";
    kaart.appendChild(p);
    return kaart;
  }

  const perDag = new Map();
  const vandaag = new Date();
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(vandaag.getFullYear(), vandaag.getMonth(), vandaag.getDate() - i);
    perDag.set(lokaleDagSleutel(d), { datum: d, sessies: [] });
  }
  for (const s of sessies) {
    const dag = perDag.get(lokaleDagSleutel(new Date(s.tijdstip)));
    if (dag) dag.sessies.push(s);
  }

  for (const { datum, sessies: lijst } of perDag.values()) {
    const blok = document.createElement("div");
    blok.style.cssText = "padding:10px 0;border-top:1px solid #e2e8f0;";
    const goed = lijst.reduce((t, s) => t + s.aantalGoed, 0);
    const totaal = lijst.reduce((t, s) => t + s.aantalTotaal, 0);
    const duur = lijst.reduce((t, s) => t + (s.duurSec || 0), 0);
    const kop = document.createElement("strong");
    const isVandaag = lokaleDagSleutel(datum) === lokaleDagSleutel(vandaag);
    kop.textContent = `${isVandaag ? "Vandaag" : DAG_NAMEN[datum.getDay()]} ${datum.getDate()}-${datum.getMonth() + 1}`;
    const samen = document.createElement("span");
    samen.style.cssText = "margin-left:10px;color:#52667a;";
    samen.textContent = lijst.length
      ? `${lijst.length} sessie${lijst.length === 1 ? "" : "s"} · ${goed}/${totaal} goed (${totaal ? Math.round((goed / totaal) * 100) : 0}%) · ${formatDuur(duur)}`
      : "geen oefeningen";
    blok.append(kop, samen);

    if (lijst.length) {
      const tabel = document.createElement("table");
      tabel.style.cssText = "width:100%;border-collapse:collapse;margin-top:6px;font-size:14px;";
      const kopRij = document.createElement("tr");
      for (const k of ["Tijd", "Kind", "Oefening", "Score", "Duur", "Coins"]) {
        const th = document.createElement("th");
        th.textContent = k;
        th.style.cssText = "text-align:left;padding:3px 8px 3px 0;color:#52667a;font-weight:700;";
        kopRij.appendChild(th);
      }
      tabel.appendChild(kopRij);
      for (const s of [...lijst].reverse()) {
        const tr = document.createElement("tr");
        const tijd = new Date(s.tijdstip).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
        const score = `${s.aantalGoed}/${s.aantalTotaal} (${Math.round(s.percentage)}%)`;
        const detail = s.eerstePogingGoed === null || s.eerstePogingGoed === undefined
          ? ""
          : ` · ${s.eerstePogingGoed} in 1e poging`;
        for (const waarde of [tijd, s.profielNaam, oefeningNaam(s.exerciseId), score + detail, formatDuur(s.duurSec), String(s.punten)]) {
          const td = document.createElement("td");
          td.textContent = waarde;
          td.style.cssText = "padding:3px 8px 3px 0;";
          tr.appendChild(td);
        }
        tabel.appendChild(tr);
      }
      blok.appendChild(tabel);
    }
    kaart.appendChild(blok);
  }
  return kaart;
}

export async function toonBeheerScherm(container) {
  container.innerHTML = "";

  const koppenRij = document.createElement("div");
  koppenRij.className = "kop-balk";
  const titelBlok = document.createElement("div");
  titelBlok.className = "kop-balk__titel";
  const titel = document.createElement("h1");
  titel.textContent = "Ouder & beheer";
  titelBlok.appendChild(titel);
  koppenRij.appendChild(titelBlok);

  const terugLink = document.createElement("a");
  terugLink.className = "knop knop--zacht";
  terugLink.href = "#/";
  terugLink.textContent = "← Terug naar het menu";
  koppenRij.appendChild(terugLink);
  container.appendChild(koppenRij);

  const uitleg = document.createElement("p");
  uitleg.textContent = "Hier beheer je alle profielen: bekijk statistieken, exporteer resultaten of verwijder een profiel.";
  uitleg.style.marginBottom = "24px";
  container.appendChild(uitleg);

  container.appendChild(await bouwWeekOverzicht());

  const profielen = await listProfielen();

  if (profielen.length === 0) {
    const legeKaart = document.createElement("div");
    legeKaart.className = "kaart";
    const legeMelding = document.createElement("p");
    legeMelding.className = "leeg-melding";
    legeMelding.textContent = "Er zijn nog geen profielen aangemaakt.";
    legeKaart.appendChild(legeMelding);
    container.appendChild(legeKaart);
  }

  for (const profiel of profielen) {
    const kaart = document.createElement("div");
    kaart.className = "kaart";

    const kopRij = document.createElement("div");
    kopRij.className = "kop-balk";
    kopRij.style.marginBottom = "12px";

    const profielTitelBlok = document.createElement("div");
    profielTitelBlok.className = "kop-balk__titel";
    const profielTitel = document.createElement("h2");
    profielTitel.className = "profiel-beheer-titel";
    vulProfielTitel(profielTitel, profiel);
    profielTitelBlok.appendChild(profielTitel);
    kopRij.appendChild(profielTitelBlok);

    const verwijderKnop = document.createElement("button");
    verwijderKnop.type = "button";
    verwijderKnop.className = "knop knop--gevaar knop--klein";
    verwijderKnop.textContent = "🗑️ Verwijderen";
    verwijderKnop.addEventListener("click", async () => {
      const bevestigd = window.confirm(
        `Weet je zeker dat je het profiel "${profiel.naam}" wilt verwijderen? Alle statistieken en instellingen van dit profiel gaan hierbij verloren. Dit kan niet ongedaan worden gemaakt.`
      );
      if (!bevestigd) return;
      try {
        await verwijderProfiel(profiel.id);
        if (getActiefProfielId() === profiel.id) {
          wisActiefProfiel();
        }
        await toonBeheerScherm(container);
      } catch (fout) {
        console.error("Kon profiel niet verwijderen:", fout);
        window.alert("Er ging iets mis bij het verwijderen van dit profiel.");
      }
    });
    kopRij.appendChild(verwijderKnop);
    kaart.appendChild(kopRij);

    const overzicht = await getStatistiekOverzichtVoorProfiel(profiel.id);
    const statGrid = document.createElement("div");
    statGrid.className = "stat-grid";
    for (const [waarde, label] of [
      [overzicht.totaal, "opgaven gemaakt"],
      [overzicht.goed, "goed"],
      [`${overzicht.percentage}%`, "percentage goed"],
      [overzicht.besteStreak, "beste reeks"],
      [formatTijd(overzicht.gemiddeldeTijdMs), "gem. tijd per opgave"],
    ]) {
      const tegel = document.createElement("div");
      tegel.className = "stat-tegeltje";
      const waardeEl = document.createElement("span");
      waardeEl.className = "stat-tegeltje__waarde";
      waardeEl.textContent = waarde;
      const labelEl = document.createElement("span");
      labelEl.className = "stat-tegeltje__label";
      labelEl.textContent = label;
      tegel.append(waardeEl, labelEl);
      statGrid.appendChild(tegel);
    }
    kaart.appendChild(statGrid);

    kaart.appendChild(
      bouwExportRij(exportUrl(profiel.id, "json"), exportUrl(profiel.id, "csv"))
    );

    // Maandpunten
    const maandPuntenVeld = document.createElement("div");
    maandPuntenVeld.style.marginTop = "12px";
    maandPuntenVeld.style.fontSize = "16px";
    maandPuntenVeld.style.fontWeight = "600";
    maandPuntenVeld.style.color = "#4f8fe8";
    maandPuntenVeld.textContent = "Punten deze maand: laden...";
    kaart.appendChild(maandPuntenVeld);
    haalMaandOverzicht(profiel.id, new Date().getFullYear(), new Date().getMonth() + 1).then((m) => {
      maandPuntenVeld.textContent = `💰 Punten deze maand: ${m.totaalPunten}`;
    });

    container.appendChild(kaart);
  }

  // --- Alle profielen samen ---
  const alleKaart = document.createElement("div");
  alleKaart.className = "kaart";
  const alleTitel = document.createElement("h2");
  alleTitel.textContent = "Alle profielen samen";
  alleKaart.appendChild(alleTitel);
  const alleUitleg = document.createElement("p");
  alleUitleg.textContent = "Exporteer de data van alle profielen in één bestand.";
  alleKaart.appendChild(alleUitleg);
  alleKaart.appendChild(
    bouwExportRij(exportAlleUrl("json"), exportAlleUrl("csv"))
  );
  container.appendChild(alleKaart);
}
