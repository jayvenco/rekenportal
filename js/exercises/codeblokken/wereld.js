// exercises/codeblokken/wereld.js
// -----------------------------------------------------------------------------
// Tekent de wereld van een Code-blokken-level (bord of platform) als SVG en
// speelt de stappen uit de simulatie (engine.js) animatie voor animatie af.
//
//   const w = maakWereld(level);
//   w.element            // in de pagina zetten
//   w.reset()            // terug naar de beginstand
//   await w.speel(vorigeSnap, snap, ms)  // één stap animeren
// -----------------------------------------------------------------------------

const NS = "http://www.w3.org/2000/svg";
const VOGEL = "🐥";
const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function el(naam, attrs = {}, tekst) {
  const e = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (tekst !== undefined) e.textContent = tekst;
  return e;
}

const wacht = (ms) => new Promise((r) => setTimeout(r, REDUCED ? Math.min(ms, 40) : ms));
const HOEK = { E: 0, S: 90, W: 180, N: 270 };

/** Beginstand van een level, in dezelfde vorm als de snapshots uit de simulatie. */
export function beginSnap(level) {
  if (level.type === "platform") return { x: 0, cellen: level.cellen, gepakt: [], gebeurtenis: "start", actie: -1 };
  return { x: level.start[0], y: level.start[1], dir: level.dir || "E", gepakt: [], gebeurtenis: "start", actie: -1 };
}

export function maakWereld(level) {
  return level.type === "platform" ? maakPlatform(level) : maakBord(level);
}

// ---------------------------------------------------------------------------
// Bord
// ---------------------------------------------------------------------------

