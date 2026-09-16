// screens/instellingen.js
// -----------------------------------------------------------------------------
// Algemeen instellingenscherm van de portal: op dit moment alleen de
// geluid-aan/uit-schakelaar (standaard uit). Alle instellingen worden nu
// via de backend-API bewaard, gekoppeld aan het actieve profiel.
// -----------------------------------------------------------------------------

import { getAlgemeneInstellingen, saveAlgemeneInstellingen } from "../storage.js";

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

  const kaart = document.createElement("div");
  kaart.className = "kaart";

  const geluidRij = document.createElement("div");
  geluidRij.style.display = "flex";
  geluidRij.style.alignItems = "center";
  geluidRij.style.justifyContent = "space-between";
  geluidRij.style.padding = "12px 0";

  const geluidLabelBlok = document.createElement("div");
  const geluidTitel = document.createElement("strong");
  geluidTitel.textContent = "Geluidjes";
  const geluidUitleg = document.createElement("p");
  geluidUitleg.style.margin = "4px 0 0";
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
  kaart.appendChild(geluidRij);
  container.appendChild(kaart);
}
