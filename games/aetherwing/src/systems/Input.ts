export interface InputHandlers {
  flap: () => void;
  pause: () => void;
  mute: () => void;
  restart: () => void;
  /** Fired on the very first user gesture — used to unlock the audio context. */
  firstGesture: () => void;
}

/** Elements that own their own clicks; a tap on one must not also flap. */
const UI_SELECTOR = 'button, select, input, label, a, .panel, .over, .menu, .themes';

/**
 * Normalises keyboard, mouse, pen and touch into four intents, and stops the
 * browser from doing anything else with them — no scrolling, no pull to
 * refresh, no double-tap zoom, no long-press menu.
 */
export class Input {
  private disposers: Array<() => void> = [];
  private gestureSeen = false;

  constructor(
    private readonly root: HTMLElement,
    private readonly handlers: InputHandlers,
  ) {
    this.bind();
  }

  private on<K extends keyof WindowEventMap>(
    target: EventTarget,
    type: K | string,
    fn: (ev: never) => void,
    opts?: AddEventListenerOptions,
  ): void {
    const listener = fn as EventListener;
    target.addEventListener(type, listener, opts);
    this.disposers.push(() => target.removeEventListener(type, listener, opts));
  }

  private firstGesture(): void {
    if (this.gestureSeen) return;
    this.gestureSeen = true;
    this.handlers.firstGesture();
  }

  private bind(): void {
    this.on(window, 'keydown', (ev: KeyboardEvent) => {
      const code = ev.code || ev.key;
      const target = ev.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA');

      switch (code) {
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
        case 'Enter':
        case 'NumpadEnter':
          // Let the browser activate a focused button with Enter/Space.
          if (typing || isActivatable(target)) return;
          ev.preventDefault();
          this.firstGesture();
          if (!ev.repeat) this.handlers.flap();
          break;
        case 'Escape':
        case 'KeyP':
          if (typing) return;
          ev.preventDefault();
          this.firstGesture();
          this.handlers.pause();
          break;
        case 'KeyM':
          if (typing) return;
          this.firstGesture();
          this.handlers.mute();
          break;
        case 'KeyR':
          if (typing) return;
          this.firstGesture();
          this.handlers.restart();
          break;
        default:
          break;
      }
    });

    this.on(
      this.root,
      'pointerdown',
      (ev: PointerEvent) => {
        this.firstGesture();
        if (ev.button !== undefined && ev.button !== 0) return;
        const target = ev.target as HTMLElement | null;
        if (target?.closest(UI_SELECTOR)) return;
        ev.preventDefault();
        this.handlers.flap();
      },
      { passive: false },
    );

    // Block every remaining browser gesture on the play surface.
    const swallow = (ev: Event) => {
      const target = ev.target as HTMLElement | null;
      if (target?.closest(UI_SELECTOR)) return;
      if (ev.cancelable) ev.preventDefault();
    };

    this.on(document, 'touchstart', swallow, { passive: false });
    this.on(document, 'touchmove', swallow, { passive: false });
    this.on(document, 'gesturestart', swallow, { passive: false });
    this.on(document, 'dblclick', swallow, { passive: false });
    this.on(this.root, 'contextmenu', swallow, { passive: false });
    this.on(window, 'wheel', swallow, { passive: false });
    this.on(document, 'dragstart', swallow, { passive: false });
  }

  dispose(): void {
    for (const d of this.disposers) d();
    this.disposers = [];
  }
}

const isActivatable = (el: HTMLElement | null): boolean =>
  !!el && (el.tagName === 'BUTTON' || el.tagName === 'A');
