// utils/raketAnimatie.js
// -----------------------------------------------------------------------------
// Superwoman Math Power: vliegende superwoman die stenen wegslaat.
// 3 goeie animaties: punch, kick, laser blast
// 3 foute animaties: geraakt door steen, bliksem, vuurbal
// -----------------------------------------------------------------------------

const CHECKPOINTS = [
  { grens: 25, tekst: "HELD IN TRAINING" },
  { grens: 50, tekst: "POWER HELDIN" },
  { grens: 75, tekst: "SUPER HELDIN" },
  { grens: 100, tekst: "MATH MASTER" },
];

const PARTIKEL_KLEUREN = ["#2f6ed4", "#38b26a", "#f5b942", "#f07a3d", "#9b5de5"];
const GOEDE_ACTIES = ["punch", "kick", "laser"];
const FOUTE_ACTIES = ["getroffen", "bliksem", "vuurbal"];

function begrens(g, mi, ma) { return Math.max(mi, Math.min(ma, g)); }
function el(t, c, txt = "") {
  const e = document.createElement(t);
  if (c) e.className = c;
  if (txt) e.textContent = txt;
  return e;
}

function kies(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// -----------------------------------------------------------------------
// SVG: Vliegende superwoman
// -----------------------------------------------------------------------
function svgSuperwoman() {
  const w = el("div", "math-hero__character");
  w.setAttribute("aria-hidden", "true");
  w.innerHTML = `
    <svg class="math-hero__svg" viewBox="0 0 180 180" role="img">
      <defs>
        <linearGradient id="swCape" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#ff6b8a" />
          <stop offset="100%" stop-color="#c42d55" />
        </linearGradient>
        <linearGradient id="swSuit" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#5a7ff2" />
          <stop offset="100%" stop-color="#2a4fc9" />
        </linearGradient>
      </defs>
      <!-- Aura -->
      <g opacity="0.15">
        <circle cx="90" cy="90" r="70" fill="#f8d84c" />
        <path d="M90 10 L102 52 L146 28 L126 70 L170 76 L130 96 L162 132 L118 120 L122 166 L90 132 L58 166 L62 120 L18 132 L50 96 L10 76 L54 70 L34 28 L78 52 Z" fill="#ffd83d" />
      </g>
      <!-- Cape (wavy, feminine) -->
      <path class="math-hero__cape" d="M52 70 C24 88 16 130 36 162 C56 146 74 136 92 132 C110 136 128 146 148 162 C166 128 156 86 126 70 C110 88 70 88 52 70 Z" fill="url(#swCape)" />
      <!-- Arms -->
      <path d="M44 106 C22 118 18 142 32 148 C40 132 52 122 66 116 Z" fill="#f0c8a8" />
      <path d="M136 106 C158 118 162 142 148 148 C140 132 128 122 114 116 Z" fill="#f0c8a8" />
      <!-- Body (female: narrower waist, wider hips) -->
      <path class="math-hero__body" d="M60 78 C62 58 74 48 90 48 C106 48 118 58 120 78 L128 112 C112 132 68 132 52 112 Z" fill="url(#swSuit)" />
      <!-- Skirt/costume detail -->
      <path d="M55 112 L90 118 L125 112 L120 122 L90 128 L60 122 Z" fill="#2a4fc9" />
      <!-- Chest emblem (★) -->
      <circle cx="90" cy="92" r="16" fill="#ffd83d" stroke="#fff" stroke-width="3" />
      <text x="90" y="99" text-anchor="middle" font-size="20" font-weight="900" fill="#2a4fc9" font-family="Arial">★</text>
      <!-- Waist belt -->
      <path d="M58 106 L122 106" stroke="#ffd83d" stroke-width="4" stroke-linecap="round" />
      <!-- Head / face -->
      <circle cx="90" cy="42" r="28" fill="#f0c8a8" />
      <!-- Hair (long flowing) -->
      <path d="M50 38 C44 26 54 10 70 16 C74 8 84 4 90 4 C96 4 106 8 110 16 C126 10 136 26 130 38 C138 46 134 58 126 60 C118 56 110 50 106 48 C96 52 84 52 74 48 C70 50 62 56 54 60 C46 58 42 46 50 38 Z" fill="#3a1f0e" />
      <!-- Long ponytail flowing -->
      <path d="M52 24 C32 20 16 56 20 72 C28 64 38 56 50 52" fill="#3a1f0e" />
      <path d="M128 24 C148 20 164 56 160 72 C152 64 142 56 130 52" fill="#3a1f0e" />
      <!-- Eyes -->
      <ellipse cx="78" cy="44" rx="5" ry="6" fill="#1c2740" />
      <ellipse cx="102" cy="44" rx="5" ry="6" fill="#1c2740" />
      <circle cx="80" cy="42" r="2" fill="#fff" />
      <circle cx="104" cy="42" r="2" fill="#fff" />
      <!-- Smile -->
      <path d="M82 54 Q90 60 98 54" fill="none" stroke="#7a3d2a" stroke-width="3" stroke-linecap="round" />
      <!-- Boots -->
      <path d="M64 130 L56 162" stroke="#2a4fc9" stroke-width="14" stroke-linecap="round" />
      <path d="M116 130 L124 162" stroke="#2a4fc9" stroke-width="14" stroke-linecap="round" />
      <!-- Energy glow hands -->
      <circle cx="32" cy="148" r="8" fill="#ffd83d" opacity="0.9" filter="url(#heroGlow)" />
      <circle cx="148" cy="148" r="8" fill="#ffd83d" opacity="0.9" filter="url(#heroGlow)" />
    </svg>
  `;
  return w;
}

// -----------------------------------------------------------------------
// SVG: Rotsblok
// -----------------------------------------------------------------------
function svgRots() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 120 100");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.style.cssText = "position:absolute;opacity:0.9;transition:all 0.3s;";
  svg.innerHTML = `
    <path d="M8 70 L5 40 L20 8 L50 3 L80 6 L102 18 L115 40 L118 70 L106 88 L76 97 L38 95 L10 85 Z" fill="#7a7a8a" stroke="#5a5a6a" stroke-width="3" stroke-linejoin="round" />
    <path d="M20 20 L40 18 L35 40 L18 38 Z" fill="#8a8a9a" />
    <path d="M80 15 L100 28 L90 45 L72 42 Z" fill="#9292a2" />
    <path d="M38 42 L50 42 L48 65 L30 60 Z" fill="#686878" />
    <path d="M70 48 L90 50 L85 75 L65 70 Z" fill="#6a6a7a" />
    <path d="M30 70 L55 72 L50 90 L25 85 Z" fill="#5e5e6e" />
  `;
  return svg;
}

