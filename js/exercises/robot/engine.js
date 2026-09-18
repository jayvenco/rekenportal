// exercises/robot/engine.js
// -----------------------------------------------------------------------------
// RobotEngine — speelt een robot-level af.
// Commando's: UP, DOWN, LEFT, RIGHT.
// Intern heeft de robot een richting (NORTH, EAST, SOUTH, WEST) voor
// toekomstige FORWARD / BACKWARD ondersteuning.
// -----------------------------------------------------------------------------

/** @typedef {'NORTH'|'EAST'|'SOUTH'|'WEST'} Richting */

const RICHTINGEN = {
  NORTH: { dr: -1, dc: 0 },
  EAST: { dr: 0, dc: 1 },
  SOUTH: { dr: 1, dc: 0 },
  WEST: { dr: 0, dc: -1 },
};

/** Draaitabel: huidige richting → nieuwe richting bij LEFT / RIGHT-draai */
const LINKS_DRAAI = { NORTH: "WEST", WEST: "SOUTH", SOUTH: "EAST", EAST: "NORTH" };
const RECHTS_DRAAI = { NORTH: "EAST", EAST: "SOUTH", SOUTH: "WEST", WEST: "NORTH" };

/**
 * @param {import('./levels.js').LevelData} levelData
 */
export class RobotEngine {
  #levelData;
  #robotRow;
  #robotCol;
  /** @type {Richting} */
  #richting;
  #obstakels;
  #overgeblevenMunten;
  #verzameldeMunten;
  #doelRij;
  #doelKol;
  #gridGrootte;
  #commandoQueue;

  constructor(levelData) {
    this.#levelData = levelData;
    this.#gridGrootte = levelData.size ?? 8;
    this.#commandoQueue = [];
    this.#resetIntern();
  }

  // ── openbare API ──────────────────────────────────────────────────────

  /** Reset de robot naar de beginsituatie van het huidige level. */
  reset() {
    this.#resetIntern();
  }

  /** Laad een nieuw level en reset de robot. */
  loadLevel(level) {
    this.#levelData = level;
    this.#gridGrootte = level.size ?? 8;
    this.#resetIntern();
  }

  /**
   * Vervangt de commando-wachtrij. Elk commando is "UP", "DOWN", "LEFT", of "RIGHT".
   * @param {string[]} commandoLijst
   */
  setCommands(commandoLijst) {
    this.#commandoQueue = [...commandoLijst];
  }

  /**
   * Voert één commando uit de wachtrij uit (FIFO).
   * Als de queue leeg is, retourneert { done: true }.
   *
   * @param {(result: RobotResult) => void} [callback] — optionele callback na uitvoering
   * @returns {RobotResult}
   */
  executeNext(callback) {
    if (this.#commandoQueue.length === 0) {
      const result = { done: true, collided: false, coin: false, atGoal: false, error: null, state: this.#bouwState() };
      callback?.(result);
      return result;
    }

    const commando = this.#commandoQueue.shift();
    const result = this.#voerCommandoUit(commando);
    callback?.(result);
    return result;
  }

  /**
   * Geeft de huidige status terug.
   * @returns {RobotState}
   */
  getState() {
    return this.#bouwState();
  }

  // ── interne logica ───────────────────────────────────────────────────

  #resetIntern() {
    const ld = this.#levelData;
    this.#robotRow = ld.robot.row;
    this.#robotCol = ld.robot.col;
    this.#richting = "EAST"; // robot kijkt standaard oostwaarts
    this.#doelRij = ld.target.row;
    this.#doelKol = ld.target.col;

    // obstakels als Set met "row,col" string voor O(1)-lookup
    this.#obstakels = new Set(
      (ld.obstacles ?? []).map((o) => `${o.row},${o.col}`)
    );

