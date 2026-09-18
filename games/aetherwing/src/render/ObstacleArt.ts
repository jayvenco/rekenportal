import { Rng } from '../core/Rng';
import { TAU, rgb, shade } from '../core/math';
import type { Theme } from '../config/themes';
import { bakeStoneTile, ctx2d, makeCanvas, tintStone } from './textures';

const TILE_ASPECT = 1.55;
const STYLES = 3;

let greyTiles: HTMLCanvasElement[] | null = null;
let greyWidth = 0;

/** Greyscale stone is theme-independent, so it is generated at most once per size. */
function ensureGreyTiles(w: number): HTMLCanvasElement[] {
  const h = Math.round(w * TILE_ASPECT);
  if (greyTiles && greyWidth === w) return greyTiles;
  greyTiles = [
    bakeStoneTile(w, h, 0x51ed27),
    bakeStoneTile(w, h, 0x9a3f11),
    bakeStoneTile(w, h, 0x2c77bd),
  ];
  greyWidth = w;
  return greyTiles;
}

/**
 * Every drawable piece of a monolith, pre-tinted for one sky.
 *
 * A gate is composed at draw time from a handful of `drawImage` calls: a few
 * repeats of a tileable column, one capstone, one additive rune band. Nothing
 * is generated per frame.
 */
export class ObstacleArt {
  tiles: HTMLCanvasElement[] = [];
  caps: HTMLCanvasElement[] = [];
  runes!: HTMLCanvasElement;

  tileW = 1;
  tileH = 1;
  capW = 1;
  capH = 1;
  runeW = 1;
  runeH = 1;

  constructor(
    readonly theme: Theme,
    /** Body width in device pixels. */
    pxWidth: number,
    /** Cap height as a multiple of the body width. */
    capRatio: number,
    /** Cap overhang, per side, as a multiple of the body width. */
    overhangRatio: number,
  ) {
    const w = Math.max(24, Math.round(pxWidth));
    const grey = ensureGreyTiles(w);
    const lightFromRight = theme.sunX >= 0.5;

    const dark = rgb(theme.stoneDark);
    const mid = rgb(theme.stoneMid);
    const lit = rgb(theme.stoneLit);
    const rim = rgb(theme.stoneRim);

    this.tiles = grey.map((g) => tintStone(g, dark, mid, lit, rim, lightFromRight));
    this.tileW = w;
    this.tileH = grey[0].height;

    this.capW = Math.round(w * (1 + overhangRatio * 2));
    this.capH = Math.max(10, Math.round(w * capRatio));
    for (let s = 0; s < STYLES; s++) {
      this.caps.push(this.bakeCap(s, w, lightFromRight));
    }

    this.runeW = w;
    this.runeH = Math.round(w * 1.1);
    this.runes = this.bakeRunes();
  }

  /* --------------------------------- cap --------------------------------- */

