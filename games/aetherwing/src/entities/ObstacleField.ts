import { NEAR_MISS_FRACTION, OBSTACLE, WORLD, type Difficulty } from '../config/balance';
import { Pool } from '../core/Pool';
import { Rng } from '../core/Rng';
import { TAU, clamp } from '../core/math';
import { circleRect } from '../systems/Collision';
import { Obstacle } from './Obstacle';

export interface PassEvent {
  obstacle: Obstacle;
  /** Distance to the nearer corridor edge, as a fraction of the gap. */
  clearance: number;
  nearMiss: boolean;
}

const CAPACITY = 12;
/** Smallest visible wall above and below a corridor. */
const MIN_WALL = 0.075;

/**
 * Spawns, drifts, recycles and tests the gates.
 *
 * Layout is random but never cruel: every corridor is reachable from the last
 * one at the current scroll speed, always leaves visible stone on both sides,
 * and drifting gates shrink their own travel range so they can't wander into
 * an impossible position.
 */
export class ObstacleField {
  private pool = new Pool<Obstacle>(CAPACITY, () => new Obstacle());
  private rng = new Rng(1);
  private nextId = 1;
  private distanceToNext = 0;
  private lastCenter = 0.5;
  private pendingTwin = false;
  private time = 0;

  get active(): number {
    return this.pool.active;
  }

  get items(): readonly Obstacle[] {
    return this.pool.items;
  }

  reset(seed: number, worldH: number): void {
    this.pool.clear();
    this.rng.reseed(seed);
    this.nextId = 1;
    this.time = 0;
    this.lastCenter = worldH * 0.5;
    this.pendingTwin = false;
    this.distanceToNext = 0;
  }

  /** Give the flyer a calm stretch of open sky before the first gate. */
  primeLeadIn(distance: number): void {
    this.distanceToNext = distance;
  }

  /** Bounds the corridor centre can occupy for a given gap and drift. */
  private centerRange(worldH: number, gap: number, drift: number): [number, number] {
    const top = WORLD.ceilingInset + MIN_WALL + gap * 0.5 + drift;
    const bottom = worldH - WORLD.floorInset - MIN_WALL - gap * 0.5 - drift;
    if (top >= bottom) {
      const mid = worldH * 0.5;
      return [mid, mid];
    }
    // Also keep gates loosely centred so the eye isn't dragged to an edge.
    const band = Math.min(worldH * 0.31, 0.4);
    const lo = Math.max(top, worldH * 0.5 - band);
    const hi = Math.min(bottom, worldH * 0.5 + band);
    return lo >= hi ? [top, bottom] : [lo, hi];
  }

  update(
    dt: number,
    scroll: number,
    worldW: number,
    worldH: number,
    diff: Difficulty,
    spawning: boolean,
  ): void {
    this.time += dt;

    const items = this.pool.items;
    for (let i = 0; i < this.pool.active; i++) {
      const o = items[i];
      o.x -= scroll * dt;
      if (o.right + OBSTACLE.capOverhang < -0.15) {
        this.pool.releaseAt(i);
        i--;
      }
    }

    if (!spawning) return;

    this.distanceToNext -= scroll * dt;
    let guard = 0;
    while (this.distanceToNext <= 0 && guard++ < 4) {
      const twin = this.pendingTwin;
      this.spawn(worldW, worldH, diff, twin);
      if (twin) {
        this.pendingTwin = false;
        this.distanceToNext += diff.spacing * 0.62;
      } else {
        this.pendingTwin = this.rng.bool(diff.twinChance);
        this.distanceToNext += this.pendingTwin
          ? diff.spacing * 0.62
          : diff.spacing;
      }
    }
  }