    // munten — Set van "row,col", verwijderen bij rapen
    this.#overgeblevenMunten = new Set(
      (ld.coins ?? []).map((c) => `${c.row},${c.col}`)
    );
    this.#verzameldeMunten = [];
    this.#commandoQueue = [];
  }

  /**
   * Voert één commando uit en retourneert het resultaat.
   * @param {string} commando
   * @returns {RobotResult}
   */
  #voerCommandoUit(commando) {
    const fout = this.#valideerCommando(commando);
    if (fout) {
      return { done: false, collided: false, coin: false, atGoal: false, error: fout, state: this.#bouwState() };
    }

    // Bepaal delta op basis van commando
    let dr = 0;
    let dc = 0;
    if (commando === "UP") { dr = -1; }
    else if (commando === "DOWN") { dr = 1; }
    else if (commando === "LEFT") { dc = -1; }
    else if (commando === "RIGHT") { dc = 1; }

    // Werk richting bij (voor FORWARD / BACKWARD in de toekomst)
    if (commando === "UP") this.#richting = "NORTH";
    else if (commando === "DOWN") this.#richting = "SOUTH";
    else if (commando === "LEFT") this.#richting = "WEST";
    else if (commando === "RIGHT") this.#richting = "EAST";
    // (LEFT / RIGHT commando's zetten de richting ook — dat is intentional voor draai-dan-loop)

    const nieuweRij = this.#robotRow + dr;
    const nieuweKol = this.#robotCol + dc;

    // Botsingdetectie: gridgrenzen
    if (nieuweRij < 0 || nieuweRij >= this.#gridGrootte ||
        nieuweKol < 0 || nieuweKol >= this.#gridGrootte) {
      return { done: false, collided: true, coin: false, atGoal: false, error: "Botsing! De robot kan niet buiten het raster.", state: this.#bouwState() };
    }

    // Botsingdetectie: obstakels
    const sleutel = `${nieuweRij},${nieuweKol}`;
    if (this.#obstakels.has(sleutel)) {
      return { done: false, collided: true, coin: false, atGoal: false, error: "Botsing! De robot loopt tegen een obstakel.", state: this.#bouwState() };
    }

    // Verplaats de robot
    this.#robotRow = nieuweRij;
    this.#robotCol = nieuweKol;

    // Munt rapen
    let coinGeraapt = false;
    if (this.#overgeblevenMunten.has(sleutel)) {
      this.#overgeblevenMunten.delete(sleutel);
      this.#verzameldeMunten.push({ row: nieuweRij, col: nieuweKol });
      coinGeraapt = true;
    }

    // Doel bereikt?
    const atGoal = this.#robotRow === this.#doelRij && this.#robotCol === this.#doelKol;

    // Klaar?
    const done = atGoal;

    return {
      done,
      collided: false,
      coin: coinGeraapt,
      atGoal,
      error: null,
      state: this.#bouwState(),
    };
  }

  /**
   * Controleert of een commando geldig is.
   * @param {string} cmd
   * @returns {string|null} foutmelding of null
   */
  #valideerCommando(cmd) {
    const geldig = ["UP", "DOWN", "LEFT", "RIGHT"];
    if (!geldig.includes(cmd)) {
      return `Ongeldig commando: "${cmd}". Gebruik UP, DOWN, LEFT of RIGHT.`;
    }
    return null;
  }

  /**
   * Bouwt de huidige RobotState.
   * @returns {RobotState}
   */
  #bouwState() {
    return {
      robot: { row: this.#robotRow, col: this.#robotCol },
      richting: this.#richting,
      target: { row: this.#doelRij, col: this.#doelKol },
      obstakels: this.#levelData.obstacles ?? [],
      munten: this.#levelData.coins ?? [],
      overgeblevenMunten: [...this.#overgeblevenMunten].map((s) => {
        const [r, c] = s.split(",").map(Number);
        return { row: r, col: c };
      }),
      verzameldeMunten: [...this.#verzameldeMunten],
      gridGrootte: this.#gridGrootte,
      commandoWachtrij: [...this.#commandoQueue],
    };
  }
}

/**
 * @typedef {Object} RobotState
 * @property {{row:number,col:number}} robot
 * @property {Richting} richting
 * @property {{row:number,col:number}} target
 * @property {{row:number,col:number}[]} obstakels
 * @property {{row:number,col:number}[]} munten          — alle munten (oorspronkelijk)
 * @property {{row:number,col:number}[]} overgeblevenMunten — nog niet geraapt
 * @property {{row:number,col:number}[]} verzameldeMunten   — reeds geraapt
 * @property {number} gridGrootte
 * @property {string[]} commandoWachtrij
 */

/**
 * @typedef {Object} RobotResult
 * @property {boolean} done       — true als alle commando's uitgevoerd zijn OF robot op doel is
 * @property {boolean} collided   — true bij botsing
 * @property {boolean} coin       — true als er deze stap een munt is geraapt
 * @property {boolean} atGoal     — true als robot op de doelpositie staat
 * @property {string|null} error  — foutmelding of null
 * @property {RobotState} state   — de staat ná deze stap
 */