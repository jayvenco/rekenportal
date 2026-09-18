// utils/raketAnimatie.js
// -----------------------------------------------------------------------------
// Nyan Cat in space — kat vliegt door de ruimte van links naar rechts.
// Voortgang = aantal vragen afgemaakt. Goed = powerup. Fout = schudden.
// -----------------------------------------------------------------------------

const CHECKPOINTS = [
  { grens: 25, tekst: "NYAN LAUNCH" },
  { grens: 50, tekst: "SPACE CAT" },
  { grens: 75, tekst: "STAR NYAN" },
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

// -----------------------------------------------------------------------
// Nyan Cat (herbruikt CSS uit nyan-cat.css)
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
// Scene: sterrenhemel met gradient (wolken → ruimte)
// -----------------------------------------------------------------------
function bouwScene() {
  const blok = el("div", "nyan-space");
  blok.setAttribute("role", "img");
  blok.setAttribute("aria-label", "Nyan Cat vliegt door de ruimte.");

  const scene = el("div", "nyan-space__scene");
  scene.style.cssText = "position:relative;height:200px;border-radius:12px;overflow:hidden;background:linear-gradient(180deg,#0a0a2e 0%,#1a1a4e 25%,#2a3a6e 45%,#4a6abe 65%,#7ab8e8 80%,#b0e0ff 92%,#5a8a3a 100%);";

  // Grond (donkergroen)
  const ground = el("div");
  ground.style.cssText = "position:absolute;bottom:0;left:0;right:0;height:12%;background:linear-gradient(180deg,#4a7a3a,#2a5a2a);border-top:2px solid #1a3a1a;z-index:2;";

  // Wolken (onderaan, bewegen)
  const wolkLayer = el("div");
  wolkLayer.style.cssText = "position:absolute;bottom:15%;left:0;right:0;height:80px;overflow:hidden;z-index:3;pointer-events:none;";
  for (let i = 0; i < 4; i++) {
    const w = el("div");
    w.style.cssText = `position:absolute;bottom:${8+i*15}px;width:${80+i*20}px;height:${16+i*4}px;border-radius:999px;background:rgba(255,255,255,${0.3-i*0.05});left:${-30+i*35}%;animation:nyan-cloud ${8-i}s linear infinite;animation-delay:${i*2}s;filter:blur(1px);`;
    wolkLayer.appendChild(w);
  }

  // Cat (links start)
  const cat = nyanCat();
  cat.style.cssText = "position:absolute;left:5%;bottom:22%;z-index:5;width:150px;height:110px;transition:left 0.6s cubic-bezier(0.34,1.56,0.64,1), bottom 0.3s;";

  // Badge
  const badge = el("div", "nyan-space__badge");
  badge.style.cssText = "position:absolute;left:50%;top:6%;z-index:6;padding:5px 16px;border-radius:999px;background:#2a4fc9;color:#fff;font-size:13px;font-weight:900;transform:translateX(-50%) scale(0.82);opacity:0;pointer-events:none;";

  scene.append(ground, wolkLayer, cat, badge);

  // Meter
  const meter = el("div", "nyan-space__meter");
  meter.style.cssText = "padding:8px 0;";
  meter.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">
      <span style="font-size:12px;font-weight:800;color:#5b6472;">FLIGHT PROGRESS</span>
      <span class="nyan-space__pct" style="font-size:18px;font-weight:800;color:#2a4fc9;">0%</span>
    </div>
    <div style="position:relative;height:10px;border-radius:5px;background:#e2e8f0;overflow:hidden;">
      <div class="nyan-space__fill" style="height:100%;width:0%;border-radius:5px;background:linear-gradient(90deg,#38b26a,#ffd83d,#ff785a);transition:width 0.4s ease;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:3px;">
      <span class="nyan-space__rank" style="font-size:12px;font-weight:700;color:#5b6472;">NYAN LAUNCH</span>
      <span class="nyan-space__count" style="font-size:12px;font-weight:700;color:#5b6472;">0 / 1</span>
    </div>
  `;
  blok.appendChild(scene);
  blok.appendChild(meter);

  // Inject keyframes
  if (!document.getElementById("nyan-space-kf")) {
    const st = document.createElement("style");
    st.id = "nyan-space-kf";
    st.textContent = `
      @keyframes nyan-cloud { 0%{transform:translateX(0)} 100%{transform:translateX(120vw)} }
      @keyframes nyan-particle { 0%{opacity:0;transform:translate(0,0) scale(0.5) rotate(0)} 20%{opacity:1} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.2) rotate(20deg)} }
    `;
    document.head.appendChild(st);
  }

  return {
    blok, cat, scene, badge,
    percent: meter.querySelector(".nyan-space__pct"),
    rank: meter.querySelector(".nyan-space__rank"),
    count: meter.querySelector(".nyan-space__count"),
    fill: meter.querySelector(".nyan-space__fill"),
  };
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
function animHerstart(e, c) { e.classList.remove(c); void e.offsetWidth; e.classList.add(c); }

function toonPartikels(laag, opties = {}) {
  const aant = opties.aantal ?? 10;
  const sym = opties.symbols ?? ["★","✦","◆","✨"];
  for (let i = 0; i < aant; i++) {
    const p = document.createElement("span");
    p.textContent = sym[i % sym.length];
    p.style.cssText = `position:absolute;z-index:5;font-size:16px;font-weight:900;pointer-events:none;left:${20+Math.random()*60}%;top:${30+Math.random()*40}%;color:${PARTIKEL_KLEUREN[i%PARTIKEL_KLEUREN.length]};--dx:${(Math.random()-0.5)*120}px;--dy:${-30-Math.random()*60}px;animation:nyan-particle 0.8s ease-out forwards;animation-delay:${Math.random()*0.12}s;`;
    laag.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }
}

function toonBadge(badge, tekst) {
  badge.style.opacity = "1"; badge.textContent = tekst;
  badge.classList.remove("nyan-space__badge--show"); void badge.offsetWidth;
  badge.classList.add("nyan-space__badge--show");
  setTimeout(() => { badge.classList.remove("nyan-space__badge--show"); badge.style.opacity = "0"; }, 1300);
}

// -----------------------------------------------------------------------
// Publieke API
// -----------------------------------------------------------------------
export function toonEindAnimatie(container, pct) {
  const p = begrens(Math.round(pct || 0), 0, 100);
  const suc = p >= 70;
  const v = el("div");
  v.style.cssText = "text-align:center;padding:18px 14px;margin:14px 0;border-radius:14px;background:linear-gradient(135deg,#f6f9fc,#ebf3ff);border:2px solid #dce7f5;";
  const hero = nyanCat(); hero.style.cssText = "display:inline-block;width:90px;height:70px;";
  v.appendChild(hero);
  ["h3","p","meter","strong"].forEach(type => {
    const e = el(type === "meter" ? "div" : type);
    if (type === "h3") { e.style.cssText = "font-size:24px;font-weight:900;color:#2a4fc9;margin:6px 0;"; e.textContent = p >= 100 ? "MATH MASTER!" : suc ? "CAT POWER!" : "NYAN LAUNCH!"; }
    else if (type === "p") { e.style.cssText = "margin:0 0 10px;font-size:16px;color:#5b6472;"; e.textContent = "Missie voltooid!"; }
    else if (type === "meter") { e.style.cssText = "height:8px;border-radius:4px;background:#e2e8f0;max-width:180px;margin:0 auto 4px;overflow:hidden;"; e.innerHTML = `<div style="height:100%;border-radius:4px;background:linear-gradient(90deg,#38b26a,#ffd83d,#ff785a);width:${p}%;"></div>`; }
    else { e.style.cssText = "color:#2f6ed4;"; e.textContent = `${p}% goed`; }
    v.appendChild(e);
  });
  container.appendChild(v);
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
    s.count.textContent = `${aantalGoed} / ${totaal}`;
    const cp = CHECKPOINTS.reduce((a, c) => pct >= c.grens ? c : a, CHECKPOINTS[0]);
    s.rank.textContent = cp.tekst;

    // Cat flies from 5% to 75% left
    const catLeft = 5 + v * 70;
    s.cat.style.left = `${catLeft}%`;
    // Slight altitude gain
    const catBottom = 22 + v * 8;
    s.cat.style.bottom = `${catBottom}%`;

    if (aantalGoed >= totaal) {
      setTimeout(() => toonBadge(s.badge, "MATH MASTER!"), 300);
    }
  }

  return {
    goedAntwoord() {
      aantalGoed += 1;
      animHerstart(s.cat, "nyan-space--powerup");
      setTimeout(() => s.cat.classList.remove("nyan-space--powerup"), 700);
      toonPartikels(s.scene, { aantal: 8, symbols: ["★","✦","◆","✨"] });
      update();
    },
    foutAntwoord() {
      animHerstart(s.cat, "nyan-space--hit");
      setTimeout(() => s.cat.classList.remove("nyan-space--hit"), 500);
    },
    reset() {
      aantalGoed = 0;
      s.cat.style.left = "5%"; s.cat.style.bottom = "22%";
      s.cat.style.filter = "";
      update();
    },
    element: s.blok,
  };
}
  