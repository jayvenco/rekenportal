// exercises/splitsen/uitleg.js
// -----------------------------------------------------------------------------
// Uitlegpagina "Hoe werkt splitsen?" met plaatjes: wat splitsen is,
// splitsingen van 10 en 20, en de strategie "rond eerst af naar tientallen"
// voor getallen tot 100.
// -----------------------------------------------------------------------------

import { bouwSplitsboom } from "./splitsboom.js";

const ROOD = "#e0533d";
const BLAUW = "#2f6fb5";

function stippen(rood, blauw, groot = false) {
  const r = groot ? 11 : 9;
  const stap = r * 2 + 4;
  const n = rood + blauw;
  const b = n * stap + 4;
  let s = `<svg viewBox="0 0 ${b} ${r * 2 + 6}" width="${b}" height="${r * 2 + 6}" role="img" aria-label="${rood} rode en ${blauw} blauwe stippen">`;
  for (let i = 0; i < n; i += 1) {
    s += `<circle cx="${2 + r + i * stap}" cy="${r + 3}" r="${r}" fill="${i < rood ? ROOD : BLAUW}"/>`;
  }
  return s + "</svg>";
}

/** Tientalstaven en losse blokjes: `staven` x 10 en `los` x 1; eerste `gekleurd` staven in oranje. */
function blokken(staven, los, gekleurd = 0) {
  const b = staven * 26 + los * 18 + 20;
  let s = `<svg viewBox="0 0 ${b} 76" width="${b}" height="76" role="img" aria-label="${staven} tientallen en ${los} eenheden">`;
  for (let i = 0; i < staven; i += 1) {
    const kleur = i < gekleurd ? "#e8913a" : "#2f6fb5";
    s += `<rect x="${4 + i * 26}" y="4" width="20" height="68" rx="3" fill="${kleur}"/>`;
    for (let k = 1; k < 10; k += 1) s += `<line x1="${4 + i * 26}" x2="${24 + i * 26}" y1="${4 + k * 6.8}" y2="${4 + k * 6.8}" stroke="#fff" stroke-width="1"/>`;
  }
  for (let i = 0; i < los; i += 1) s += `<rect x="${staven * 26 + 8 + i * 18}" y="46" width="14" height="14" rx="2" fill="#2e9e6b"/>`;
  return s + "</svg>";
}

/** Sprong-plaatje: van `van` naar `tussen` naar `naar` met stapgroottes erboven. */
function sprongen(van, tussen, naar) {
  const x = (g) => 40 + ((g - van) / (naar - van)) * 380;
  return `<svg viewBox="0 0 460 120" role="img" aria-label="Van ${van} naar ${tussen} naar ${naar}" style="width:100%;max-width:460px">
    <line x1="30" y1="80" x2="430" y2="80" stroke="#444" stroke-width="3"/>
    ${[van, tussen, naar].map((g) => `<line x1="${x(g)}" y1="70" x2="${x(g)}" y2="90" stroke="#444" stroke-width="3"/><text x="${x(g)}" y="112" text-anchor="middle" font-size="20" font-weight="700">${g}</text>`).join("")}
    <path d="M${x(van)} 70 Q ${(x(van) + x(tussen)) / 2} 20 ${x(tussen)} 68" fill="none" stroke="${ROOD}" stroke-width="3"/>
    <text x="${(x(van) + x(tussen)) / 2}" y="30" text-anchor="middle" font-size="20" font-weight="800" fill="${ROOD}">+${tussen - van}</text>
    <path d="M${x(tussen)} 70 Q ${(x(tussen) + x(naar)) / 2} 20 ${x(naar)} 68" fill="none" stroke="${BLAUW}" stroke-width="3"/>
    <text x="${(x(tussen) + x(naar)) / 2}" y="30" text-anchor="middle" font-size="20" font-weight="800" fill="${BLAUW}">+${naar - tussen}</text>
  </svg>`;
}

function boomHtml(totaal, links, rechts) {
  const { svg } = bouwSplitsboom({ totaal, links, rechts, klein: true });
  return svg.outerHTML;
}

function sectie(titel, inhoud) {
  return `<section class="spl-sectie"><h2>${titel}</h2>${inhoud}</section>`;
}

function stijl() {
  if (document.getElementById("splitsen-stijl")) return;
  const s = document.createElement("style");
  s.id = "splitsen-stijl";
  s.textContent = `
  .spl-sectie{margin:22px 0}
  .spl-sectie h2{font-size:1.3rem;color:#2f6fb5;margin:0 0 8px}
  .spl-rij{display:flex;gap:18px;flex-wrap:wrap;align-items:center;margin:10px 0}
  .spl-kaartje{background:#fff;border:2px solid #d9e2ec;border-radius:14px;padding:10px 14px;text-align:center}
  .spl-kaartje strong{display:block;font-size:1.15rem;margin-top:4px}
  .spl-tip{background:#fff7e0;border-left:6px solid #e8913a;border-radius:10px;padding:10px 14px;margin:10px 0;font-size:1.05rem}
  .spl-uitleg p,.spl-uitleg li{font-size:1.1rem;line-height:1.5}
  .spl-tabel{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
  .spl-sprong{display:inline-block;background:#eef3fa;border-radius:8px;padding:2px 8px;font-weight:700}
  `;
  document.head.appendChild(s);
}

