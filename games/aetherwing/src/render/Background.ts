import type { RidgeStyle, Theme } from '../config/themes';
import { Rng } from '../core/Rng';
import { TAU, clamp01, mixRGB, rgb, shade, type RGB } from '../core/math';
import { ctx2d, makeCanvas } from './textures';

type LayerKind = 'clouds' | 'ridge' | 'islands' | 'mist';

interface LayerSpec {
  kind: LayerKind;
  parallax: number;
  /** Band position as a fraction of viewport height. */
  top: number;
  bottom: number;
  /** Bake resolution relative to CSS pixels. */
  res: number;
  /** Index into `theme.ridges`, for ridge layers. */
  ridge?: number;
  /** Cloud tuning. */
  puffScale?: number;
  clusters?: number;
  /** Drawn in front of the gameplay plane. */
  front?: boolean;
  /** Dropped first when quality is reduced. */
  lod?: number;
}

const SPECS: readonly LayerSpec[] = [
  { kind: 'clouds', parallax: 0.045, top: 0.0, bottom: 0.56, res: 0.42, puffScale: 1.55, clusters: 5 },
  { kind: 'ridge', parallax: 0.1, top: 0.28, bottom: 1.0, res: 0.45, ridge: 0 },
  { kind: 'ridge', parallax: 0.175, top: 0.36, bottom: 1.0, res: 0.5, ridge: 1, lod: 1 },
  { kind: 'islands', parallax: 0.27, top: 0.08, bottom: 0.78, res: 0.52, lod: 1 },
  { kind: 'ridge', parallax: 0.33, top: 0.46, bottom: 1.0, res: 0.6, ridge: 2 },
  { kind: 'clouds', parallax: 0.47, top: 0.38, bottom: 0.96, res: 0.55, puffScale: 2.5, clusters: 4 },
  { kind: 'ridge', parallax: 0.58, top: 0.63, bottom: 1.0, res: 0.8, ridge: 3 },
  { kind: 'mist', parallax: 1.22, top: 0.7, bottom: 1.0, res: 0.5, front: true },
];

interface Layer {
  spec: LayerSpec;
  canvas: HTMLCanvasElement;
  /** Viewport height the canvas was baked against, for aspect bookkeeping. */
  bakedH: number;
}

export interface SkyBake {
  theme: Theme;
  layers: Layer[];
  steps: Array<() => void>;
  total: number;
  ready: boolean;
}

/**
 * Baked parallax terrain.
 *
 * Ridge *shapes* are seeded per layer, never per theme, so the geography of
 * the world stays consistent while its light changes. That is what makes a
 * sky shift feel like weather rolling in rather than a level swap — the same
 * mountains, lit differently.
 *
 * Baking is chunked into steps and metered against a millisecond budget, so
 * generating the next sky mid-flight never costs a dropped frame.
 */
export class Background {
  /** Displayed sky. */
  private current: SkyBake | null = null;
  /** Sky being cross-faded in. */
  private next: SkyBake | null = null;
  /** Fresh copy of `current` at a new viewport size; swapped in when ready. */
  private rebake: SkyBake | null = null;
  private cssW = 0;
  private cssH = 0;
  private lodLimit = 0;

  get currentTheme(): Theme | null {
    return this.current?.theme ?? null;
  }

  get nextTheme(): Theme | null {
    return this.next?.theme ?? null;
  }

  get nextReady(): boolean {
    return !!this.next?.ready;
  }

  setViewport(cssW: number, cssH: number): void {
    this.cssW = cssW;
    this.cssH = cssH;
  }

  setLod(limit: number): void {
    this.lodLimit = limit;
  }

  /** True when the given theme is the one on screen. */
  isCurrent(theme: Theme): boolean {
    return this.current?.theme.id === theme.id;
  }

  /** Replace the visible sky outright. Only safe before anything is on screen. */
  requestNow(theme: Theme): void {
    this.current = this.createBake(theme);
    this.rebake = null;
    this.next = null;
  }

