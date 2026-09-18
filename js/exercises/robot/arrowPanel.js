// exercises/robot/arrowPanel.js
// -----------------------------------------------------------------------------
// Paneel met pijlknoppen (⬆ ⬇ ⬅ ➡), commandolijst en
// START ▶ / RESET 🔄 / CLEAR 🗑 knoppen.
// Commando's worden opgeslagen als ['UP','LEFT','DOWN',...] via callback.
// -----------------------------------------------------------------------------

const RICHTING_NAAR_LABEL = {
  UP: "⬆",
  DOWN: "⬇",
  LEFT: "⬅",
  RIGHT: "➡",
};

/**
 * Bouwt het pijlenpaneel in `container`.
 * @param {HTMLElement} container
 * @param {Object} callbacks
 * @param {(commands: string[]) => void} callbacks.onStart  — start-knop ingedrukt
 * @param {() => void} callbacks.onReset                    — reset de robotpositie
 * @param {() => void} callbacks.onClear                    — wis alle commando's
 * @returns {{ voegToe: (richting: string) => void, wis: () => void, setStartEnabled: (en: boolean) => void }}
 */
export function renderArrowPanel(container, { onStart, onReset, onClear }) {
  container.innerHTML = "";

  const commands = []; // string[] — 'UP', 'DOWN', 'LEFT', 'RIGHT'

  // ── Paneel-wrapper ──────────────────────────────────────────────────────
  const paneel = document.createElement("div");
  paneel.className = "arrow-panel";
  container.appendChild(paneel);

  // ── Pijlknoppen (2×2 grid) ──────────────────────────────────────────────
  const knoppenGrid = document.createElement("div");
  knoppenGrid.className = "arrow-panel__knoppen";
  paneel.appendChild(knoppenGrid);

  const richtingen = [
    { label: "⬆", richting: "UP", col: 2, row: 1 },
    { label: "⬅", richting: "LEFT", col: 1, row: 2 },
    { label: "⬇", richting: "DOWN", col: 2, row: 3 },
    { label: "➡", richting: "RIGHT", col: 3, row: 2 },
  ];

  // Vul een 3×3 grid, centreer de 4 pijlen.
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= 3; c++) {
      const match = richtingen.find((d) => d.row === r && d.col === c);
      if (match) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "arrow-panel__knop";
        btn.textContent = match.label;
        btn.addEventListener("click", () => voegCommandoToe(match.richting));
        knoppenGrid.appendChild(btn);
      } else {
        // lege opvulplek in het grid
        const leeg = document.createElement("div");
        knoppenGrid.appendChild(leeg);
      }
    }
  }

  // ── Actieknoppen (START / RESET / CLEAR) ────────────────────────────────
  const actiesRij = document.createElement("div");
  actiesRij.className = "arrow-panel__acties";
  paneel.appendChild(actiesRij);

  const startBtn = document.createElement("button");
  startBtn.type = "button";
  startBtn.className = "arrow-panel__actie arrow-panel__actie--start";
  startBtn.textContent = "▶ START";
  startBtn.addEventListener("click", () => {
    if (commands.length > 0) onStart([...commands]);
  });

  const resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.className = "arrow-panel__actie arrow-panel__actie--reset";
  resetBtn.textContent = "🔄 RESET";
  resetBtn.addEventListener("click", () => {
    onReset();
  });

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "arrow-panel__actie arrow-panel__actie--clear";
  clearBtn.textContent = "🗑 CLEAR";
  clearBtn.addEventListener("click", wisCommandoLijst);

  actiesRij.append(startBtn, resetBtn, clearBtn);

  // ── Commandolijst ───────────────────────────────────────────────────────
  const lijstWrapper = document.createElement("div");
  lijstWrapper.className = "arrow-panel__lijst";
  paneel.appendChild(lijstWrapper);

  const lijstTitel = document.createElement("div");
  lijstTitel.className = "arrow-panel__lijst-titel";
  lijstTitel.textContent = "Commando's:";
  lijstWrapper.appendChild(lijstTitel);

  const lijst = document.createElement("div");
  lijst.className = "arrow-panel__lijst-items";
  lijstWrapper.appendChild(lijst);

  let volgnummer = 0;

  /** Hertekent de commandolijst op basis van de array */
  function hertekenLijst() {
    lijst.innerHTML = "";
    commands.forEach((richting, i) => {
      const item = document.createElement("div");
      item.className = "arrow-panel__lijst-item";
      item.textContent = `${i + 1}. ${RICHTING_NAAR_LABEL[richting] || richting}`;
      lijst.appendChild(item);
    });
  }

  /** Voegt een commando toe en werkt de lijst bij */
  function voegCommandoToe(richting) {
    commands.push(richting);
    hertekenLijst();
  }

  /** Wist alle commando's */
  function wisCommandoLijst() {
    commands.length = 0;
    hertekenLijst();
    onClear();
  }

  // Exposed helpers
  return {
    voegToe: voegCommandoToe,
    wis: wisCommandoLijst,
    setStartEnabled(en) {
      startBtn.disabled = !en;
    },
  };
}