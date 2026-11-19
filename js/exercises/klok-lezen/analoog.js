// exercises/klok-lezen/analoog.js
// -----------------------------------------------------------------------------
// De grote analoge klok van "Klok lezen" (SVG).
//  - 12 grote cijfers voor de uren, een streepje voor elke minuut, een groter
//    streepje en een klein cijfer (5, 10, ... 60) voor elke 5 minuten;
//  - kleur voor het hele uur (12), kwart over (3), half (6) en kwart voor (9);
//  - korte wijzer (uren) en lange wijzer (minuten) die je zelf kunt slepen;
//  - optioneel een gekleurde "taart" die laat zien hoeveel minuten voorbij zijn.
// -----------------------------------------------------------------------------

import { hoeken, hoekVanPunt, sleepMinuutwijzer, sleepUurwijzer, minuutVan, uurVan, normaliseer } from "./tijd.js";

const NS = "http://www.w3.org/2000/svg";
const M = 320; // midden
const MAAT = 640;

export const KLEUREN = {
  uur: "#e0533d", // 12: heel uur
  kwartOver: "#2e9e6b", // 3: kwart over
  half: "#2f6fb5", // 6: half
  kwartVoor: "#e8913a", // 9: kwart voor
};
const PASTEL = { 12: "#fde2dc", 3: "#d8f2e4", 6: "#d9e8f8", 9: "#fdebd3" };
const KLEUR_BIJ_CIJFER = { 12: KLEUREN.uur, 3: KLEUREN.kwartOver, 6: KLEUREN.half, 9: KLEUREN.kwartVoor };

function el(naam, attrs = {}, tekst) {
  const e = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (tekst !== undefined) e.textContent = tekst;
  return e;
}

const polair = (r, graden) => {
  const a = (graden * Math.PI) / 180;
  return { x: M + r * Math.sin(a), y: M - r * Math.cos(a) };
};

/**
 * @param {ReturnType<import("./tijd.js").maakKlokStore>} store
 * @param {{hulpteksten?:boolean, taart?:boolean, magneet?:boolean, opSleepStart?:Function}} opties
 */