  /**
   * Switch skies without a cross-fade, keeping the old terrain on screen until
   * the replacement finishes. Used when a run resets to its starting sky.
   */
  requestSwap(theme: Theme): void {
    if (this.current?.theme.id === theme.id && !this.rebake) return;
    if (!this.current) {
      this.requestNow(theme);
      return;
    }
    this.rebake = this.createBake(theme);
    this.next = null;
  }

  /** Prepare the sky we are about to cross-fade into. */
  requestNext(theme: Theme): void {
    this.next = this.createBake(theme);
  }

  /** Promote the queued sky to the visible one. */
  promote(): void {
    if (!this.next) return;
    this.current = this.next;
    this.next = null;
    this.rebake = null;
  }

  discardNext(): void {
    this.next = null;
  }

  /** 0..1 completion of whichever sky is currently being generated. */
  get bakeProgress(): number {
    const target = this.pending;
    if (!target) return 1;
    return 1 - target.steps.length / Math.max(1, target.total);
  }

  private get pending(): SkyBake | null {
    if (this.current && !this.current.ready) return this.current;
    if (this.rebake && !this.rebake.ready) return this.rebake;
    if (this.next && !this.next.ready) return this.next;
    return null;
  }

  /** Runs queued bake work for up to `budgetMs`. @returns 0..1 progress. */
  pump(budgetMs: number): number {
    const target = this.pending;
    if (!target) return 1;
    const start = performance.now();
    do {
      target.steps.shift()?.();
    } while (target.steps.length && performance.now() - start < budgetMs);
    if (!target.steps.length) this.settle(target);
    return this.bakeProgress;
  }

  /** Force every pending bake to finish now. */
  finish(): void {
    for (let i = 0; i < 4; i++) {
      const target = this.pending;
      if (!target) return;
      while (target.steps.length) target.steps.shift()?.();
      this.settle(target);
    }
  }

  private settle(bake: SkyBake): void {
    bake.ready = true;
    if (bake === this.rebake) {
      this.current = bake;
      this.rebake = null;
    }
  }

  /**
   * Regenerate at the current viewport size. The existing layers keep drawing
   * (stretched) until the replacements are finished, so a resize never blanks
   * the world.
   */
  invalidate(): void {
    if (this.current) this.rebake = this.createBake(this.current.theme);
    if (this.next) this.next = this.createBake(this.next.theme);
  }

  private createBake(theme: Theme): SkyBake {
    const bake: SkyBake = { theme, layers: [], steps: [], total: 0, ready: false };
    const w = this.cssW;
    const h = this.cssH;
    if (w < 2 || h < 2) {
      bake.ready = true;
      return bake;
    }

    SPECS.forEach((spec, index) => {
      if ((spec.lod ?? 0) > 0 && (spec.lod ?? 0) <= this.lodLimit) return;
      const bandH = (spec.bottom - spec.top) * h;
      const cw = Math.max(8, Math.round(w * spec.res));
      const ch = Math.max(8, Math.round(bandH * spec.res));
      const layer: Layer = { spec, canvas: makeCanvas(cw, ch), bakedH: h };
      bake.layers.push(layer);
      bake.steps.push(() => paintLayer(layer, theme, index));
    });

    bake.total = bake.steps.length;
    return bake;
  }

  /* --------------------------------- draw -------------------------------- */

  drawBack(
    ctx: CanvasRenderingContext2D,
    scroll: number,
    blend: number,
    overscan: number,
  ): void {
    if (this.current) this.drawBake(ctx, this.current, scroll, 1, false, overscan);
    if (this.next?.ready && blend > 0.001) {
      this.drawBake(ctx, this.next, scroll, blend, false, overscan);
    }
  }

  drawFront(
    ctx: CanvasRenderingContext2D,
    scroll: number,
    blend: number,
    overscan: number,
  ): void {
    if (this.current) this.drawBake(ctx, this.current, scroll, 1, true, overscan);
    if (this.next?.ready && blend > 0.001) {
      this.drawBake(ctx, this.next, scroll, blend, true, overscan);
    }
  }

