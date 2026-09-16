// screens/beheer.js
// -----------------------------------------------------------------------------
// Ouder/beheer-scherm: apart van het kind-menu. Toont alle profielen met hun
// statistieken, biedt verwijderen en exporteren (JSON/CSV) per profiel, en
// een export van alle profielen samen. Geen PIN/login — lokale huis-app,
// geen publieke deployment.
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

function formatTijd(ms) {
  if (!ms) return "–";
  return `${(ms / 1000).toFixed(1)}s`;
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
    profielTitel.textContent = `${profiel.avatar} ${profiel.naam}`;
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