export function maakAnalogeKlok(store, opties = {}) {
  const staat = { hulpteksten: opties.hulpteksten ?? true, taart: opties.taart ?? true, magneet: opties.magneet ?? false };

  const houder = document.createElement("div");
  houder.className = "kl-analoog";
  const svg = el("svg", { viewBox: `0 0 ${MAAT} ${MAAT}`, role: "group", "aria-label": "Analoge klok met een korte en een lange wijzer" });
  svg.style.cssText = "width:100%;height:auto;display:block;touch-action:none;user-select:none;-webkit-user-select:none";
  houder.appendChild(svg);

  // --- rand en wijzerplaat -----------------------------------------------------
  svg.appendChild(el("circle", { cx: M, cy: M, r: 316, fill: "#34445e" }));
  svg.appendChild(el("circle", { cx: M, cy: M, r: 304, fill: "#fffdf7", stroke: "#1f2b40", "stroke-width": 3 }));

  // taart (komt onder de streepjes en cijfers)
  const taart = el("path", { d: "", fill: "rgba(47,111,181,.20)", stroke: "rgba(47,111,181,.35)", "stroke-width": 2 });
  svg.appendChild(taart);
  const taartLabel = el("text", { x: M, y: M, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 26, "font-weight": 800, fill: "#1f4f8a", "paint-order": "stroke", stroke: "#fffdf7", "stroke-width": 6 });
  svg.appendChild(taartLabel);

  // --- streepjes en minuutcijfers ---------------------------------------------
  for (let i = 0; i < 60; i += 1) {
    const hoek = i * 6;
    const vijf = i % 5 === 0;
    const kwart = i % 15 === 0;
    const r1 = kwart ? 246 : vijf ? 254 : 266;
    const kleur = kwart ? { 0: KLEUREN.uur, 15: KLEUREN.kwartOver, 30: KLEUREN.half, 45: KLEUREN.kwartVoor }[i] : vijf ? "#34445e" : "#8a97a8";
    const a = polair(r1, hoek);
    const b = polair(282, hoek);
    svg.appendChild(el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: kleur, "stroke-width": kwart ? 9 : vijf ? 6 : 2.5, "stroke-linecap": "round" }));
  }
  for (let k = 1; k <= 12; k += 1) {
    const p = polair(228, k * 30);
    svg.appendChild(el("text", { x: p.x, y: p.y, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 21, "font-weight": 800, fill: KLEUR_BIJ_CIJFER[k] || "#5b6676" }, String(k * 5)));
  }

  // --- uurcijfers --------------------------------------------------------------
  for (let k = 1; k <= 12; k += 1) {
    const p = polair(178, k * 30);
    if (PASTEL[k]) svg.appendChild(el("circle", { cx: p.x, cy: p.y, r: 38, fill: PASTEL[k], stroke: KLEUR_BIJ_CIJFER[k], "stroke-width": 3 }));
    svg.appendChild(el("text", { x: p.x, y: p.y + 2, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 56, "font-weight": 900, fill: "#1f2937" }, String(k)));
  }

  // --- hulpteksten in het midden ----------------------------------------------
  const hulp = el("g", { "aria-hidden": "true" });
  [["uur", 12, KLEUREN.uur, 86], ["kwart over", 3, KLEUREN.kwartOver, 84], ["half", 6, KLEUREN.half, 86], ["kwart voor", 9, KLEUREN.kwartVoor, 84]].forEach(([tekst, cijfer, kleur, r]) => {
    const p = polair(r, cijfer * 30);
    hulp.appendChild(el("text", { x: p.x, y: p.y, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 17, "font-weight": 800, fill: kleur }, tekst));
  });
  svg.appendChild(hulp);

  // pulserende markering (voor animaties)
  const markering = el("circle", { cx: M, cy: M, r: 30, fill: "none", stroke: "#ffbf1f", "stroke-width": 8, opacity: 0 });
  svg.appendChild(markering);

  // --- wijzers -----------------------------------------------------------------
  const uurGroep = el("g", { tabindex: 0, role: "slider", "aria-label": "Korte wijzer (uren)", "aria-valuemin": 1, "aria-valuemax": 12, "data-wijzer": "uur" });
  uurGroep.style.cursor = "grab";
  uurGroep.appendChild(el("path", { d: `M ${M - 11} ${M + 30} L ${M - 15} ${M - 20} L ${M} ${M - 150} L ${M + 15} ${M - 20} L ${M + 11} ${M + 30} Z`, fill: KLEUREN.uur, stroke: "#9b2f1f", "stroke-width": 2.5, "stroke-linejoin": "round" }));
  uurGroep.appendChild(el("circle", { cx: M, cy: M - 150, r: 17, fill: "rgba(224,83,61,.25)", stroke: KLEUREN.uur, "stroke-width": 3 }));
  uurGroep.appendChild(el("line", { x1: M, y1: M, x2: M, y2: M - 175, stroke: "transparent", "stroke-width": 52, "stroke-linecap": "round" }));
  uurGroep.querySelector("line").setAttribute("y2", String(M - 175));
  svg.appendChild(uurGroep);

  const minuutGroep = el("g", { tabindex: 0, role: "slider", "aria-label": "Lange wijzer (minuten)", "aria-valuemin": 0, "aria-valuemax": 59, "data-wijzer": "minuut" });
  minuutGroep.style.cursor = "grab";
  minuutGroep.appendChild(el("path", { d: `M ${M - 7} ${M + 40} L ${M - 8} ${M - 20} L ${M} ${M - 250} L ${M + 8} ${M - 20} L ${M + 7} ${M + 40} Z`, fill: KLEUREN.half, stroke: "#1f4f8a", "stroke-width": 2.5, "stroke-linejoin": "round" }));
  minuutGroep.appendChild(el("circle", { cx: M, cy: M - 250, r: 15, fill: "rgba(47,111,181,.25)", stroke: KLEUREN.half, "stroke-width": 3 }));
  // alleen het buitenste stuk van de lange wijzer is grijpbaar, zodat de korte wijzer er nooit onder verdwijnt
  minuutGroep.appendChild(el("line", { x1: M, y1: M - 170, x2: M, y2: M - 262, stroke: "transparent", "stroke-width": 46, "stroke-linecap": "round" }));
  svg.appendChild(minuutGroep);

  svg.appendChild(el("circle", { cx: M, cy: M, r: 15, fill: "#1f2b40", stroke: "#fffdf7", "stroke-width": 4, "pointer-events": "none" }));

  // --- tekenen -----------------------------------------------------------------
  function teken(tFloat) {
    const h = hoeken(tFloat);
    uurGroep.setAttribute("transform", `rotate(${h.uur} ${M} ${M})`);
    minuutGroep.setAttribute("transform", `rotate(${h.minuut} ${M} ${M})`);
    const m = Math.round(h.minuut / 6) % 60;
    if (staat.taart && h.minuut > 0.5) {
      const r = 240;
      const eind = polair(r, h.minuut);
      const groot = h.minuut > 180 ? 1 : 0;
      taart.setAttribute("d", `M ${M} ${M} L ${M} ${M - r} A ${r} ${r} 0 ${groot} 1 ${eind.x} ${eind.y} Z`);
      // vaste, vrije plek vlak naast de 12 (de hulpteksten staan op 3, 6 en 9)
      const mid = polair(116, 24);
      taartLabel.setAttribute("x", String(mid.x));
      taartLabel.setAttribute("y", String(mid.y));
      taartLabel.textContent = `${m} min`;
      taartLabel.style.display = h.minuut > 48 ? "" : "none";
    } else {
      taart.setAttribute("d", "");
      taartLabel.textContent = "";
    }
    const t = Math.floor(((tFloat % 1440) + 1440) % 1440);
    uurGroep.setAttribute("aria-valuenow", String(uurVan(t) % 12 || 12));
    minuutGroep.setAttribute("aria-valuenow", String(minuutVan(t)));
    uurGroep.setAttribute("aria-valuetext", `${uurVan(t) % 12 || 12} uur`);
    minuutGroep.setAttribute("aria-valuetext", `${minuutVan(t)} minuten`);
  }
  hulp.style.display = staat.hulpteksten ? "" : "none";

  const stopAbonnement = store.abonneer((t, bron, tFloat) => teken(tFloat ?? t));
  teken(store.get());

  // --- slepen --------------------------------------------------------------------
  let sleep = null;
  function puntInSvg(e) {
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * MAAT, y: ((e.clientY - r.top) / r.height) * MAAT };
  }
  svg.addEventListener("pointerdown", (e) => {
    const g = e.target.closest("[data-wijzer]");
    if (!g) return;
    opties.opSleepStart?.();
    sleep = g.dataset.wijzer;
    svg.setPointerCapture(e.pointerId);
    g.style.cursor = "grabbing";
    e.preventDefault();
  });
  svg.addEventListener("pointermove", (e) => {
    if (!sleep) return;
    const p = puntInSvg(e);
    const hoek = hoekVanPunt(p.x - M, p.y - M);
    if (sleep === "minuut") {
      let minuut = Math.round(hoek / 6) % 60;
      if (staat.magneet) minuut = (Math.round(minuut / 5) * 5) % 60;
      store.zet(sleepMinuutwijzer(store.get(), minuut), "analoog");
    } else {
      store.zet(sleepUurwijzer(store.get(), hoek), "analoog");
    }
  });
  const einde = () => {
    sleep = null;
    uurGroep.style.cursor = minuutGroep.style.cursor = "grab";
  };
  svg.addEventListener("pointerup", einde);
  svg.addEventListener("pointercancel", einde);

  // toetsenbord: pijltjes
  svg.addEventListener("keydown", (e) => {
    const g = e.target.closest?.("[data-wijzer]");
    if (!g) return;
    const richting = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
    if (!richting) return;
    e.preventDefault();
    opties.opSleepStart?.();
    const t = store.get();
    if (g.dataset.wijzer === "minuut") store.zet(t + richting * (e.shiftKey ? 5 : 1), "analoog");
    else store.zet(t + richting * 60, "analoog");
  });

  return {
    element: houder,
    zetHulpteksten(waar) {
      staat.hulpteksten = waar;
      hulp.style.display = waar ? "" : "none";
    },
    zetTaart(waar) {
      staat.taart = waar;
      teken(store.get());
    },
    zetMagneet(waar) {
      staat.magneet = waar;
    },
    /** Laat een ring oplichten op een minuutstand (0, 15, 30, 45...). */
    markeer(minuut, kleur = "#ffbf1f") {
      const p = polair(264, minuut * 6);
      markering.setAttribute("cx", String(p.x));
      markering.setAttribute("cy", String(p.y));
      markering.setAttribute("stroke", kleur);
      markering.setAttribute("r", "26");
      markering.animate([{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.4)" }], { duration: 1100, easing: "ease-out" });
      markering.style.transformOrigin = `${p.x}px ${p.y}px`;
    },
    ruimOp() {
      stopAbonnement();
    },
  };
}

export { normaliseer };
