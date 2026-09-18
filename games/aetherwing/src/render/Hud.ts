import { clamp01, easeOutBack, easeOutCubic, rgb, type RGB } from '../core/math';
import type { SkyState } from './SkyState';

const numFont = (px: number): string =>
  `800 ${px}px ui-rounded, "SF Pro Rounded", "Segoe UI", system-ui, -apple-system, sans-serif`;
const uiFont = (px: number, weight = 700): string =>
  `${weight} ${px}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

const MILESTONES: Array<[score: number, label: string]> = [
  [10, 'SWIFT'],
  [25, 'SOARING'],
  [50, 'ASCENDANT'],
  [75, 'UNTETHERED'],
  [100, 'MYTHIC'],
  [150, 'LEGEND'],
];

/**
 * In-run HUD, drawn on the canvas rather than in the DOM.
 *
 * A tweened score would otherwise mutate a DOM node sixty times a second and
 * force layout on every frame of gameplay; two `fillText` calls cost nothing.
 */
export class Hud {
  private pop = 0;
  private shown = 0;
  private banner = 0;
  private bannerText = '';
  private card = 0;
  private cardTitle = '';
  private cardSub = '';
  private nearMiss = 0;
  private nearX = 0;
  private nearY = 0;

  reset(): void {
    this.pop = 0;
    this.shown = 0;
    this.banner = 0;
    this.card = 0;
    this.nearMiss = 0;
  }

  onScore(score: number): void {
    this.shown = score;
    this.pop = 1;
    for (const [at, label] of MILESTONES) {
      if (score === at) {
        this.banner = 1;
        this.bannerText = label;
      }
    }
  }

  onNearMiss(x: number, y: number): void {
    this.nearMiss = 1;
    this.nearX = x;
    this.nearY = y;
  }

  showSkyCard(title: string, sub: string): void {
    this.card = 1;
    this.cardTitle = title;
    this.cardSub = sub;
  }

  update(dt: number): void {
    this.pop = Math.max(0, this.pop - dt * 2.6);
    this.banner = Math.max(0, this.banner - dt * 0.42);
    this.card = Math.max(0, this.card - dt * 0.3);
    this.nearMiss = Math.max(0, this.nearMiss - dt * 1.5);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    u: number,
    sky: SkyState,
    opts: { visible: number; safeTop: number },
  ): void {
    const vis = clamp01(opts.visible);
    if (vis <= 0.005) return;

    const accent = sky.sunCore as unknown as RGB;
    const glow = sky.sunGlow as unknown as RGB;

    /* ------------------------------ score ------------------------------ */
    const size = Math.max(30, Math.min(u * 0.15, w * 0.2));
    const scale = 1 + easeOutBack(1 - this.pop) * 0 + this.pop * 0.26;
    const cx = w * 0.5;
    const cy = opts.safeTop + size * 1.02;

    ctx.save();
    ctx.globalAlpha = vis;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = numFont(size);
    ctx.lineJoin = 'round';

    const text = String(this.shown);
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.35;
    ctx.shadowOffsetY = size * 0.06;
    ctx.lineWidth = size * 0.17;
    ctx.strokeStyle = 'rgba(6,9,18,0.62)';
    ctx.strokeText(text, 0, 0);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    const grad = ctx.createLinearGradient(0, -size * 0.78, 0, size * 0.14);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.55, rgb(accent));
    grad.addColorStop(1, rgb(glow));
    ctx.fillStyle = grad;
    ctx.fillText(text, 0, 0);

    if (this.pop > 0.02) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = vis * this.pop * 0.5;
      ctx.fillStyle = rgb(accent);
      ctx.fillText(text, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();

    /* ----------------------------- milestone ---------------------------- */
    if (this.banner > 0.01) {
      const t = 1 - this.banner;
      const inT = easeOutCubic(clamp01(t / 0.18));
      const outT = clamp01((t - 0.72) / 0.28);
      const a = vis * inT * (1 - outT);
      const bs = Math.max(13, u * 0.038);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(cx, cy + size * 0.72);
      ctx.scale(1 + (1 - inT) * 0.3, 1 + (1 - inT) * 0.3);
      ctx.textAlign = 'center';
      ctx.font = uiFont(bs, 800);
      const label = this.bannerText.split('').join('\u2009\u2009');
      ctx.lineWidth = bs * 0.34;
      ctx.strokeStyle = 'rgba(6,9,18,0.5)';
      ctx.lineJoin = 'round';
      ctx.strokeText(label, 0, 0);
      ctx.fillStyle = rgb(accent);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }

    /* ------------------------------ sky card ---------------------------- */
    if (this.card > 0.01) {
      const t = 1 - this.card;
      const inT = easeOutCubic(clamp01(t / 0.16));
      const outT = clamp01((t - 0.78) / 0.22);
      const a = vis * inT * (1 - outT);
      const ts = Math.max(15, u * 0.042);
      const ss = Math.max(10, u * 0.021);
      const x = w * 0.5;
      const y = h * 0.82 - (1 - inT) * u * 0.05;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';

      ctx.font = uiFont(ts, 800);
      ctx.lineWidth = ts * 0.3;
      ctx.strokeStyle = 'rgba(6,9,18,0.55)';
      ctx.lineJoin = 'round';
      const title = this.cardTitle.toUpperCase().split('').join('\u2009');
      ctx.strokeText(title, x, y);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, x, y);

      ctx.font = uiFont(ss, 600);
      ctx.lineWidth = ss * 0.34;
      ctx.strokeText(this.cardSub, x, y + ts * 1.05);
      ctx.fillStyle = rgb(accent, 0.9);
      ctx.fillText(this.cardSub, x, y + ts * 1.05);
      ctx.restore();
    }

    /* ----------------------------- near miss ---------------------------- */
    if (this.nearMiss > 0.01) {
      const t = 1 - this.nearMiss;
      const a = vis * (1 - t) * 0.9;
      const s = Math.max(11, u * 0.026);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(this.nearX, this.nearY - t * u * 0.09);
      ctx.textAlign = 'center';
      ctx.font = uiFont(s, 800);
      ctx.lineWidth = s * 0.36;
      ctx.strokeStyle = 'rgba(6,9,18,0.5)';
      ctx.lineJoin = 'round';
      ctx.strokeText('CLOSE!', 0, 0);
      ctx.fillStyle = rgb(accent);
      ctx.fillText('CLOSE!', 0, 0);
      ctx.restore();
    }
  }

  drawFps(ctx: CanvasRenderingContext2D, h: number, fps: number, tier: string): void {
    ctx.save();
    ctx.font = uiFont(11, 600);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = fps >= 55 ? 'rgba(140,240,170,0.75)' : fps >= 40 ? 'rgba(255,214,120,0.8)' : 'rgba(255,130,110,0.85)';
    ctx.fillText(`${fps} fps · ${tier}`, 12, h - 10);
    ctx.restore();
  }
}