  private drawBake(
    ctx: CanvasRenderingContext2D,
    bake: SkyBake,
    scroll: number,
    alpha: number,
    front: boolean,
    overscan: number,
  ): void {
    if (!bake.ready) return;
    ctx.globalAlpha = alpha;
    const vx0 = -overscan;
    const period = this.cssW;
    const vx1 = period + overscan;
    for (const layer of bake.layers) {
      if (!!layer.spec.front !== front) continue;
      // Destination geometry is derived from the *current* viewport, so a
      // layer baked at a stale size simply stretches until the rebake lands.
      const y = layer.spec.top * this.cssH;
      const h = (layer.spec.bottom - layer.spec.top) * this.cssH;
      const offset = -((scroll * layer.spec.parallax) % period);
      const first = Math.floor((vx0 - offset) / period);
      const last = Math.floor((vx1 - offset) / period);
      for (let i = first; i <= last; i++) {
        ctx.drawImage(layer.canvas, offset + i * period, y, period, h);
      }
    }
    ctx.globalAlpha = 1;
  }
}

/* ------------------------------ layer painting ---------------------------- */

function paintLayer(layer: Layer, theme: Theme, index: number): void {
  const g = ctx2d(layer.canvas);
  const w = layer.canvas.width;
  const h = layer.canvas.height;
  g.clearRect(0, 0, w, h);
  switch (layer.spec.kind) {
    case 'ridge':
      // Ridges already end in transparency above the silhouette and run off
      // the bottom of the frame, so they need no feathering.
      paintRidge(g, layer, theme, index);
      break;
    case 'clouds':
      paintClouds(g, layer, theme, index);
      featherEdges(g, w, h, h * 0.22, h * 0.26);
      break;
    case 'islands':
      paintIslands(g, layer, theme, index);
      featherEdges(g, w, h, h * 0.16, h * 0.3);
      break;
    case 'mist':
      paintMist(g, layer, theme);
      featherEdges(g, w, h, h * 0.3, 0);
      break;
  }
}

/**
 * Dissolve a layer into nothing at its top and bottom edges.
 *
 * Without this, anything painted near a band boundary — a cloud crown, the
 * mist off an island — is sliced off by the canvas edge and reads as a hard
 * horizontal line straight across the sky.
 */
function featherEdges(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  topFade: number,
  bottomFade: number,
): void {
  g.globalCompositeOperation = 'destination-out';
  if (topFade > 1) {
    const grad = g.createLinearGradient(0, 0, 0, topFade);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, topFade);
  }
  if (bottomFade > 1) {
    const grad = g.createLinearGradient(0, h - bottomFade, 0, h);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.45, 'rgba(0,0,0,0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,1)');
    g.fillStyle = grad;
    g.fillRect(0, h - bottomFade, w, bottomFade);
  }
  g.globalCompositeOperation = 'source-over';
}

/** Ridged multifractal built from integer harmonics, so it tiles exactly. */
function makeProfile(seed: number): (x: number) => number {
  const rng = new Rng(seed);
  const ks = [1, 2, 3, 5, 8, 13, 21];
  const amps = [1, 0.56, 0.34, 0.2, 0.12, 0.07, 0.04];
  const phases = ks.map(() => rng.next());
  const total = amps.reduce((a, b) => a + b, 0);
  return (x: number): number => {
    let v = 0;
    for (let i = 0; i < ks.length; i++) {
      v += amps[i] * (1 - Math.abs(Math.sin(Math.PI * (ks[i] * x + phases[i]))));
    }
    return Math.pow(clamp01(v / total), 1.35);
  };
}