function maakBord(level) {
  const C = 60;
  const W = level.w * C;
  const H = level.h * C;
  const toonRichting = level.laag === "bord";
  const houder = document.createElement("div");
  houder.className = "cb-wereld cb-wereld--bord";
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `Bord van ${level.w} bij ${level.h}` });
  svg.style.cssText = "width:100%;height:auto;display:block;border-radius:14px;background:#8fcb62";
  houder.appendChild(svg);

  for (let y = 0; y < level.h; y += 1) {
    for (let x = 0; x < level.w; x += 1) {
      svg.appendChild(el("rect", { x: x * C, y: y * C, width: C, height: C, fill: (x + y) % 2 ? "#9ad56b" : "#8cc85f" }));
    }
  }
  for (const [x, y] of level.muren) {
    const g = el("g");
    g.appendChild(el("rect", { x: x * C + 4, y: y * C + 4, width: C - 8, height: C - 8, rx: 10, fill: "#d79a4e", stroke: "#8a5a22", "stroke-width": 3 }));
    g.appendChild(el("rect", { x: x * C + 15, y: y * C + 15, width: C - 30, height: C - 30, rx: 6, fill: "#b9803d" }));
    g.appendChild(el("path", { d: `M${x * C + 12} ${y * C + 48} L${x * C + 48} ${y * C + 12}`, stroke: "#8a5a22", "stroke-width": 2, opacity: 0.35 }));
    svg.appendChild(g);
  }
  // doel
  const doel = el("g");
  doel.appendChild(el("circle", { cx: level.doel.x * C + C / 2, cy: level.doel.y * C + C / 2, r: 26, fill: "#fff8d6", stroke: "#e8b923", "stroke-width": 3 }));
  doel.appendChild(el("text", { x: level.doel.x * C + C / 2, y: level.doel.y * C + C / 2 + 1, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 34 }, "🏁"));
  svg.appendChild(doel);
  // sterren
  const sterEls = level.sterren.map((s) => {
    const t = el("text", { x: s.x * C + C / 2, y: s.y * C + C / 2 + 1, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 30 }, "⭐");
    t.style.transition = "opacity .25s, transform .25s";
    t.style.transformOrigin = `${s.x * C + C / 2}px ${s.y * C + C / 2}px`;
    svg.appendChild(t);
    return t;
  });
  // figuur
  const fig = el("g");
  const richtingEl = el("g");
  if (toonRichting) {
    richtingEl.appendChild(el("path", { d: "M25 0 L39 -9 L39 9 Z", fill: "#fff", stroke: "#e0533d", "stroke-width": 2.5, "stroke-linejoin": "round" }));
  }
  fig.append(richtingEl, el("text", { x: 0, y: 2, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 38 }, VOGEL));
  svg.appendChild(fig);
  let hoek = 0;

  const plaats = (x, y) => `translate(${x * C + C / 2}px, ${y * C + C / 2}px)`;
  function zetHoek(dir) {
    const doelHoek = HOEK[dir];
    const delta = ((((doelHoek - hoek) % 360) + 540) % 360) - 180;
    hoek += delta;
    richtingEl.style.transition = REDUCED ? "none" : "transform .25s ease";
    richtingEl.style.transform = `rotate(${hoek}deg)`;
  }
  function toonSterren(gepakt) {
    sterEls.forEach((t, i) => {
      const weg = gepakt.includes(i);
      t.style.opacity = weg ? "0" : "1";
      t.style.transform = weg ? "scale(1.8)" : "scale(1)";
    });
  }
  function toon(snap) {
    fig.style.transition = "none";
    fig.style.transform = plaats(snap.x, snap.y);
    hoek = HOEK[snap.dir || "E"];
    richtingEl.style.transition = "none";
    richtingEl.style.transform = `rotate(${hoek}deg)`;
    toonSterren(snap.gepakt || []);
  }

  async function speel(vorige, snap, ms) {
    const g = snap.gebeurtenis;
    if (g === "draai") {
      zetHoek(snap.dir);
      await wacht(ms * 0.8);
      return;
    }
    zetHoek(snap.dir);
    if (g === "stoot") {
      const dx = { E: 1, W: -1, N: 0, S: 0 }[snap.dir] * 14;
      const dy = { S: 1, N: -1, E: 0, W: 0 }[snap.dir] * 14;
      const van = plaats(snap.x, snap.y);
      const naar = `translate(${snap.x * C + C / 2 + dx}px, ${snap.y * C + C / 2 + dy}px)`;
      fig.animate([{ transform: van }, { transform: naar }, { transform: van }, { transform: naar }, { transform: van }], { duration: REDUCED ? 30 : 420 });
      await wacht(450);
      return;
    }
    fig.style.transition = REDUCED ? "none" : `transform ${Math.round(ms * 0.85)}ms ease-in-out`;
    fig.style.transform = plaats(snap.x, snap.y);
    await wacht(ms);
    toonSterren(snap.gepakt || []);
    if (g === "doel") {
      fig.animate([{ transform: plaats(snap.x, snap.y) }, { transform: `translate(${snap.x * C + C / 2}px, ${snap.y * C + C / 2 - 22}px)` }, { transform: plaats(snap.x, snap.y) }], { duration: REDUCED ? 30 : 500, iterations: 2 });
      await wacht(900);
    }
  }

  const start = beginSnap(level);
  toon(start);
  return { element: houder, toon, reset: () => toon(start), speel, volg() {} };
}

// ---------------------------------------------------------------------------
// Platform
// ---------------------------------------------------------------------------