  private spawn(worldW: number, worldH: number, diff: Difficulty, twin: boolean): void {
    const o = this.pool.obtain();
    if (!o) return;

    const drifts = !twin && this.rng.bool(diff.driftChance);
    const amp = drifts ? diff.driftAmp * this.rng.range(0.55, 1) : 0;

    const [lo, hi] = this.centerRange(worldH, diff.gap, amp);

    let center: number;
    if (twin) {
      // A double gate keeps the same corridor: dramatic to look at, honest to fly.
      center = clamp(this.lastCenter, lo, hi);
    } else {
      const spread = diff.variance;
      let delta = this.rng.gaussian() * spread;
      // Nudge away from "identical to the last one", which reads as a bug.
      if (Math.abs(delta) < spread * 0.28) {
        delta = (delta < 0 ? -1 : 1) * spread * this.rng.range(0.28, 0.6);
      }
      center = clamp(this.lastCenter + delta, lo, hi);
      // If clamping ate the movement, push the other way instead.
      if (Math.abs(center - this.lastCenter) < spread * 0.16) {
        center = clamp(this.lastCenter - delta, lo, hi);
      }
    }

    o.x = worldW + OBSTACLE.width * 0.5 + OBSTACLE.capOverhang + 0.02;
    o.gapCenter = center;
    o.gapSize = diff.gap;
    o.driftAmp = amp;
    o.driftFreq = amp > 0 ? TAU * this.rng.range(0.12, 0.24) : 0;
    o.driftPhase = this.rng.range(0, TAU);
    o.capStyle = this.rng.int(0, 2);
    o.tileTop = this.rng.int(0, 2);
    o.tileBottom = this.rng.int(0, 2);
    o.tilt = this.rng.spread(0.018);
    o.runeSeed = this.rng.next();
    o.trimAmount = this.rng.range(0.45, 1);
    o.scored = false;
    o.nearMissed = false;
    o.id = this.nextId++;

    this.lastCenter = center;
  }

  /* ------------------------------- queries ------------------------------- */

  /** @returns the colliding obstacle, or null. */
  hitTest(cx: number, cy: number, r: number, worldH: number): Obstacle | null {
    const items = this.pool.items;
    const inset = OBSTACLE.colliderInset;
    for (let i = 0; i < this.pool.active; i++) {
      const o = items[i];
      if (o.right + OBSTACLE.capOverhang < cx - r || o.left - OBSTACLE.capOverhang > cx + r) {
        continue;
      }
      const center = o.centerAt(this.time);
      const gapTop = center - o.gapSize * 0.5;
      const gapBottom = center + o.gapSize * 0.5;

      const bx = o.left + inset;
      const bw = OBSTACLE.width - inset * 2;
      const cxL = o.left - OBSTACLE.capOverhang + inset;
      const cw = OBSTACLE.width + OBSTACLE.capOverhang * 2 - inset * 2;
      const ch = OBSTACLE.capHeight - inset;

      // Upper monolith: body column, then the flared capstone at its foot.
      if (circleRect(cx, cy, r, bx, -2, bw, gapTop - OBSTACLE.capHeight + 2 + inset)) return o;
      if (circleRect(cx, cy, r, cxL, gapTop - OBSTACLE.capHeight + inset, cw, ch)) return o;

      // Lower monolith.
      if (circleRect(cx, cy, r, cxL, gapBottom, cw, ch)) return o;
      if (
        circleRect(cx, cy, r, bx, gapBottom + OBSTACLE.capHeight - inset, bw, worldH + 2)
      ) {
        return o;
      }
    }
    return null;
  }

  /**
   * Marks gates the flyer has just cleared.
   * @returns the pass events produced this step.
   */
  collectPasses(cx: number, cy: number, out: PassEvent[]): PassEvent[] {
    out.length = 0;
    const items = this.pool.items;
    for (let i = 0; i < this.pool.active; i++) {
      const o = items[i];
      if (o.scored || o.x > cx) continue;
      o.scored = true;
      const center = o.centerAt(this.time);
      const half = o.gapSize * 0.5;
      const clearance = Math.max(0, (half - Math.abs(cy - center)) / o.gapSize);
      const nearMiss = clearance < NEAR_MISS_FRACTION;
      o.nearMissed = nearMiss;
      out.push({ obstacle: o, clearance, nearMiss });
    }
    return out;
  }

  /** The gate the flyer is heading into, used for HUD framing hints. */
  nextAhead(cx: number): Obstacle | null {
    let best: Obstacle | null = null;
    const items = this.pool.items;
    for (let i = 0; i < this.pool.active; i++) {
      const o = items[i];
      if (o.x < cx) continue;
      if (!best || o.x < best.x) best = o;
    }
    return best;
  }

  get clock(): number {
    return this.time;
  }
}
