import { OBSTACLE, PLAYER } from '../config/balance';
import type { Theme } from '../config/themes';
import type { Obstacle } from '../entities/Obstacle';
import { Player, PlayerState } from '../entities/Player';
import type { Camera } from '../systems/Camera';
import type { Particles } from '../systems/Particles';
import type { QualityProfile } from '../systems/Quality';
import type { Viewport } from '../core/Viewport';
import { clamp01, lerp, rgb, type RGB } from '../core/math';
import { Background } from './Background';
import { CreatureSprite } from './CreatureSprite';
import { Hud } from './Hud';
import { ObstacleArt } from './ObstacleArt';
import { Post } from './Post';
import { SkyEffects } from './SkyEffects';
import { SkyState } from './SkyState';
import { Weather } from './Weather';

const asRGB = (c: number[]): RGB => c as unknown as RGB;

export interface RenderState {
  sky: SkyState;
  /** Total distance the world has scrolled, in CSS pixels. */
  scroll: number;
  worldTime: number;
  obstacles: readonly Obstacle[];
  obstacleCount: number;
  player: Player;
  particles: Particles;
  camera: Camera;
  alpha: number;
  blend: number;
  scrim: number;
  hudVisible: number;
  intensity: number;
  playerAlpha: number;
  showFps: boolean;
  fps: number;
}

/**
 * Composites a frame: sky, parallax terrain, gates, flyer, weather, grade.
 *
 * The renderer owns every baked asset and rebuilds them only when the viewport
 * or the sky actually changes, so the per-frame cost is a fixed, predictable
 * list of blits and fills.
 */
export class Renderer {
  readonly background = new Background();
  readonly effects = new SkyEffects();
  readonly weather = new Weather();
  readonly post = new Post();
  readonly hud = new Hud();
  readonly creature = new CreatureSprite();

  private artCurrent: ObstacleArt | null = null;
  private artNext: ObstacleArt | null = null;
  private artWidthPx = 0;
  private trail: Array<{ y: number; rot: number; wing: number }> = [];
  private quality!: QualityProfile;

  constructor(private readonly view: Viewport) {}

  setQuality(profile: QualityProfile): void {
    this.quality = profile;
    this.weather.budget = profile.weatherScale;
    this.background.setLod(profile.tier === 'low' ? 1 : 0);
  }

  /** Rebuild everything that depends on pixel dimensions. */
  onResize(): void {
    const v = this.view;
    this.background.setViewport(v.cssW, v.cssH);
    this.weather.resize(v.cssW, v.cssH, v.u);
    this.post.resize(v.ctx, v.cssW, v.cssH);
    this.creature.build(PLAYER.drawScale * PLAYER.drawFrame * v.u * v.dpr);
    this.artWidthPx = 0;
    this.artCurrent = null;
    this.artNext = null;
  }

  /** Ensure obstacle art exists for the given themes at the current scale. */
  syncArt(current: Theme, next: Theme | null): void {
    const v = this.view;
    const px = Math.round(OBSTACLE.width * v.u * v.dpr * 1.1);
    const capRatio = OBSTACLE.capHeight / OBSTACLE.width;
    const overhang = OBSTACLE.capOverhang / OBSTACLE.width;

    if (px !== this.artWidthPx) {
      this.artWidthPx = px;
      this.artCurrent = null;
      this.artNext = null;
    }
    if (!this.artCurrent || this.artCurrent.theme.id !== current.id) {
      this.artCurrent =
        this.artNext && this.artNext.theme.id === current.id
          ? this.artNext
          : new ObstacleArt(current, px, capRatio, overhang);
    }
    if (!next) {
      this.artNext = null;
    } else if (!this.artNext || this.artNext.theme.id !== next.id) {
      this.artNext = new ObstacleArt(next, px, capRatio, overhang);
    }
  }

  update(dt: number): void {
    this.effects.update(dt);
    this.post.update(dt);
    this.hud.update(dt);
  }

  /* --------------------------------- draw -------------------------------- */

