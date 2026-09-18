import { TAU, clamp, lerp, rgb, shade, type RGB } from '../core/math';
import { ctx2d, makeCanvas } from './textures';

export const FRAMES = 13;
const WING_MIN = -1.05;
const WING_MAX = 1.1;

/** The drake's own colours — it keeps its identity across every sky. */
const PAL = {
  backDark: [38, 58, 66] as RGB,
  backLit: [104, 160, 158] as RGB,
  bodyDark: [74, 44, 26] as RGB,
  bodyMid: [166, 108, 54] as RGB,
  bodyLit: [214, 156, 86] as RGB,
  belly: [236, 208, 158] as RGB,
  bellyShade: [186, 148, 104] as RGB,
  covert: [136, 88, 44] as RGB,
  covertLit: [196, 140, 76] as RGB,
  primary: [58, 38, 24] as RGB,
  primaryEdge: [166, 122, 74] as RGB,
  primaryFar: [40, 30, 26] as RGB,
  crest: [226, 158, 66] as RGB,
  beak: [242, 198, 108] as RGB,
  beakDark: [168, 116, 40] as RGB,
  eye: [255, 186, 64] as RGB,
  rim: [255, 236, 200] as RGB,
  claw: [58, 44, 32] as RGB,
};

interface Sheet {
  canvas: HTMLCanvasElement;
  frame: number;
}

/**
 * The flyer, pre-rendered once into a strip of wing poses.
 *
 * Drawing this creature costs roughly 120 vector operations — affordable
 * fifteen times at load, ruinous sixty times a second. At runtime the game
 * blits one cell, tints it to the current sky, and rotates it.
 */
export class CreatureSprite {
  private sheet: Sheet | null = null;
  private scratch: HTMLCanvasElement | null = null;

  /** Rebuilds only when the required pixel size actually changes. */
  build(framePx: number): void {
    const size = clamp(Math.round(framePx), 56, 400);
    if (this.sheet && this.sheet.frame === size) return;

    const canvas = makeCanvas(size * FRAMES, size);
    const g = ctx2d(canvas);
    const R = (size / 2) * 0.96;

    for (let i = 0; i < FRAMES; i++) {
      const wing = lerp(WING_MIN, WING_MAX, i / (FRAMES - 1));
      g.save();
      g.translate(size * i + size / 2, size / 2);
      g.scale(R, R);
      g.lineJoin = 'round';
      g.lineCap = 'round';
      drawCreature(g, wing);
      g.restore();
    }

    this.sheet = { canvas, frame: size };
    this.scratch = makeCanvas(size, size);
  }

  get frameSize(): number {
    return this.sheet?.frame ?? 1;
  }

  static frameIndex(wing: number): number {
    const t = (clamp(wing, WING_MIN, WING_MAX) - WING_MIN) / (WING_MAX - WING_MIN);
    return Math.round(t * (FRAMES - 1));
  }

