import { Rng } from '../core/Rng';
import { TAU, rgb, type RGB } from '../core/math';
import type { WeatherKind } from '../config/themes';
import { ctx2d, makeCanvas } from './textures';
import type { SkyState } from './SkyState';

interface Drop {
  x: number;
  y: number;
  /** 0 = far, 1 = near. Drives size, speed and opacity. */
  depth: number;
  phase: number;
  kind: WeatherKind;
  seed: number;
}

const MAX = 260;

/**
 * Ambient weather: rain, snow, dust, embers and sparks.
 *
 * When the sky changes the particles are not swapped out — each one adopts the
 * new weather the next time it wraps off screen, so rain thins into snow over
 * a few seconds instead of blinking.
 */
export class Weather {
  private drops: Drop[] = [];
  private rng = new Rng(0x5eed);
  private sprite: HTMLCanvasElement | null = null;
  private spriteColor = '';
  private target: WeatherKind = 'dust';
  private w = 1;
  private h = 1;
  private u = 1;

  /** Multiplier from the adaptive quality profile. */
  budget = 1;

  constructor() {
    for (let i = 0; i < MAX; i++) {
      this.drops.push({
        x: 0,
        y: 0,
        depth: this.rng.next(),
        phase: this.rng.range(0, TAU),
        kind: 'dust',
        seed: this.rng.next(),
      });
    }
  }

  resize(w: number, h: number, u: number): void {
    this.w = w;
    this.h = h;
    this.u = u;
    for (const d of this.drops) {
      d.x = this.rng.range(0, w);
      d.y = this.rng.range(0, h);
    }
  }

  setKind(kind: WeatherKind): void {
    this.target = kind;
  }

  /** Populate immediately (used when starting a run in a new sky). */
  prime(kind: WeatherKind): void {
    this.target = kind;
    for (const d of this.drops) d.kind = kind;
  }

  update(dt: number, scroll: number, sky: SkyState): void {
    const count = this.activeCount(sky);
    const w = this.w;
    const h = this.h;
    const u = this.u;

    for (let i = 0; i < count; i++) {
      const d = this.drops[i];
      const near = 0.35 + d.depth * 0.65;
      let vx = -scroll * near * 0.34;
      let vy = 0;

      switch (d.kind) {
        case 'rain':
          vy = (2.1 + d.depth * 1.7) * u;
          vx -= 0.42 * u * near;
          break;
        case 'snow':
          vy = (0.16 + d.depth * 0.2) * u;
          vx += Math.sin(d.phase + performance.now() * 0.0007) * 0.1 * u;
          break;
        case 'dust':
          vy = (-0.02 + d.depth * 0.05) * u;
          vx += Math.sin(d.phase * 1.7) * 0.04 * u;
          break;
        case 'ember':
          vy = (-0.12 - d.depth * 0.22) * u;
          vx += Math.sin(d.phase + performance.now() * 0.0011) * 0.12 * u;
          break;
        case 'spark':
          vy = (0.05 + d.depth * 0.3) * u;
          vx -= 0.12 * u;
          break;
      }

      d.x += vx * dt;
      d.y += vy * dt;
      d.phase += dt * (0.6 + d.depth);

      const margin = u * 0.12;
      let wrapped = false;
      if (d.x < -margin) {
        d.x = w + margin;
        wrapped = true;
      } else if (d.x > w + margin) {
        d.x = -margin;
        wrapped = true;
      }
      if (d.y < -margin) {
        d.y = h + margin;
        wrapped = true;
      } else if (d.y > h + margin) {
        d.y = -margin;
        wrapped = true;
      }
      if (wrapped) {
        if (d.kind !== this.target) d.kind = this.target;
        d.depth = this.rng.next();
        d.seed = this.rng.next();
        if (d.x < 0 || d.x > w) d.y = this.rng.range(0, h);
        else d.x = this.rng.range(0, w);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, sky: SkyState): void {
    const count = this.activeCount(sky);
    if (!count) return;
    const color = sky.weatherColor as unknown as RGB;
    this.ensureSprite(color);
    const u = this.u;

    // Rain is stroked as one batched path; everything else blits a sprite.
    let rainCount = 0;
    for (let i = 0; i < count; i++) if (this.drops[i].kind === 'rain') rainCount++;

    if (rainCount) {
      ctx.save();
      ctx.lineCap = 'round';
      for (let bucket = 0; bucket < 2; bucket++) {
        ctx.beginPath();
        let any = false;
        for (let i = 0; i < count; i++) {
          const d = this.drops[i];
          if (d.kind !== 'rain') continue;
          if ((d.depth > 0.5 ? 1 : 0) !== bucket) continue;
          const len = (0.05 + d.depth * 0.075) * u;
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - len * 0.22, d.y + len);
          any = true;
        }
        if (!any) continue;
        ctx.strokeStyle = rgb(color, bucket ? 0.34 : 0.16);
        ctx.lineWidth = bucket ? Math.max(1, u * 0.0032) : Math.max(0.7, u * 0.0018);
        ctx.stroke();
      }
      ctx.restore();
    }

    const sprite = this.sprite;
    if (!sprite) return;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i++) {
      const d = this.drops[i];
      if (d.kind === 'rain') continue;
      let size: number;
      let alpha: number;
      switch (d.kind) {
        case 'snow':
          size = (0.006 + d.depth * 0.012) * u;
          alpha = 0.35 + d.depth * 0.5;
          break;
        case 'ember':
          size = (0.004 + d.depth * 0.01) * u * (0.7 + 0.3 * Math.sin(d.phase * 3));
          alpha = 0.4 + d.depth * 0.55;
          break;
        case 'spark':
          size = (0.003 + d.depth * 0.008) * u;
          alpha = (0.3 + d.depth * 0.6) * (0.4 + 0.6 * Math.abs(Math.sin(d.phase * 4)));
          break;
        default:
          size = (0.004 + d.depth * 0.011) * u;
          alpha = 0.14 + d.depth * 0.3;
          break;
      }
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, d.x - size, d.y - size, size * 2, size * 2);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private activeCount(sky: SkyState): number {
    return Math.min(
      MAX,
      Math.round(MAX * sky.weatherDensity * this.budget),
    );
  }

  private ensureSprite(color: RGB): void {
    const key = `${color[0] | 0},${color[1] | 0},${color[2] | 0}`;
    if (this.sprite && this.spriteColor === key) return;
    const size = 32;
    const c = makeCanvas(size, size);
    const g = ctx2d(c);
    const r = size / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, rgb(color, 1));
    grad.addColorStop(0.35, rgb(color, 0.6));
    grad.addColorStop(1, rgb(color, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    this.sprite = c;
    this.spriteColor = key;
  }
}