// -----------------------------------------------------------------------
// Hoofdstructuur
// -----------------------------------------------------------------------
function bouwScene() {
  const blok = el("div", "math-hero");
  blok.style.setProperty("--power-progress", "0%");
  blok.setAttribute("role", "img");
  blok.setAttribute("aria-label", "Superwoman die stenen verbrijzelt bij elk goed rekenantwoord.");

  const scene = el("div", "math-hero__scene");
  const speedlines = el("div", "math-hero__speedlines");
  const hero = svgSuperwoman();
  const badge = el("div", "math-hero__badge");
  const bubble = el("div", "math-hero__bubble", "Klaar voor math power!");

  // Rots (rechts, groter naarmate dichterbij)
  const rotsWrap = el("div", "math-hero__rock");
  const rotsSvg = svgRots();
  rotsWrap.appendChild(rotsSvg);

  const meter = el("div", "math-hero__meter");
  meter.innerHTML = `
    <div class="math-hero__meter-top">
      <span class="math-hero__label">MATH POWER</span>
      <span class="math-hero__percent">0%</span>
    </div>
    <div class="math-hero__bar">
      <div class="math-hero__bar-fill"></div>
      <div class="math-hero__checkpoint math-hero__checkpoint--25"></div>
      <div class="math-hero__checkpoint math-hero__checkpoint--50"></div>
      <div class="math-hero__checkpoint math-hero__checkpoint--75"></div>
      <div class="math-hero__checkpoint math-hero__checkpoint--100"></div>
    </div>
    <div class="math-hero__meta">
      <span class="math-hero__rank">HELD IN TRAINING</span>
      <span class="math-hero__count">0 / 1 goed</span>
    </div>
  `;

  scene.append(speedlines, rotsWrap, hero, badge, bubble);
  blok.append(scene, meter);

  return {
    blok, hero, scene, badge, bubble, rotsWrap,
    percent: meter.querySelector(".math-hero__percent"),
    rank: meter.querySelector(".math-hero__rank"),
    count: meter.querySelector(".math-hero__count"),
    fill: meter.querySelector(".math-hero__bar-fill"),
  };
}

