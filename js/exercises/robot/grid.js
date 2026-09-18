// exercises/robot/grid.js
// -----------------------------------------------------------------------------
// 8×8 CSS-grid component: tekent het speelveld met robot 🏆 🧱 🪙
// Exporteert renderGrid, updateRobot, animateCoin.
// -----------------------------------------------------------------------------

const GRID_SIZE = 8;

/** Map van entiteit naar emoji/tekst */
const ENTITY_CHAR = {
  robot: "🤖",
  target: "🏆",
  obstacle: "🧱",
  coin: "🪙",
};

/** bouwt een leeg grid van 8×8 div's */
function maakGridCellen(container) {
  const cellen = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const rij = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      const div = document.createElement("div");
      div.className = "robot-grid__cel";
      div.dataset.row = r;
      div.dataset.col = c;
      container.appendChild(div);
      rij.push(div);
    }
  }
  return cellen;
}

/** Geef een referentie naar een cel in de [row][col] matrix */
function cel(cellen, row, col) {
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null;
  return cellen[row][col];
}

/** Wis de entiteit-klassen van een cel (behalve pending-highlight) */
function wisCel(celDiv) {
  if (!celDiv) return;
  celDiv.classList.remove(
    "robot-grid__cel--robot",
    "robot-grid__cel--target",
    "robot-grid__cel--obstacle",
    "robot-grid__cel--coin",
    "robot-grid__cel--robot-pending"
  );
  celDiv.textContent = "";
}

/** Zet de entiteit op een cel */
function zetEntiteit(celDiv, entiteit, isPending) {
  if (!celDiv) return;
  const cls = `robot-grid__cel--${entiteit}`;
  celDiv.classList.add(cls);
  celDiv.textContent = ENTITY_CHAR[entiteit] || "";
  if (isPending) {
    celDiv.classList.add("robot-grid__cel--robot-pending");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported functies
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tekent het volledige 8×8 grid in `container`.
 * @param {HTMLElement} container
 * @param {Object} state
 * @param {{ row:number, col:number }} state.robot   — positie van 🤖
 * @param {boolean} state.pending                   — of de robot een commando uitvoert
 * @param {Array<{row:number, col:number}>} state.obstacles
 * @param {Array<{row:number, col:number}>} state.coins
 * @param {{ row:number, col:number }} state.target
 * @returns {{ gridCellen: HTMLElement[][], updateRobot: Function, animateCoin: Function }}
 */
export function renderGrid(container, state) {
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "robot-grid";
  container.appendChild(grid);

  const cellen = maakGridCellen(grid);

  // Obstakels
  for (const o of state.obstacles || []) {
    zetEntiteit(cel(cellen, o.row, o.col), "obstacle", false);
  }

  // Munten
  for (const c of state.coins || []) {
    zetEntiteit(cel(cellen, c.row, c.col), "coin", false);
  }

  // Doel
  zetEntiteit(cel(cellen, state.target.row, state.target.col), "target", false);

  // Robot
  const robotCel = cel(cellen, state.robot.row, state.robot.col);
  zetEntiteit(robotCel, "robot", state.pending);

  /**
   * Verplaatst de robot naar een nieuwe positie (met CSS-transitie).
   * @param {{ row:number, col:number }} nieuwePos
   * @param {boolean} isPending
   */
  function updateRobot(nieuwePos, isPending) {
    // Oude robotcel opruimen
    const oudeRobot = grid.querySelector(".robot-grid__cel--robot");
    if (oudeRobot) {
      oudeRobot.classList.remove(
        "robot-grid__cel--robot",
        "robot-grid__cel--robot-pending"
      );
      oudeRobot.textContent = "";
    }

    const nieuweCel = cel(cellen, nieuwePos.row, nieuwePos.col);
    if (nieuweCel) {
      zetEntiteit(nieuweCel, "robot", isPending);
    }
  }

  /**
   * Speelt een munt-opraap-animatie op de gegeven cel.
   * @param {HTMLElement} celDiv
   * @param {Function} [onDone] — callback na animatie
   */
  function animateCoin(celDiv, onDone) {
    if (!celDiv) {
      if (onDone) onDone();
      return;
    }
    celDiv.classList.add("robot-grid__cel--coin-collect");
    celDiv.addEventListener(
      "animationend",
      () => {
        wisCel(celDiv);
        if (onDone) onDone();
      },
      { once: true }
    );
  }

  return { gridCellen: cellen, updateRobot, animateCoin };
}