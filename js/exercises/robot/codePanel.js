// exercises/robot/codePanel.js
// -----------------------------------------------------------------------------
// Paneel met een tekstgebied (monospace) waar de gebruiker commando's typt,
// en RUN ▶ / RESET 🔄 / CLEAR 🗑 knoppen.
// Converteert regels naar UP/DOWN/LEFT/RIGHT (hoofdletterongevoelig).
// -----------------------------------------------------------------------------

/** Vertaalt een ingetypte regel naar een geldig commando, of null als ongeldig. */
function regelNaarCommando(regel) {
  const schoon = regel.trim().toUpperCase();
  const geldig = ["UP", "DOWN", "LEFT", "RIGHT"];
  return geldig.includes(schoon) ? schoon : null;
}

/**
 * Bouwt het code-paneel in `container`.
 * @param {HTMLElement} container
 * @param {Object} callbacks
 * @param {(commands: string[]) => void} callbacks.onRun   — run-knop ingedrukt met de geparseerde commando's
 * @param {() => void} callbacks.onReset                   — reset de robotpositie
 * @param {() => void} callbacks.onClear                   — wis de tekstarea
 * @returns {{ setRunEnabled: (en: boolean) => void, vulMet: (commands: string[]) => void }}
 */
export function renderCodePanel(container, { onRun, onReset, onClear }) {
  container.innerHTML = "";

  const paneel = document.createElement("div");
  paneel.className = "code-panel";
  container.appendChild(paneel);

  // ── Tekstgebied ─────────────────────────────────────────────────────────
  const textarea = document.createElement("textarea");
  textarea.className = "code-panel__textarea";
  textarea.rows = 8;
  textarea.placeholder =
    "Typ commando's, één per regel:\nUP\nDOWN\nLEFT\nRIGHT";
  textarea.spellcheck = false;
  paneel.appendChild(textarea);

  // ── Actieknoppen ────────────────────────────────────────────────────────
  const actiesRij = document.createElement("div");
  actiesRij.className = "code-panel__acties";
  paneel.appendChild(actiesRij);

  const runBtn = document.createElement("button");
  runBtn.type = "button";
  runBtn.className = "code-panel__actie code-panel__actie--run";
  runBtn.textContent = "▶ RUN CODE";
  runBtn.addEventListener("click", () => {
    const regels = textarea.value.split("\n");
    const commands = [];
    let fouten = 0;
    for (const regel of regels) {
      const commando = regelNaarCommando(regel);
      // Lege regels overslaan
      if (regel.trim() === "") continue;
      if (commando) {
        commands.push(commando);
      } else {
        fouten++;
      }
    }
    if (commands.length === 0 && fouten === 0) {
      // helemaal leeg — niets doen
      return;
    }
    if (fouten > 0) {
      const melding = document.createElement("div");
      melding.className = "code-panel__foutmelding";
      melding.textContent = `⚠️ ${fouten} ongeldig(e) commando('s) overgeslagen. Gebruik UP, DOWN, LEFT of RIGHT.`;
      // Toon kort de melding en verwijder hem na 3s
      paneel.appendChild(melding);
      setTimeout(() => melding.remove(), 3000);
    }
    if (commands.length > 0) {
      onRun(commands);
    }
  });

  const resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.className = "code-panel__actie code-panel__actie--reset";
  resetBtn.textContent = "🔄 RESET";
  resetBtn.addEventListener("click", onReset);

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "code-panel__actie code-panel__actie--clear";
  clearBtn.textContent = "🗑 CLEAR";
  clearBtn.addEventListener("click", () => {
    textarea.value = "";
    onClear();
  });

  actiesRij.append(runBtn, resetBtn, clearBtn);

  // Exposed helpers
  return {
    /** Schakel de run-knop in/uit (bv. tijdens uitvoeren) */
    setRunEnabled(en) {
      runBtn.disabled = !en;
    },
    /** Vul de textarea met commando's (één per regel) */
    vulMet(commands) {
      textarea.value = commands.join("\n");
    },
  };
}