import { clamp } from './math';

/**
 * Owns canvas sizing and the world coordinate system.
 *
 * Everything in the game is expressed in *units*, where one unit is
 * `Viewport.u` CSS pixels. The unit is derived from the geometric mean of the
 * viewport so that a phone in portrait, a laptop and an ultrawide monitor all
 * get a comparable amount of manoeuvring room and reaction time — a game tuned
 * on 16:9 shouldn't become trivial on 21:9 or brutal on 19.5:9.
 */
export class Viewport {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  /** CSS pixel size of the stage. */
  cssW = 1;
  cssH = 1;
  /** Backing store size (CSS size × effective dpr). */
  pxW = 1;
  pxH = 1;
  /** Effective device pixel ratio after quality + memory caps. */
  dpr = 1;
  /** CSS pixels per world unit. */
  u = 1;
  /** Visible world size, in units. */
  worldW = 1;
  worldH = 1;

  /** Upper bound on backing-store pixels; keeps fill-rate sane on 4K panels. */
  private maxPixels = 2_600_000;
  private dprCap = 2;
  private listeners = new Set<() => void>();
  private raf = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) throw new Error('Canvas 2D is not available in this browser.');
    this.ctx = ctx;

    this.measure();

    const schedule = () => {
      if (this.raf) return;
      this.raf = requestAnimationFrame(() => {
        this.raf = 0;
        this.measure();
      });
    };

    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(schedule).observe(canvas);
    }
    // iOS collapses/expands its URL bar without firing a reliable resize.
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
  }

  onResize(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Lower the render resolution when the adaptive quality system asks. */
  setDprCap(cap: number): void {
    if (Math.abs(cap - this.dprCap) < 0.01) return;
    this.dprCap = cap;
    this.measure();
  }

  private measure(): void {
    const rect = this.canvas.getBoundingClientRect();
    const cssW = Math.max(1, Math.round(rect.width || window.innerWidth));
    const cssH = Math.max(1, Math.round(rect.height || window.innerHeight));

    const raw = Math.min(window.devicePixelRatio || 1, this.dprCap);
    const budget = Math.sqrt(this.maxPixels / (cssW * cssH));
    const dpr = clamp(Math.min(raw, budget), 0.75, 3);

    const pxW = Math.max(1, Math.round(cssW * dpr));
    const pxH = Math.max(1, Math.round(cssH * dpr));

    const unchanged =
      cssW === this.cssW && cssH === this.cssH && pxW === this.pxW && pxH === this.pxH;
    if (unchanged) return;

    this.cssW = cssW;
    this.cssH = cssH;
    this.dpr = dpr;
    this.pxW = pxW;
    this.pxH = pxH;
    this.canvas.width = pxW;
    this.canvas.height = pxH;

    this.u = computeUnit(cssW, cssH);
    this.worldW = cssW / this.u;
    this.worldH = cssH / this.u;

    for (const fn of this.listeners) fn();
  }

  /** Reset the transform so drawing code can work in CSS pixels. */
  beginFrame(): CanvasRenderingContext2D {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    return ctx;
  }
}

function computeUnit(w: number, h: number): number {
  let u = Math.sqrt(w * h) * 0.75;
  // Floors: stop the world from spanning too many units (too much lookahead).
  u = Math.max(u, w / 1.9, h / 1.78);
  // Ceilings: guarantee a minimum visible extent in both axes.
  u = Math.min(u, w / 0.78, h / 0.82);
  return clamp(u, 220, 2400);
}
