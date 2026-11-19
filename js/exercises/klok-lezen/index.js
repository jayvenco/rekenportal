// exercises/klok-lezen/index.js
// -----------------------------------------------------------------------------
// "Klok lezen": een leermiddel (geen opgaven) voor alle groepen. Een grote
// analoge klok met wijzers die je zelf kunt verzetten, korte animaties voor een
// uur, een half uur en de kwartieren, sprongen van 1 tot 10 uur vooruit en
// achteruit, en een digitale klok die altijd dezelfde tijd laat zien.
// -----------------------------------------------------------------------------

import {
  maakKlokStore, nuInMinuten, tijdInWoorden, urenEnMinuten, uitlegMinuutwijzer, uitlegUurwijzer,
  bijzonderMoment, digitaal, dagdeel,
} from "./tijd.js";
import { maakAnalogeKlok, KLEUREN } from "./analoog.js";
import { maakDigitaleKlok } from "./digitaal.js";
import { maakAnimator } from "./animaties.js";

function voegStijlToe() {
  if (document.getElementById("kl-stijl")) return;
  const s = document.createElement("style");
  s.id = "kl-stijl";
  s.textContent = `
  .kl{display:flex;flex-direction:column;gap:14px}
  .kl h2{margin:0}
  .kl-tabs{display:flex;gap:8px;flex-wrap:wrap}
  .kl-tab{border:3px solid #cbd5e1;background:#fff;border-radius:999px;padding:10px 22px;font-size:1.1rem;font-weight:800;color:#34445e;cursor:pointer}
  .kl-tab[aria-selected="true"]{background:#2f6fb5;border-color:#2f6fb5;color:#fff}
  @media (max-width:520px){.kl-tab{padding:8px 14px;font-size:1rem}.kl-woorden{font-size:1.7rem}}
  .kl-rij{display:grid;grid-template-columns:minmax(0,660px) minmax(0,1fr);gap:16px;align-items:start}
  @media (max-width:1100px){.kl-rij{grid-template-columns:minmax(0,1fr)}}
  .kl-links{display:flex;flex-direction:column;gap:12px;align-items:stretch}
  .kl-analoog{width:100%;max-width:660px;margin:0 auto}
  .kl-rechts{display:flex;flex-direction:column;gap:12px;min-width:0}
  .kl-kaart{background:#fff;border:2px solid #dde5ee;border-radius:16px;padding:14px 16px}
  .kl-kaart h3{margin:0 0 8px;font-size:1.05rem;color:#34445e}
  .kl-woorden{font-size:clamp(1.8rem,4.4vw,2.6rem);font-weight:900;color:#1f2937;line-height:1.15}
  .kl-digitaalklein{display:inline-block;font:800 1.6rem ui-monospace,Menlo,monospace;background:#0f2b1d;color:#7cfc9a;border-radius:8px;padding:2px 12px;margin:6px 8px 0 0}
  .kl-moment{display:inline-block;margin-top:6px;padding:3px 12px;border-radius:999px;background:#fff4d1;border:2px solid #f2c94c;font-weight:800;color:#7a5800}
  .kl-uitleg{margin:8px 0 0;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:1.05rem;line-height:1.4}
  .kl-uitleg li{padding-left:34px;position:relative}
  .kl-uitleg li::before{content:"";position:absolute;left:4px;top:.35em;width:20px;height:12px;border-radius:6px;background:var(--wijzer)}
  .kl-legenda{display:flex;flex-wrap:wrap;gap:8px}
  .kl-chip{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;border:2px solid var(--c);background:#fff;font-weight:800;font-size:.95rem;color:#1f2937;cursor:pointer}
  .kl-chip b{display:inline-block;width:14px;height:14px;border-radius:50%;background:var(--c)}
  .kl-knoppenrij{display:flex;flex-wrap:wrap;gap:8px}
  .kl-knop{border:0;border-radius:10px;padding:10px 16px;font-size:1rem;font-weight:800;color:#fff;background:#2f6fb5;cursor:pointer;box-shadow:0 3px 0 #1f4f8a}
  .kl-knop:hover{background:#3b7bc6}
  .kl-knop:disabled{opacity:.5;cursor:default}
  .kl-knop--zacht{background:#eef3fa;color:#34445e;box-shadow:0 3px 0 #c5d1e0}
  .kl-knop--zacht:hover{background:#e1eaf6}
  .kl-knop--zacht[aria-pressed="true"]{background:#2f6fb5;color:#fff;box-shadow:0 3px 0 #1f4f8a}
  .kl-knop--stop{background:#d6453a;box-shadow:0 3px 0 #9b2f1f}
  .kl-knop--uur{background:#e0533d;box-shadow:0 3px 0 #9b2f1f}
  .kl-knop--half{background:#2f6fb5}
  .kl-knop--kwart{background:#2e9e6b;box-shadow:0 3px 0 #1f6e49}
  .kl-bijschrift{min-height:3.6em;padding:10px 14px;border-radius:12px;background:#eef6ff;border:2px solid #bcd6f2;font-size:1.1rem;font-weight:700;color:#1f3b5c;line-height:1.4}
  .kl-bijschrift--klaar{background:#e7f8ec;border-color:#9fdcb4;color:#14703a}
  .kl-sprongen{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
  @media (max-width:520px){.kl-sprongen{grid-template-columns:repeat(5,minmax(0,1fr));gap:5px}.kl-sprongen .kl-knop{padding:9px 2px;font-size:.9rem}}
  .kl-opties{display:flex;flex-direction:column;gap:6px;font-size:1rem}
  .kl-opties label{display:flex;gap:8px;align-items:center;cursor:pointer}
  .kl-opties input{width:20px;height:20px}
  .kl-tip{font-size:.95rem;color:#5b6676;margin:0}
  /* digitale klok */
  .kl-digi{display:flex;flex-direction:column;gap:14px;align-items:center;width:100%}
  .kl-digi__scherm{display:flex;align-items:center;justify-content:center;gap:clamp(6px,2vw,18px);background:#0f2b1d;border:6px solid #2b4a3a;border-radius:22px;padding:18px clamp(12px,4vw,36px);box-shadow:inset 0 0 30px rgba(0,0,0,.55);width:100%;max-width:560px}
  .kl-digi__kolom{display:flex;flex-direction:column;align-items:center;gap:6px}
  .kl-digi__cijfers{font:900 clamp(4rem,15vw,8.5rem)/1 ui-monospace,"SF Mono",Menlo,monospace;color:#7cfc9a;text-shadow:0 0 18px rgba(124,252,154,.65);min-width:2ch;text-align:center;font-variant-numeric:tabular-nums}
  .kl-digi__dubbelepunt{font:900 clamp(4rem,15vw,8.5rem)/1 ui-monospace,Menlo,monospace;color:#7cfc9a;text-shadow:0 0 18px rgba(124,252,154,.65);animation:kl-knipper 1s steps(1) infinite;padding-bottom:.12em}
  @keyframes kl-knipper{50%{opacity:.15}}
  .kl-digi__pijl{width:clamp(64px,16vw,96px);height:46px;border:0;border-radius:12px;background:#24523b;color:#b5ffd0;font-size:1.5rem;cursor:pointer;touch-action:manipulation}
  .kl-digi__pijl:hover{background:#2f6d4d}
  .kl-digi__pijl:active{background:#3d8a62}
  .kl-digi__label{color:#7cc9a0;font-size:.9rem;font-weight:800;letter-spacing:.05em}
  .kl-digi__snel,.kl-digi__formaat{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
  .kl-digi__dagdeel{font-size:1.4rem;font-weight:800;color:#34445e}
  .kl-mini{width:min(100%,300px)}
  @media (prefers-reduced-motion:reduce){.kl-digi__dubbelepunt{animation:none}}
  `;
  document.head.appendChild(s);
}

