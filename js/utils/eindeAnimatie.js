// utils/eindeAnimatie.js
// -----------------------------------------------------------------------------
// Full-screen animatie voor 100% score: CSS vuurwerk (2 sec).
// -----------------------------------------------------------------------------

const KLEUREN = ["#ff4d4d", "#ffd83d", "#38b26a", "#4f8fe8", "#9b5de5", "#ff6b8a", "#ff9f43"];

/**
 * Toont CSS-vuurwerk bij 100% score — 2 sec, geen JS-interval.
 */
export function toonPerfecteScoreAnimatie() {
  const overlay = document.createElement("div");
  overlay.className = "perfect-overlay";
  overlay.innerHTML = `<div class="perfect-overlay__vuurwerk"></div>`;
  document.body.appendChild(overlay);
  void overlay.offsetWidth;

  // Genereer 30 vuurwerkdeeltjes met CSS-vars voor random kleur/richting
  const bak = overlay.querySelector(".perfect-overlay__vuurwerk");
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("span");
    const hoek = (i / 30) * 360 + (Math.random() - 0.5) * 20;
    const afstand = 80 + Math.random() * 140;
    const kleur = KLEUREN[Math.floor(Math.random() * KLEUREN.length)];
    const vertraging = (Math.random() * 0.6).toFixed(2);
    const grootte = 6 + Math.random() * 10;
    p.className = "perfect-overlay__vonk";
    p.style.cssText = `
      --hoek: ${hoek}deg;
      --afstand: ${afstand}px;
      --kleur: ${kleur};
      --grootte: ${grootte}px;
      animation-delay: ${vertraging}s;
    `;
    bak.appendChild(p);
  }

  setTimeout(() => {
    overlay.classList.add("perfect-overlay--uit");
    setTimeout(() => overlay.remove(), 500);
  }, 2400);
}