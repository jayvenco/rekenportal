import { DEFAULT_THEME_ID, THEMES } from '../config/themes';

export type QualityPreference = 'auto' | 'high' | 'medium' | 'low';

export interface SaveData {
  version: number;
  best: number;
  runs: number;
  totalScore: number;
  unlocked: string[];
  startTheme: string;
  settings: {
    sfx: boolean;
    music: boolean;
    shake: boolean;
    haptics: boolean;
    reducedMotion: boolean;
    showFps: boolean;
    quality: QualityPreference;
  };
}

const KEY = 'aetherwing.save.v1';
const VERSION = 1;

const prefersReducedMotion = (): boolean => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

const defaults = (): SaveData => ({
  version: VERSION,
  best: 0,
  runs: 0,
  totalScore: 0,
  unlocked: [DEFAULT_THEME_ID],
  startTheme: DEFAULT_THEME_ID,
  settings: {
    sfx: true,
    music: true,
    shake: true,
    haptics: true,
    reducedMotion: prefersReducedMotion(),
    showFps: false,
    quality: 'auto',
  },
});

/**
 * localStorage wrapper that degrades to an in-memory store. Private browsing,
 * disabled cookies and storage quota errors must never break the game.
 */
export class Storage {
  data: SaveData;
  private writable = true;
  private flushTimer = 0;

  constructor() {
    this.data = this.read();
  }

  private read(): SaveData {
    const base = defaults();
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      const known = new Set(THEMES.map((t) => t.id));
      const unlocked = Array.isArray(parsed.unlocked)
        ? parsed.unlocked.filter((id) => known.has(id))
        : base.unlocked;
      if (!unlocked.includes(DEFAULT_THEME_ID)) unlocked.push(DEFAULT_THEME_ID);
      return {
        version: VERSION,
        best: numberOr(parsed.best, 0),
        runs: numberOr(parsed.runs, 0),
        totalScore: numberOr(parsed.totalScore, 0),
        unlocked,
        startTheme: known.has(parsed.startTheme ?? '')
          ? (parsed.startTheme as string)
          : DEFAULT_THEME_ID,
        settings: { ...base.settings, ...(parsed.settings ?? {}) },
      };
    } catch {
      this.writable = false;
      return base;
    }
  }

  /** Debounced so a burst of setting toggles is a single write. */
  save(): void {
    if (!this.writable) return;
    if (this.flushTimer) return;
    this.flushTimer = window.setTimeout(() => {
      this.flushTimer = 0;
      try {
        localStorage.setItem(KEY, JSON.stringify(this.data));
      } catch {
        this.writable = false;
      }
    }, 120);
  }

  saveNow(): void {
    if (!this.writable) return;
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = 0;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch {
      this.writable = false;
    }
  }

  /** @returns true when this run set a new personal best. */
  recordRun(score: number): boolean {
    this.data.runs += 1;
    this.data.totalScore += score;
    const isBest = score > this.data.best;
    if (isBest) this.data.best = score;
    this.saveNow();
    return isBest;
  }

  /** @returns the ids that became available on this call. */
  syncUnlocks(reachedScore: number): string[] {
    const fresh: string[] = [];
    for (const theme of THEMES) {
      if (reachedScore >= theme.unlockAt && !this.data.unlocked.includes(theme.id)) {
        this.data.unlocked.push(theme.id);
        fresh.push(theme.id);
      }
    }
    if (fresh.length) this.saveNow();
    return fresh;
  }

  isUnlocked(id: string): boolean {
    return this.data.unlocked.includes(id);
  }

  reset(): void {
    this.data = defaults();
    this.saveNow();
  }
}

const numberOr = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback;