function paintRidge(
  g: CanvasRenderingContext2D,
  layer: Layer,
  theme: Theme,
  index: number,
): void {
  const style: RidgeStyle = theme.ridges[layer.spec.ridge ?? 0];
  const w = layer.canvas.width;
  const h = layer.canvas.height;
  const profile = makeProfile(0x2a1f + index * 7919);
  const rng = new Rng(0x51a3 + index * 104729);

  const samples = Math.min(460, Math.max(90, Math.round(w / 3)));
  const xs = new Float32Array(samples + 1);
  const ys = new Float32Array(samples + 1);
  const peakY = h * 0.04;
  const valleyY = h * 0.7;
  let minY = h;
  for (let i = 0; i <= samples; i++) {
    const x01 = i / samples;
    const p = profile(x01);
    xs[i] = x01 * w;
    ys[i] = valleyY + (peakY - valleyY) * p;
    if (ys[i] < minY) minY = ys[i];
  }

  const silhouette = new Path2D();
  silhouette.moveTo(0, ys[0]);
  for (let i = 1; i <= samples; i++) silhouette.lineTo(xs[i], ys[i]);
  silhouette.lineTo(w, h);
  silhouette.lineTo(0, h);
  silhouette.closePath();

  const top = mixRGB(style.color, style.haze, style.hazeAmount * 0.5);
  const bottom = mixRGB(style.color, style.haze, Math.min(1, style.hazeAmount * 1.25));

  g.save();
  g.clip(silhouette);
  const body = g.createLinearGradient(0, minY, 0, h);
  body.addColorStop(0, rgb(top));
  body.addColorStop(0.55, rgb(mixRGB(top, bottom, 0.55)));
  body.addColorStop(1, rgb(bottom));
  g.fillStyle = body;
  g.fillRect(0, 0, w, h);

  // Gullies: vertical creases falling from the peaks give the mass volume.
  const gullies = Math.round(w / 26);
  g.lineCap = 'round';
  for (let i = 0; i < gullies; i++) {
    const x = rng.range(0, w);
    const si = Math.round((x / w) * samples);
    const y0 = ys[Math.min(samples, si)];
    const len = rng.range(h * 0.08, h * 0.42);
    g.beginPath();
    g.moveTo(x, y0);
    g.quadraticCurveTo(x + rng.spread(w * 0.012), y0 + len * 0.5, x + rng.spread(w * 0.02), y0 + len);
    g.strokeStyle = rgb(shade(style.color, -0.4), rng.range(0.05, 0.16) * (1 - style.hazeAmount * 0.6));
    g.lineWidth = rng.range(1, Math.max(1.4, w * 0.0035));
    g.stroke();
  }
  g.restore();

  // Snow / ice on the high ground.
  if (style.snowLine > 0) {
    const hMax = h - minY;
    const threshold = h - hMax * style.snowLine;
    g.save();
    g.clip(silhouette);
    g.beginPath();
    let open = false;
    for (let i = 0; i <= samples; i++) {
      if (ys[i] < threshold) {
        if (!open) {
          g.moveTo(xs[i], ys[i]);
          open = true;
        } else {
          g.lineTo(xs[i], ys[i]);
        }
      } else if (open) {
        closeSnowRun(g, xs, ys, i - 1, threshold, hMax);
        open = false;
      }
    }
    if (open) closeSnowRun(g, xs, ys, samples, threshold, hMax);
    const snow = g.createLinearGradient(0, minY, 0, threshold);
    snow.addColorStop(0, rgb(style.snowColor, 0.95));
    snow.addColorStop(1, rgb(style.snowColor, 0.12));
    g.fillStyle = snow;
    g.fill();
    g.restore();
  }

  // Directional rim light: only the faces turned toward the sun catch it.
  if (style.rimAmount > 0.01) {
    const sunX = theme.sunX * w;
    const sunY = (theme.sunY - layer.spec.top) * (h / (layer.spec.bottom - layer.spec.top));
    g.lineCap = 'round';
    g.lineWidth = Math.max(1.1, h * 0.006);
    for (let i = 0; i < samples; i++) {
      const dx = xs[i + 1] - xs[i];
      const dy = ys[i + 1] - ys[i];
      const len = Math.hypot(dx, dy) || 1;
      const nx = dy / len;
      const ny = -dx / len;
      let lx = sunX - xs[i];
      let ly = sunY - ys[i];
      const ll = Math.hypot(lx, ly) || 1;
      lx /= ll;
      ly /= ll;
      const d = nx * lx + ny * ly;
      if (d <= 0.08) continue;
      g.strokeStyle = rgb(style.rim, Math.pow(d, 1.6) * style.rimAmount * 0.85);
      g.beginPath();
      g.moveTo(xs[i], ys[i]);
      g.lineTo(xs[i + 1], ys[i + 1]);
      g.stroke();
    }
  }

  // Haze pooling in the valleys. Four ranges stack, so each one contributes
  // only a little — otherwise the whole frame turns to milk.
  const haze = g.createLinearGradient(0, minY, 0, h);
  haze.addColorStop(0, rgb(theme.fogColor, 0));
  haze.addColorStop(0.55, rgb(theme.fogColor, (0.03 + style.hazeAmount * 0.1) * theme.fogStrength * 2));
  haze.addColorStop(1, rgb(theme.fogColor, (0.08 + style.hazeAmount * 0.26) * theme.fogStrength * 2));
  g.fillStyle = haze;
  g.fillRect(0, 0, w, h);
}

