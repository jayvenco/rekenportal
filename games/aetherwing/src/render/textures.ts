import { Rng } from '../core/Rng';
import { TAU, clamp01, hash2 } from '../core/math';

export const makeCanvas = (w: number, h: number): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};

export const ctx2d = (c: HTMLCanvasElement): CanvasRenderingContext2D => {
  const g = c.getContext('2d');
  if (!g) throw new Error('Canvas 2D context unavailable');
  return g;
};

/**
 * A vertically tileable slab of grey stone.
 *
 * Baked once in greyscale and reused by every sky: recolouring a finished
 * texture with two composite passes costs a fraction of a millisecond, while
 * regenerating the noise per theme would cost tens.
 *
 * Seamlessness comes from building the strata out of sine harmonics whose
 * periods divide the tile height exactly, so the bottom row always meets the
 * top row. The carved joints sit on exact fractions for the same reason.
 */
export function bakeStoneTile(w: number, h: number, seed: number): HTMLCanvasElement {
  const c = makeCanvas(w, h);
  const g = ctx2d(c);
  const rng = new Rng(seed);

  const HARMONICS = 7;
  const phase = new Float32Array(HARMONICS);
  const bend = new Float32Array(HARMONICS);
  const amp = [0.5, 0.29, 0.18, 0.12, 0.08, 0.05, 0.035];
  let ampSum = 0;
  for (let k = 0; k < HARMONICS; k++) {
    phase[k] = rng.range(0, TAU);
    bend[k] = rng.range(-2.6, 2.6);
    ampSum += amp[k];
  }

  const img = g.createImageData(w, h);
  const data = img.data;

  for (let y = 0; y < h; y++) {
    const v = y / h;
    for (let x = 0; x < w; x++) {
      const u = x / w;

      // Sedimentary banding: periodic in v, warped by u so the strata wave.
      let s = 0;
      for (let k = 0; k < HARMONICS; k++) {
        s += amp[k] * Math.sin(TAU * (k + 1) * v + phase[k] + u * bend[k]);
      }
      s /= ampSum;

      // Two scales of grit.
      const fine = hash2(x * 1.7, y * 1.7) - 0.5;
      const coarse = hash2(Math.floor(x / 3) * 2.3, Math.floor(y / 3) * 2.3) - 0.5;

      // Cylindrical shading — the column is round, not a flat plank.
      const curve = Math.sin(Math.PI * clamp01(u * 0.94 + 0.03));
      const round = 0.42 + 0.58 * Math.pow(curve, 0.62);

      let lum = round * (0.72 + s * 0.2) + fine * 0.075 + coarse * 0.055;

      // Chiselled edges.
      const edge = Math.min(u, 1 - u);
      if (edge < 0.055) lum *= 0.42 + (edge / 0.055) * 0.58;
      else if (edge < 0.1) lum *= 0.92 + (edge - 0.055) * 1.7;

      const i = (y * w + x) << 2;
      const b = clamp01(lum) * 255;
      data[i] = b;
      data[i + 1] = b;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);

  // Carved joints between the stacked blocks, on exact fractions of the tile.
  const joints = 3;
  for (let j = 0; j < joints; j++) {
    const y = Math.round((j / joints) * h);
    const t = Math.max(1, h * 0.012);
    g.fillStyle = 'rgba(0,0,0,0.55)';
    g.fillRect(0, y, w, t);
    g.fillStyle = 'rgba(255,255,255,0.24)';
    g.fillRect(0, y + t, w, Math.max(1, t * 0.55));
    g.fillStyle = 'rgba(0,0,0,0.18)';
    g.fillRect(0, y - t * 1.6, w, t * 1.6);
  }

  // Weathering: a few interior fractures, kept clear of the tiling seam.
  g.lineCap = 'round';
  const cracks = 4;
  for (let i = 0; i < cracks; i++) {
    let cx = rng.range(w * 0.12, w * 0.88);
    let cy = rng.range(h * 0.12, h * 0.88);
    g.beginPath();
    g.moveTo(cx, cy);
    const steps = rng.int(3, 6);
    for (let s = 0; s < steps; s++) {
      cx += rng.spread(w * 0.1);
      cy += rng.range(h * 0.02, h * 0.09);
      if (cy > h * 0.9) break;
      g.lineTo(cx, cy);
    }
    g.strokeStyle = 'rgba(0,0,0,0.4)';
    g.lineWidth = Math.max(0.7, w * 0.008);
    g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.lineWidth = Math.max(0.5, w * 0.004);
    g.stroke();
  }

  return c;
}

/** Static monochrome grain, tiled and jittered per frame for film texture. */
export function bakeGrainTile(size = 128): HTMLCanvasElement {
  const c = makeCanvas(size, size);
  const g = ctx2d(c);
  const img = g.createImageData(size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = 118 + Math.random() * 20;
    d[i] = d[i + 1] = d[i + 2] = n;
    d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

/** Recolour a greyscale source: multiply for body tone, screen for the rim. */
export function tintStone(
  src: HTMLCanvasElement,
  dark: string,
  mid: string,
  lit: string,
  rim: string,
  lightFromRight: boolean,
): HTMLCanvasElement {
  const c = makeCanvas(src.width, src.height);
  const g = ctx2d(c);
  const w = c.width;
  const h = c.height;

  g.drawImage(src, 0, 0);

  const body = g.createLinearGradient(0, 0, w, 0);
  body.addColorStop(0, lightFromRight ? dark : lit);
  body.addColorStop(0.34, mid);
  body.addColorStop(0.72, lightFromRight ? lit : mid);
  body.addColorStop(1, lightFromRight ? mid : dark);
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = body;
  g.fillRect(0, 0, w, h);

  // A narrow specular strip along the sunward edge.
  const rimX = lightFromRight ? w * 0.78 : w * 0.22;
  const spec = g.createLinearGradient(rimX - w * 0.22, 0, rimX + w * 0.14, 0);
  spec.addColorStop(0, 'rgba(0,0,0,0)');
  spec.addColorStop(0.62, rim);
  spec.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalCompositeOperation = 'screen';
  g.globalAlpha = 0.4;
  g.fillStyle = spec;
  g.fillRect(0, 0, w, h);

  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  return c;
}
