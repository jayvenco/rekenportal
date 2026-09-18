// utils/raketAnimatie.js
// -----------------------------------------------------------------------------
// Superheldin vs Monster: vliegt van links naar rechts, monster op rechts.
// Goed: powerup + boost naar rechts. Fout: laser van monster. Laatste: monster kapot.
// -----------------------------------------------------------------------------

const CHECKPOINTS = [
  { grens: 25, tekst: "HELD IN TRAINING" },
  { grens: 50, tekst: "POWER HELDIN" },
  { grens: 75, tekst: "SUPER HELDIN" },
  { grens: 100, tekst: "MATH MASTER" },
];

const PARTIKEL_KLEUREN = ["#2f6ed4", "#38b26a", "#f5b942", "#f07a3d", "#9b5de5"];

function begrens(g, mi, ma) { return Math.max(mi, Math.min(ma, g)); }
function el(t, c, txt = "") {
  const e = document.createElement(t);
  if (c) e.className = c;
  if (txt) e.textContent = txt;
  return e;
}
function kies(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// -----------------------------------------------------------------------
// SVG: Vliegende superheldin (links naar rechts, dynamischer)
// -----------------------------------------------------------------------
function svgSuperheldin() {
  const w = el("div", "monster-hero__character");
  w.innerHTML = `
    <svg class="monster-hero__svg" viewBox="0 0 180 180" role="img">
      <defs>
        <linearGradient id="mhCape" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#ff6b8a" /><stop offset="100%" stop-color="#c42d55" />
        </linearGradient>
        <linearGradient id="mhSuit" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#5a7ff2" /><stop offset="100%" stop-color="#2a4fc9" />
        </linearGradient>
        <filter id="mhGlow"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g opacity="0.12">
        <circle cx="90" cy="90" r="70" fill="#f8d84c" />
        <path d="M90 10 L102 52 L146 28 L126 70 L170 76 L130 96 L162 132 L118 120 L122 166 L90 132 L58 166 L62 120 L18 132 L50 96 L10 76 L54 70 L34 28 L78 52 Z" fill="#ffd83d" />
      </g>
      <path class="monster-hero__cape" d="M52 70 C24 88 16 130 36 162 C56 146 74 136 92 132 C110 136 128 146 148 162 C166 128 156 86 126 70 C110 88 70 88 52 70 Z" fill="url(#mhCape)" />
      <path d="M44 106 C22 118 18 142 32 148 C40 132 52 122 66 116Z" fill="#f0c8a8" />
      <path d="M136 106 C158 118 162 142 148 148 C140 132 128 122 114 116Z" fill="#f0c8a8" />
      <path class="monster-hero__body" d="M60 78 C62 58 74 48 90 48 C106 48 118 58 120 78 L128 112 C112 132 68 132 52 112Z" fill="url(#mhSuit)" />
      <path d="M55 112 L90 118 L125 112 L120 122 L90 128 L60 122Z" fill="#2a4fc9" />
      <circle cx="90" cy="92" r="16" fill="#ffd83d" stroke="#fff" stroke-width="3" />
      <text x="90" y="99" text-anchor="middle" font-size="20" font-weight="900" fill="#2a4fc9" font-family="Arial, sans-serif">★</text>
      <path d="M58 106 L122 106" stroke="#ffd83d" stroke-width="4" stroke-linecap="round" />
      <circle cx="90" cy="42" r="28" fill="#f0c8a8" />
      <path d="M50 38 C44 26 54 10 70 16 C74 8 84 4 90 4 C96 4 106 8 110 16 C126 10 136 26 130 38 C138 46 134 58 126 60 C118 56 110 50 106 48 C96 52 84 52 74 48 C70 50 62 56 54 60 C46 58 42 46 50 38Z" fill="#3a1f0e" />
      <path d="M52 24 C32 20 16 56 20 72 C28 64 38 56 50 52" fill="#3a1f0e" />
      <path d="M128 24 C148 20 164 56 160 72 C152 64 142 56 130 52" fill="#3a1f0e" />
      <ellipse cx="78" cy="44" rx="5" ry="6" fill="#1c2740" /><ellipse cx="102" cy="44" rx="5" ry="6" fill="#1c2740" />
      <circle cx="80" cy="42" r="2" fill="#fff" /><circle cx="104" cy="42" r="2" fill="#fff" />
      <path d="M82 54 Q90 60 98 54" fill="none" stroke="#7a3d2a" stroke-width="3" stroke-linecap="round" />
      <path d="M64 130 L56 162" stroke="#2a4fc9" stroke-width="14" stroke-linecap="round" />
      <path d="M116 130 L124 162" stroke="#2a4fc9" stroke-width="14" stroke-linecap="round" />
    </svg>
  `;
  return w;
}

// -----------------------------------------------------------------------
// SVG: Monster (rechts, dreigend)
// -----------------------------------------------------------------------
function svgMonster() {
  const w = el("div", "monster-hero__monster");
  w.innerHTML = `
    <svg class="monster-hero__monster-svg" viewBox="0 0 160 160" role="img">
      <defs>
        <radialGradient id="monsterEye"><stop offset="0%" stop-color="#ff4d4d"/><stop offset="100%" stop-color="#8b0000"/></radialGradient>
        <radialGradient id="monsterBelly"><stop offset="0%" stop-color="#5a3a2a"/><stop offset="100%" stop-color="#2a1a0a"/></radialGradient>
      </defs>
      <!-- Body -->
      <ellipse cx="80" cy="100" rx="52" ry="40" fill="#3a2a1a" />
      <ellipse cx="80" cy="105" rx="40" ry="30" fill="url(#monsterBelly)" />
      <!-- Legs -->
      <path d="M48 132 L36 160" stroke="#3a2a1a" stroke-width="18" stroke-linecap="round" />
      <path d="M112 132 L124 160" stroke="#3a2a1a" stroke-width="18" stroke-linecap="round" />
      <!-- Arms -->
      <path d="M32 92 L12 112 L6 106" stroke="#3a2a1a" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M128 92 L148 112 L154 106" stroke="#3a2a1a" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
      <!-- Head -->
      <ellipse cx="80" cy="54" rx="40" ry="34" fill="#4a3a2a" />
      <!-- Horns -->
      <path d="M52 36 L42 10 L62 26Z" fill="#2a1a0a" />
      <path d="M108 36 L118 10 L98 26Z" fill="#2a1a0a" />
      <!-- Eyes -->
      <ellipse cx="62" cy="52" rx="11" ry="13" fill="url(#monsterEye)" />
      <ellipse cx="98" cy="52" rx="11" ry="13" fill="url(#monsterEye)" />
      <circle cx="64" cy="48" r="3" fill="#fff" />
      <circle cx="100" cy="48" r="3" fill="#fff" />
      <!-- Mouth -->
      <path d="M60 70 Q80 80 100 70" fill="none" stroke="#1a0a00" stroke-width="4" stroke-linecap="round" />
      <!-- Teeth -->
      <path d="M68 70 L72 76 L76 70" fill="#fff" />
      <path d="M84 70 L88 76 L92 70" fill="#fff" />
      <!-- Scar -->
      <path d="M74 40 L78 44 L74 48" stroke="#c42d55" stroke-width="2" fill="none" />
    </svg>
  `;
  return w;
}

// -----------------------------------------------------------------------
// Scene bouwen
// -----------------------------------------------------------------------
function bouwScene() {
  const blok = el("div", "monster-hero");
  blok.setAttribute("role", "img");
  blok.setAttribute("aria-label", "Superheldin vliegt naar monster.");

  const scene = el("div", "monster-hero__scene");
  const speedlines = el("div", "monster-hero__speedlines");

  // Heldin (links starten)
  const hero = svgSuperheldin();
  hero.style.left = "8%";

  // Monster (rechts)
  const monster = svgMonster();
  monster.classList.add("monster-hero__monster-wrap");

  // Laser (onzichtbaar, wordt getoond bij fout)
  const laser = el("div", "monster-hero__laser");

  const badge = el("div", "monster-hero__badge");
  const bubble = el("div", "monster-hero__bubble", "Vlieg erheen!");

  scene.append(speedlines, monster, laser, hero, badge, bubble);
  blok.appendChild(scene);

  // Meter onder scene
  const meter = el("div", "monster-hero__meter");
  meter.innerHTML = `
    <div class="monster-hero__meter-top">
      <span class="monster-hero__label">MATH POWER</span>
      <span class="monster-hero__percent">0%</span>
    </div>
    <div class="monster-hero__bar">
      <div class="monster-hero__bar-fill"></div>
      <div class="monster-hero__checkpoint monster-hero__checkpoint--25"></div>
      <div class="monster-hero__checkpoint monster-hero__checkpoint--50"></div>
      <div class="monster-hero__checkpoint monster-hero__checkpoint--75"></div>
      <div class="monster-hero__checkpoint monster-hero__checkpoint--100"></div>
    </div>
    <div class="monster-hero__meta">
      <span class="monster-hero__rank">HELD IN TRAINING</span>
      <span class="monster-hero__count">0 / 1 goed</span>
    </div>
  `;
  blok.appendChild(meter);

  return {
    blok, hero, scene, monster, laser, badge, bubble,
    percent: meter.querySelector(".monster-hero__percent"),
    rank: meter.querySelector(".monster-hero__rank"),
    count: meter.querySelector(".monster-hero__count"),
    fill: meter.querySelector(".monster-hero__bar-fill"),
  };
}

// -----------------------------------------------------------------------
// Animaties
// -----------------------------------------------------------------------
function animHerstart(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

function toonPartikels(laag, opties = {}) {
  const aant = opties.aantal ?? 12;
  const sym = opties.symbols ?? ["★", "✦", "◆", "⚡"];
  for (let i = 0; i < aant; i++) {
    const p = document.createElement("span");
    p.className = "monster-hero__particle";
    p.textContent = sym[i % sym.length];
    p.style.cssText = `left:${20+Math.random()*60}%;top:${30+Math.random()*40}%;color:${PARTIKEL_KLEUREN[i%PARTIKEL_KLEUREN.length]};--dx:${(Math.random()-0.5)*140}px;--dy:${-40-Math.random()*80}px;animation-delay:${Math.random()*0.15}s;`;
    laag.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
}

function toonBadge(badge, tekst) {
  badge.textContent = tekst;
  animHerstart(badge, "monster-hero__badge--show");
  setTimeout(() => badge.classList.remove("monster-hero__badge--show"), 1400);
}

function monsterSchud(monster) {
  animHerstart(monster, "monster-hero__monster--schud");
}

function monsterLaser(laser, scene) {
  animHerstart(laser, "monster-hero__laser--vuren");
  setTimeout(() => laser.classList.remove("monster-hero__laser--vuren"), 500);
}

function monsterKapot(monster, scene) {
  animHerstart(monster, "monster-hero__monster--kapot");
  setTimeout(() => {
    monster.classList.remove("monster-hero__monster--kapot");
    monster.style.opacity = "0";
  }, 800);
  toonPartikels(scene, { aantal: 20, symbols: ["💥", "🔥", "💫", "⚡", "✨"] });
}

function heldPowerup(hero) {
  animHerstart(hero, "monster-hero__hero--powerup");
  setTimeout(() => hero.classList.remove("monster-hero__hero--powerup"), 700);
}

function heldGetroffen(hero) {
  animHerstart(hero, "monster-hero__hero--hit");
  setTimeout(() => hero.classList.remove("monster-hero__hero--hit"), 800);
}

// -----------------------------------------------------------------------
// Publieke API
// -----------------------------------------------------------------------
export function toonEindAnimatie(container, pct) {
  const p = begrens(Math.round(pct || 0), 0, 100);
  const v = el("div", "monster-hero-result");
  const suc = p >= 70;
  v.setAttribute("aria-label", `${p >= 100 ? "MATH MASTER!" : suc ? "MONSTER VERBRIJZELD!" : "HELD IN TRAINING!"}`);
  v.innerHTML = `
    <div class="monster-hero-result__burst"></div>
    <div class="monster-hero-result__hero"></div>
    <h3>${p >= 100 ? "MATH MASTER!" : suc ? "MONSTER VERBRIJZELD!" : "HELD IN TRAINING!"}</h3>
    <p>${suc ? "Het monster is verslagen!" : "Blijf oefenen, word sterker!"}</p>
    <div class="monster-hero-result__meter"><div class="monster-hero-result__fill"></div></div>
    <strong>${p}% goed</strong>
  `;
  v.querySelector(".monster-hero-result__hero").appendChild(svgSuperheldin());
  container.appendChild(v);
  if (suc) toonPartikels(v.querySelector(".monster-hero-result__burst"), { aantal: 20 });
  return v;
}

export function maakRaketAnimatie(container, doelAantal) {
  const totaal = Math.max(1, doelAantal);
  let aantalGoed = 0;
  let monsterDood = false;
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

    // Heldin vliegt naar rechts (8% → 62%)
    const heroLeft = 8 + v * 54;
    s.hero.style.left = `${heroLeft}%`;

    // Monster wordt groter en dreigender
    const monSchaal = 0.4 + v * 0.6;
    s.monster.style.transform = `scale(${monSchaal})`;
    s.monster.style.opacity = String(0.3 + v * 0.7);

    // Laatste opgave: heldin bereikt monster
    if (aantalGoed >= totaal && !monsterDood) {
      monsterDood = true;
      setTimeout(() => {
        monsterKapot(s.monster, s.scene);
        s.bubble.textContent = "YEAH! GEDAAN!";
        toonBadge(s.badge, "MATH MASTER!");
      }, 300);
    }
  }

  return {
    goedAntwoord() {
      aantalGoed += 1;
      heldPowerup(s.hero);
      monsterSchud(s.monster);
      s.bubble.textContent = kies(["Hyaa!", "Take that!", "POW!", "Yes!"]);
      toonPartikels(s.scene, { aantal: 8, symbols: ["★", "✦", "◆", "⚡"] });
      update();
    },
    foutAntwoord() {
      // Scherm flitst donkerrood
      animHerstart(s.blok, "monster-hero--flash");
      setTimeout(() => s.blok.classList.remove("monster-hero--flash"), 500);
      monsterLaser(s.laser, s.scene);
      setTimeout(() => {
        heldGetroffen(s.hero);
        s.bubble.textContent = kies(["Oof!", "Dat doet pijn!", "Nee!", "Grrr!"]);
      }, 200);
    },
    reset() {
      aantalGoed = 0;
      monsterDood = false;
      s.monster.style.opacity = "1";
      s.monster.style.transform = "scale(0.4)";
      s.hero.style.left = "8%";
      update();
    },
    element: s.blok,
  };
}