function closeSnowRun(
  g: CanvasRenderingContext2D,
  xs: Float32Array,
  ys: Float32Array,
  end: number,
  threshold: number,
  hMax: number,
): void {
  for (let j = end; j >= 0; j--) {
    if (ys[j] >= threshold) break;
    const depth = (threshold - ys[j]) / Math.max(1, hMax) ;
    g.lineTo(xs[j], ys[j] + depth * hMax * 0.55 + 2);
  }
  g.closePath();
}

function paintClouds(
  g: CanvasRenderingContext2D,
  layer: Layer,
  theme: Theme,
  index: number,
): void {
  const w = layer.canvas.width;
  const h = layer.canvas.height;
  const rng = new Rng(0x77c1 + index * 31337);
  const clusters = Math.max(2, Math.round((layer.spec.clusters ?? 4) * (0.6 + theme.cloudCover)));
  const puffScale = layer.spec.puffScale ?? 2;
  const lightDx = theme.sunX < 0.5 ? -1 : 1;

  interface Puff {
    x: number;
    y: number;
    r: number;
  }

  for (let c = 0; c < clusters; c++) {
    const cx = ((c + rng.range(0.15, 0.85)) / clusters) * w;
    // Clouds are wide and flat; radius is derived from the band height so the
    // silhouette is identical whatever resolution the layer was baked at.
    const puffR = h * rng.range(0.1, 0.16) * (puffScale * 0.5);
    const cy = clamp01(rng.range(0.3, 0.66)) * h;
    const spanX = puffR * rng.range(4.5, 8);

    const puffs: Puff[] = [];
    const n = rng.int(9, 15);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const arc = Math.pow(Math.sin(t * Math.PI), 0.7);
      puffs.push({
        x: cx + (t - 0.5) * spanX + rng.spread(puffR * 0.3),
        y: cy - arc * puffR * 0.85 + rng.spread(puffR * 0.16),
        r: puffR * (0.42 + arc * 0.72) * rng.range(0.82, 1.15),
      });
    }

    const drawSet = (offsetX: number): void => {
      // A flat, shaded base: real cloud decks are anvil-bottomed.
      g.globalCompositeOperation = 'source-over';
      for (const p of puffs) {
        const px = p.x + offsetX;
        const py = p.y + p.r * 0.22;
        const grad = g.createRadialGradient(px, py - p.r * 0.2, p.r * 0.1, px, py, p.r);
        grad.addColorStop(0, rgb(theme.cloudLo, theme.cloudAlpha * 0.95));
        grad.addColorStop(0.62, rgb(theme.cloudLo, theme.cloudAlpha * 0.6));
        grad.addColorStop(1, rgb(theme.cloudLo, 0));
        g.fillStyle = grad;
        g.beginPath();
        g.ellipse(px, py, p.r, p.r * 0.78, 0, 0, TAU);
        g.fill();
      }
      // Crowns catching the sun.
      g.globalCompositeOperation = 'lighter';
      for (const p of puffs) {
        const lx = p.x + offsetX + lightDx * p.r * 0.26;
        const ly = p.y - p.r * 0.34;
        const r = p.r * 0.78;
        const grad = g.createRadialGradient(lx, ly, 0, lx, ly, r);
        grad.addColorStop(0, rgb(theme.cloudHi, theme.cloudAlpha * 0.42));
        grad.addColorStop(0.55, rgb(theme.cloudHi, theme.cloudAlpha * 0.13));
        grad.addColorStop(1, rgb(theme.cloudHi, 0));
        g.fillStyle = grad;
        g.beginPath();
        g.arc(lx, ly, r, 0, TAU);
        g.fill();
      }
      g.globalCompositeOperation = 'source-over';
    };

    drawSet(0);
    const reach = spanX * 0.5 + puffR * 1.4;
    if (cx - reach < 0) drawSet(w);
    if (cx + reach > w) drawSet(-w);
  }
}