  draw(s: RenderState): void {
    const v = this.view;
    const ctx = v.beginFrame();
    const w = v.cssW;
    const h = v.cssH;
    const u = v.u;
    const cam = s.camera;
    const overscan = Math.max(90, w * 0.1);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low';

    ctx.save();
    ctx.translate(w * 0.5, h * 0.5);
    ctx.scale(cam.zoom, cam.zoom);
    if (cam.rotation !== 0) ctx.rotate(cam.rotation);
    ctx.translate(-w * 0.5 - cam.x * u, -h * 0.5 - cam.y * u);

    this.effects.drawSky(ctx, s.sky, w, h);
    this.background.drawBack(ctx, s.scroll, s.blend, overscan);
    this.effects.drawEffects(ctx, s.sky, w, h, this.quality.volumetricLight);

    this.drawObstacles(ctx, s, u, h);
    s.particles.draw(ctx);
    this.drawPlayer(ctx, s, u);

    this.background.drawFront(ctx, s.scroll, s.blend, overscan);
    this.weather.draw(ctx, s.sky);

    ctx.restore();

    this.post.drawSpeedLines(ctx, s.intensity, u, asRGB(s.sky.sunCore));
    this.post.draw(ctx, s.sky, {
      grain: this.quality.filmGrain,
      exposure: this.effects.flash * 0.28,
    });
    this.post.drawScrim(ctx, s.scrim);

    this.hud.draw(ctx, w, h, u, s.sky, {
      visible: s.hudVisible,
      safeTop: Math.max(18, h * 0.045),
    });
    if (s.showFps) this.hud.drawFps(ctx, h, s.fps, this.quality.tier);
  }

  /* ------------------------------- obstacles ------------------------------ */

  private drawObstacles(
    ctx: CanvasRenderingContext2D,
    s: RenderState,
    u: number,
    h: number,
  ): void {
    const art = this.artCurrent;
    if (!art) return;
    const items = s.obstacles;
    const n = s.obstacleCount;
    const lightFromRight = s.sky.dominant.sunX >= 0.5;

    // Occlusion cast by each gate onto the haze behind it.
    if (this.quality.softShadows) {
      ctx.save();
      const dir = lightFromRight ? -1 : 1;
      for (let i = 0; i < n; i++) {
        const o = items[i];
        const x = o.x * u;
        const bw = OBSTACLE.width * u;
        const center = o.centerAt(s.worldTime) * u;
        const gapTop = center - o.gapSize * 0.5 * u;
        const gapBottom = center + o.gapSize * 0.5 * u;
        const sx = x + dir * bw * 0.55;
        const grad = ctx.createLinearGradient(sx, 0, sx + dir * bw * 1.5, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0.3)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        const left = Math.min(sx, sx + dir * bw * 1.5);
        ctx.fillRect(left, -h, bw * 1.5, gapTop + h);
        ctx.fillRect(left, gapBottom, bw * 1.5, h * 2);
      }
      ctx.restore();
    }

    for (let i = 0; i < n; i++) {
      this.drawGate(ctx, items[i], art, 1, s, u, h);
    }
    if (this.artNext && s.blend > 0.001) {
      for (let i = 0; i < n; i++) {
        this.drawGate(ctx, items[i], this.artNext, s.blend, s, u, h);
      }
    }
  }

  private drawGate(
    ctx: CanvasRenderingContext2D,
    o: Obstacle,
    art: ObstacleArt,
    alpha: number,
    s: RenderState,
    u: number,
    h: number,
  ): void {
    const bw = OBSTACLE.width * u;
    const capW = (OBSTACLE.width + OBSTACLE.capOverhang * 2) * u;
    const capH = OBSTACLE.capHeight * u;
    const x = o.x * u;
    const center = o.centerAt(s.worldTime) * u;
    const gapTop = center - o.gapSize * 0.5 * u;
    const gapBottom = center + o.gapSize * 0.5 * u;

    if (x + capW < -40 || x - capW > this.view.cssW + 40) return;

    const tileDrawH = (art.tileH / art.tileW) * bw;
    const tile = art.tiles[o.tileTop % art.tiles.length];
    const tileB = art.tiles[o.tileBottom % art.tiles.length];
    const cap = art.caps[o.capStyle % art.caps.length];

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, center);
    if (o.tilt !== 0) ctx.rotate(o.tilt);
    ctx.translate(-x, -center);

