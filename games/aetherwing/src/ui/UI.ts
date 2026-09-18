import { THEMES } from '../config/themes';
import type { SaveData } from '../systems/Storage';

export type ScreenName =
  | 'loading'
  | 'menu'
  | 'ready'
  | 'paused'
  | 'gameover'
  | 'themes'
  | 'settings'
  | 'none';

export type UIAction =
  | 'play'
  | 'resume'
  | 'retry'
  | 'quit'
  | 'settings'
  | 'themes'
  | 'back'
  | 'share'
  | 'reset';

type SettingKey = keyof SaveData['settings'];

/**
 * Thin controller over the markup in index.html.
 *
 * Menus live in the DOM because that is where accessible, responsive,
 * animated layout is cheap. Nothing here runs during gameplay — the in-run
 * HUD is drawn on the canvas instead.
 */
export class UI {
  private screens = new Map<ScreenName, HTMLElement>();
  private active: ScreenName = 'loading';
  private toastTimer = 0;

  private readonly loadBar = byId<HTMLElement>('loadBar');
  private readonly loadLabel = byId<HTMLElement>('loadLabel');
  private readonly menuBest = byId<HTMLElement>('menuBest');
  private readonly menuRuns = byId<HTMLElement>('menuRuns');
  private readonly overScore = byId<HTMLElement>('overScore');
  private readonly overBest = byId<HTMLElement>('overBest');
  private readonly overTheme = byId<HTMLElement>('overTheme');
  private readonly overKicker = byId<HTMLElement>('overKicker');
  private readonly overBanner = byId<HTMLElement>('overBanner');
  private readonly overUnlock = byId<HTMLElement>('overUnlock');
  private readonly overUnlockName = byId<HTMLElement>('overUnlockName');
  private readonly themeList = byId<HTMLElement>('themeList');
  private readonly toastEl = byId<HTMLElement>('toast');
  private readonly toastText = byId<HTMLElement>('toastText');
  private readonly pauseBtn = byId<HTMLButtonElement>('pauseBtn');
  private readonly muteBtn = byId<HTMLButtonElement>('muteBtn');
  private readonly shareLabel = byId<HTMLElement>('shareLabel');

  onAction: (action: UIAction) => void = () => {};
  onSetting: (key: SettingKey, value: boolean | string) => void = () => {};
  onThemePick: (id: string) => void = () => {};
  onPauseClick: () => void = () => {};
  onMuteClick: () => void = () => {};

