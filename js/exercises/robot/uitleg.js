// exercises/robot/uitleg.js
// -----------------------------------------------------------------------------
// Uitlegartikel "Hoe werkt het Robot Programmeer Spel?": doel, commando's,
// munten, muren, TNT (straal van 1 vakje), kettingreacties en tips, met
// plaatjes die uit kleine kaartjes getekend worden.
// -----------------------------------------------------------------------------

const NS = "http://www.w3.org/2000/svg";
const C = 40; // celgrootte in het plaatje

/**
 * Tekent een mini-speelveld.
 * Tekens: S robot  G doel  # stevige muur  W zwak muurtje  T TNT  c munt
 *         * explosiestraal (rood gloeiend)  o afgelegd pad (oranje)  . leeg
 * @param {string[]} rijen
 * @param {{pijl?: [number,number][]}} [opties] pijl: lijst van [rij,kol] waar een route langs loopt
 */
export function miniKaart(rijen, opties = {}) {
  const h = rijen.length;
  const w = rijen[0].length;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${w * C} ${h * C}`);
  svg.setAttribute("width", String(w * C));
  svg.setAttribute("height", String(h * C));
  svg.setAttribute("role", "img");
  svg.style.cssText = "max-width:100%;height:auto;border:3px solid #cbd5e1;border-radius:8px;background:#fff";
  const maak = (naam, attrs, tekst) => {
    const e = document.createElementNS(NS, naam);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    if (tekst !== undefined) e.textContent = tekst;
    svg.appendChild(e);
    return e;
  };
  rijen.forEach((tekst, r) => {
    [...tekst].forEach((t, c) => {
      const x = c * C;
      const y = r * C;
      let vul = "#fff";
      let rand = "#e2e8f0";
      let streep = "";
      if (t === "o") vul = "#f0883e";
      if (t === "*") vul = "#fecaca";
      if (t === "G") vul = "#fef9c3";
      if (t === "S") vul = "#dbeafe";
      if (t === "#") vul = "#94a3b8";
      if (t === "W") { vul = "#fdba74"; rand = "#c2410c"; streep = "4 3"; }
      if (t === "T") vul = "#fee2e2";
      const rect = maak("rect", { x: x + 1, y: y + 1, width: C - 2, height: C - 2, rx: 4, fill: vul, stroke: rand, "stroke-width": streep ? 2.5 : 1 });
      if (streep) rect.setAttribute("stroke-dasharray", streep);
      const emoji = { S: "🤖", G: "🎯", "#": "🧱", W: "🧱", T: "🧨", c: "💰", "*": "💥" }[t];
      if (emoji) maak("text", { x: x + C / 2, y: y + C / 2 + 1, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 22 }, emoji);
    });
  });
  if (opties.pijl && opties.pijl.length > 1) {
    const punten = opties.pijl.map(([r, c]) => `${c * C + C / 2},${r * C + C / 2}`).join(" ");
    maak("polyline", { points: punten, fill: "none", stroke: "#2f6ed4", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": "2 8", opacity: 0.9 });
  }
  return svg;
}

function stijl() {
  if (document.getElementById("robot-uitleg-stijl")) return;
  const s = document.createElement("style");
  s.id = "robot-uitleg-stijl";
  s.textContent = `
  .ru-sectie{margin:22px 0}
  .ru-sectie h2{font-size:1.3rem;color:#2f6ed4;margin:0 0 8px}
  .ru-uitleg p,.ru-uitleg li{font-size:1.08rem;line-height:1.55}
  .ru-rij{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start;margin:10px 0}
  .ru-kaartje{background:#fff;border:2px solid #d9e2ec;border-radius:14px;padding:10px 14px;text-align:center}
  .ru-kaartje strong{display:block;margin-top:6px}
  .ru-tip{background:#fff7e0;border-left:6px solid #e8913a;border-radius:10px;padding:10px 14px;margin:10px 0;font-size:1.05rem}
  .ru-waarsch{background:#fff1f2;border-left:6px solid #e11d48;border-radius:10px;padding:10px 14px;margin:10px 0;font-size:1.05rem}
  .ru-code{background:#1f2937;color:#d6f5ff;font:14px/1.5 ui-monospace,Menlo,monospace;border-radius:8px;padding:10px 14px;display:inline-block;margin:0}
  .ru-tabel{border-collapse:collapse;margin:8px 0}
  .ru-tabel td,.ru-tabel th{border:1px solid #d9e2ec;padding:6px 12px;text-align:left}
  .ru-tabel th{background:#2f6ed4;color:#fff}
  `;
  document.head.appendChild(s);
}

const kaart = (rijen, onder, opties) => {
  const d = document.createElement("div");
  d.className = "ru-kaartje";
  d.appendChild(miniKaart(rijen, opties));
  const b = document.createElement("strong");
  b.textContent = onder;
  d.appendChild(b);
  return d;
};

/**
 * Toont het uitlegartikel.
 * @param {HTMLElement} container
 * @param {Function} opTerug
 * @param {Function} opStart
 */
export function toonUitleg(container, opTerug, opStart) {
  stijl();
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "kaart ru-uitleg";
  const sectie = (titel, html) => {
    const s = document.createElement("section");
    s.className = "ru-sectie";
    s.innerHTML = `<h2>${titel}</h2>${html}`;
    wrap.appendChild(s);
    return s;
  };
  const kop = document.createElement("h1");
  kop.textContent = "Robot Programmeer Spel: zo werkt het 🤖";
  wrap.appendChild(kop);
  const intro = document.createElement("p");
  intro.innerHTML = "Jij bent de <b>programmeur</b>. Je schrijft een lijstje commando's, de robot voert ze één voor één uit. Zo komt hij bij het doel. Je kunt dit spel ook als artikel lezen voordat je begint!";
  wrap.appendChild(intro);

  // 1. Doel
  const s1 = sectie("1. Het doel", `<p>Breng de robot 🤖 naar het doel 🎯. Bereikt hij het doel, dan is het level klaar. Onderweg kun je munten 💰 pakken voor extra punten.</p>`);
  const r1 = document.createElement("div");
  r1.className = "ru-rij";
  r1.append(kaart(["S..G"], "Robot en doel"), kaart(["So.c", "...."], "Het pad dat de robot liep", {}));
  s1.appendChild(r1);

  // 2. Commando's
  const s2 = sectie("2. De commando's", `
    <p>De robot kent maar vier commando's. Elk commando is <b>één stap</b>:</p>
    <table class="ru-tabel"><tr><th>Knop</th><th>Commando</th><th>Betekenis</th></tr>
      <tr><td>⬆️</td><td>UP</td><td>één vakje omhoog</td></tr>
      <tr><td>⬇️</td><td>DOWN</td><td>één vakje omlaag</td></tr>
      <tr><td>⬅️</td><td>LEFT</td><td>één vakje naar links</td></tr>
      <tr><td>➡️</td><td>RIGHT</td><td>één vakje naar rechts</td></tr>
    </table>
    <p><b>Pijltjesmodus:</b> tik op de pijltjes. <b>Codemodus:</b> typ elk commando op een eigen regel, bijvoorbeeld:</p>
    <pre class="ru-code">RIGHT\nRIGHT\nDOWN\nDOWN</pre>
    <p>Druk daarna op <b>▶ START</b>. De robot voert je lijstje uit. Met <b>🔄 RESET</b> begin je opnieuw met het bord, met <b>🗑 CLEAR</b> wis je je lijstje.</p>`);
  const r2 = document.createElement("div");
  r2.className = "ru-rij";
  r2.append(kaart(["Soo.", "..o.", "..oG"], "RIGHT, RIGHT, DOWN, DOWN, RIGHT"));
  s2.appendChild(r2);

  // 3. Muren
  const s3 = sectie("3. Muren", `
    <p>Er zijn twee soorten muren. Loopt de robot tegen een muur aan, of van het bord af, dan <b>stopt je programma</b> en moet je opnieuw proberen.</p>`);
  const r3 = document.createElement("div");
  r3.className = "ru-rij";
  r3.append(kaart(["S#G"], "Stevige muur (grijs): blijft altijd staan"), kaart(["SWG"], "Zwak muurtje (oranje, gestippeld): kan worden opgeblazen"));
  s3.appendChild(r3);

  // 4. TNT
  const s4 = sectie("4. TNT 🧨: muurtjes opblazen", `
    <p>Een zwak muurtje is dicht, tot er een <b>TNT</b> 🧨 in de buurt ontploft. Zo werkt dat:</p>
    <ol>
      <li><b>Loop over de TNT.</b> Zodra de robot op het vakje van de TNT stapt, ontploft hij. De robot zelf blijft heel.</li>
      <li>De explosie heeft een <b>straal van 1 vakje</b>: alle <b>zwakke muurtjes</b> in de 9 vakjes rondom de TNT (ook schuin) vallen om.</li>
      <li>De muurtjes zijn weg: je kunt er nu doorheen lopen.</li>
      <li><b>Stevige muren</b> blijven staan. Daar doet TNT niets mee.</li>
    </ol>`);
  const r4 = document.createElement("div");
  r4.className = "ru-rij";
  r4.append(
    kaart(["#####", "SWTWG", "#####"], "Vóór: muurtjes dicht"),
    kaart(["#####", "S*T*G", "#####"], "Straal van 1 vakje"),
    kaart(["#####", "So.oG", "#####"], "Na: de weg is vrij"),
  );
  s4.appendChild(r4);
  const r4b = document.createElement("div");
  r4b.className = "ru-rij";
  r4b.append(kaart(["***", "*T*", "***"], "De 9 vakjes rond de TNT"));
  s4.appendChild(r4b);
  const tip4 = document.createElement("div");
  tip4.className = "ru-tip";
  tip4.innerHTML = "💡 Plan eerst: <b>welke TNT</b> staat dicht genoeg bij het muurtje dat je moet openen? Loop naar die TNT en daarna door de opening heen.";
  s4.appendChild(tip4);

  // 5. Kettingreactie
  const s5 = sectie("5. Kettingreactie ⛓️", `
    <p>Staat er een andere TNT binnen de straal van een ontploffende TNT, dan <b>gaat die ook af</b>. En daarna misschien weer een volgende. Zo kun je met één stap een heel rijtje TNT laten ontploffen en ver weg een muurtje opblazen.</p>`);
  const r5 = document.createElement("div");
  r5.className = "ru-rij";
  r5.append(kaart(["######", "STTTWG", "######"], "Vóór: een lont van TNT"), kaart(["######", "SooooG", "######"], "Na: alles ontploft"));
  s5.appendChild(r5);

  // 6. Munten en TNT
  const s6 = sectie("6. Pas op voor je munten! 💰", `
    <div class="ru-waarsch">⚠️ <b>Munten in de explosie gaan kapot.</b> Staat er een munt binnen 1 vakje van een TNT, pak die munt dan <b>eerst</b>, en loop pas daarna over de TNT.</div>`);
  const r6 = document.createElement("div");
  r6.className = "ru-rij";
  r6.append(kaart(["S.c..", "..TWG"], "Pak eerst de munt (boven de TNT), loop dan pas over de TNT"));
  s6.appendChild(r6);

  // 7. Voorbeeld
  const s7 = sectie("7. Een voorbeeld: level 13, de eerste TNT", `
    <p>De muurtjes bij het doel zitten dicht. De TNT staat links ervan. Plan: eerst naar de TNT, dan door de opening naar het doel.</p>
    <pre class="ru-code">DOWN DOWN DOWN\nRIGHT RIGHT RIGHT   ← hier ontploft de TNT\nRIGHT RIGHT RIGHT RIGHT</pre>
    <p>De robot loopt drie stappen omlaag, dan drie naar rechts. Op de TNT ontploffen de twee muurtjes. Daarna loopt hij door de opening naar het doel 🎯.</p>`);
  const r7 = document.createElement("div");
  r7.className = "ru-rij";
  r7.append(
    kaart(["S...#...", "....#...", "....#...", "...TW..G", "....W...", "....#...", "....#...", "....#..."], "Het begin"),
    kaart(["o...#...", "o...#...", "o...#...", "oooooooG", "....#...", "....#...", "....#...", "....#..."], "De route (de muurtjes zijn weg)"),
  );
  s7.appendChild(r7);

  // 8. Tips
  sectie("8. Tips van een slimme programmeur", `
    <ul>
      <li>Loop je programma <b>eerst in je hoofd na</b>, vakje voor vakje, voordat je op START drukt.</li>
      <li>Kijk waar de <b>TNT</b> staat en welk <b>muurtje</b> je moet openen. Alleen muurtjes die binnen 1 vakje van de TNT staan, vallen om.</li>
      <li>Past een muurtje niet binnen de straal van één TNT? Zoek een <b>kettingreactie</b> of een tweede TNT.</li>
      <li>Wil je alle munten? Pak ze <b>vóór</b> je over een TNT in de buurt loopt.</li>
      <li>Gaat het mis? Lees de melding: bij welke stap botste de robot? De gekleurde vakjes laten zien waar hij liep.</li>
      <li>Je mag zo vaak opnieuw proberen als je wilt. Gebruik <b>🔄 RESET</b> en pas je lijstje aan.</li>
    </ul>`);

  const acties = document.createElement("div");
  acties.className = "acties-rij";
  const start = document.createElement("button");
  start.type = "button";
  start.className = "knop knop--primair";
  start.textContent = "Naar de levels";
  start.addEventListener("click", opStart);
  const terug = document.createElement("button");
  terug.type = "button";
  terug.className = "knop knop--zacht";
  terug.textContent = "← Terug";
  terug.addEventListener("click", opTerug);
  acties.append(start, terug);
  wrap.appendChild(acties);
  container.appendChild(wrap);
  window.scrollTo(0, 0);
}
