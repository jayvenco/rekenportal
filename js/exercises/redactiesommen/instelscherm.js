// exercises/redactiesommen/instelscherm.js
import { getInstellingen, saveInstellingen } from "../../storage.js";
import { STANDAARD_INSTELLINGEN } from "./opgaven.js";

export async function toonInstellingenScherm(container, opgeslagen, startOefening) {
  const saved = (await getInstellingen("redactiesommen")) || {};
  const instellingen = { ...STANDAARD_INSTELLINGEN, ...saved, ...opgeslagen };

  container.innerHTML = \`
    <div class="kaart" style="text-align:center;">
      <h2>✏️ Redactiesommen</h2>
      <p style="color:#5b6472;margin-bottom:20px;">Verhaaltjessommen tot 1000</p>
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
  \`;

  container.querySelectorAll("[data-aantal]").forEach(b => {
    b.addEventListener("click", () => {
      instellingen.aantalOpgaven = Number(b.dataset.aantal);
      container.querySelectorAll("[data-aantal]").forEach(x => x.className = "knop knop--zacht");
      b.className = "knop knop--primair";
    });
  });

  container.querySelector("#rc-start").addEventListener("click", async () => {
    await saveInstellingen("redactiesommen", instellingen);
    startOefening(instellingen);
  });
}