const el = (tag, klasse, tekst) => {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst !== undefined) e.textContent = tekst;
  return e;
};
const kaart = (titel) => {
  const k = el("div", "kl-kaart");
  if (titel) k.appendChild(el("h3", "", titel));
  return k;
};
const knop = (tekst, klasse, opKlik, aria) => {
  const b = el("button", `kl-knop ${klasse}`.trim(), tekst);
  b.type = "button";
  if (aria) b.setAttribute("aria-label", aria);
  b.addEventListener("click", opKlik);
  return b;
};

/**
 * @param {HTMLElement} container
 */
export async function mount(container) {
  voegStijlToe();
  container.textContent = "";
  const store = maakKlokStore(nuInMinuten());
  const ruimOp = [];

  const hoofd = el("div", "kl");
  container.appendChild(hoofd);
  const kopKaart = el("div", "kaart");
  kopKaart.style.padding = "12px 18px";
  kopKaart.appendChild(el("h2", "", "🕐 Klok lezen"));
  kopKaart.appendChild(el("p", "", "Leer hoe uren, minuten, halve uren en kwartieren werken. Sleep de wijzers van de klok, kijk naar de animaties en probeer de sprongen in de tijd. Hier hoef je geen opgaven te maken."));
  kopKaart.lastChild.style.margin = "6px 0 0";
  hoofd.appendChild(kopKaart);

  // --- gedeelde onderdelen --------------------------------------------------------
  const bijschriften = [];
  const analogen = [];
  const animatieKnoppen = [];
  const zetBijschrift = (tekst, soort = "") => {
    for (const b of bijschriften) {
      b.textContent = tekst;
      b.className = `kl-bijschrift${soort === "klaar" ? " kl-bijschrift--klaar" : ""}`;
    }
  };
  const animator = maakAnimator(store, {
    opBijschrift: zetBijschrift,
    opMarkeer: (minuut, kleur) => analogen.forEach((a) => a.markeer(minuut, kleur)),
    opTaart: (aan) => analogen.filter((a) => a.groot).forEach((a) => a.zetTaart(aan)),
    opStatus: (bezig) => animatieKnoppen.forEach((b) => (b.disabled = bezig && b.dataset.type === "animatie")),
  });
  ruimOp.push(() => animator.stop());
  const stopAnimatie = () => {
    animator.stop();
  };

  // --- tabs -------------------------------------------------------------------------
  const tabs = el("div", "kl-tabs");
  tabs.setAttribute("role", "tablist");
  const tabAnaloog = el("button", "kl-tab", "🕐 Analoge klok");
  const tabDigitaal = el("button", "kl-tab", "🔢 Digitale klok");
  for (const t of [tabAnaloog, tabDigitaal]) {
    t.type = "button";
    t.setAttribute("role", "tab");
  }
  tabs.append(tabAnaloog, tabDigitaal);
  hoofd.appendChild(tabs);

  // --- onderdelen die op beide tabs terugkomen ----------------------------------------
  function leesPaneel() {
    const k = kaart("Hoe laat is het?");
    const woorden = el("div", "kl-woorden");
    woorden.setAttribute("aria-live", "polite");
    const digi = el("span", "kl-digitaalklein");
    const dag = el("span", "");
    dag.style.cssText = "font-size:1.15rem;font-weight:800;color:#34445e";
    const moment = el("div", "kl-moment");
    const uitleg = el("ul", "kl-uitleg");
    const li1 = el("li", "");
    li1.style.setProperty("--wijzer", KLEUREN.uur);
    const li2 = el("li", "");
    li2.style.setProperty("--wijzer", KLEUREN.half);
    uitleg.append(li1, li2);
    k.append(woorden, digi, dag, el("br"), moment, uitleg);
    const teken = (t) => {
      woorden.textContent = tijdInWoorden(t);
      const d = digitaal(t, true);
      digi.textContent = `${d.uren}:${d.minuten}`;
      const dd = dagdeel(t);
      dag.textContent = `${dd.emoji} ${dd.naam} · ${urenEnMinuten(t)}`;
      const b = bijzonderMoment(t);
      moment.style.display = b ? "" : "none";
      moment.textContent = b ? `⭐ ${b}` : "";
      li1.textContent = uitlegUurwijzer(t);
      li2.textContent = uitlegMinuutwijzer(t);
    };
    ruimOp.push(store.abonneer((t) => teken(t)));
    teken(store.get());
    return k;
  }

  function legenda() {
    const k = kaart("Belangrijke plekken op de klok");
    const rij = el("div", "kl-legenda");
    const items = [
      ["het hele uur", "12 = 0 minuten", KLEUREN.uur, 0],
      ["kwart over", "3 = 15 minuten", KLEUREN.kwartOver, 15],
      ["half (een half uur)", "6 = 30 minuten", KLEUREN.half, 30],
      ["kwart voor", "9 = 45 minuten", KLEUREN.kwartVoor, 45],
    ];
    for (const [naam, tekst, kleur, minuut] of items) {
      const chip = el("button", "kl-chip");
      chip.type = "button";
      chip.style.setProperty("--c", kleur);
      chip.innerHTML = `<b></b><span>${naam}: ${tekst}</span>`;
      chip.title = "Tik om de lange wijzer hierheen te laten gaan";
      chip.addEventListener("click", () => animator.naarMinuut(minuut));
      rij.appendChild(chip);
    }
    k.appendChild(rij);
    k.appendChild(el("p", "kl-tip", "Tik op een kleur: de lange wijzer gaat er vanzelf naartoe. Een uur heeft 60 minuten, een kwartier is 15 minuten, een half uur is 30 minuten."));
    k.lastChild.style.marginTop = "8px";
    return k;
  }

  function animatiePaneel() {
    const k = kaart("Laat het zien");
    const rij = el("div", "kl-knoppenrij");
    const maak = (tekst, klasse, fn) => {
      const b = knop(tekst, klasse, fn);
      b.dataset.type = "animatie";
      animatieKnoppen.push(b);
      return b;
    };
    rij.append(
      maak("▶ Een uur", "kl-knop--uur", () => animator.speelUur()),
      maak("▶ Een half uur", "kl-knop--half", () => animator.speelHalfUur()),
      maak("▶ De kwartieren", "kl-knop--kwart", () => animator.speelKwartieren()),
      knop("⏹ Stop", "kl-knop--stop", () => {
        animator.stop();
        zetBijschrift("Gestopt. Sleep de wijzers zelf of kies een animatie.");
      }),
    );
    const bijschrift = el("div", "kl-bijschrift", "Kies een animatie om te zien hoe een uur, een half uur en de kwartieren werken.");
    bijschrift.setAttribute("aria-live", "polite");
    bijschriften.push(bijschrift);
    k.append(rij, bijschrift);
    bijschrift.style.marginTop = "10px";
    return k;
  }

  function sprongPaneel() {
    const k = kaart("Springen in de tijd");
    const maakRij = (titel, teken) => {
      k.appendChild(el("p", "kl-tip", titel));
      k.lastChild.style.margin = "6px 0 4px";
      const raster = el("div", "kl-sprongen");
      for (let n = 1; n <= 10; n += 1) {
        const b = knop(`${teken}${n}`, teken === "+" ? "" : "kl-knop--uur", () => animator.springUren(teken === "+" ? n : -n), `${n} uur ${teken === "+" ? "later" : "eerder"}`);
        b.title = `${n} uur ${teken === "+" ? "later" : "eerder"}`;
        raster.appendChild(b);
      }
      k.appendChild(raster);
    };
    maakRij("⏩ Vooruit: 1 tot 10 uur later", "+");
    maakRij("⏪ Achteruit: 1 tot 10 uur eerder", "−");
    k.appendChild(el("p", "kl-tip", "Het getal is het aantal uren. Kijk hoe de lange wijzer rondjes draait en de korte wijzer meeloopt."));
    k.lastChild.style.marginTop = "8px";
    return k;
  }

  // --- tab 1: analoge klok --------------------------------------------------------------
  const weergaveAnaloog = el("div", "kl-rij");
  const groot = maakAnalogeKlok(store, { opSleepStart: stopAnimatie });
  groot.groot = true;
  analogen.push(groot);
  ruimOp.push(() => groot.ruimOp());
  const linksA = el("div", "kl-links");
  linksA.appendChild(groot.element);
  const optiesKaart = kaart("Instellingen van de klok");
  const opties = el("div", "kl-opties");
  const maakAan = (tekst, aan, fn) => {
    const l = el("label");
    const i = el("input");
    i.type = "checkbox";
    i.checked = aan;
    i.addEventListener("change", () => fn(i.checked));
    l.append(i, el("span", "", tekst));
    return l;
  };
  opties.append(
    maakAan("Hulpteksten op de klok (uur, kwart over, half, kwart voor)", true, (a) => groot.zetHulpteksten(a)),
    maakAan("Kleur de minuten die voorbij zijn", true, (a) => groot.zetTaart(a)),
    maakAan("Magneet: de lange wijzer blijft op 5 minuten staan", false, (a) => groot.zetMagneet(a)),
  );
  optiesKaart.appendChild(opties);
  linksA.appendChild(optiesKaart);
  optiesKaart.style.width = "100%";
  const rechtsA = el("div", "kl-rechts");
  rechtsA.append(leesPaneel(), legenda(), animatiePaneel(), sprongPaneel());
  weergaveAnaloog.append(linksA, rechtsA);
  hoofd.appendChild(weergaveAnaloog);

  // --- tab 2: digitale klok --------------------------------------------------------------
  const weergaveDigitaal = el("div", "kl-rij");
  const digitaalKlok = maakDigitaleKlok(store, { opSleepStart: stopAnimatie });
  ruimOp.push(() => digitaalKlok.ruimOp());
  const mini = maakAnalogeKlok(store, { opSleepStart: stopAnimatie, taart: false, hulpteksten: false });
  analogen.push(mini);
  ruimOp.push(() => mini.ruimOp());
  const linksD = el("div", "kl-links");
  linksD.appendChild(digitaalKlok.element);
  const miniKaart = kaart("Dezelfde tijd op de analoge klok");
  const miniHouder = el("div", "kl-mini");
  miniHouder.style.margin = "0 auto";
  miniHouder.appendChild(mini.element);
  miniKaart.appendChild(miniHouder);
  miniKaart.style.width = "100%";
  linksD.appendChild(miniKaart);
  const rechtsD = el("div", "kl-rechts");
  const digiUitleg = kaart("Zo lees je de digitale klok");
  digiUitleg.appendChild(el("p", "", "Links van de dubbele punt staan de uren, rechts de minuten. 15:30 betekent 15 uur en 30 minuten. Op de klok is dat half 4. In het dagelijks leven zeggen we 's middags 3 uur 30 of half 4."));
  digiUitleg.lastChild.style.cssText = "margin:0;font-size:1.05rem;line-height:1.5";
  digiUitleg.appendChild(el("p", "kl-tip", "Een dag heeft 24 uur. Na 12 uur 's middags telt de digitale klok door: 13:00, 14:00, ... 23:00 en dan weer 0:00."));
  digiUitleg.lastChild.style.marginTop = "8px";
  rechtsD.append(leesPaneel(), digiUitleg, animatiePaneel(), sprongPaneel());
  weergaveDigitaal.append(linksD, rechtsD);
  hoofd.appendChild(weergaveDigitaal);

  // --- tabs schakelen ------------------------------------------------------------------------
  function kies(analoog) {
    weergaveAnaloog.style.display = analoog ? "" : "none";
    weergaveDigitaal.style.display = analoog ? "none" : "";
    tabAnaloog.setAttribute("aria-selected", String(analoog));
    tabDigitaal.setAttribute("aria-selected", String(!analoog));
  }
  tabAnaloog.addEventListener("click", () => kies(true));
  tabDigitaal.addEventListener("click", () => kies(false));
  kies(true);

  // bij verlaten van de pagina de animatie en abonnementen opruimen
  const opruimer = new MutationObserver(() => {
    if (!document.body.contains(hoofd)) {
      ruimOp.forEach((f) => f());
      opruimer.disconnect();
    }
  });
  opruimer.observe(document.body, { childList: true, subtree: true });
}

const icoon = `<svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
  <circle cx="32" cy="32" r="27" fill="#fffdf7" stroke="#34445e" stroke-width="4"/>
  <g stroke="#34445e" stroke-width="3" stroke-linecap="round"><line x1="32" y1="9" x2="32" y2="14" stroke="#e0533d"/><line x1="55" y1="32" x2="50" y2="32" stroke="#2e9e6b"/><line x1="32" y1="55" x2="32" y2="50" stroke="#2f6fb5"/><line x1="9" y1="32" x2="14" y2="32" stroke="#e8913a"/></g>
  <line x1="32" y1="32" x2="32" y2="19" stroke="#e0533d" stroke-width="4" stroke-linecap="round"/>
  <line x1="32" y1="32" x2="44" y2="39" stroke="#2f6fb5" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="32" r="3" fill="#1f2b40"/>
</svg>`;

export const klokLezenOefening = {
  id: "klok-lezen",
  titel: "Klok lezen",
  omschrijving: "Een grote klok met wijzers die je zelf verzet, animaties voor uren, halve uren en kwartieren, en een digitale klok.",
  icoonSvg: icoon,
  kleurthema: "#34445e",
  leermiddel: true,
  mount,
};
