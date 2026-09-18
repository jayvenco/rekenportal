// utils/eindeAnimatie.js
// -----------------------------------------------------------------------------
// Full-screen animatie voor 100% score: bliksem + schermtrilling.
// -----------------------------------------------------------------------------

/**
 * Toont een spectaculaire full-screen animatie bij 100% score.
 * - Scherm trilt
 * - Bliksemflits
 * - Goudglow over de hele pagina
 */
export function toonPerfecteScoreAnimatie() {
  // Overlay voor donker/licht effect
  const overlay = document.createElement("div");
  overlay.className = "perfect-overlay";
  overlay.innerHTML = `
    <div class="perfect-overlay__bliksem"></div>
    <div class="perfect-overlay__gloed"></div>
  `;
  document.body.appendChild(overlay);

  // Forceer reflow + start animatie
  void overlay.offsetWidth;
  overlay.classList.add("perfect-overlay--actief");

  // Schud de hele pagina
  document.body.classList.add("perfect-schud");

  // Na 1.5s alles opruimen
  setTimeout(() => {
    document.body.classList.remove("perfect-schud");
    overlay.classList.remove("perfect-overlay--actief");
    setTimeout(() => overlay.remove(), 400);
  }, 1500);
}