// -----------------------------------------------------------------------
// Animaties: rots verbrijzelen (3 varianten)
// -----------------------------------------------------------------------
function animRotsPunch(rotsWrap) {
  rotsWrap.classList.remove("math-hero__rock--hit", "math-hero__rock--explode", "math-hero__rock--vaporize");
  void rotsWrap.offsetWidth;
  rotsWrap.classList.add("math-hero__rock--explode");
  // Voeg brokstukjes toe
  const scene = rotsWrap.closest(".math-hero__scene");
  if (!scene) return;
  for (let i = 0; i < 8; i++) {
    const brok = document.createElement("div");
    brok.className = "math-hero__debris";
    brok.style.cssText = `position:absolute;width:${8+Math.random()*14}px;height:${8+Math.random()*14}px;background:#${["7a7a8a","5a5a6a","9292a2","686878"][i%4]};border-radius:${Math.random()*6}px;left:${50+ (Math.random()-0.5)*20}%;top:${40+ (Math.random()-0.5)*20}%;--dx:${(Math.random()-0.5)*200}px;--dy:${(Math.random()-0.5)*200}px;`;
    brok.style.animation = `rock-debris 0.7s ease-out forwards`;
    brok.style.animationDelay = `${Math.random()*0.1}s`;
    scene.appendChild(brok);
    setTimeout(() => brok.remove(), 900);
  }
}

function animRotsKick(rotsWrap) {
  rotsWrap.classList.remove("math-hero__rock--hit", "math-hero__rock--explode", "math-hero__rock--vaporize");
  void rotsWrap.offsetWidth;
  rotsWrap.classList.add("math-hero__rock--hit");
  // Rots vliegt omhoog en valt in stukken
}

function animRotsLaser(rotsWrap) {
  rotsWrap.classList.remove("math-hero__rock--hit", "math-hero__rock--explode", "math-hero__rock--vaporize");
  void rotsWrap.offsetWidth;
  rotsWrap.classList.add("math-hero__rock--vaporize");
  // Vervagingseffect
}

// -----------------------------------------------------------------------
// Animaties: geraakt worden (3 varianten)
// -----------------------------------------------------------------------
function animGetroffen(hero) {
  const h = hero.querySelector(".math-hero__svg");
  if (!h) return;
  h.classList.remove("math-hero__hit--stun", "math-hero__hit--electro", "math-hero__hit--fire");
  void h.offsetWidth;
  h.classList.add("math-hero__hit--stun");
  // Sterretjes rond het hoofd via pseudo-elementen
}

function animBliksem(hero) {
  const h = hero.querySelector(".math-hero__svg");
  if (!h) return;
  h.classList.remove("math-hero__hit--stun", "math-hero__hit--electro", "math-hero__hit--fire");
  void h.offsetWidth;
  h.classList.add("math-hero__hit--electro");
}

function animVuurbal(hero) {
  const h = hero.querySelector(".math-hero__svg");
  if (!h) return;
  h.classList.remove("math-hero__hit--stun", "math-hero__hit--electro", "math-hero__hit--fire");
  void h.offsetWidth;
  h.classList.add("math-hero__hit--fire");
}

// -----------------------------------------------------------------------
// Goed/fout met variaties
// -----------------------------------------------------------------------
const GOEDE_FN = [animRotsPunch, animRotsKick, animRotsLaser];
const FOUTE_FN = [animGetroffen, animBliksem, animVuurbal];

// -----------------------------------------------------------------------
// Helper: partikels tonen
// -----------------------------------------------------------------------
function toonPartikels(laag, opties = {}) {
  const aant = opties.aantal ?? 12;
  const sym = opties.symbols ?? ["★", "✦", "◆", "⚡", "✨"];
  for (let i = 0; i < aant; i++) {
    const p = el("span", "math-hero__particle");
    p.textContent = sym[i % sym.length];
    p.style.cssText = `left:${18+Math.random()*64}%;top:${34+Math.random()*34}%;color:${PARTIKEL_KLEUREN[i%PARTIKEL_KLEUREN.length]};--dx:${(Math.random()-0.5)*130}px;--dy:${-45-Math.random()*70}px;animation-delay:${Math.random()*0.12}s;`;
    laag.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }
}

