// exercises/robot/oefenscherm.js
// -----------------------------------------------------------------------------
// Het daadwerkelijke oefenscherm van de Robot Programmeer Spel-module.
// Bevat de spel-logica shell: grid-weergave, commandopanelen, engine-loop,
// collision/goal handling en beloningen.
//
// Nog te implementeren modules (worden dynamisch geladen):
//   - ./grid.js        → renderGrid(), renderRobot(), renderDoel()
//   - ./arrowPanel.js  → bouwArrowPanel(container, onChange)
//   - ./codePanel.js   → bouwCodePanel(container, onChange)
//   - ./levels.js      → laadLevel(id) → { grid, start, doel, naam, coins }
//   - ./engine.js      → executeNext(commands, grid, state, delayMs, callbacks)
// -----------------------------------------------------------------------------

import { recordAnswer } from "../../storage.js";
import { maakRewardTracker, toonBadgeUnlocks, toonRewardResultaat, verversCoinCounter } from "../../utils/rewards.js";

const EXERCISE_ID = "robot";
const ANIMATIE_VERTRAGING_MS = 500;

// ─── Hulpfunctie: een module dynamisch laden, met graceful fallback ──────
async function laadModule(path) {
  try {
    return await import(path);
  } catch {
    console.warn(`[robot] Module nog niet geïmplementeerd: ${path}`);
    return null;
  }
}

/**
 * Toont het oefenscherm en start de speelsessie.
 * @param {HTMLElement} container
 * @param {Object} instellingen - { level, modus, moeilijkheid, groep }
 * @param {Function} opKlaar - callback({ opnieuw }) na afloop.
 */