    // Upper monolith: column stacked upward from the capstone.
    const topEnd = gapTop - capH;
    let y = topEnd;
    let guard = 0;
    while (y > -h * 0.6 && guard++ < 20) {
      y -= tileDrawH;
      ctx.drawImage(tile, x - bw * 0.5, y, bw, tileDrawH);
    }
    ctx.save();
    ctx.translate(x, gapTop);
    ctx.scale(1, -1);
    ctx.drawImage(cap, -capW * 0.5, 0, capW, capH);
    ctx.restore();

    // Lower monolith.
    y = gapBottom + capH;
    guard = 0;
    const bottomLimit = h * 1.6;
    while (y < bottomLimit && guard++ < 20) {
      ctx.drawImage(tileB, x - bw * 0.5, y, bw, tileDrawH);
      y += tileDrawH;
    }
    ctx.drawImage(cap, x - capW * 0.5, gapBottom, capW, capH);

    // Runes: a slow, per-gate pulse so a row of them shimmers out of sync.
    const pulse = 0.55 + 0.45 * Math.sin(s.worldTime * 1.7 + o.id * 1.31);
    const runeW = bw * 0.9;
    const runeH = (art.runeH / art.runeW) * runeW;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha * (0.35 + pulse * 0.4) * s.sky.dominant.runeGlow;
    ctx.drawImage(art.runes, x - runeW * 0.5, topEnd - runeH * 1.25, runeW, runeH);
    ctx.drawImage(art.runes, x - runeW * 0.5, gapBottom + capH + runeH * 0.25, runeW, runeH);
    ctx.globalCompositeOperation = 'source-over';

    // The corridor itself glows faintly — it reads as the thing to aim at.
    ctx.globalAlpha = alpha * 0.5;
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createLinearGradient(x - capW * 0.5, 0, x + capW * 0.5, 0);
    const rune = rgb(asRGB(s.sky.runeColor), 0.09);
    glow.addColorStop(0, 'rgba(0,0,0,0)');
    glow.addColorStop(0.5, rune);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - capW * 0.5, gapTop, capW, gapBottom - gapTop);
    ctx.globalCompositeOperation = 'source-over';

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /* --------------------------------- flyer -------------------------------- */

  private drawPlayer(ctx: CanvasRenderingContext2D, s: RenderState, u: number): void {
    const p = s.player;
    const size = PLAYER.drawScale * PLAYER.drawFrame * u;
    const x = p.x * u;
    const y = p.renderY(s.alpha) * u;
    const rot = p.renderRotation(s.alpha);

    // Speed after-images: three faint copies of the recent path.
    if (this.quality.afterImages && p.state !== PlayerState.Hover) {
      this.trail.push({ y, rot, wing: p.wing });
      if (this.trail.length > 4) this.trail.shift();
      const fade = clamp01((s.intensity - 0.15) / 0.85) * 0.5 + Math.abs(p.vy) * 0.16;
      if (fade > 0.03) {
        for (let i = 0; i < this.trail.length - 1; i++) {
          const t = this.trail[i];
          const a = ((i + 1) / this.trail.length) * 0.22 * clamp01(fade) * s.playerAlpha;
          if (a < 0.01) continue;
          this.creature.draw(ctx, x - (this.trail.length - i) * u * 0.012, t.y, size, t.rot, t.wing, {
            rimColor: asRGB(s.sky.creatureRim),
            fillColor: asRGB(s.sky.creatureFill),
            ambient: 1,
            hurt: 0,
            beat: 0,
            alpha: a,
            squash: 1,
          });
        }
      }
    } else if (this.trail.length) {
      this.trail.length = 0;
    }

    this.creature.draw(ctx, x, y, size, rot, p.wing, {
      rimColor: asRGB(s.sky.creatureRim),
      fillColor: asRGB(s.sky.creatureFill),
      ambient: 1,
      hurt: p.hurt,
      beat: p.beat,
      alpha: s.playerAlpha,
      squash: lerp(1, p.squash, 0.85),
    });
  }
}
