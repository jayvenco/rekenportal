import { Pool } from '../core/Pool';
import { Rng } from '../core/Rng';
import { TAU, clamp01, easeOutCubic, rgb, shade, type RGB } from '../core/math';
import type { Theme } from '../config/themes';

export enum PKind {
  Glow = 0,
  Shard = 1,
  Feather = 2,
  Ring = 3,
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  endSize: number;
  rot: number;
  spin: number;
  drag: number;
  grav: number;
  alpha: number;
  sprite: number;
  kind: PKind;
  color: string;
  stroke: string;
}

const SPRITE_PX = 64;

const makeParticle = (): Particle => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  life: 0,
  maxLife: 1,
  size: 1,
  endSize: 1,
  rot: 0,
  spin: 0,
  drag: 1,
  grav: 0,
  alpha: 1,
  sprite: 0,
  kind: PKind.Glow,
  color: '#fff',
  stroke: '#fff',
});

/** Indices into the baked sprite table. */
enum Sp {
  Warm = 0,
  Cool = 1,
  White = 2,
  Accent = 3,
  Smoke = 4,
}

/**
 * All soft particles are pre-rendered radial gradients drawn with `drawImage`.
 * Building a gradient per particle per frame is the single most expensive
 * mistake a canvas particle system can make; five baked sprites cost a few
 * kilobytes and turn each particle into one blit.
 */
export class Particles {
  private pool: Pool<Particle>;
  private sprites: HTMLCanvasElement[] = [];
  private rng = new Rng(7717);
  private theme: Theme | null = null;

  /** Scaled by the adaptive quality system. */
  budget = 1;

  constructor(capacity = 620) {
    this.pool = new Pool<Particle>(capacity, makeParticle);
  }

  get count(): number {
    return this.pool.active;
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    const warm: RGB = theme.sunGlow;
    const cool: RGB = theme.runeColor;
    const accent: RGB = theme.stoneRim;
    const smoke: RGB = shade(theme.stoneMid, -0.35);
    this.sprites = [
      softSprite(warm, 0.34),
      softSprite(cool, 0.3),
      softSprite([255, 255, 255], 0.4),
      softSprite(accent, 0.32),
      softSprite(smoke, 0.05),
    ];
  }

  clear(): void {
    this.pool.clear();
  }

  private spawn(): Particle | null {
    return this.pool.obtain();
  }

  /* ------------------------------- emitters ------------------------------ */

  /** Downward wash of air from a wingbeat. */
  flapBurst(x: number, y: number, u: number, power = 1): void {
    const n = Math.round(9 * power * this.budget);
    for (let i = 0; i < n; i++) {
      const p = this.spawn();
      if (!p) return;
      const a = this.rng.range(0.35, Math.PI - 0.35);
      const speed = this.rng.range(0.18, 0.62) * u * power;
      p.x = x + this.rng.spread(0.02 * u);
      p.y = y + this.rng.range(0.005, 0.045) * u;
      p.vx = -Math.cos(a) * speed * 0.55 - 0.12 * u;
      p.vy = Math.sin(a) * speed * 0.85;
      p.maxLife = p.life = this.rng.range(0.28, 0.62);
      p.size = this.rng.range(0.014, 0.036) * u;
      p.endSize = p.size * this.rng.range(2.2, 3.6);
      p.alpha = this.rng.range(0.16, 0.4);
      p.drag = 2.4;
      p.grav = 0.05 * u;
      p.kind = PKind.Glow;
      p.sprite = Sp.White;
      p.rot = 0;
      p.spin = 0;
    }

    const ring = this.spawn();
    if (ring) {
      ring.x = x;
      ring.y = y + 0.02 * u;
      ring.vx = -0.1 * u;
      ring.vy = 0.06 * u;
      ring.maxLife = ring.life = 0.34;
      ring.size = 0.02 * u;
      ring.endSize = 0.16 * u;
      ring.alpha = 0.34;
      ring.drag = 1.2;
      ring.grav = 0;
      ring.kind = PKind.Ring;
      ring.rot = 0;
      ring.spin = 0;
      ring.stroke = rgb(this.theme?.creatureRim ?? [255, 255, 255]);
    }
  }

  /** Continuous wingtip vapour while gliding fast. */
  trail(x: number, y: number, u: number, speed: number): void {
    const p = this.spawn();
    if (!p) return;
    p.x = x + this.rng.spread(0.012 * u);
    p.y = y + this.rng.spread(0.014 * u);
    p.vx = -speed * u * this.rng.range(0.25, 0.5);
    p.vy = this.rng.spread(0.05 * u);
    p.maxLife = p.life = this.rng.range(0.2, 0.44);
    p.size = this.rng.range(0.008, 0.018) * u;
    p.endSize = p.size * 2.6;
    p.alpha = this.rng.range(0.08, 0.2);
    p.drag = 1.8;
    p.grav = 0;
    p.kind = PKind.Glow;
    p.sprite = Sp.White;
  }