  constructor(root: HTMLElement) {
    root.querySelectorAll<HTMLElement>('[data-screen]').forEach((el) => {
      this.screens.set(el.dataset.screen as ScreenName, el);
    });

    root.addEventListener('click', (ev) => {
      const target = ev.target as HTMLElement | null;
      const btn = target?.closest<HTMLElement>('[data-action]');
      if (!btn) return;
      ev.preventDefault();
      this.onAction(btn.dataset.action as UIAction);
    });

    root.querySelectorAll<HTMLInputElement>('input[data-setting]').forEach((input) => {
      input.addEventListener('change', () => {
        this.onSetting(input.dataset.setting as SettingKey, input.checked);
      });
    });
    root.querySelectorAll<HTMLSelectElement>('select[data-setting]').forEach((sel) => {
      sel.addEventListener('change', () => {
        this.onSetting(sel.dataset.setting as SettingKey, sel.value);
      });
    });

    this.pauseBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.onPauseClick();
    });
    this.muteBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.onMuteClick();
    });
  }

  /* ------------------------------- screens ------------------------------- */

  show(name: ScreenName): void {
    if (this.active === name) return;
    this.screens.get(this.active)?.classList.remove('is-active');
    this.active = name;
    this.screens.get(name)?.classList.add('is-active');
  }

  get current(): ScreenName {
    return this.active;
  }

  setLoading(progress: number, label?: string): void {
    this.loadBar.style.transform = `scaleX(${Math.max(0.02, Math.min(1, progress))})`;
    if (label) this.loadLabel.textContent = label;
  }

  setPauseVisible(visible: boolean): void {
    this.pauseBtn.hidden = !visible;
  }

  setMuted(muted: boolean): void {
    this.muteBtn.classList.toggle('is-muted', muted);
    this.muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
  }

  setReducedMotion(on: boolean): void {
    document.documentElement.classList.toggle('reduce-motion', on);
  }

  /* -------------------------------- content ------------------------------ */

  setMenuStats(best: number, runs: number): void {
    this.menuBest.textContent = String(best);
    this.menuRuns.textContent = String(runs);
  }

  setGameOver(info: {
    score: number;
    best: number;
    isBest: boolean;
    themeName: string;
    unlockedName: string | null;
  }): void {
    this.overScore.textContent = String(info.score);
    this.overBest.textContent = String(info.best);
    this.overTheme.textContent = info.themeName;
    this.overBanner.hidden = !info.isBest;
    this.overKicker.textContent = info.isBest ? 'A NEW RECORD' : 'FLIGHT ENDED';
    this.overUnlock.hidden = !info.unlockedName;
    if (info.unlockedName) this.overUnlockName.textContent = info.unlockedName;
    this.shareLabel.textContent = 'Share';
  }

  buildThemes(save: SaveData): void {
    const frag = document.createDocumentFragment();
    for (const theme of THEMES) {
      const unlocked = save.unlocked.includes(theme.id);
      const active = save.startTheme === theme.id;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `theme${unlocked ? '' : ' is-locked'}${active ? ' is-active' : ''}`;
      btn.disabled = !unlocked;

      const swatch = document.createElement('div');
      swatch.className = 'theme__swatch';
      swatch.style.background = theme.swatch;

      const name = document.createElement('div');
      name.className = 'theme__name';
      name.textContent = theme.name;

      const meta = document.createElement('div');
      meta.className = 'theme__meta';
      meta.textContent = unlocked
        ? active
          ? 'Selected'
          : theme.tagline
        : `Reach ${theme.unlockAt}`;

      btn.append(swatch, name, meta);
      if (unlocked) btn.addEventListener('click', () => this.onThemePick(theme.id));
      frag.append(btn);
    }
    this.themeList.replaceChildren(frag);
  }

  syncSettings(settings: SaveData['settings']): void {
    document.querySelectorAll<HTMLInputElement>('input[data-setting]').forEach((input) => {
      const key = input.dataset.setting as SettingKey;
      const value = settings[key];
      if (typeof value === 'boolean') input.checked = value;
    });
    document.querySelectorAll<HTMLSelectElement>('select[data-setting]').forEach((sel) => {
      const key = sel.dataset.setting as SettingKey;
      const value = settings[key];
      if (typeof value === 'string') sel.value = value;
    });
    this.setReducedMotion(settings.reducedMotion);
  }

  toast(message: string, ms = 2000): void {
    this.toastText.textContent = message;
    this.toastEl.hidden = false;
    // Force a reflow so the transition runs on a freshly unhidden element.
    void this.toastEl.offsetWidth;
    this.toastEl.classList.add('is-visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toastEl.classList.remove('is-visible');
      setTimeout(() => {
        this.toastEl.hidden = true;
      }, 340);
    }, ms);
  }

  /* --------------------------------- share ------------------------------- */

  async share(score: number, best: number): Promise<void> {
    const text = `I scored ${score} in Aetherwing${
      score >= best ? ' — a new personal best' : ''
    }! Can you beat me?`;
    const url = location.href.split('#')[0];

    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      canShare?: (data: ShareData) => boolean;
    };

    if (nav.share) {
      try {
        await nav.share({ title: 'Aetherwing', text, url });
        return;
      } catch (err) {
        // A user-cancelled share is not a failure; anything else falls through.
        if ((err as DOMException)?.name === 'AbortError') return;
      }
    }

    const payload = `${text} ${url}`;
    try {
      await navigator.clipboard.writeText(payload);
      this.shareLabel.textContent = 'Copied!';
      this.toast('Score copied to clipboard');
      setTimeout(() => {
        this.shareLabel.textContent = 'Share';
      }, 1800);
    } catch {
      if (legacyCopy(payload)) {
        this.toast('Score copied to clipboard');
      } else {
        this.toast('Copy failed — sharing is unavailable here');
      }
    }
  }
}

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

/** Fallback for browsers without the async clipboard API. */
function legacyCopy(text: string): boolean {
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