function paintIslands(
  g: CanvasRenderingContext2D,
  layer: Layer,
  theme: Theme,
  index: number,
): void {
  const w = layer.canvas.width;
  const h = layer.canvas.height;
  const rng = new Rng(0x1b9d + index * 55001);
  const style = theme.ridges[2];
  const count = rng.int(3, 4);
  const lightDx = theme.sunX >= 0.5 ? 1 : -1;

  const rock = mixRGB(style.color, style.haze, style.hazeAmount * 0.45);
  const rockLit = mixRGB(shade(style.color, 0.3), style.haze, style.hazeAmount * 0.35);
  const rockDeep = mixRGB(shade(style.color, -0.45), theme.fogColor, 0.28);

  for (let i = 0; i < count; i++) {
    const cx = ((i + rng.range(0.2, 0.8)) / count) * w;
    const cy = rng.range(h * 0.3, h * 0.6);
    const rw = h * rng.range(0.13, 0.22);
    const capH = rw * rng.range(0.16, 0.24);
    const keelH = rw * rng.range(1.5, 2.4);

    // Pre-roll the silhouette so both wrapped copies are identical.
    const notches = rng.int(4, 6);
    const keel: Array<[number, number]> = [];
    for (let s = 1; s < notches; s++) {
      const t = s / notches;
      // Deepest at the centre, tapering to the rim: a hanging keel of rock.
      const taper = Math.pow(Math.sin(t * Math.PI), 0.85);
      keel.push([t, taper * rng.range(0.55, 1)]);
    }
    const towerX = rng.spread(rw * 0.42);
    const towerH = rw * rng.range(0.5, 1);
    const towerW = rw * rng.range(0.13, 0.2);
    const shardCount = rng.int(2, 4);
    const shards: Array<[number, number, number]> = [];
    for (let s = 0; s < shardCount; s++) {
      shards.push([rng.range(-1, 1), rng.range(0.3, 0.9), rng.range(0.05, 0.11)]);
    }

    const draw = (ox: number): void => {
      const x = cx + ox;

      // Underside keel.
      g.beginPath();
      g.moveTo(x - rw, cy);
      for (const [t, depth] of keel) {
        const sx = x - rw + t * rw * 2;
        g.lineTo(sx + rw * 0.05, cy + keelH * depth);
        g.lineTo(sx + rw * 0.16, cy + keelH * depth * 0.42);
      }
      g.lineTo(x + rw, cy);
      g.closePath();
      const under = g.createLinearGradient(0, cy - capH, 0, cy + keelH);
      under.addColorStop(0, rgb(rock));
      under.addColorStop(0.35, rgb(shade(rock, -0.28)));
      under.addColorStop(1, rgb(rockDeep, 0.35));
      g.fillStyle = under;
      g.fill();

      // Plateau slab with a lit rim on the sunward side.
      g.beginPath();
      g.ellipse(x, cy - capH * 0.2, rw, capH, 0, 0, TAU);
      const top = g.createLinearGradient(x - rw * lightDx, cy - capH, x + rw * lightDx, cy + capH);
      top.addColorStop(0, rgb(rockLit));
      top.addColorStop(0.55, rgb(rock));
      top.addColorStop(1, rgb(shade(rock, -0.35)));
      g.fillStyle = top;
      g.fill();

      g.strokeStyle = rgb(style.rim, style.rimAmount * 0.55);
      g.lineWidth = Math.max(1, rw * 0.02);
      g.beginPath();
      g.ellipse(x, cy - capH * 0.2, rw * 0.98, capH * 0.94, 0, Math.PI, TAU);
      g.stroke();

      // A ruined tower, so these read as inhabited ruins rather than debris.
      const tx = x + towerX;
      const ty = cy - capH * 0.4;
      g.fillStyle = rgb(shade(rock, 0.08));
      g.fillRect(tx - towerW, ty - towerH, towerW * 0.72, towerH);
      g.fillRect(tx + towerW * 0.4, ty - towerH * 0.66, towerW * 0.66, towerH * 0.66);
      g.fillRect(tx - towerW, ty - towerH, towerW * 2.06, towerH * 0.13);
      g.fillStyle = rgb(style.rim, style.rimAmount * 0.6);
      g.fillRect(tx - towerW, ty - towerH, towerW * 2.06, Math.max(1, towerH * 0.03));

      // Debris still orbiting the island.
      g.fillStyle = rgb(shade(rock, -0.15), 0.85);
      for (const [sx, sy, ss] of shards) {
        const px = x + sx * rw * 1.35;
        const py = cy + sy * keelH * 0.55;
        const r = rw * ss;
        g.beginPath();
        g.moveTo(px - r, py);
        g.lineTo(px, py - r * 0.7);
        g.lineTo(px + r, py + r * 0.2);
        g.lineTo(px - r * 0.3, py + r * 0.6);
        g.closePath();
        g.fill();
      }

      // Vapour shedding off the underside.
      const mist = g.createRadialGradient(x, cy + keelH * 0.5, 0, x, cy + keelH * 0.5, rw * 1.7);
      mist.addColorStop(0, rgb(theme.fogColor, 0.2));
      mist.addColorStop(1, rgb(theme.fogColor, 0));
      g.fillStyle = mist;
      g.beginPath();
      g.ellipse(x, cy + keelH * 0.5, rw * 1.7, keelH * 0.72, 0, 0, TAU);
      g.fill();
    };

    draw(0);
    const reach = rw * 2.4;
    if (cx - reach < 0) draw(w);
    if (cx + reach > w) draw(-w);
  }
}

