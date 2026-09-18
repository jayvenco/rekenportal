import { OBSTACLE } from '../config/balance';

/**
 * One gate: a monolith hanging from the sky and one rising from the cloud sea,
 * with a corridor between them. Geometry is regenerated on recycle rather than
 * allocated, so a ten-minute run never triggers a collection.
 */
export class Obstacle {
  /** Horizontal centre, world units. */
  x = 0;
  /** Resting centre of the corridor. */
  gapCenter = 0;
  gapSize = 0.3;

  /** Vertical oscillation. */
  driftAmp = 0;
  driftFreq = 0;
  driftPhase = 0;

  /** Cosmetic variation. */
  capStyle = 0;
  tileTop = 0;
  tileBottom = 0;
  tilt = 0;
  runeSeed = 0;
  /** 0..1 — how heavily the capstones are overgrown / iced / lit. */
  trimAmount = 0.5;

  scored = false;
  /** Set when the pass was tight enough to earn the near-miss flourish. */
  nearMissed = false;
  /** Monotonic id so the renderer can vary animation phase per gate. */
  id = 0;

  /** Live corridor centre for the given world clock. */
  centerAt(time: number): number {
    return this.driftAmp === 0
      ? this.gapCenter
      : this.gapCenter + Math.sin(time * this.driftFreq + this.driftPhase) * this.driftAmp;
  }

  get halfWidth(): number {
    return OBSTACLE.width * 0.5;
  }

  /** Left edge of the body column (visual). */
  get left(): number {
    return this.x - OBSTACLE.width * 0.5;
  }

  get right(): number {
    return this.x + OBSTACLE.width * 0.5;
  }
}