export async function toonOefeningScherm(container, instellingen, opKlaar) {
  let commands = [];
  let huidigeStap = -1;
  let isPlaying = false;
  let isFinished = false;
  let coinsCollected = 0;
  let collisionError = null;

  // Laad level-data
  const levelsMod = await laadModule("./levels.js");
  const levelData = levelsMod ? levelsMod.laadLevel(instellingen.level) : null;
  const gridCols = levelData?.size || 6;
  const gridRows = levelData?.size || 6;
  const levelNaam = levelData?.name || `Level ${instellingen.level}`;
  const maxCoins = levelData?.coins?.length || 0;

  const rewardTracker = maakRewardTracker(EXERCISE_ID, 1); // 1 level per sessie

  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "12px";

  // ─── 1. Bovenbalk: levelnaam + score + muntjes ──────────────────────
  const topBar = document.createElement("div");
  topBar.className = "robot-topbar";
  topBar.style.cssText =
    "display:flex;align-items:center;justify-content:space-between;padding:8px 16px;" +
    "background:#eef2ff;border-radius:12px;flex-wrap:wrap;gap:8px;";

  const levelTitle = document.createElement("span");
  levelTitle.style.cssText = "font-weight:700;font-size:1.15em;color:#1e3a5f;";
  levelTitle.textContent = `🤖 ${levelNaam}`;
  topBar.appendChild(levelTitle);

  const scoreBadge = document.createElement("span");
  scoreBadge.className = "robot-score";
  scoreBadge.style.cssText =
    "background:#dbeafe;color:#1e40af;padding:4px 12px;border-radius:999px;font-weight:600;font-size:0.9em;";
  scoreBadge.textContent = `💰 0 / ${maxCoins} munten`;
  topBar.appendChild(scoreBadge);

  container.appendChild(topBar);

  // ─── 2. Hoofd-layout: grid + commandopaneel ──────────────────────────
  const mainRow = document.createElement("div");
  mainRow.style.cssText =
    "display:flex;gap:16px;flex-wrap:wrap;flex:1;";

  // ─── Grid (links / midden) ──────────────────────────────────────────
  const gridContainer = document.createElement("div");
  gridContainer.className = "robot-grid-container";
  gridContainer.style.cssText =
    "flex:1;min-width:260px;display:flex;align-items:center;justify-content:center;";

  const gridEl = document.createElement("div");
  gridEl.className = "robot-grid";
  gridEl.style.cssText =
    "display:grid;gap:2px;background:#f8fafc;border:3px solid #cbd5e1;border-radius:8px;padding:4px;";

  // Grid kolommen instellen op basis van breedte/hoogte
  gridEl.style.gridTemplateColumns = `repeat(${gridCols}, 48px)`;
  gridEl.style.gridTemplateRows = `repeat(${gridRows}, 48px)`;

  // Teken de gridcellen
  for (let rij = 0; rij < gridRows; rij++) {
    for (let kol = 0; kol < gridCols; kol++) {
      const cel = document.createElement("div");
      cel.className = "robot-cel";
      cel.dataset.rij = String(rij);
      cel.dataset.kol = String(kol);
      cel.style.cssText =
        "width:48px;height:48px;background:#fff;border:1px solid #e2e8f0;border-radius:4px;" +
        "display:flex;align-items:center;justify-content:center;font-size:20px;transition:background 0.2s;";

      // Hindernis / muur (voor later gebruik)
      if (levelData?.obstacles) {
        const isMuur = levelData.obstacles.some(
          (m) => m.row === rij && m.col === kol
        );
        if (isMuur) {
          cel.style.background = "#94a3b8";
          cel.textContent = "🧱";
        }
      }

      // Doel markeren
      if (levelData?.target?.row === rij && levelData?.target?.col === kol) {
        cel.style.background = "#fef9c3";
        cel.textContent = "🎯";
      }

      // Muntjes
      if (levelData?.coins) {
        const isMunt = levelData.coins.some(
          (c) => c.row === rij && c.col === kol
        );
        if (isMunt) {
          cel.textContent = "💰";
        }
      }

      // Startpositie
      if (levelData?.robot?.row === rij && levelData?.robot?.col === kol) {
        cel.textContent = "🤖";
        cel.style.background = "#dbeafe";
        cel.id = "robot-start-cel";
      }

      // Cel-id voor later robot-animatie
      const celId = `cel-${rij}-${kol}`;
      cel.id = celId;

      gridEl.appendChild(cel);
    }
  }

  gridContainer.appendChild(gridEl);
  mainRow.appendChild(gridContainer);

  // ─── Commandopaneel (rechts / onder) ────────────────────────────────
  const panelContainer = document.createElement("div");
  panelContainer.className = "robot-panel-container";
  panelContainer.style.cssText =
    "flex:0 0 260px;display:flex;flex-direction:column;gap:8px;min-width:200px;";

  const panelLabel = document.createElement("div");
  panelLabel.style.cssText = "font-weight:600;color:#374151;font-size:0.95em;";
  panelLabel.textContent =
    instellingen.modus === "code" ? "📝 Code" : "⬆️ Pijltjes";
  panelContainer.appendChild(panelLabel);

  // Commando-lijst (lege lijst om in te vullen)
  const commandoLijst = document.createElement("div");
  commandoLijst.className = "robot-command-lijst";
  commandoLijst.style.cssText =
    "flex:1;background:#fff;border:2px solid #e2e8f0;border-radius:8px;padding:8px;min-height:120px;" +
    "font-family:monospace;font-size:0.9em;overflow-y:auto;display:flex;flex-direction:column;gap:2px;";
  commandoLijst.setAttribute("aria-label", "Commando's lijst");
  panelContainer.appendChild(commandoLijst);

  // ─── Toevoegknoppen voor pijltjesmodus ──────────────────────────────
  const arrowBar = document.createElement("div");
  arrowBar.className = "robot-arrow-bar";
  arrowBar.style.cssText =
    "display:flex;gap:4px;justify-content:center;flex-wrap:wrap;";

  if (instellingen.modus === "arrows") {
    const pijlen = [
      { symbool: "⬆️", cmd: "UP", label: "Omhoog" },
      { symbool: "⬇️", cmd: "DOWN", label: "Omlaag" },
      { symbool: "⬅️", cmd: "LEFT", label: "Links" },
      { symbool: "➡️", cmd: "RIGHT", label: "Rechts" },
    ];
    for (const pijl of pijlen) {
      const knop = document.createElement("button");
      knop.type = "button";
      knop.textContent = pijl.symbool;
      knop.setAttribute("aria-label", pijl.label);
      knop.style.cssText =
        "width:52px;height:52px;font-size:24px;border:2px solid #cbd5e1;border-radius:8px;" +
        "background:#f8fafc;cursor:pointer;display:flex;align-items:center;justify-content:center;";
      knop.addEventListener("click", () => {
        if (!isPlaying && !isFinished) {
          commands.push(pijl.cmd);
          herstelCommandoLijst();
        }
      });
      arrowBar.appendChild(knop);
    }
  }

  panelContainer.appendChild(arrowBar);

  // ─── Code-invoer (voor codemodus) ───────────────────────────────────
  if (instellingen.modus === "code") {
    const codeInvoer = document.createElement("textarea");
    codeInvoer.className = "robot-code-input";
    codeInvoer.setAttribute("aria-label", "Code invoeren");
    codeInvoer.placeholder = "Typ commando's:\nUP\nRIGHT\nDOWN\n...";
    codeInvoer.style.cssText =
      "width:100%;min-height:80px;border:2px solid #e2e8f0;border-radius:8px;padding:8px;" +
      "font-family:monospace;font-size:0.9em;resize:vertical;";
    codeInvoer.addEventListener("input", () => {
      if (!isPlaying && !isFinished) {
        commands = codeInvoer.value
          .split("\n")
          .map((l) => l.trim().toUpperCase())
          .filter((l) => ["UP", "DOWN", "LEFT", "RIGHT"].includes(l));
        herstelCommandoLijst();
      }
    });
    panelContainer.appendChild(codeInvoer);
  }

  mainRow.appendChild(panelContainer);
  container.appendChild(mainRow);

  // ─── 4. Actieknoppen (START / RESET / CLEAR) ────────────────────────
  const actionBar = document.createElement("div");
  actionBar.className = "robot-actions";
  actionBar.style.cssText =
    "display:flex;gap:12px;justify-content:center;padding:8px 0;flex-wrap:wrap;";

  const startBtn = document.createElement("button");
  startBtn.type = "button";
  startBtn.textContent = "▶ START";
  startBtn.className = "knop knop--primair";
  startBtn.style.cssText =
    "font-size:1.1em;padding:10px 28px;background:#2f6ed4;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;";

  const resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.textContent = "🔄 RESET";
  resetBtn.className = "knop knop--zacht";
  resetBtn.style.cssText =
    "font-size:1.1em;padding:10px 28px;border:2px solid #cbd5e1;border-radius:8px;cursor:pointer;font-weight:600;background:#fff;color:#374151;";

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.textContent = "🗑 CLEAR";
  clearBtn.className = "knop knop--zacht";
  clearBtn.style.cssText =
    "font-size:1.1em;padding:10px 28px;border:2px solid #cbd5e1;border-radius:8px;cursor:pointer;font-weight:600;background:#fff;color:#374151;";

  actionBar.append(startBtn, resetBtn, clearBtn);
  container.appendChild(actionBar);

  // ─── Status/feedback-gebied ─────────────────────────────────────────
  const feedbackEl = document.createElement("div");
  feedbackEl.className = "robot-feedback";
  feedbackEl.setAttribute("aria-live", "polite");
  feedbackEl.style.cssText =
    "text-align:center;font-size:1em;font-weight:600;min-height:28px;padding:4px 0;color:#374151;";
  container.appendChild(feedbackEl);

  // ─── 5. Hulpfuncties ────────────────────────────────────────────────
  function herstelCommandoLijst() {
    commandoLijst.innerHTML = "";
    for (let i = 0; i < commands.length; i++) {
      const item = document.createElement("div");
      item.className = "robot-cmd-item";
      item.dataset.index = String(i);
      item.style.cssText =
        "padding:2px 6px;border-radius:4px;font-family:monospace;transition:background 0.2s;";
      item.textContent = `${i + 1}. ${commands[i]}`;
      if (i === huidigeStap) {
        item.style.background = "#fef9c3";
        item.style.fontWeight = "700";
      }
      commandoLijst.appendChild(item);
    }
    // Scroll naar huidige stap
    if (huidigeStap >= 0) {
      const actief = commandoLijst.querySelector(`[data-index="${huidigeStap}"]`);
      if (actief) actief.scrollIntoView({ block: "nearest" });
    }
  }

  /** Verplaatst het robot-icoon naar een bepaalde cel. */
  function verplaatsRobot(rij, kol) {
    // Verwijder robot-icoon uit alle cellen
    gridEl.querySelectorAll(".robot-cel").forEach((cel) => {
      if (cel.textContent === "🤖") cel.textContent = "";
    });
    // Zet robot op nieuwe positie
    const celDoel = gridEl.querySelector(`#cel-${rij}-${kol}`);
    if (celDoel) {
      celDoel.textContent = "🤖";
      celDoel.style.background = "#dbeafe";
    }
  }

  /** Reset de grid naar de start-positie. */
  function resetGrid() {
    gridEl.querySelectorAll(".robot-cel").forEach((cel) => {
      if (cel.textContent === "🤖") {
        cel.textContent = "";
        cel.style.background = "";
      }
    });
    const start = levelData?.robot || { row: 0, col: 0 };
    verplaatsRobot(start.row, start.col);
    coinsCollected = 0;
    collisionError = null;
    werkScoreBij();
  }

  /** Werkt de score/munten badge bij. */
  function werkScoreBij() {
    scoreBadge.textContent = `💰 ${coinsCollected} / ${maxCoins} munten`;
  }

  /** Markeert een cel als bezocht (voor muntjes oprapen). */
  function checkMuntjes(rij, kol) {
    if (!levelData?.coins) return;
    const muntIndex = levelData.coins.findIndex(
      (c) => c.row === rij && c.col === kol
    );
    if (muntIndex >= 0) {
      // Verwijder de munt uit de getoonde grid
      const cel = gridEl.querySelector(`#cel-${rij}-${kol}`);
      if (cel && cel.textContent === "💰") {
        cel.textContent = ""; // munt opgepakt
        coinsCollected++;
        werkScoreBij();
      }
    }
  }

  // ─── 6. Engine-loop ─────────────────────────────────────────────────
  async function startEngine() {
    if (commands.length === 0) {
      feedbackEl.textContent = "Voeg eerst commando's toe!";
      feedbackEl.style.color = "#dc2626";
      return;
    }

    isPlaying = true;
    isFinished = false;
    huidigeStap = -1;
    collisionError = null;
    resetGrid();
    feedbackEl.style.color = "#374151";

    const start = levelData?.robot || { row: 0, col: 0 };
    let robotRij = start.row;
    let robotKol = start.col;

    startBtn.disabled = true;
    clearBtn.disabled = true;
    if (instellingen.modus === "arrows") {
      arrowBar.querySelectorAll("button").forEach((b) => (b.disabled = true));
    }

    for (let i = 0; i < commands.length; i++) {
      if (isFinished) break; // gestopt door collision of goal

      huidigeStap = i;
      herstelCommandoLijst();
      feedbackEl.textContent = `Stap ${i + 1} van ${commands.length}: ${commands[i]}`;

      await new Promise((resolve) => setTimeout(resolve, ANIMATIE_VERTRAGING_MS));

      // Bereken nieuwe positie
      const cmd = commands[i];
      let nieuweRij = robotRij;
      let nieuweKol = robotKol;

      switch (cmd) {
        case "UP":    nieuweRij--; break;
        case "DOWN":  nieuweRij++; break;
        case "LEFT":  nieuweKol--; break;
        case "RIGHT": nieuweKol++; break;
      }

      // 🔹 Collision-check: muren
      if (levelData?.obstacles) {
        const isMuur = levelData.obstacles.some(
          (m) => m.row === nieuweRij && m.col === nieuweKol
        );
        if (isMuur) {
          collisionError = `🧱 Robot botst tegen een muur bij stap ${i + 1}!`;
          feedbackEl.textContent = collisionError;
          feedbackEl.style.color = "#dc2626";
          isFinished = true;
          // Markeer de muur rood
          const muurCel = gridEl.querySelector(`#cel-${nieuweRij}-${nieuweKol}`);
          if (muurCel) muurCel.style.background = "#fca5a5";
          break;
        }
      }

      // 🔹 Collision-check: buiten grid
      if (
        nieuweRij < 0 || nieuweRij >= gridRows ||
        nieuweKol < 0 || nieuweKol >= gridCols
      ) {
        collisionError = `🚫 Robot loopt van het bord af bij stap ${i + 1}!`;
        feedbackEl.textContent = collisionError;
        feedbackEl.style.color = "#dc2626";
        isFinished = true;
        break;
      }

      // Verplaats robot
      robotRij = nieuweRij;
      robotKol = nieuweKol;
      verplaatsRobot(robotRij, robotKol);

      // Check muntjes
      checkMuntjes(robotRij, robotKol);

      // 🔹 Check: doel bereikt?
      if (levelData?.target?.row === robotRij && levelData?.target?.col === robotKol) {
        feedbackEl.textContent = "🎉 Doel bereikt! Goed gedaan!";
        feedbackEl.style.color = "#16a34a";
        isFinished = true;
        const celDoel = gridEl.querySelector(`#cel-${robotRij}-${robotKol}`);
        if (celDoel) {
          celDoel.textContent = "🎯🤖";
          celDoel.style.background = "#bbf7d0";
        }
        // Score = coins + bonus voor resterende stappen
        await verwerkSucces();
        break;
      }
    }

    // Als de loop zonder goal eindigt
    if (!isFinished) {
      huidigeStap = -1;
      herstelCommandoLijst();
      feedbackEl.textContent = "⏹ Robot staat stil, maar het doel is niet bereikt.";
      feedbackEl.style.color = "#d97706";
      isFinished = true;
    }

    // Herstel knoppen
    startBtn.disabled = false;
    clearBtn.disabled = false;
    if (instellingen.modus === "arrows") {
      arrowBar.querySelectorAll("button").forEach((b) => (b.disabled = false));
    }
    isPlaying = false;
  }

  // ─── 7. Succes / beloningen ─────────────────────────────────────────
  async function verwerkSucces() {
    const tijdBesteed = performance.now(); // ruwe timestamp
    await recordAnswer({
      exerciseId: EXERCISE_ID,
      correct: true,
      timeMs: Math.round(tijdBesteed),
      meta: {
        level: instellingen.level,
        modus: instellingen.modus,
        coins: coinsCollected,
        maxCoins,
        stappen: commands.length,
      },
    });

    const rewardVlak = document.createElement("div");
    rewardVlak.className = "robot-reward";
    rewardVlak.style.cssText =
      "margin:12px 0;text-align:center;padding:12px;background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;";

    const rewardText = document.createElement("p");
    rewardText.style.cssText = "font-size:1.1em;font-weight:600;color:#15803d;";
    rewardText.textContent = `🌟 ${coinsCollected} / ${maxCoins} munten verzameld!`;
    rewardVlak.appendChild(rewardText);
    container.appendChild(rewardVlak);

    // ─── 8. Volgende level-knop ─────────────────────────────────
    const volgendLevelBtn = document.createElement("button");
    volgendLevelBtn.type = "button";
    volgendLevelBtn.className = "knop knop--primair";
    volgendLevelBtn.textContent = "Volgende level ▶";
    volgendLevelBtn.style.cssText =
      "font-size:1.1em;padding:10px 28px;background:#2f6ed4;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;";
    const volgendeLevel = instellingen.level + 1;
    const maxLevel = instellingen.groep === 8 ? 12 : 6;
    if (volgendeLevel <= maxLevel) {
      volgendLevelBtn.addEventListener("click", () => {
        opKlaar({
          opnieuw: true,
          nieuweInstellingen: { ...instellingen, level: volgendeLevel },
        });
      });
      const btnRow = document.createElement("div");
      btnRow.className = "acties-rij";
      btnRow.style.cssText =
        "display:flex;gap:12px;justify-content:center;margin-top:8px;";

      const terugBtn = document.createElement("button");
      terugBtn.type = "button";
      terugBtn.className = "knop knop--zacht";
      terugBtn.textContent = "Terug naar menu";
      terugBtn.style.cssText =
        "font-size:1.1em;padding:10px 28px;border:2px solid #cbd5e1;border-radius:8px;cursor:pointer;font-weight:600;background:#fff;color:#374151;";
      terugBtn.addEventListener("click", () => opKlaar({ opnieuw: false }));

      btnRow.appendChild(volgendLevelBtn);
      btnRow.appendChild(terugBtn);
      container.appendChild(btnRow);
    }

    // Reward-tracker voltooien
    const rewards = await rewardTracker.voltooi();
    toonRewardResultaat(rewardVlak, rewards);
    await verversCoinCounter();
    await toonBadgeUnlocks(rewards?.badgesEarned || []);
  }

  // ─── Event-listeners voor actieknoppen ──────────────────────────────
  startBtn.addEventListener("click", startEngine);

  resetBtn.addEventListener("click", () => {
    if (isPlaying) {
      isFinished = true; // stop engine
      isPlaying = false;
    }
    resetGrid();
    feedbackEl.textContent = "";
    feedbackEl.style.color = "#374151";
    huidigeStap = -1;
    herstelCommandoLijst();
  });

  clearBtn.addEventListener("click", () => {
    if (isPlaying) {
      isFinished = true;
      isPlaying = false;
    }
    commands = [];
    huidigeStap = -1;
    collisionError = null;
    resetGrid();
    feedbackEl.textContent = "";
    feedbackEl.style.color = "#374151";
    herstelCommandoLijst();
    if (instellingen.modus === "code") {
      codeInvoer.value = "";
    }
  });

  // ─── Initialisatie ──────────────────────────────────────────────────
  resetGrid();
  herstelCommandoLijst();
}