function maakPlatform(level) {
  const C = 56;
  const n = level.cellen.length;
  const H = 230;
  const GROND = 150;
  const W = n * C;
  const houder = document.createElement("div");
  houder.className = "cb-wereld cb-wereld--platform";
  houder.style.cssText = "overflow-x:auto;border-radius:14px;";
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-label": "Platform met gaten, muren en vijanden" });
  svg.style.cssText = `display:block;min-width:100%;height:auto;max-height:${H}px;background:linear-gradient(#bfe6ff,#eaf7ff);`;
  houder.appendChild(svg);

  // achtergrond: heuvels en wolkjes
  for (let i = 0; i < Math.ceil(n / 5); i += 1) {
    svg.appendChild(el("ellipse", { cx: i * 5 * C + 120, cy: GROND + 10, rx: 120, ry: 60, fill: "#a5dc86", opacity: 0.55 }));
    svg.appendChild(el("text", { x: i * 5 * C + 60 + (i % 2) * 90, y: 50 + (i % 3) * 18, "font-size": 34, opacity: 0.85 }, "☁️"));
  }
  const celLaag = el("g");
  svg.appendChild(celLaag);
  const fig = el("g");
  fig.appendChild(el("text", { x: 0, y: -22, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 40 }, VOGEL));
  svg.appendChild(fig);
  const kogel = el("circle", { r: 7, fill: "#ff6b3d", stroke: "#fff", "stroke-width": 2, opacity: 0 });
  svg.appendChild(kogel);

  function tekenCellen(cellen) {
    celLaag.textContent = "";
    [...cellen].forEach((c, i) => {
      const x = i * C;
      if (c === "^") {
        celLaag.appendChild(el("rect", { x, y: GROND, width: C, height: H - GROND, fill: "#5b3a1e" }));
        celLaag.appendChild(el("path", { d: `M${x + 8} ${H} L${x + 18} ${H - 28} L${x + 28} ${H} L${x + 38} ${H - 28} L${x + 48} ${H}`, fill: "#7a7f8a", stroke: "#4b4f58", "stroke-width": 2 }));
        return;
      }
      celLaag.appendChild(el("rect", { x, y: GROND, width: C, height: H - GROND, fill: "#a0703c" }));
      celLaag.appendChild(el("rect", { x, y: GROND, width: C, height: 14, fill: "#6cc24a" }));
      celLaag.appendChild(el("rect", { x: x + 0.5, y: GROND, width: C - 1, height: H - GROND, fill: "none", stroke: "rgba(0,0,0,.12)" }));
      if (c === "=") {
        celLaag.appendChild(el("rect", { x: x + 2, y: GROND - 4, width: C - 4, height: 16, rx: 3, fill: "#d9a45b", stroke: "#8a5a22", "stroke-width": 2 }));
        celLaag.appendChild(el("path", { d: `M${x + 14} ${GROND - 4} V${GROND + 12} M${x + 28} ${GROND - 4} V${GROND + 12} M${x + 42} ${GROND - 4} V${GROND + 12}`, stroke: "#8a5a22", "stroke-width": 1.5, opacity: 0.6 }));
      } else if (c === "#") {
        celLaag.appendChild(el("rect", { x: x + 4, y: GROND - C + 6, width: C - 8, height: C - 6, rx: 8, fill: "#9aa3b2", stroke: "#5c6573", "stroke-width": 3 }));
        celLaag.appendChild(el("path", { d: `M${x + 14} ${GROND - 30} h14 M${x + 24} ${GROND - 16} h14`, stroke: "#5c6573", "stroke-width": 3, "stroke-linecap": "round" }));
      } else if (c === "E") {
        celLaag.appendChild(el("text", { x: x + C / 2, y: GROND - 24, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 40 }, "👾"));
      } else if (c === "*") {
        celLaag.appendChild(el("text", { x: x + C / 2, y: GROND - 46, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 30 }, "⭐"));
      } else if (c === "F") {
        celLaag.appendChild(el("line", { x1: x + C / 2 - 10, y1: GROND, x2: x + C / 2 - 10, y2: GROND - 74, stroke: "#6b4a2b", "stroke-width": 4 }));
        celLaag.appendChild(el("path", { d: `M${x + C / 2 - 8} ${GROND - 74} l30 12 l-30 14 z`, fill: "#e0533d" }));
      }
    });
  }

  const midden = (x) => x * C + C / 2;
  const plaats = (x, dy = 0) => `translate(${midden(x)}px, ${GROND + dy}px)`;
  function volg(x) {
    const zichtbaar = houder.clientWidth;
    if (!zichtbaar || W <= zichtbaar) return;
    const doelScroll = Math.max(0, Math.min(W - zichtbaar, midden(x) - zichtbaar / 2));
    houder.scrollTo({ left: doelScroll, behavior: REDUCED ? "auto" : "smooth" });
  }
  function toon(snap) {
    tekenCellen(snap.cellen);
    fig.style.transition = "none";
    fig.style.opacity = "1";
    fig.style.transform = plaats(snap.x);
    kogel.setAttribute("opacity", "0");
    houder.scrollLeft = 0;
  }

  async function schiet(x, raak) {
    kogel.setAttribute("cy", GROND - 30);
    kogel.setAttribute("cx", midden(x) + 22);
    kogel.setAttribute("opacity", "1");
    const afstand = raak ? C * 0.95 : C * 1.9;
    kogel.animate([{ transform: "translateX(0)" }, { transform: `translateX(${afstand}px)` }], { duration: REDUCED ? 30 : 320, fill: "forwards" });
    await wacht(340);
    kogel.setAttribute("opacity", "0");
    kogel.getAnimations().forEach((a) => a.cancel());
    if (raak) {
      const boem = el("text", { x: midden(x + 1), y: GROND - 30, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 44 }, "💥");
      svg.appendChild(boem);
      boem.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.6)" }], { duration: REDUCED ? 30 : 450, fill: "forwards" });
      await wacht(300);
      setTimeout(() => boem.remove(), 400);
    }
  }

  async function speel(vorige, snap, ms) {
    const g = snap.gebeurtenis;
    const x0 = vorige.x;
    if (g === "loop" || g === "spring" || g === "doel") {
      const springen = vorige.x !== snap.x && Math.abs(snap.x - x0) === 2;
      volg(snap.x);
      if (springen) {
        const van = plaats(x0);
        const naar = plaats(snap.x);
        const top = `translate(${(midden(x0) + midden(snap.x)) / 2}px, ${GROND - 78}px)`;
        fig.animate([{ transform: van }, { transform: top, offset: 0.5 }, { transform: naar }], { duration: REDUCED ? 30 : Math.round(ms * 1.1), easing: "ease-in-out" });
        fig.style.transition = "none";
        fig.style.transform = naar;
        await wacht(ms * 1.15);
      } else {
        fig.style.transition = REDUCED ? "none" : `transform ${Math.round(ms * 0.85)}ms ease-in-out`;
        fig.style.transform = plaats(snap.x);
        await wacht(ms);
      }
      tekenCellen(snap.cellen);
      if (g === "doel") {
        fig.animate([{ transform: plaats(snap.x) }, { transform: plaats(snap.x, -34) }, { transform: plaats(snap.x) }], { duration: REDUCED ? 30 : 500, iterations: 2 });
        await wacht(900);
      }
      return;
    }
    if (g === "schiet-raak" || g === "schiet-mis") {
      await schiet(snap.x, g === "schiet-raak");
      tekenCellen(snap.cellen);
      await wacht(ms * 0.3);
      return;
    }
    if (g === "bouw" || g === "bouw-mis") {
      if (g === "bouw") {
        tekenCellen(snap.cellen);
        celLaag.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: REDUCED ? 30 : 300 });
      }
      await wacht(ms);
      return;
    }
    if (g === "val" || g === "stoot") {
      const naar = snap.naar ?? snap.x + 1;
      if (g === "val") {
        fig.style.transition = REDUCED ? "none" : `transform ${Math.round(ms * 0.6)}ms ease-in`;
        fig.style.transform = plaats(naar);
        await wacht(ms * 0.65);
        fig.style.transition = REDUCED ? "none" : "transform .5s ease-in, opacity .5s";
        fig.style.transform = plaats(naar, 130);
        fig.style.opacity = "0";
        await wacht(600);
      } else {
        const van = plaats(snap.x);
        const stoot = plaats(snap.x, 0).replace(/translate\(([\d.]+)px/, (_, a) => `translate(${Number(a) + 16}px`);
        fig.animate([{ transform: van }, { transform: stoot }, { transform: van }, { transform: stoot }, { transform: van }], { duration: REDUCED ? 30 : 420 });
        await wacht(450);
      }
      return;
    }
    await wacht(ms * 0.5);
  }

  const start = beginSnap(level);
  toon(start);
  return { element: houder, toon, reset: () => toon(start), speel, volg };
}
