import { TAU, rgb, type RGB } from '../core/math';
import type { SkyEffect, Theme } from '../config/themes';
import type { SkyState } from './SkyState';

const asRGB = (c: number[]): RGB => c as unknown as RGB;

/**
 * Everything painted live above the baked terrain: the gradient itself, the
 * sun, and one signature phenomenon per sky. All of it is cheap enough to
 * redraw every frame, which is what lets two skies cross-fade continuously.
 */
export class SkyEffects {
  private time = 0;
  private lightning = 0;
  private lightningNext = 3;
  private boltSeed = 0;

  update(dt: number): void {
    this.time += dt;
    if (this.lightning > 0) this.lightning = Math.max(0, this.lightning - dt * 3.2);
    this.lightningNext -= dt;
    if (this.lightningNext <= 0) {
      this.lightningNext = 2.6 + Math.random() * 6.5;
      this.lightning = 1;
      this.boltSeed = Math.random();
    }
  }

  /** 0..1 — the renderer adds this to the exposure during a storm flash. */
  get flash(): number {
    return this.lightning;
  }

  drawSky(ctx: CanvasRenderingContext2D, sky: SkyState, w: number, h: number): void {
    const grad = ctx.createLinearGradient(0, 0, w * 0.12, h);
    grad.addColorStop(0, rgb(asRGB(sky.skyTop)));
    grad.addColorStop(0.52, rgb(asRGB(sky.skyMid)));
    grad.addColorStop(1, rgb(asRGB(sky.skyLow)));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Sun: a soft atmospheric bloom, then a hot core.
    const sx = sky.sunX * w;
    const sy = sky.sunY * h;
    const r = sky.sunSize * Math.min(w, h);
    const strength = sky.sunStrength;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const bloom = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 7);
    bloom.addColorStop(0, rgb(asRGB(sky.sunGlow), 0.34 * strength));
    bloom.addColorStop(0.28, rgb(asRGB(sky.sunGlow), 0.12 * strength));
    bloom.addColorStop(1, rgb(asRGB(sky.sunGlow), 0));
    ctx.fillStyle = bloom;
    ctx.fillRect(sx - r * 7, sy - r * 7, r * 14, r * 14);