  /** Sparkle ribbon when a monolith is cleared. */
  scoreSparks(x: number, y: number, u: number, strong: boolean): void {
    const n = Math.round((strong ? 20 : 11) * this.budget);
    for (let i = 0; i < n; i++) {
      const p = this.spawn();
      if (!p) return;
      const a = this.rng.range(0, TAU);
      const speed = this.rng.range(0.12, strong ? 0.85 : 0.5) * u;
      p.x = x;
      p.y = y + this.rng.spread(0.05 * u);
      p.vx = Math.cos(a) * speed - 0.1 * u;
      p.vy = Math.sin(a) * speed;
      p.maxLife = p.life = this.rng.range(0.35, 0.8);
      p.size = this.rng.range(0.006, 0.017) * u;
      p.endSize = p.size * 0.25;
      p.alpha = this.rng.range(0.55, 1);
      p.drag = 2.8;
      p.grav = 0.16 * u;
      p.kind = PKind.Glow;
      p.sprite = strong ? Sp.Accent : Sp.Warm;
    }
  }

  /** Stone chips and feathers on collision. */
  impact(x: number, y: number, u: number, dirX = -1): void {
    const stone = this.theme?.stoneMid ?? [120, 120, 120];
    const chips = Math.round(26 * this.budget);
    for (let i = 0; i < chips; i++) {
      const p = this.spawn();
      if (!p) return;
      const a = this.rng.range(-Math.PI, Math.PI);
      const speed = this.rng.range(0.25, 1.5) * u;
      p.x = x + this.rng.spread(0.02 * u);
      p.y = y + this.rng.spread(0.03 * u);
      p.vx = Math.cos(a) * speed + dirX * 0.25 * u;
      p.vy = Math.sin(a) * speed - 0.2 * u;
      p.maxLife = p.life = this.rng.range(0.5, 1.4);
      p.size = this.rng.range(0.006, 0.021) * u;
      p.endSize = p.size;
      p.alpha = 1;
      p.drag = 0.6;
      p.grav = 2.1 * u;
      p.rot = this.rng.range(0, TAU);
      p.spin = this.rng.spread(9);
      p.kind = PKind.Shard;
      p.color = rgb(shade(stone, this.rng.range(-0.35, 0.25)));
    }

    const feathers = Math.round(11 * this.budget);
    for (let i = 0; i < feathers; i++) {
      const p = this.spawn();
      if (!p) return;
      const a = this.rng.range(-Math.PI, Math.PI);
      const speed = this.rng.range(0.1, 0.7) * u;
      p.x = x + this.rng.spread(0.03 * u);
      p.y = y + this.rng.spread(0.03 * u);
      p.vx = Math.cos(a) * speed;
      p.vy = Math.sin(a) * speed - 0.1 * u;
      p.maxLife = p.life = this.rng.range(1.1, 2.4);
      p.size = this.rng.range(0.016, 0.032) * u;
      p.endSize = p.size;
      p.alpha = 1;
      p.drag = 1.9;
      p.grav = 0.34 * u;
      p.rot = this.rng.range(0, TAU);
      p.spin = this.rng.spread(4);
      p.kind = PKind.Feather;
      p.color = rgb(shade(this.theme?.creatureRim ?? [220, 190, 150], this.rng.range(-0.4, 0.1)));
    }

    for (let i = 0; i < 8 * this.budget; i++) {
      const p = this.spawn();
      if (!p) return;
      const a = this.rng.range(0, TAU);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * this.rng.range(0.1, 0.5) * u;
      p.vy = Math.sin(a) * this.rng.range(0.1, 0.5) * u;
      p.maxLife = p.life = this.rng.range(0.6, 1.2);
      p.size = this.rng.range(0.03, 0.07) * u;
      p.endSize = p.size * 2.4;
      p.alpha = 0.4;
      p.drag = 1.4;
      p.grav = -0.12 * u;
      p.kind = PKind.Glow;
      p.sprite = Sp.Smoke;
    }

    const shock = this.spawn();
    if (shock) {
      shock.x = x;
      shock.y = y;
      shock.vx = 0;
      shock.vy = 0;
      shock.maxLife = shock.life = 0.42;
      shock.size = 0.02 * u;
      shock.endSize = 0.44 * u;
      shock.alpha = 0.85;
      shock.drag = 0;
      shock.grav = 0;
      shock.kind = PKind.Ring;
      shock.stroke = rgb(this.theme?.sunCore ?? [255, 255, 255]);
    }
  }

