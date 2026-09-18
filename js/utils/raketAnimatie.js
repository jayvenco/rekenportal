// utils/raketAnimatie.js
// -----------------------------------------------------------------------------
// Nyan Cat vs Monster: regenboog-kat vliegt naar rechts, monster op rechts.
// Goed: powerup + boost. Fout: laser. Laatste opgave: monster kapot.
// -----------------------------------------------------------------------------

const CHECKPOINTS = [
  { grens: 25, tekst: "NYAN STARTER" },
  { grens: 50, tekst: "RAINBOW CAT" },
  { grens: 75, tekst: "SUPER NYAN" },
  { grens: 100, tekst: "MATH MASTER" },
];

const PARTIKEL_KLEUREN = ["#2f6ed4", "#38b26a", "#f5b942", "#f07a3d", "#9b5de5"];
const REGENBOOG = ["#f00", "#f90", "#ff0", "#3f0", "#09f", "#639"];

function begrens(g, mi, ma) { return Math.max(mi, Math.min(ma, g)); }
function el(t, c, txt = "") {
  const e = document.createElement(t);
  if (c) e.className = c;
  if (txt) e.textContent = txt;
  return e;
}
function kies(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// -----------------------------------------------------------------------
// Nyan Cat — CSS-only regenboog kat
// -----------------------------------------------------------------------
function nyanCat() {
  const w = el("div", "nyan-cat");
  w.setAttribute("aria-hidden", "true");
  // Build stars (12 li with i)
  const sterren = document.createElement("ul");
  sterren.className = "nyan-stars";
  for (let s = 0; s < 12; s++) {
    const li = document.createElement("li");
    li.appendChild(document.createElement("i"));
    sterren.appendChild(li);
  }
  w.innerHTML = `
    <div class="nyan-regenboog"><div class="nyan-sprite"></div></div>
    <div class="nyan-lichaam">
      <div class="nyan-staart"><div class="nyan-sprite"></div></div>
      <div class="nyan-pootjes"><div class="nyan-sprite"></div></div>
      <div class="nyan-poptart"></div>
      <div class="nyan-kop"></div>
    </div>
  `;
  w.querySelector(".nyan-lichaam").prepend(sterren);
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

  // Nyan Cat (links starten)
  const hero = nyanCat();
  hero.style.left = "8%";

  // Sterren (ruimte bovenin)
  const sterren = el("div", "monster-hero__sterren");

  // Wolken (bewegend)
  const wolken = el("div", "monster-hero__wolken");
  for (let i = 0; i < 4; i++) {
    const w = el("div", "monster-hero__wolk");
    w.style.cssText = `top:${20 + i * 42}%;left:${-20 + i * 30}%;opacity:${0.25 + Math.random() * 0.25};animation-delay:${(i * 1.5).toFixed(1)}s;`;
    wolken.appendChild(w);
  }

  // Monster (rechts)
  const monster = svgMonster();
  monster.classList.add("monster-hero__monster-wrap");

  // Laser (onzichtbaar, wordt getoond bij fout)
  const laser = el("div", "monster-hero__laser");

  const badge = el("div", "monster-hero__badge");
  const bubble = el("div", "monster-hero__bubble", "Vlieg erheen!");

  scene.append(sterren, wolken, speedlines, monster, laser, hero, badge, bubble);
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
  animHerstart(hero, "nyan-cat--powerup");
  setTimeout(() => hero.classList.remove("nyan-cat--powerup"), 700);
}

function heldGetroffen(hero) {
  animHerstart(hero, "nyan-cat--hit");
  setTimeout(() => hero.classList.remove("nyan-cat--hit"), 800);
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
  v.querySelector(".monster-hero-result__hero").appendChild(nyanCat());
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