function toonBadge(badge, tekst) {
  badge.textContent = tekst;
  badge.classList.remove("math-hero__badge--show");
  void badge.offsetWidth;
  badge.classList.add("math-hero__badge--show");
  setTimeout(() => badge.classList.remove("math-hero__badge--show"), 1400);
}

// -----------------------------------------------------------------------
// Publieke API (zelfde interface als oude raket-animatie)
// -----------------------------------------------------------------------
export function toonEindAnimatie(container, pct) {
  const p = begrens(Math.round(pct || 0), 0, 100);
  const v = el("div", "math-hero-result");
  v.style.setProperty("--power-progress", `${p}%`);
  const suc = p >= 70;
  v.setAttribute("aria-label", `${p >= 100 ? "MATH MASTER!" : suc ? "SUPER HELDIN!" : "HELD IN TRAINING!"}`);
  v.innerHTML = `
    <div class="math-hero-result__burst"></div>
    <div class="math-hero-result__hero"></div>
    <h3>${p >= 100 ? "MATH MASTER!" : suc ? "SUPER HELDIN!" : "HELD IN TRAINING!"}</h3>
    <p>${suc ? "Missie voltooid!" : "Goed geoefend, word sterker!"}</p>
    <div class="math-hero-result__meter"><div class="math-hero-result__fill"></div></div>
    <strong>${p}% goed</strong>
  `;
  v.querySelector(".math-hero-result__hero").appendChild(svgSuperwoman());
  container.appendChild(v);
  if (suc) toonPartikels(v.querySelector(".math-hero-result__burst"), { aantal: 22 });
  return v;
}

export function maakRaketAnimatie(container, doelAantal) {
  const totaal = Math.max(1, doelAantal);
  let aantalGoed = 0;
  const s = bouwScene();
  container.appendChild(s.blok);

  function update() {
    const v = Math.min(1, aantalGoed / totaal);
    const pct = Math.round(v * 100);
    s.fill.style.width = `${v * 100}%`;
    s.percent.textContent = `${pct}%`;
    s.count.textContent = `${aantalGoed} / ${totaal} goed`;
    const cp = CHECKPOINTS.reduce((a, c) => pct >= c.grens ? c : a, CHECKPOINTS[0]);
    s.rank.textContent = cp.tekst;
    s.blok.style.setProperty("--power-progress", `${pct}%`);

    // Rots schaalt mee: groter naarmate dichterbij (naarmate meer progress)
    const schaal = 0.8 + v * 0.5;
    s.rotsWrap.style.transform = `scale(${schaal})`;
    s.rotsWrap.style.opacity = String(0.5 + v * 0.5);

    if (aantalGoed >= totaal) {
      setTimeout(() => toonBadge(s.badge, "MATH MASTER!"), 300);
    }
  }

  return {
    goedAntwoord() {
      aantalGoed += 1;
      const fn = GOEDE_FN[Math.floor(Math.random() * GOEDE_FN.length)];
      fn(s.rotsWrap);
      toonPartikels(s.scene, { aantal: 14, symbols: ["★", "✦", "◆", "✧", "✨"] });
      s.bubble.textContent = kies(["Hyaa!", "Take that!", "Whoosh!", "Boom!"]);
      // Powerup: heldin gloeit + pulseert bij elk goed antwoord
      animatieHerstart(s.hero, "math-hero--powerup");
      setTimeout(() => s.hero.classList.remove("math-hero--powerup"), 900);
      update();
    },
    foutAntwoord() {
      const fn = FOUTE_FN[Math.floor(Math.random() * FOUTE_FN.length)];
      fn(s.hero);
      s.bubble.textContent = kies(["Oof!", "That hurt!", "No way!", "Grr..."]);
      // Geen update() — teller blijft gelijk
    },
    reset() {
      aantalGoed = 0;
      update();
    },
    element: s.blok,
  };
}