  private bakeCap(style: number, bodyW: number, lightFromRight: boolean): HTMLCanvasElement {
    const W = this.capW;
    const H = this.capH;
    const c = makeCanvas(W, H);
    const g = ctx2d(c);
    const theme = this.theme;
    const cx = W / 2;
    const half = bodyW / 2;
    const over = (W - bodyW) / 2;

    // Stepped profile, widest at the corridor-facing face (y = 0).
    const steps: Array<[t0: number, t1: number, inset: number]> =
      style === 0
        ? [
            [0, 0.2, 0],
            [0.2, 0.32, 0.42],
            [0.32, 0.6, 0.2],
            [0.6, 0.78, 0.6],
            [0.78, 1, 1],
          ]
        : style === 1
          ? [
              [0, 0.14, 0.14],
              [0.14, 0.3, 0],
              [0.3, 0.46, 0.34],
              [0.46, 0.74, 0.52],
              [0.74, 1, 1],
            ]
          : [
              [0, 0.24, 0],
              [0.24, 0.44, 0.28],
              [0.44, 0.7, 0.55],
              [0.7, 1, 1],
            ];

    const widthAt = (inset: number): number => bodyW + over * 2 * (1 - inset);

    const path = new Path2D();
    path.moveTo(cx - widthAt(steps[0][2]) / 2, 0);
    for (const [t0, t1, inset] of steps) {
      const hw = widthAt(inset) / 2;
      path.lineTo(cx - hw, t0 * H);
      path.lineTo(cx - hw, t1 * H);
    }
    path.lineTo(cx - half, H);
    path.lineTo(cx + half, H);
    for (let i = steps.length - 1; i >= 0; i--) {
      const [t0, t1, inset] = steps[i];
      const hw = widthAt(inset) / 2;
      path.lineTo(cx + hw, t1 * H);
      path.lineTo(cx + hw, t0 * H);
    }
    path.closePath();

    g.save();
    g.clip(path);

    // Fill with the same stone the column uses so the material matches.
    const tile = this.tiles[style % this.tiles.length];
    const scale = W / tile.width;
    const drawH = tile.height * scale;
    for (let y = -drawH * 0.35; y < H; y += drawH) g.drawImage(tile, 0, y, W, drawH);

    // The corridor-facing face catches the most light.
    const face = g.createLinearGradient(0, 0, 0, H);
    face.addColorStop(0, rgb(shade(theme.stoneLit, 0.28), 0.85));
    face.addColorStop(0.16, rgb(theme.stoneLit, 0.24));
    face.addColorStop(0.55, 'rgba(0,0,0,0)');
    face.addColorStop(1, rgb(theme.stoneDark, 0.5));
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = face;
    g.fillRect(0, 0, W, H);

    // Directional key light across the crown.
    const key = g.createLinearGradient(lightFromRight ? 0 : W, 0, lightFromRight ? W : 0, 0);
    key.addColorStop(0, 'rgba(0,0,0,0.34)');
    key.addColorStop(0.6, 'rgba(0,0,0,0)');
    key.addColorStop(1, rgb(theme.stoneRim, 0.3));
    g.fillStyle = key;
    g.fillRect(0, 0, W, H);
    g.restore();

    // Step edges: a lit lip on top of each ledge, occlusion underneath.
    g.lineWidth = Math.max(1, H * 0.018);
    for (const [t0, , inset] of steps) {
      if (t0 === 0) continue;
      const hw = widthAt(inset) / 2;
      const y = t0 * H;
      g.strokeStyle = rgb(theme.stoneRim, 0.5);
      g.beginPath();
      g.moveTo(cx - hw, y + g.lineWidth * 0.5);
      g.lineTo(cx + hw, y + g.lineWidth * 0.5);
      g.stroke();

      const ao = g.createLinearGradient(0, y - H * 0.09, 0, y);
      ao.addColorStop(0, 'rgba(0,0,0,0)');
      ao.addColorStop(1, 'rgba(0,0,0,0.42)');
      g.fillStyle = ao;
      g.fillRect(cx - hw, y - H * 0.09, hw * 2, H * 0.09);
    }

    // Dentils along the crown: small repeated teeth read as carved masonry.
    const teeth = style === 1 ? 9 : 7;
    const crownW = widthAt(steps[0][2]);
    const tw = crownW / (teeth * 2 + 1);
    g.fillStyle = rgb(shade(theme.stoneDark, 0.1), 0.55);
    for (let i = 0; i < teeth; i++) {
      const x = cx - crownW / 2 + tw * (1 + i * 2);
      g.fillRect(x, H * 0.035, tw, H * 0.075);
    }
    g.fillStyle = rgb(theme.stoneRim, 0.32);
    for (let i = 0; i < teeth; i++) {
      const x = cx - crownW / 2 + tw * (1 + i * 2);
      g.fillRect(x, H * 0.035, tw, Math.max(1, H * 0.016));
    }

    // Bright leading line on the very face of the crown.
    g.fillStyle = rgb(shade(theme.stoneRim, 0.4), 0.75);
    g.fillRect(cx - crownW / 2, 0, crownW, Math.max(1, H * 0.03));

    // Overgrowth / rime / neon trim hanging off the crown.
    if (theme.trimAmount > 0.05) {
      const rng = new Rng(0x4a21 + style * 977);
      g.globalCompositeOperation = theme.id === 'neon' ? 'lighter' : 'source-over';
      const tips = Math.round(10 + theme.trimAmount * 10);
      for (let i = 0; i < tips; i++) {
        const x = cx - crownW / 2 + rng.range(0, crownW);
        const len = rng.range(H * 0.08, H * 0.34) * theme.trimAmount;
        const wdt = rng.range(H * 0.02, H * 0.055);
        g.fillStyle = rgb(shade(theme.trim, rng.range(-0.3, 0.3)), rng.range(0.4, 0.9));
        g.beginPath();
        g.moveTo(x - wdt, 0);
        g.lineTo(x + wdt, 0);
        g.lineTo(x, len);
        g.closePath();
        g.fill();
      }
      g.globalCompositeOperation = 'source-over';
    }

    return c;
  }

  /* -------------------------------- runes -------------------------------- */

  private bakeRunes(): HTMLCanvasElement {
    const W = this.runeW;
    const H = this.runeH;
    const c = makeCanvas(W, H);
    const g = ctx2d(c);
    const rng = new Rng(0x7f2e91);
    const color = this.theme.runeColor;
    const cx = W / 2;

    g.globalCompositeOperation = 'lighter';
    g.lineCap = 'round';
    g.lineJoin = 'round';

    // Each glyph is stroked three times — wide and faint, then tight and hot.
    // That fakes a bloom without a blur filter.
    const glow = (draw: () => void) => {
      const passes: Array<[number, number]> = [
        [W * 0.11, 0.1],
        [W * 0.055, 0.24],
        [W * 0.018, 0.95],
      ];
      for (const [lw, a] of passes) {
        g.lineWidth = lw;
        g.strokeStyle = rgb(color, a);
        g.fillStyle = rgb(color, a);
        draw();
      }
    };

    const rows = 3;
    for (let r = 0; r < rows; r++) {
      const y = H * (0.2 + r * 0.3);
      const kind = rng.int(0, 3);
      if (kind === 0) {
        glow(() => {
          g.beginPath();
          g.arc(cx, y, W * 0.19, 0.5, Math.PI - 0.5);
          g.stroke();
          g.beginPath();
          g.moveTo(cx, y - W * 0.22);
          g.lineTo(cx, y + W * 0.16);
          g.stroke();
        });
      } else if (kind === 1) {
        glow(() => {
          g.beginPath();
          g.moveTo(cx - W * 0.2, y - W * 0.11);
          g.lineTo(cx, y + W * 0.11);
          g.lineTo(cx + W * 0.2, y - W * 0.11);
          g.stroke();
        });
      } else if (kind === 2) {
        glow(() => {
          g.beginPath();
          g.arc(cx, y, W * 0.14, 0, TAU);
          g.stroke();
          g.beginPath();
          g.arc(cx, y, W * 0.045, 0, TAU);
          g.fill();
        });
      } else {
        glow(() => {
          g.beginPath();
          g.moveTo(cx - W * 0.22, y);
          g.lineTo(cx + W * 0.22, y);
          g.moveTo(cx - W * 0.1, y - W * 0.13);
          g.lineTo(cx - W * 0.1, y + W * 0.13);
          g.moveTo(cx + W * 0.1, y - W * 0.13);
          g.lineTo(cx + W * 0.1, y + W * 0.13);
          g.stroke();
        });
      }
    }

    return c;
  }
}