/**
 * Toont de uitlegpagina in de container.
 * @param {Function} opTerug - callback voor "Terug"
 * @param {Function} opStart - callback voor "Start met oefenen"
 */
export function toonUitleg(container, opTerug, opStart) {
  stijl();
  container.innerHTML = "";
  const kaart = document.createElement("div");
  kaart.className = "kaart spl-uitleg";

  const paren10 = Array.from({ length: 9 }, (_, i) => i + 1)
    .map((a) => `<div class="spl-kaartje">${stippen(a, 10 - a)}<strong>${a} + ${10 - a} = 10</strong></div>`).join("");

  kaart.innerHTML = `
    <h1>Splitsen: zo werkt het 🌳</h1>
    <p>Bij splitsen haal je een getal uit elkaar in <strong>twee delen</strong>. Zet je de twee delen weer bij elkaar, dan heb je het getal terug.</p>

    ${sectie("1. Wat is splitsen?", `
      <div class="spl-rij">
        <div class="spl-kaartje">${boomHtml(8, 5, 3)}</div>
        <div>
          <div>${stippen(5, 3, true)}</div>
          <p><strong>8 splits je in 5 en 3.</strong><br>5 + 3 = 8 en 8 − 5 = 3.</p>
        </div>
      </div>
      <p>In de splitsboom staat het hele getal <strong>bovenaan</strong>. Onderaan staan de twee delen. Is één deel bekend? Dan reken je het andere deel uit.</p>`)}

    ${sectie("2. Splitsingen van 10", `
      <p>Deze splitsingen moet je uit je hoofd kennen. Ze helpen bij alle grotere getallen!</p>
      <div class="spl-tabel">${paren10}</div>`)}

    ${sectie("3. Splitsingen van 20", `
      <p>Weet je dat 6 + 4 = 10? Dan weet je ook dat 16 + 4 = 20. Je tientallen blijven gewoon staan.</p>
      <div class="spl-rij">
        <div class="spl-kaartje">${boomHtml(20, 14, "?")}<strong>14 + 6 = 20</strong></div>
        <div>${stippen(10, 0)}<br>${stippen(4, 6)}<p>10 + 4 + 6: eerst het tiental vol maken.</p></div>
      </div>`)}

    ${sectie("4. Eerst afronden naar tientallen", `
      <p>Wordt het getal groter, bijvoorbeeld <strong>47 = 38 + ?</strong>, dan is dat lastig in één keer. Maak het makkelijker: <strong>rond eerst af naar het volgende tiental</strong>.</p>
      <ol>
        <li>Van <strong>38</strong> naar het volgende tiental: <strong>40</strong> (dat is <span class="spl-sprong">+2</span>).</li>
        <li>Van <strong>40</strong> naar <strong>47</strong>: <span class="spl-sprong">+7</span>.</li>
        <li>Tel de sprongen op: 2 + 7 = <strong>9</strong>.</li>
      </ol>
      ${sprongen(38, 40, 47)}
      <div class="spl-tip">💡 Dus 47 = 38 + 9. Controleer: 38 + 9 = 47 ✔</div>
      <div class="spl-rij"><div class="spl-kaartje">${boomHtml(47, 38, 9)}</div></div>`)}

    ${sectie("5. Splitsen met tientallen en eenheden", `
      <p>Een getal tot 100 bestaat uit <strong>tientallen</strong> (blauwe staven) en <strong>eenheden</strong> (groene blokjes).</p>
      <p>Neem <strong>63 = 40 + ?</strong></p>
      <div>${blokken(6, 3, 4)}</div>
      <p>63 is 6 tientallen en 3 eenheden. De 40 zijn 4 tientallen (oranje). Er blijven 2 tientallen en 3 eenheden over: <strong>20 + 3 = 23</strong>.</p>
      <div class="spl-tip">💡 Tientallen reken je net als gewone splitsingen: 6 tientallen − 4 tientallen = 2 tientallen. Dus 60 = 40 + 20.</div>
      <div class="spl-rij"><div class="spl-kaartje">${boomHtml(63, 40, 23)}</div><div class="spl-kaartje">${boomHtml(60, 40, 20)}</div></div>`)}

    ${sectie("6. Controleer je antwoord", `
      <p>Tel de twee delen bij elkaar op. Komt er het getal bovenin uit? Dan klopt je splitsing!</p>
      <div class="spl-tip">💡 Voorbeeld: 72 = 45 + ? &nbsp; 45 → 50 is +5, 50 → 72 is +22. Samen 27. Controle: 45 + 27 = 72 ✔</div>`)}
  `;

  const acties = document.createElement("div");
  acties.className = "acties-rij";
  const start = document.createElement("button");
  start.type = "button";
  start.className = "knop knop--primair";
  start.textContent = "Start met oefenen";
  start.addEventListener("click", opStart);
  const terug = document.createElement("button");
  terug.type = "button";
  terug.className = "knop knop--zacht";
  terug.textContent = "← Terug";
  terug.addEventListener("click", opTerug);
  acties.append(start, terug);
  kaart.appendChild(acties);
  container.appendChild(kaart);
  window.scrollTo(0, 0);
}
