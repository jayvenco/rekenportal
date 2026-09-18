import { Rng } from '../core/Rng';
import { clamp01, rgb, type RGB } from '../core/math';
import { bakeGrainTile, ctx2d, makeCanvas } from './textures';
import type { SkyState } from './SkyState';

const asRGB = (c: number[]): RGB => c as unknown as RGB;

/**
 * The finishing pass: vignette, colour grade, exposure flashes, speed streaks
 * and film grain. All of it is a handful of full-screen fills, which a
 * compositor handles far more cheaply than any per-pixel work would.
 */
export class Post {
  private vignette: HTMLCanvasElement | null = null;
  private grain: CanvasPattern | null = null;
  private grainTile: HTMLCanvasElement | null = null;
  private w = 0;
  private h = 0;
  private rng = new Rng(0xbeef);
  private streakPhase = 0;

  /** Additive white flash, 0..1. */
  flash = 0;
  /** Additive damage flash, 0..1. */
  damage = 0;

  resize(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    if (this.w === w && this.h === h && this.vignette) return;
    this.w = w;
    this.h = h;

    const scale = 0.35;
    const vw = Math.max(8, Math.round(w * scale));
    const vh = Math.max(8, Math.round(h * scale));
    const c = makeCanvas(vw, vh);
    const g = ctx2d(c);
    const grad = g.createRadialGradient(
      vw * 0.5,
      vh * 0.46,
      Math.min(vw, vh) * 0.22,
      vw * 0.5,
      vh * 0.5,
      Math.max(vw, vh) * 0.78,
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.28)');
    grad.addColorStop(1, 'rgba(0,0,0,1)');
    g.fillStyle = grad;
    g.fillRect(0, 0, vw, vh);
    this.vignette = c;

    if (!this.grainTile) this.grainTile = bakeGrainTile(140);
    this.grain = ctx.createPattern(this.grainTile, 'repeat');
  }

  update(dt: number): void {
    this.flash = Math.max(0, this.flash - dt * 3.4);
    this.damage = Math.max(0, this.damage - dt * 2.1);
    this.streakPhase += dt;
  }

  /** Motion streaks that only appear once the world is genuinely moving fast. */
  drawSpeedLines(
    ctx: CanvasRenderingContext2D,
    intensity: number,
    u: number,
    color: RGB,
  ): void {
    const a = clamp01((intensity - 0.32) / 0.68);
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.rng.reseed(0x1234);
    const count = Math.round(8 + a * 12);
    for (let i = 0; i < count; i++) {
      const y = this.rng.range(0, this.h);
      const edge = Math.max(0, 1 - Math.abs(y - this.h * 0.5) / (this.h * 0.5));
      const weight = 1 - edge * 0.85;
      const speed = 0.7 + this.rng.next() * 1.4;
      const x =
        ((this.rng.next() * 1.4 + this.streakPhase * speed) % 1.4) * (this.w + u) - u * 0.5;
      const len = u * (0.1 + this.rng.next() * 0.28);
      const grad = ctx.createLinearGradient(x, y, x + len, y);
      grad.addColorStop(0, rgb(color, 0));
      grad.addColorStop(0.5, rgb(color, 0.06 * a * weight));
      grad.addColorStop(1, rgb(color, 0));
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, len, Math.max(1, u * 0.0016));
    }
    ctx.restore();
  }

  draw(
    ctx: CanvasRenderingContext2D,
    sky: SkyState,
    opts: { grain: boolean; exposure: number },
  ): void {
    const w = this.w;
    const h = this.h;

    // Colour grade — a wash of the sky's dominant hue over the whole frame.
    if (sky.gradeAmount > 0.001) {
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = sky.gradeAmount;
      ctx.fillStyle = rgb(asRGB(sky.gradeTint));
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    if (this.vignette) {
      ctx.save();
      ctx.globalAlpha = sky.vignette;
      ctx.drawImage(this.vignette, 0, 0, w, h);
      ctx.restore();
    }

    if (opts.grain && this.grain && this.grainTile) {
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.05;
      const ox = Math.floor(Math.random() * this.grainTile.width);
      const oy = Math.floor(Math.random() * this.grainTile.height);
      ctx.translate(-ox, -oy);
      ctx.fillStyle = this.grain;
      ctx.fillRect(0, 0, w + ox + 1, h + oy + 1);
      ctx.restore();
    }

    const exposure = this.flash + opts.exposure;
    if (exposure > 0.002) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,250,238,${Math.min(0.85, exposure * 0.5)})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    if (this.damage > 0.002) {
      ctx.save();
      const grad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.18,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.7,
      );
      grad.addColorStop(0, 'rgba(190,20,10,0)');
      grad.addColorStop(1, `rgba(180,24,12,${0.72 * this.damage})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }

  /** Darkening wash used behind menus and the pause screen. */
  drawScrim(ctx: CanvasRenderingContext2D, amount: number): void {
    if (amount <= 0.002) return;
    ctx.save();
    ctx.fillStyle = `rgba(4,7,15,${amount * 0.55})`;
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.restore();
  }
}