  /**
   * Draws the creature, environment-lit.
   *
   * The sky's ambient colour is composited onto the sprite with `source-atop`
   * in a scratch buffer, so the drake picks up the sunset or the storm without
   * ever re-baking the sheet — a theme change is a colour change, not a rebuild.
   */
  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    rotation: number,
    wing: number,
    opts: {
      rimColor: RGB;
      fillColor: RGB;
      ambient: number;
      hurt: number;
      beat: number;
      alpha: number;
      squash: number;
    },
  ): void {
    const sheet = this.sheet;
    const scratch = this.scratch;
    if (!sheet || !scratch) return;

    const fs = sheet.frame;
    const idx = CreatureSprite.frameIndex(wing);
    const sg = ctx2d(scratch);

    sg.clearRect(0, 0, fs, fs);
    sg.drawImage(sheet.canvas, idx * fs, 0, fs, fs, 0, 0, fs, fs);

    // Environment light: cool bounce from below, key colour from above.
    sg.globalCompositeOperation = 'source-atop';
    const grad = sg.createLinearGradient(0, 0, fs * 0.35, fs);
    grad.addColorStop(0, rgb(opts.rimColor, 0.34 * opts.ambient));
    grad.addColorStop(0.52, rgb(opts.fillColor, 0.16 * opts.ambient));
    grad.addColorStop(1, rgb(opts.fillColor, 0.44 * opts.ambient));
    sg.fillStyle = grad;
    sg.fillRect(0, 0, fs, fs);

    if (opts.hurt > 0.01) {
      sg.fillStyle = `rgba(255,72,48,${0.7 * opts.hurt})`;
      sg.fillRect(0, 0, fs, fs);
    }
    sg.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opts.alpha;

    // Wingbeat bloom behind the body.
    if (opts.beat > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      const r = size * (0.42 + opts.beat * 0.2);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      glow.addColorStop(0, rgb(opts.rimColor, 0.3 * opts.beat));
      glow.addColorStop(1, rgb(opts.rimColor, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.globalCompositeOperation = 'source-over';
    }

    const w = size;
    const h = size * opts.squash;
    ctx.drawImage(scratch, -w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

/* ------------------------------ vector body ------------------------------ */

function drawCreature(g: CanvasRenderingContext2D, wing: number): void {
  // The far wing lags the near one, which is what sells the depth.
  drawWing(g, wing * 0.92 - 0.1, false);
  drawTail(g, wing);
  drawBody(g);
  drawLegs(g);
  drawHead(g);
  drawWing(g, wing, true);
  drawRim(g, wing);
}

function drawBody(g: CanvasRenderingContext2D): void {
  // Contact shadow under the belly.
  g.save();
  const sh = g.createRadialGradient(0.02, 0.26, 0.01, 0.02, 0.26, 0.42);
  sh.addColorStop(0, 'rgba(0,0,0,0.34)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sh;
  g.beginPath();
  g.ellipse(0.02, 0.26, 0.42, 0.16, 0, 0, TAU);
  g.fill();
  g.restore();

  g.save();
  g.beginPath();
  g.ellipse(0.0, 0.06, 0.415, 0.238, -0.1, 0, TAU);
  g.clip();

  // Base form: a sphere-like falloff keyed to the upper-right.
  const body = g.createRadialGradient(0.16, -0.12, 0.02, 0.02, 0.1, 0.56);
  body.addColorStop(0, rgb(PAL.bodyLit));
  body.addColorStop(0.42, rgb(PAL.bodyMid));
  body.addColorStop(1, rgb(PAL.bodyDark));
  g.fillStyle = body;
  g.fillRect(-1, -1, 2, 2);

  // Dark iridescent mantle over the shoulders and back.
  const back = g.createLinearGradient(0, -0.28, 0, 0.14);
  back.addColorStop(0, rgb(PAL.backDark, 0.95));
  back.addColorStop(0.55, rgb(PAL.backDark, 0.35));
  back.addColorStop(1, rgb(PAL.backDark, 0));
  g.fillStyle = back;
  g.fillRect(-1, -1, 2, 2);

  const sheen = g.createLinearGradient(-0.3, -0.24, 0.3, 0.02);
  sheen.addColorStop(0, rgb(PAL.backLit, 0));
  sheen.addColorStop(0.5, rgb(PAL.backLit, 0.42));
  sheen.addColorStop(1, rgb(PAL.backLit, 0));
  g.globalCompositeOperation = 'screen';
  g.fillStyle = sheen;
  g.fillRect(-1, -1, 2, 2);
  g.globalCompositeOperation = 'source-over';

  // Pale underside.
  const belly = g.createLinearGradient(0, 0.34, 0, -0.02);
  belly.addColorStop(0, rgb(PAL.belly, 0.98));
  belly.addColorStop(0.45, rgb(PAL.bellyShade, 0.6));
  belly.addColorStop(1, rgb(PAL.bellyShade, 0));
  g.fillStyle = belly;
  g.fillRect(-1, -1, 2, 2);

  // Breast feather scallops.
  g.strokeStyle = 'rgba(90,58,32,0.16)';
  g.lineWidth = 0.012;
  for (let r = 0; r < 4; r++) {
    const y = 0.06 + r * 0.055;
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const x = -0.14 + i * 0.1;
      g.moveTo(x, y);
      g.quadraticCurveTo(x + 0.05, y + 0.045, x + 0.1, y);
    }
    g.stroke();
  }
  g.restore();
}

function drawHead(g: CanvasRenderingContext2D): void {
  // Neck wedge tying the head to the shoulders.
  g.beginPath();
  g.moveTo(0.18, -0.16);
  g.quadraticCurveTo(0.34, -0.26, 0.5, -0.16);
  g.lineTo(0.46, 0.06);
  g.quadraticCurveTo(0.3, 0.12, 0.16, 0.04);
  g.closePath();
  const neck = g.createLinearGradient(0.2, -0.24, 0.36, 0.1);
  neck.addColorStop(0, rgb(PAL.backDark));
  neck.addColorStop(0.6, rgb(PAL.bodyMid));
  neck.addColorStop(1, rgb(PAL.bodyDark));
  g.fillStyle = neck;
  g.fill();

  // Crest: three swept quills.
  for (let i = 0; i < 3; i++) {
    const t = i / 2;
    g.beginPath();
    g.moveTo(0.4 - t * 0.06, -0.19);
    g.quadraticCurveTo(0.24 - t * 0.14, -0.36 - t * 0.06, 0.02 - t * 0.16, -0.34 - t * 0.1);
    g.quadraticCurveTo(0.2 - t * 0.1, -0.3 - t * 0.04, 0.42 - t * 0.05, -0.14);
    g.closePath();
    g.fillStyle = rgb(shade(PAL.crest, -0.18 * i), 0.95);
    g.fill();
  }

  // Skull.
  g.save();
  g.beginPath();
  g.ellipse(0.45, -0.1, 0.17, 0.148, -0.16, 0, TAU);
  g.clip();
  const head = g.createRadialGradient(0.5, -0.17, 0.01, 0.44, -0.08, 0.26);
  head.addColorStop(0, rgb(shade(PAL.bodyLit, 0.2)));
  head.addColorStop(0.5, rgb(PAL.bodyMid));
  head.addColorStop(1, rgb(PAL.bodyDark));
  g.fillStyle = head;
  g.fillRect(0, -1, 1, 2);
  const cap = g.createLinearGradient(0, -0.26, 0, -0.06);
  cap.addColorStop(0, rgb(PAL.backDark, 0.9));
  cap.addColorStop(1, rgb(PAL.backDark, 0));
  g.fillStyle = cap;
  g.fillRect(0, -1, 1, 2);
  g.restore();

  // Beak: upper mandible with a hooked tip, then the lower.
  g.beginPath();
  g.moveTo(0.55, -0.16);
  g.quadraticCurveTo(0.76, -0.155, 0.87, -0.075);
  g.quadraticCurveTo(0.79, -0.028, 0.72, -0.035);
  g.quadraticCurveTo(0.63, -0.05, 0.54, -0.04);
  g.closePath();
  const bk = g.createLinearGradient(0.55, -0.17, 0.8, -0.02);
  bk.addColorStop(0, rgb(PAL.beak));
  bk.addColorStop(1, rgb(PAL.beakDark));
  g.fillStyle = bk;
  g.fill();

  g.beginPath();
  g.moveTo(0.55, -0.03);
  g.quadraticCurveTo(0.68, -0.015, 0.74, -0.008);
  g.quadraticCurveTo(0.66, 0.032, 0.54, 0.028);
  g.closePath();
  g.fillStyle = rgb(shade(PAL.beakDark, -0.2));
  g.fill();

  // Nostril + mandible seam.
  g.strokeStyle = 'rgba(60,36,10,0.5)';
  g.lineWidth = 0.011;
  g.beginPath();
  g.moveTo(0.56, -0.085);
  g.quadraticCurveTo(0.68, -0.062, 0.78, -0.052);
  g.stroke();
  g.fillStyle = 'rgba(60,36,10,0.55)';
  g.beginPath();
  g.ellipse(0.605, -0.115, 0.016, 0.01, 0.2, 0, TAU);
  g.fill();

  // Eye: socket, iris, pupil, catchlight.
  g.fillStyle = 'rgba(24,14,8,0.55)';
  g.beginPath();
  g.ellipse(0.485, -0.145, 0.062, 0.056, -0.1, 0, TAU);
  g.fill();
  const iris = g.createRadialGradient(0.492, -0.152, 0.004, 0.485, -0.145, 0.05);
  iris.addColorStop(0, rgb(shade(PAL.eye, 0.5)));
  iris.addColorStop(0.6, rgb(PAL.eye));
  iris.addColorStop(1, rgb(shade(PAL.eye, -0.55)));
  g.fillStyle = iris;
  g.beginPath();
  g.ellipse(0.485, -0.145, 0.046, 0.042, -0.1, 0, TAU);
  g.fill();
  g.fillStyle = '#140c05';
  g.beginPath();
  g.ellipse(0.495, -0.147, 0.019, 0.024, -0.1, 0, TAU);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.92)';
  g.beginPath();
  g.ellipse(0.505, -0.163, 0.014, 0.011, -0.3, 0, TAU);
  g.fill();
  // Brow ridge — gives the face intent instead of blankness.
  g.strokeStyle = rgb(shade(PAL.bodyDark, -0.25), 0.85);
  g.lineWidth = 0.026;
  g.beginPath();
  g.moveTo(0.42, -0.2);
  g.quadraticCurveTo(0.5, -0.215, 0.55, -0.17);
  g.stroke();
}

function drawLegs(g: CanvasRenderingContext2D): void {
  g.strokeStyle = rgb(PAL.claw);
  g.lineWidth = 0.03;
  g.lineCap = 'round';
  for (let i = 0; i < 2; i++) {
    const x = 0.06 - i * 0.1;
    const y = 0.2 + i * 0.012;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x - 0.06, y + 0.08, x - 0.13, y + 0.055);
    g.stroke();
    g.lineWidth = 0.016;
    g.beginPath();
    g.moveTo(x - 0.13, y + 0.055);
    g.lineTo(x - 0.18, y + 0.03);
    g.moveTo(x - 0.13, y + 0.055);
    g.lineTo(x - 0.17, y + 0.085);
    g.stroke();
    g.lineWidth = 0.03;
  }
}

function drawTail(g: CanvasRenderingContext2D, wing: number): void {
  const fan = 0.2 + wing * 0.06;
  const base = 2.94;
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const a = base + (t - 0.5) * fan * 2;
    const len = 0.52 * (1 - Math.abs(t - 0.5) * 0.42);
    const bx = -0.3;
    const by = 0.06 + (t - 0.5) * 0.06;
    const tx = bx + Math.cos(a) * len;
    const ty = by + Math.sin(a) * len;
    const mid = 1 - Math.abs(t - 0.5) * 2;
    const grad = g.createLinearGradient(bx, by, tx, ty);
    grad.addColorStop(0, rgb(shade(PAL.covert, 0.1 * mid)));
    grad.addColorStop(0.65, rgb(PAL.primary));
    grad.addColorStop(1, rgb(shade(PAL.primary, -0.25)));
    g.fillStyle = grad;
    feather(g, bx, by, tx, ty, 0.05 + mid * 0.022);
    g.strokeStyle = 'rgba(20,12,8,0.35)';
    g.lineWidth = 0.007;
    g.beginPath();
    g.moveTo(bx, by);
    g.lineTo(tx, ty);
    g.stroke();
  }
}

function drawWing(g: CanvasRenderingContext2D, wing: number, near: boolean): void {
  const w = clamp(wing, -1.15, 1.2);
  const sx = near ? 0.1 : 0.0;
  const sy = near ? -0.02 : -0.11;
  const theta = 2.84 - w * 0.8;
  const len = (near ? 0.96 : 0.86) * (1 - 0.12 * Math.abs(w));

  const dx = Math.cos(theta);
  const dy = Math.sin(theta);

  const primary = near ? PAL.primary : PAL.primaryFar;
  const edge = near ? PAL.primaryEdge : shade(PAL.primaryEdge, -0.4);
  const covert = near ? PAL.covert : shade(PAL.covert, -0.42);
  const covertLit = near ? PAL.covertLit : shade(PAL.covertLit, -0.4);

  const n = 9;
  const spread = 0.152;

  // Feathers, outermost first so the inner ones overlap correctly.
  for (let i = n - 1; i >= 0; i--) {
    const t = i / (n - 1);
    const a = theta + i * spread;
    const l = len * (1 - 0.58 * Math.pow(t, 0.8));
    const bx = sx + dx * len * 0.3 * (1 - t) + 0.02 * t;
    const by = sy + dy * len * 0.3 * (1 - t) + 0.05 * t;
    const tx = bx + Math.cos(a) * l;
    const ty = by + Math.sin(a) * l;
    const width = len * (0.085 - 0.03 * t);

    const grad = g.createLinearGradient(bx, by, tx, ty);
    grad.addColorStop(0, rgb(covertLit));
    grad.addColorStop(0.34, rgb(shade(primary, 0.22)));
    grad.addColorStop(1, rgb(primary));
    g.fillStyle = grad;
    feather(g, bx, by, tx, ty, width);

    // A bright margin along the leading side of each primary.
    g.strokeStyle = rgb(edge, near ? 0.5 : 0.25);
    g.lineWidth = 0.009;
    g.beginPath();
    g.moveTo(bx, by);
    const nx = -(ty - by);
    const ny = tx - bx;
    const nl = Math.hypot(nx, ny) || 1;
    g.quadraticCurveTo(
      (bx + tx) / 2 + (nx / nl) * width,
      (by + ty) / 2 + (ny / nl) * width,
      tx,
      ty,
    );
    g.stroke();
  }

  // Covert shoulder pad hiding the feather roots.
  const cx = sx + dx * len * 0.2;
  const cy = sy + dy * len * 0.2;
  g.save();
  g.translate(sx, sy);
  g.rotate(theta + 0.42);
  g.beginPath();
  g.ellipse(len * 0.2, 0.0, len * 0.34, len * 0.16, 0, 0, TAU);
  g.clip();
  const cg = g.createLinearGradient(0, -len * 0.16, 0, len * 0.16);
  cg.addColorStop(0, rgb(covertLit));
  cg.addColorStop(0.5, rgb(covert));
  cg.addColorStop(1, rgb(shade(covert, -0.4)));
  g.fillStyle = cg;
  g.fillRect(-1, -1, 2, 2);
  // Two rows of covert scallops.
  g.strokeStyle = 'rgba(30,18,10,0.28)';
  g.lineWidth = 0.011;
  for (let r = 0; r < 2; r++) {
    const yy = -0.04 + r * 0.07;
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const x = len * 0.02 + i * len * 0.09;
      g.moveTo(x, yy);
      g.quadraticCurveTo(x + len * 0.045, yy + 0.04, x + len * 0.09, yy);
    }
    g.stroke();
  }
  g.restore();

  // Leading-edge highlight along the arm.
  g.strokeStyle = rgb(near ? PAL.rim : shade(PAL.rim, -0.55), near ? 0.5 : 0.22);
  g.lineWidth = 0.018;
  g.beginPath();
  g.moveTo(sx, sy);
  g.quadraticCurveTo(cx, cy - 0.03, sx + dx * len * 0.52, sy + dy * len * 0.52);
  g.stroke();
}

