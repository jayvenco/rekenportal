// utils/raketAnimatie.js
// -----------------------------------------------------------------------------
// Nyan Cat — kat vliegt door de ruimte met een regenboog vlak achter zich.
// Voortgang = aantal vragen goed. Goed = powerup. Fout = schudden.
// -----------------------------------------------------------------------------

const CHECKPOINTS = [
  { grens: 25, tekst: "GOED BEZIG" },
  { grens: 50, tekst: "STOER" },
  { grens: 75, tekst: "TOPPER" },
  { grens: 100, tekst: "REKENKAMPIOEN" },
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
  w.innerHTML = `
    <div class="nyan-lichaam">
      <div class="nyan-staart"><div class="nyan-sprite"></div></div>
      <div class="nyan-pootjes"><div class="nyan-sprite"></div></div>
      <div class="nyan-poptart"></div>
      <div class="nyan-kop"></div>
    </div>
  `;
  return w;
}

// Sterrenveld (12 sterren; posities + animatie via CSS .nyan-stars)
function maakSterren() {
  const sterren = document.createElement("ul");
  sterren.className = "nyan-stars";
  for (let s = 0; s < 12; s++) {
    const li = document.createElement("li");
    li.appendChild(document.createElement("i"));
    sterren.appendChild(li);
  }
  return sterren;
}

// -----------------------------------------------------------------------
// Scene: ruimte met geanimeerde sterren; kat vliegt er met regenboog doorheen.
// -----------------------------------------------------------------------
function bouwScene() {
  const blok = el("div", "nyan-space");
  blok.setAttribute("role", "img");
  blok.setAttribute("aria-label", "Nyan Cat vliegt door de ruimte met een regenboog.");

  const scene = el("div", "nyan-space__scene");
  scene.style.cssText = "position:relative;height:200px;border-radius:12px;overflow:hidden;background:linear-gradient(180deg,#0a0a2e 0%,#1a1a4e 25%,#2a3a6e 50%,#1a1a4e 75%,#0a0a2e 100%);";

  // Sterrenveld (achtergrond)
  scene.appendChild(maakSterren());

  // Kat + regenboog (achter de kat, zelfde breedte — CSS .nyan-regenboog)
  const cat = nyanCat();
  cat.style.cssText = "position:absolute;left:5%;bottom:38%;z-index:5;width:150px;height:110px;transition:left 0.6s cubic-bezier(0.34,1.56,0.64,1);";
  const regenboog = el("div", "nyan-regenboog");
  regenboog.innerHTML = '<div class="nyan-sprite"></div>';
  cat.prepend(regenboog);

  // Badge
  const badge = el("div", "nyan-space__badge");
  badge.style.cssText = "position:absolute;left:50%;top:6%;z-index:6;padding:5px 16px;border-radius:999px;background:#2a4fc9;color:#fff;font-size:13px;font-weight:900;transform:translateX(-50%) scale(0.82);opacity:0;pointer-events:none;";

  scene.append(cat, badge);

  // Meter
  const meter = el("div", "nyan-space__meter");
  meter.style.cssText = "padding:8px 0;";
  meter.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">
      <span style="font-size:12px;font-weight:800;color:#5b6472;">VOORTGANG</span>
      <span class="nyan-space__pct" style="font-size:18px;font-weight:800;color:#2a4fc9;">0%</span>
    </div>
    <div style="position:relative;height:10px;border-radius:5px;background:#e2e8f0;overflow:hidden;">
      <div class="nyan-space__fill" style="height:100%;width:0%;border-radius:5px;background:linear-gradient(90deg,#38b26a,#ffd83d,#ff785a);transition:width 0.4s ease;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:3px;">
      <span class="nyan-space__rank" style="font-size:12px;font-weight:700;color:#5b6472;">START</span>
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
      @keyframes nyan-flash { 0%{opacity:.95;transform:translate(-50%,-50%) scale(.2)} 100%{opacity:0;transform:translate(-50%,-50%) scale(2.8)} }
      @keyframes nyan-burst { 0%{opacity:1;transform:translate(0,0) scale(.4)} 60%{opacity:1} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(1)} }
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

/** Vuurwerk-effect: een flits + radiale deeltjes die vanuit een anker (de kat) wegschieten. */
function toonVuurwerk(laag, xPct = 50, yPct = 30, aantal = 26) {
  const b = document.createElement("div");
  b.style.cssText = `position:absolute;left:${xPct}%;top:${yPct}%;z-index:6;pointer-events:none;`;

  // Flits
  const flits = document.createElement("span");
  flits.style.cssText = "position:absolute;left:0;top:0;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle,#fff 0%,#ffe27a 55%,transparent 72%);box-shadow:0 0 26px 10px rgba(255,226,122,0.75);animation:nyan-flash 0.5s ease-out forwards;";
  b.appendChild(flits);

  // Radiale deeltjes (vuurwerk-uitbarsting)
  for (let i = 0; i < aantal; i += 1) {
    const hoek = (i / aantal) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
    const afstand = 46 + Math.random() * 46;
    const p = document.createElement("span");
    const kleur = PARTIKEL_KLEUREN[i % PARTIKEL_KLEUREN.length];
    p.style.cssText = `position:absolute;left:0;top:0;width:7px;height:7px;border-radius:50%;background:${kleur};box-shadow:0 0 6px ${kleur};--tx:${(Math.cos(hoek) * afstand).toFixed(1)}px;--ty:${(Math.sin(hoek) * afstand).toFixed(1)}px;animation:nyan-burst 0.75s cubic-bezier(.2,.7,.3,1) forwards;animation-delay:${(Math.random() * 0.08).toFixed(2)}s;`;
    b.appendChild(p);
  }
  laag.appendChild(b);
  setTimeout(() => b.remove(), 850);
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
    if (type === "h3") { e.style.cssText = "font-size:24px;font-weight:900;color:#2a4fc9;margin:6px 0;"; e.textContent = p >= 100 ? "REKENKAMPIOEN!" : suc ? "TOPPER!" : "OP WEG!"; }
    else if (type === "p") { e.style.cssText = "margin:0 0 10px;font-size:16px;color:#5b6472;"; e.textContent = "Goed gedaan!"; }
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
  let catLeftPct = 5;
  // Anker voor het vuurwerk, vaste hoogte (kat zweeft op vaste hoogte).
  const catCenterTopPct = 25;
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

    // Kat vliegt van 5% naar 75% van links, op vaste hoogte.
    const catLeft = 5 + v * 70;
    catLeftPct = catLeft;
    s.cat.style.left = `${catLeft}%`;

    if (aantalGoed >= totaal) {
      setTimeout(() => toonBadge(s.badge, "REKENKAMPIOEN!"), 300);
    }
  }

  return {
    goedAntwoord() {
      aantalGoed += 1;
      update();
      animHerstart(s.cat, "nyan-space--powerup");
      setTimeout(() => s.cat.classList.remove("nyan-space--powerup"), 700);
      toonVuurwerk(s.scene, catLeftPct, catCenterTopPct);
    },
    foutAntwoord() {
      animHerstart(s.cat, "nyan-space--hit");
      setTimeout(() => s.cat.classList.remove("nyan-space--hit"), 500);
    },
    reset() {
      aantalGoed = 0;
      s.cat.style.left = "5%";
      s.cat.style.filter = "";
      update();
    },
    element: s.blok,
  };
}