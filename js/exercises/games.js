// exercises/games.js
// -----------------------------------------------------------------------------
// Game entries voor de "Games" categorie.
// Elk spel is een externe HTML-pagina die via iframe wordt geladen.
// -----------------------------------------------------------------------------

/**
 * Maakt een mount-functie die een iframe laadt met het spel.
 * @param {string} url - pad naar de game index.html
 * @param {boolean} [volleScherm] - of het iframe de volle breedte moet vullen
 * @returns {Function} mount(container, settings)
 */
function gameMount(url, volleScherm = true) {
  return async (container, settings) => {
    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.style.cssText = "width:100%;" + (volleScherm ? "min-height:70vh;" : "");

    const terug = document.createElement("a");
    terug.className = "knop knop--zacht";
    terug.href = "#/";
    terug.textContent = "← Terug naar het menu";
    terug.style.cssText = "display:inline-block;margin-bottom:12px;";
    wrap.appendChild(terug);

    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.cssText = "width:100%;height:80vh;border:none;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);";
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups");
    wrap.appendChild(iframe);
    container.appendChild(wrap);
  };
}

export const SPELEN = [
  {
    id: "aetherwing",
    titel: "Aetherwing",
    omschrijving: "Ruimtegevecht game",
    icoonSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#1a1a2e" stroke="#e94560" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="28">🚀</text></svg>`,
    kleurthema: "#1a1a2e",
    mount: gameMount("games/aetherwing/index.html"),
  },
  {
    id: "flappy",
    titel: "Flappy Bird",
    omschrijving: "Vlieg door de obstakels",
    icoonSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#fef9c3" stroke="#f59e0b" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="28">🐦</text></svg>`,
    kleurthema: "#f59e0b",
    mount: gameMount("games/flappy/index.html"),
  },
  {
    id: "chess",
    titel: "Schaken",
    omschrijving: "Speel een potje schaak",
    icoonSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#e2e8f0" stroke="#64748b" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="28">♟️</text></svg>`,
    kleurthema: "#64748b",
    mount: gameMount("games/chess/index.html"),
  },
  {
    id: "tower-blocks",
    titel: "Toren Blokken",
    omschrijving: "Stapel de blokken zo hoog mogelijk",
    icoonSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#fef9c3" stroke="#d97706" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="28">🧱</text></svg>`,
    kleurthema: "#d97706",
    mount: gameMount("games/tower-blocks/index.html"),
  },
  {
    id: "minesweeper",
    titel: "Mijnenveger",
    omschrijving: "Vind alle mijnen zonder te ontploffen",
    icoonSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#fef2f2" stroke="#dc2626" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="28">💣</text></svg>`,
    kleurthema: "#dc2626",
    mount: gameMount("games/minesweeper/index.html"),
  },
  {
    id: "tilting-maze",
    titel: "Doolhof",
    omschrijving: "Kantel het bord om de bal te laten rollen",
    icoonSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#e0f2fe" stroke="#0284c7" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="28">🌀</text></svg>`,
    kleurthema: "#0284c7",
    mount: gameMount("games/tilting-maze/index.html"),
  },
  {
    id: "asteroids",
    titel: "Asteroids",
    omschrijving: "Vernietig asteroïden in de ruimte",
    icoonSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#1a1a2e" stroke="#0f766e" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="28">☄️</text></svg>`,
    kleurthema: "#0f766e",
    mount: gameMount("games/asteroids/index.html"),
  },
  {
    id: "mahjong",
    titel: "Mahjong",
    omschrijving: "Koppel dezelfde stenen aan elkaar",
    icoonSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#fef9c3" stroke="#ca8a04" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="28">🀄</text></svg>`,
    kleurthema: "#ca8a04",
    mount: gameMount("games/mahjong/index.html"),
  },
  {
    id: "frogger",
    titel: "Frogger",
    omschrijving: "Help de kikker de overkant bereiken",
    icoonSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#dcfce7" stroke="#16a34a" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-size="28">🐸</text></svg>`,
    kleurthema: "#16a34a",
    mount: gameMount("games/frogger/index.html"),
  },
];