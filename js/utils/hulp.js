// utils/hulp.js
// -----------------------------------------------------------------------------
// "Hulp"-knop voor elk oefenscherm. Opent een venster met uitleg, een visueel
// voorbeeld en tips voor de gekozen oefening. De inhoud staat per oefening-id in
// utils/hulpInhoud.js; oefeningen zonder inhoud krijgen geen knop.
// -----------------------------------------------------------------------------

import { heeftHulp, bouwHulpInhoud } from "./hulpInhoud.js";

function voegStijlToe() {
  if (document.getElementById("hulp-stijl")) return;
  const s = document.createElement("style");
  s.id = "hulp-stijl";
  s.textContent = `
  .hulp-knop{position:fixed;left:14px;bottom:14px;z-index:900;background:#fff;border:3px solid #e8913a;color:#9a5410;font-weight:800;font-size:1rem;border-radius:999px;padding:10px 18px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.2)}
  .hulp-knop:hover{background:#fff4e4}
  .hulp-knop:focus-visible{outline:3px solid #2f6fb5}
  .hulp-overlay{position:fixed;inset:0;background:rgba(20,30,50,.55);z-index:10000;display:flex;align-items:center;justify-content:center;padding:12px}
  .hulp-venster{background:#fffdf7;border-radius:20px;max-width:760px;width:100%;max-height:92vh;overflow:auto;padding:18px 22px 22px;box-shadow:0 20px 60px rgba(0,0,0,.35)}
  .hulp-kop{display:flex;justify-content:space-between;align-items:center;gap:10px;position:sticky;top:-18px;background:#fffdf7;padding:6px 0;z-index:1}
  .hulp-kop h2{margin:0;font-size:1.5rem;color:#2f6fb5}
  .hulp-sluit{background:#2f6fb5;color:#fff;border:0;border-radius:12px;font-weight:800;font-size:1rem;padding:8px 16px;cursor:pointer}
  .hulp-sectie{margin:16px 0}
  .hulp-sectie h3{margin:0 0 6px;font-size:1.15rem;color:#9a5410}
  .hulp-stappen{margin:0;padding-left:22px;font-size:1.08rem;line-height:1.55}
  .hulp-stappen li{margin:4px 0}
  .hulp-voorbeeld{background:#fff;border:2px solid #d9e2ec;border-radius:14px;padding:12px 14px;margin:10px 0}
  .hulp-voorbeeld h4{margin:0 0 6px;font-size:1.05rem}
  .hulp-voorbeeld p{margin:6px 0;font-size:1.05rem;line-height:1.5}
  .hulp-visual{display:flex;justify-content:center;overflow-x:auto;margin:6px 0}
  .hulp-visual svg{max-width:100%;height:auto}
  .hulp-tips{background:#fff7e0;border-left:6px solid #e8913a;border-radius:10px;padding:10px 14px 10px 34px;font-size:1.05rem;line-height:1.5;margin:0}
  .hulp-tips li{margin:4px 0}
  .hulp-tabel{border-collapse:collapse;margin:6px auto}
  .hulp-tabel th{background:#2f6fb5;color:#fff;padding:6px 12px}
  .hulp-tabel td{border:1px solid #d9e2ec;padding:6px 12px;text-align:center}
  `;
  document.head.appendChild(s);
}

function sluitVenster() {
  document.querySelector(".hulp-overlay")?.remove();
  document.removeEventListener("keydown", opToets);
}

function opToets(e) {
  if (e.key === "Escape") sluitVenster();
}

/** Opent het hulpvenster voor een oefening. */
export function toonHulp(exerciseId) {
  voegStijlToe();
  sluitVenster();
  const inhoud = bouwHulpInhoud(exerciseId);
  if (!inhoud) return;

  const overlay = document.createElement("div");
  overlay.className = "hulp-overlay";
  overlay.addEventListener("click", (e) => { if (e.target === overlay) sluitVenster(); });
  const venster = document.createElement("div");
  venster.className = "hulp-venster";
  venster.setAttribute("role", "dialog");
  venster.setAttribute("aria-modal", "true");
  venster.setAttribute("aria-label", `Hulp: ${inhoud.titel}`);

  const kop = document.createElement("div");
  kop.className = "hulp-kop";
  const titel = document.createElement("h2");
  titel.textContent = `❓ Hulp: ${inhoud.titel}`;
  const sluit = document.createElement("button");
  sluit.type = "button";
  sluit.className = "hulp-sluit";
  sluit.textContent = "Sluiten";
  sluit.addEventListener("click", sluitVenster);
  kop.append(titel, sluit);
  venster.appendChild(kop);

  if (inhoud.intro) {
    const p = document.createElement("p");
    p.style.cssText = "font-size:1.1rem;margin:8px 0";
    p.textContent = inhoud.intro;
    venster.appendChild(p);
  }

  if (inhoud.stappen?.length) {
    const sec = document.createElement("div");
    sec.className = "hulp-sectie";
    sec.innerHTML = "<h3>📋 Zo werkt het</h3>";
    const ol = document.createElement("ol");
    ol.className = "hulp-stappen";
    for (const st of inhoud.stappen) {
      const li = document.createElement("li");
      li.innerHTML = st;
      ol.appendChild(li);
    }
    sec.appendChild(ol);
    venster.appendChild(sec);
  }

  if (inhoud.voorbeelden?.length) {
    const sec = document.createElement("div");
    sec.className = "hulp-sectie";
    sec.innerHTML = "<h3>👀 Voorbeeld</h3>";
    for (const v of inhoud.voorbeelden) {
      const kaart = document.createElement("div");
      kaart.className = "hulp-voorbeeld";
      if (v.kop) {
        const h4 = document.createElement("h4");
        h4.textContent = v.kop;
        kaart.appendChild(h4);
      }
      if (v.tekst) {
        const p = document.createElement("p");
        p.innerHTML = v.tekst;
        kaart.appendChild(p);
      }
      if (v.visual) {
        const vis = document.createElement("div");
        vis.className = "hulp-visual";
        vis.appendChild(v.visual);
        kaart.appendChild(vis);
      }
      if (v.na) {
        const p = document.createElement("p");
        p.innerHTML = v.na;
        kaart.appendChild(p);
      }
      sec.appendChild(kaart);
    }
    venster.appendChild(sec);
  }

  if (inhoud.tips?.length) {
    const sec = document.createElement("div");
    sec.className = "hulp-sectie";
    sec.innerHTML = "<h3>💡 Tips</h3>";
    const ul = document.createElement("ul");
    ul.className = "hulp-tips";
    for (const t of inhoud.tips) {
      const li = document.createElement("li");
      li.innerHTML = t;
      ul.appendChild(li);
    }
    sec.appendChild(ul);
    venster.appendChild(sec);
  }

  overlay.appendChild(venster);
  document.body.appendChild(overlay);
  document.addEventListener("keydown", opToets);
  sluit.focus();
}

/**
 * Maakt de zwevende Hulp-knop voor een oefening, of null als er geen hulp is.
 * @param {string} exerciseId
 */
export function maakHulpKnop(exerciseId) {
  if (!heeftHulp(exerciseId)) return null;
  voegStijlToe();
  const knop = document.createElement("button");
  knop.type = "button";
  knop.className = "hulp-knop";
  knop.textContent = "❓ Hulp";
  knop.setAttribute("aria-label", "Hulp: uitleg, voorbeeld en tips");
  knop.addEventListener("click", () => toonHulp(exerciseId));
  return knop;
}