function drawRim(g: CanvasRenderingContext2D, wing: number): void {
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = rgb(PAL.rim, 0.36);
  g.lineWidth = 0.028;

  // Back and skull catch the key light.
  g.beginPath();
  g.ellipse(0.0, 0.06, 0.4, 0.226, -0.1, -2.5, -0.55);
  g.stroke();

  g.lineWidth = 0.022;
  g.beginPath();
  g.ellipse(0.45, -0.1, 0.16, 0.14, -0.16, -2.5, -0.3);
  g.stroke();

  // Wing arm.
  const theta = 2.84 - clamp(wing, -1.15, 1.2) * 0.8;
  g.lineWidth = 0.016;
  g.strokeStyle = rgb(PAL.rim, 0.26);
  g.beginPath();
  g.moveTo(0.1, -0.02);
  g.lineTo(0.1 + Math.cos(theta) * 0.62, -0.02 + Math.sin(theta) * 0.62);
  g.stroke();
  g.restore();
}

/** A tapered lens: wide, curved leading side and a straighter trailing side. */
function feather(
  g: CanvasRenderingContext2D,
  bx: number,
  by: number,
  tx: number,
  ty: number,
  width: number,
): void {
  const dx = tx - bx;
  const dy = ty - by;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = bx + dx * 0.46;
  const my = by + dy * 0.46;
  g.beginPath();
  g.moveTo(bx, by);
  g.quadraticCurveTo(mx + nx * width, my + ny * width, tx, ty);
  g.quadraticCurveTo(mx - nx * width * 0.5, my - ny * width * 0.5, bx, by);
  g.closePath();
  g.fill();
}
