// utils/raketAnimatie.js
// -----------------------------------------------------------------------------
// Nyan Cat Jump — kat springt over muur bij goed, botst bij fout.
// Helemaal nieuw, alleen de nyan-cat.css wordt hergebruikt.
// -----------------------------------------------------------------------------

const CHECKPOINTS = [
  { grens: 25, tekst: "KITTEN STEPS" },
  { grens: 50, tekst: "JUMPER CAT" },
  { grens: 75, tekst: "ACRO-CAT" },
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
// Cat (gebruikt nyan-cat.css via nyanCat())
// -----------------------------------------------------------------------
function nyanCat() {
  const w = el("div", "nyan-cat");
  w.setAttribute("aria-hidden", "true");
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
// SVG: Bakstenen muur
// -----------------------------------------------------------------------
function svgMuur() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 80 120");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.style.cssText = "display:block;";
  svg.innerHTML = `
    <defs>
      <pattern id="baksteen" patternUnits="userSpaceOnUse" width="20" height="10">
        <rect width="20" height="10" fill="#b85a3a" stroke="#7a3a2a" stroke-width="1"/>
        <rect x="-10" y="5" width="20" height="10" fill="#b85a3a" stroke="#7a3a2a" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="80" height="120" fill="url(#baksteen)" rx="3"/>
    <rect width="80" height="120" fill="none" stroke="#5a2a1a" stroke-width="3" rx="3"/>
  `;
  return svg;
}

// -----------------------------------------------------------------------
// Scene bouwen
// -----------------------------------------------------------------------
function bouwScene() {
  const blok = el("div", "cat-wall");
  blok.setAttribute("role", "img");
  blok.setAttribute("aria-label", "Nyan Cat springt over muur.");

  const scene = el("div", "cat-wall__scene");
  scene.style.cssText = "position:relative;height:200px;border-radius:var(--radius-md);overflow:hidden;background:linear-gradient(180deg,#87ceeb 0%,#b0e0ff 60%,#5a8a3a 88%,#3a6a2a 100%);";

  // Ground
  const ground = el("div", "cat-wall__ground");
  ground.style.cssText = "position:absolute;bottom:0;left:0;right:0;height:28%;background:linear-gradient(180deg,#5a8a3a,#3a6a2a);border-top:3px solid #2a5a1a;";

  // Clouds
  const clouds = el("div");
  clouds.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;";
  for (let i = 0; i < 3; i++) {
    const c = el("div");
    c.style.cssText = `position:absolute;width:${60+i*20}px;height:${18+i*6}px;border-radius:999px;background:rgba(255,255,255,0.5);top:${8+i*25}%;left:${-20+i*40}%;animation:cat-cloud 10s linear infinite;animation-delay:${i*3}s;`;
    clouds.appendChild(c);
  }

  // Cat (links, start)
  const cat = nyanCat();
  cat.style.cssText = "position:absolute;left:8%;bottom:30%;z-index:3;width:160px;height:120px;";

  // Wall (mid)
  const muurWrap = el("div", "cat-wall__muur");
  muurWrap.style.cssText = "position:absolute;left:46%;bottom:26%;width:60px;height:90px;z-index:2;transition:transform 0.3s;";
  muurWrap.appendChild(svgMuur());

  // Badge
  const badge = el("div", "cat-wall__badge");
  badge.style.cssText = "position:absolute;left:50%;top:8%;z-index:6;padding:6px 18px;border-radius:999px;background:#2a4fc9;color:#fff;font-size:14px;font-weight:900;transform:translateX(-50%) scale(0.82);opacity:0;pointer-events:none;";

  scene.append(clouds, ground, muurWrap, cat, badge);

  // Meter
  const meter = el("div", "cat-wall__meter");
  meter.style.cssText = "padding:10px 0;";
  const pStyle = "font-size:13px;font-weight:800;color:#5b6472;";
  meter.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
      <span style="${pStyle}">MATH POWER</span>
      <span class="cat-wall__pct" style="font-size:20px;font-weight:800;color:#2a4fc9;">0%</span>
    </div>
    <div style="position:relative;height:12px;border-radius:6px;background:#e2e8f0;overflow:hidden;">
      <div class="cat-wall__fill" style="height:100%;width:0%;border-radius:6px;background:linear-gradient(90deg,#38b26a,#ffd83d,#ff785a);transition:width 0.4s ease;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:4px;">
      <span class="cat-wall__rank" style="font-size:13px;font-weight:700;color:#5b6472;">KITTEN STEPS</span>
      <span class="cat-wall__count" style="font-size:13px;font-weight:700;color:#5b6472;">0 / 1 goed</span>
    </div>
  `;
  blok.appendChild(scene);
  blok.appendChild(meter);

  return {
    blok, cat, scene, muurWrap, badge,
    percent: meter.querySelector(".cat-wall__pct"),
    rank: meter.querySelector(".cat-wall__rank"),
    count: meter.querySelector(".cat-wall__count"),
    fill: meter.querySelector(".cat-wall__fill"),
  };
}

// -----------------------------------------------------------------------
// Animaties
// -----------------------------------------------------------------------
function animHerstart(e, c) { e.classList.remove(c); void e.offsetWidth; e.classList.add(c); }

function toonPartikels(laag, opties = {}) {
  const aant = opties.aantal ?? 12;
  const sym = opties.symbols ?? ["★","✦","◆","⚡","✨"];
  for (let i = 0; i < aant; i++) {
    const p = document.createElement("span");
    p.textContent = sym[i % sym.length];
    p.style.cssText = `position:absolute;z-index:5;font-size:18px;font-weight:900;pointer-events:none;left:${20+Math.random()*60}%;top:${30+Math.random()*40}%;color:${PARTIKEL_KLEUREN[i%PARTIKEL_KLEUREN.length]};--dx:${(Math.random()-0.5)*140}px;--dy:${-40-Math.random()*80}px;animation:cat-particle 0.9s ease-out forwards;animation-delay:${Math.random()*0.15}s;`;
    laag.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
}

// -----------------------------------------------------------------------
// Publieke API
// -----------------------------------------------------------------------
export function toonEindAnimatie(container, pct) {
  const p = begrens(Math.round(pct || 0), 0, 100);
  const suc = p >= 70;
  const v = el("div", "cat-wall-result");
  v.style.cssText = "text-align:center;padding:20px 16px;margin:16px 0;border-radius:16px;background:linear-gradient(135deg,#f6f9fc,#ebf3ff);border:2px solid #dce7f5;";
  const hero = nyanCat();
  hero.style.cssText = "display:inline-block;width:100px;height:80px;";
  v.innerHTML = "";
  v.appendChild(hero);
  const h3 = el("h3");
  h3.style.cssText = "font-size:26px;font-weight:900;color:#2a4fc9;margin:8px 0;";
  h3.textContent = p >= 100 ? "MATH MASTER!" : suc ? "MUUR GESPRONGEN!" : "KITTEN STEPS!";
  v.appendChild(h3);
  const pEl = el("p");
  pEl.style.cssText = "margin:0 0 12px;font-size:17px;color:#5b6472;";
  pEl.textContent = suc ? "De kat is over de muur!" : "Blijf oefenen!";
  v.appendChild(pEl);
  const meter = el("div");
  meter.style.cssText = "height:10px;border-radius:5px;background:#e2e8f0;max-width:200px;margin:0 auto 6px;overflow:hidden;";
  meter.innerHTML = `<div style="height:100%;border-radius:5px;background:linear-gradient(90deg,#38b26a,#ffd83d,#ff785a);width:${p}%;"></div>`;
  v.appendChild(meter);
  const strong = el("strong");
  strong.style.cssText = "color:#2f6ed4;";
  strong.textContent = `${p}% goed`;
  v.appendChild(strong);
  container.appendChild(v);
  return v;
}

export function maakRaketAnimatie(container, doelAantal) {
  const totaal = Math.max(1, doelAantal);
  let aantalGoed = 0;
  const s = bouwScene();
  container.appendChild(s.blok);

  // Inject keyframes once
  if (!document.getElementById("cat-wall-kf")) {
    const st = document.createElement("style");
    st.id = "cat-wall-kf";
    st.textContent = `
      @keyframes cat-cloud {
        0% { transform: translateX(0); }
        100% { transform: translateX(120vw); }
      }
      @keyframes cat-particle {
        0% { opacity:0; transform:translate(0,0) scale(0.5) rotate(0deg); }
        20% { opacity:1; }
        100% { opacity:0; transform:translate(var(--dx),var(--dy)) scale(1.2) rotate(20deg); }
      }
      .cat-wall__muur--bonk {
        animation: cat-bonk 0.35s ease-out;
      }
      @keyframes cat-bonk {
        0%,100% { transform: translateX(0); }
        20% { transform: translateX(-4px) rotate(-2deg); }
        40% { transform: translateX(4px) rotate(2deg); }
        60% { transform: translateX(-2px); }
        80% { transform: translateX(2px); }
      }
      .cat-wall__badge--show {
        animation: cat-badge 1.3s ease-out forwards;
      }
      @keyframes cat-badge {
        0% { opacity:0; transform:translate(-50%,-12px) scale(0.82); }
        20% { opacity:1; transform:translate(-50%,0) scale(1.05); }
        75% { opacity:1; transform:translate(-50%,0) scale(1); }
        100% { opacity:0; transform:translate(-50%,-10px) scale(0.94); }
      }
    `;
    document.head.appendChild(st);
  }

  function update() {
    const v = Math.min(1, aantalGoed / totaal);
    const pct = Math.round(v * 100);
    s.fill.style.width = `${v * 100}%`;
    s.percent.textContent = `${pct}%`;
    s.count.textContent = `${aantalGoed} / ${totaal} goed`;
    const cp = CHECKPOINTS.reduce((a, c) => pct >= c.grens ? c : a, CHECKPOINTS[0]);
    s.rank.textContent = cp.tekst;
    s.cat.style.left = `${8 + v * 34}%`;

    if (aantalGoed >= totaal) {
      setTimeout(() => toonBadge(s.badge, "MATH MASTER!"), 300);
    }
  }

  function toonBadge(badge, tekst) {
    badge.style.opacity = "1";
    badge.textContent = tekst;
    badge.classList.remove("cat-wall__badge--show");
    void badge.offsetWidth;
    badge.classList.add("cat-wall__badge--show");
    setTimeout(() => { badge.classList.remove("cat-wall__badge--show"); badge.style.opacity = "0"; }, 1400);
  }

  return {
    goedAntwoord() {
      aantalGoed += 1;
      // Cat JUMP over wall
      s.cat.style.transition = "left 0.5s cubic-bezier(0.34,1.56,0.64,1), bottom 0.3s";
      s.cat.style.left = "62%";
      s.cat.style.bottom = "58%";
      setTimeout(() => { s.cat.style.bottom = "30%"; }, 300);
      animHerstart(s.muurWrap, "cat-wall__muur--bonk");
      toonPartikels(s.scene, { aantal: 10, symbols: ["★","✦","◆"] });
      update();
    },
    foutAntwoord() {
      // Cat BONK into wall
      s.cat.style.transition = "left 0.25s, bottom 0.1s";
      s.cat.style.left = "40%";
      s.cat.style.bottom = "26%";
      animHerstart(s.muurWrap, "cat-wall__muur--bonk");
      s.cat.style.filter = "brightness(0.5) hue-rotate(340deg)";
      setTimeout(() => { s.cat.style.bottom = "30%"; s.cat.style.filter = ""; }, 500);
    },
    reset() {
      aantalGoed = 0;
      s.cat.style.left = "8%"; s.cat.style.bottom = "30%";
      s.cat.style.transition = ""; s.cat.style.filter = "";
      update();
    },
    element: s.blok,
  };
}