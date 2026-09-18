/**
 * mulberry32 — a compact, fast, well-distributed 32-bit PRNG.
 * Seeded so that pre-rendered art (mountains, stone grain, rune layouts) is
 * reproducible across resizes while gameplay stays freshly random per run.
 */
export class Rng {
  private s: number;

  constructor(seed = 0x9e3779b9) {
    this.s = seed >>> 0;
  }

  reseed(seed: number): void {
    this.s = seed >>> 0;
  }

  /** Uniform float in [0, 1). */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Uniform float in [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Uniform integer in [min, max]. */
  int(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }

  /** Symmetric spread around zero: [-m, m). */
  spread(m: number): number {
    return (this.next() * 2 - 1) * m;
  }

  bool(chance = 0.5): boolean {
    return this.next() < chance;
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }

  /** Approximate normal distribution via averaging — cheaper than Box-Muller. */
  gaussian(): number {
    return (this.next() + this.next() + this.next() - 1.5) / 1.5;
  }
}

export const globalRng = new Rng(Date.now() >>> 0);