function paintMist(g: CanvasRenderingContext2D, layer: Layer, theme: Theme): void {
  const w = layer.canvas.width;
  const h = layer.canvas.height;
  const rng = new Rng(0x3ff1);
  const fog: RGB = theme.fogColor;

  // The cloud sea the world floats above — and the surface a fall ends on.
  const sea = g.createLinearGradient(0, h * 0.24, 0, h);
  sea.addColorStop(0, rgb(fog, 0));
  sea.addColorStop(0.5, rgb(fog, 0.2));
  sea.addColorStop(1, rgb(mixRGB(fog, theme.skyLow, 0.35), 0.62));
  g.fillStyle = sea;
  g.fillRect(0, 0, w, h);

  for (let i = 0; i < 14; i++) {
    const x = rng.range(0, w);
    const y = rng.range(h * 0.3, h * 0.95);
    const rw = rng.range(w * 0.09, w * 0.24);
    const rh = rng.range(h * 0.06, h * 0.18);
    const a = rng.range(0.07, 0.2);
    const puff = (px: number): void => {
      const grad = g.createRadialGradient(px, y, 0, px, y, Math.max(rw, rh));
      grad.addColorStop(0, rgb(shade(fog, 0.28), a));
      grad.addColorStop(1, rgb(fog, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.ellipse(px, y, rw, rh, 0, 0, TAU);
      g.fill();
    };
    puff(x);
    if (x - rw < 0) puff(x + w);
    if (x + rw > w) puff(x - w);
  }
}
