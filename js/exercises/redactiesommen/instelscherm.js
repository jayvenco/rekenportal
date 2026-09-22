// exercises/redactiesommen/instelscherm.js
import { getInstellingen, saveInstellingen } from "../../storage.js";
import { STANDAARD_INSTELLINGEN } from "./opgaven.js";

const OMSCHRIJVING_PER_GROEP = {
  7: "Optellen, aftrekken, keer en delen met getallen tot 1000.",
  8: "Optellen/aftrekken tot 1000, breuken, procenten, kommagetallen, omrekenen, meten en oppervlakte — alles door elkaar.",
};

export async function toonInstellingenScherm(container, opgeslagen, startOefening) {
  const saved = (await getInstellingen("redactiesommen")) || {};
  const instellingen = { ...STANDAARD_INSTELLINGEN, ...saved };
  const groep = opgeslagen && opgeslagen.groep === 8 ? 8 : 7;

  container.innerHTML = `
    <div class="kaart" style="text-align:center;">
      <h2>✏️ Redactiesommen — groep ${groep}</h2>
      <p style="color:#5b6472;margin-bottom:20px;">${OMSCHRIJVING_PER_GROEP[groep]}</p>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-weight:700;margin-bottom:8px;">Aantal opgaven:</label>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <button type="button" class="knop ${instellingen.aantalOpgaven === 5 ? 'knop--primair' : 'knop--zacht'}" data-aantal="5">5</button>
          <button type="button" class="knop ${instellingen.aantalOpgaven === 10 ? 'knop--primair' : 'knop--zacht'}" data-aantal="10">10</button>
          <button type="button" class="knop ${instellingen.aantalOpgaven === 20 ? 'knop--primair' : 'knop--zacht'}" data-aantal="20">20</button>
        </div>
      </div>
      <button type="button" class="knop knop--primair" style="font-size:20px;padding:14px 40px;" id="rc-start">▶ START</button>
    </div>
  `;

  container.querySelectorAll("[data-aantal]").forEach(b => {
    b.addEventListener("click", () => {
      instellingen.aantalOpgaven = Number(b.dataset.aantal);
      container.querySelectorAll("[data-aantal]").forEach(x => x.className = "knop knop--zacht");
      b.className = "knop knop--primair";
    });
  });

  container.querySelector("#rc-start").addEventListener("click", async () => {
    await saveInstellingen("redactiesommen", instellingen);
    startOefening({ ...instellingen, groep });
  });
}