    const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 1.5);
    core.addColorStop(0, rgb(asRGB(sky.sunCore), 0.95 * strength));
    core.addColorStop(0.42, rgb(asRGB(sky.sunCore), 0.5 * strength));
    core.addColorStop(0.72, rgb(asRGB(sky.sunGlow), 0.18 * strength));
    core.addColorStop(1, rgb(asRGB(sky.sunGlow), 0));
    ctx.fillStyle = core;
    ctx.fillRect(sx - r * 1.6, sy - r * 1.6, r * 3.2, r * 3.2);

    ctx.restore();
  }

  drawEffects(
    ctx: CanvasRenderingContext2D,
    sky: SkyState,
    w: number,
    h: number,
    quality: boolean,
  ): void {
    const a = sky.from;
    const b = sky.to;
    if (a.effect === b.effect) {
      this.drawEffect(ctx, a.effect, sky, a, w, h, 1, quality);
      return;
    }
    if (sky.t < 0.999) this.drawEffect(ctx, a.effect, sky, a, w, h, 1 - sky.t, quality);
    if (sky.t > 0.001) this.drawEffect(ctx, b.effect, sky, b, w, h, sky.t, quality);
  }

  private drawEffect(
    ctx: CanvasRenderingContext2D,
    effect: SkyEffect,
    sky: SkyState,
    theme: Theme,
    w: number,
    h: number,
    alpha: number,
    quality: boolean,
  ): void {
    switch (effect) {
      case 'godrays':
        if (quality) this.godrays(ctx, sky, w, h, alpha);
        break;
      case 'aurora':
        this.aurora(ctx, theme, w, h, alpha);
        break;
      case 'grid':
        this.grid(ctx, theme, w, h, alpha);
        break;
      case 'storm':
        this.storm(ctx, theme, w, h, alpha);
        break;
      case 'ashfall':
        this.ashfall(ctx, sky, w, h, alpha);
        break;
    }
  }

  /* -------------------------------- effects ------------------------------ */

  private godrays(
    ctx: CanvasRenderingContext2D,
    sky: SkyState,
    w: number,
    h: number,
    alpha: number,
  ): void {
    const sx = sky.sunX * w;
    const sy = sky.sunY * h;
    const len = Math.hypot(w, h) * 1.25;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(sx, sy);
    const rays = 9;
    for (let i = 0; i < rays; i++) {
      const base = (i / rays) * TAU + this.time * 0.014;
      const width = 0.045 + Math.sin(this.time * 0.31 + i * 2.1) * 0.03;
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 0.42 + i * 1.7);
      const grad = ctx.createLinearGradient(0, 0, Math.cos(base) * len, Math.sin(base) * len);
      grad.addColorStop(0, rgb(asRGB(sky.sunGlow), 0.16 * pulse * alpha * sky.sunStrength));
      grad.addColorStop(0.45, rgb(asRGB(sky.sunGlow), 0.05 * pulse * alpha * sky.sunStrength));
      grad.addColorStop(1, rgb(asRGB(sky.sunGlow), 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(base - width) * len, Math.sin(base - width) * len);
      ctx.lineTo(Math.cos(base + width) * len, Math.sin(base + width) * len);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private aurora(
    ctx: CanvasRenderingContext2D,
    theme: Theme,
    w: number,
    h: number,
    alpha: number,
  ): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const bands = 3;
    const colors: RGB[] = [
      [96, 255, 196],
      [110, 200, 255],
      [186, 140, 255],
    ];
    for (let b = 0; b < bands; b++) {
      const phase = this.time * (0.12 + b * 0.045) + b * 2.3;
      const top = h * (0.04 + b * 0.035);
      const height = h * (0.3 + b * 0.06);
      const grad = ctx.createLinearGradient(0, top, 0, top + height);
      grad.addColorStop(0, rgb(colors[b], 0));
      grad.addColorStop(0.32, rgb(colors[b], 0.15 * alpha));
      grad.addColorStop(1, rgb(colors[b], 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * w;
        const y =
          top +
          Math.sin(i * 0.55 + phase) * h * 0.045 +
          Math.sin(i * 0.21 + phase * 1.7) * h * 0.03;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let i = steps; i >= 0; i--) {
        const x = (i / steps) * w;
        const y =
          top +
          height +
          Math.sin(i * 0.44 + phase * 1.2) * h * 0.05 +
          Math.sin(i * 0.17 + phase) * h * 0.02;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    void theme;
  }

  private grid(
    ctx: CanvasRenderingContext2D,
    theme: Theme,
    w: number,
    h: number,
    alpha: number,
  ): void {
    const horizon = h * 0.7;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgb(theme.runeColor, 0.13 * alpha);
    ctx.lineWidth = 1;

    // Receding rows, animated toward the viewer.
    const scroll = (this.time * 0.24) % 1;
    ctx.beginPath();
    for (let i = 0; i < 14; i++) {
      const t = (i + scroll) / 14;
      const y = horizon + Math.pow(t, 2.6) * (h - horizon) * 1.5;
      if (y > h) continue;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Converging columns.
    ctx.beginPath();
    for (let i = -8; i <= 8; i++) {
      const x = w * 0.5 + i * w * 0.13;
      ctx.moveTo(w * 0.5 + i * w * 0.012, horizon);
      ctx.lineTo(x, h);
    }
    ctx.strokeStyle = rgb(theme.trim, 0.1 * alpha);
    ctx.stroke();

    const glow = ctx.createLinearGradient(0, horizon - h * 0.06, 0, horizon + h * 0.03);
    glow.addColorStop(0, rgb(theme.trim, 0));
    glow.addColorStop(1, rgb(theme.trim, 0.22 * alpha));
    ctx.fillStyle = glow;
    ctx.fillRect(0, horizon - h * 0.06, w, h * 0.09);
    ctx.restore();
  }

  private storm(
    ctx: CanvasRenderingContext2D,
    theme: Theme,
    w: number,
    h: number,
    alpha: number,
  ): void {
    const f = this.lightning;
    if (f <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const wash = ctx.createLinearGradient(0, 0, 0, h);
    wash.addColorStop(0, rgb(theme.stoneRim, 0.3 * f * f * alpha));
    wash.addColorStop(0.7, rgb(theme.stoneRim, 0.06 * f * alpha));
    wash.addColorStop(1, rgb(theme.stoneRim, 0));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);

    // The bolt itself only exists for the first instant of the flash.
    if (f > 0.72) {
      const bx = (0.15 + this.boltSeed * 0.7) * w;
      ctx.strokeStyle = rgb([235, 245, 255], (f - 0.72) / 0.28);
      ctx.lineWidth = Math.max(1.4, w * 0.0022);
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      let x = bx;
      let y = 0;
      let s = this.boltSeed * 1000;
      while (y < h * 0.62) {
        s = (s * 16807) % 2147483647;
        x += ((s / 2147483647) - 0.5) * w * 0.09;
        y += h * 0.07;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  private ashfall(
    ctx: CanvasRenderingContext2D,
    sky: SkyState,
    w: number,
    h: number,
    alpha: number,
  ): void {
    const pulse = 0.5 + 0.5 * Math.sin(this.time * 0.45);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createLinearGradient(0, h * 0.68, 0, h);
    glow.addColorStop(0, rgb(asRGB(sky.sunGlow), 0));
    glow.addColorStop(1, rgb(asRGB(sky.sunGlow), (0.1 + pulse * 0.1) * alpha));
    ctx.fillStyle = glow;
    ctx.fillRect(0, h * 0.68, w, h * 0.32);
    ctx.restore();
  }
}