  /** Slow smoke plume trailing a falling creature. */
  deathSmoke(x: number, y: number, u: number): void {
    const p = this.spawn();
    if (!p) return;
    p.x = x + this.rng.spread(0.02 * u);
    p.y = y + this.rng.spread(0.02 * u);
    p.vx = -0.15 * u + this.rng.spread(0.05 * u);
    p.vy = this.rng.spread(0.06 * u) - 0.05 * u;
    p.maxLife = p.life = this.rng.range(0.6, 1.3);
    p.size = this.rng.range(0.02, 0.05) * u;
    p.endSize = p.size * 3;
    p.alpha = 0.3;
    p.drag = 1.1;
    p.grav = -0.05 * u;
    p.kind = PKind.Glow;
    p.sprite = Sp.Smoke;
  }

  /** Celebration confetti of light for a new personal best. */
  celebrate(x: number, y: number, u: number): void {
    const n = Math.round(70 * this.budget);
    for (let i = 0; i < n; i++) {
      const p = this.spawn();
      if (!p) return;
      const a = this.rng.range(-Math.PI * 0.92, -Math.PI * 0.08);
      const speed = this.rng.range(0.4, 1.9) * u;
      p.x = x + this.rng.spread(0.2 * u);
      p.y = y + this.rng.spread(0.05 * u);
      p.vx = Math.cos(a) * speed;
      p.vy = Math.sin(a) * speed;
      p.maxLife = p.life = this.rng.range(1.2, 2.6);
      p.size = this.rng.range(0.008, 0.02) * u;
      p.endSize = p.size * 0.4;
      p.alpha = 1;
      p.drag = 0.7;
      p.grav = 1.1 * u;
      p.kind = PKind.Glow;
      p.sprite = i % 3 === 0 ? Sp.Accent : i % 3 === 1 ? Sp.Warm : Sp.White;
    }
  }

  /* -------------------------------- update ------------------------------- */

  update(dt: number, scroll: number): void {
    const items = this.pool.items;
    for (let i = 0; i < this.pool.active; i++) {
      const p = items[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.pool.releaseAt(i);
        i--;
        continue;
      }
      const d = Math.exp(-p.drag * dt);
      p.vx *= d;
      p.vy *= d;
      p.vy += p.grav * dt;
      p.x += p.vx * dt - scroll * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
    }
  }

  /* --------------------------------- draw -------------------------------- */

  draw(ctx: CanvasRenderingContext2D): void {
    const items = this.pool.items;
    const n = this.pool.active;
    if (!n || !this.sprites.length) return;

    // Pass 1 — additive glows and rings.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const p = items[i];
      if (p.kind === PKind.Glow) {
        const t = 1 - p.life / p.maxLife;
        const fade = t < 0.12 ? t / 0.12 : 1 - easeOutCubic((t - 0.12) / 0.88);
        const a = clamp01(fade) * p.alpha;
        if (a <= 0.004) continue;
        const s = p.size + (p.endSize - p.size) * t;
        ctx.globalAlpha = a;
        ctx.drawImage(this.sprites[p.sprite], p.x - s, p.y - s, s * 2, s * 2);
      } else if (p.kind === PKind.Ring) {
        const t = 1 - p.life / p.maxLife;
        const a = (1 - t) * p.alpha;
        if (a <= 0.01) continue;
        const r = p.size + (p.endSize - p.size) * easeOutCubic(t);
        ctx.globalAlpha = a;
        ctx.strokeStyle = p.stroke;
        ctx.lineWidth = Math.max(0.7, (1 - t) * p.endSize * 0.09);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Pass 2 — solid debris. Each piece is rotated, so it needs its own
    // transform; save/restore is cheaper than rebuilding the base matrix.
    for (let i = 0; i < n; i++) {
      const p = items[i];
      if (p.kind !== PKind.Shard && p.kind !== PKind.Feather) continue;
      const t = 1 - p.life / p.maxLife;
      const a = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
      if (a <= 0.02) continue;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const s = p.size;
      ctx.beginPath();
      if (p.kind === PKind.Shard) {
        ctx.moveTo(-s, -s * 0.6);
        ctx.lineTo(s * 0.8, -s);
        ctx.lineTo(s, s * 0.7);
        ctx.lineTo(-s * 0.6, s);
        ctx.closePath();
      } else {
        ctx.ellipse(0, 0, s, s * 0.34, 0, 0, TAU);
      }
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}

function softSprite(color: RGB, core: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = SPRITE_PX;
  const g = c.getContext('2d');
  if (!g) return c;
  const r = SPRITE_PX / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, rgb(color, 1));
  grad.addColorStop(core, rgb(color, 0.55));
  grad.addColorStop(0.62, rgb(color, 0.16));
  grad.addColorStop(1, rgb(color, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, SPRITE_PX, SPRITE_PX);
  return c;
}
