import { clamp, lerp } from '../core/math';

/**
 * Every gameplay constant lives in *world units* (1 unit ≈ the reference
 * viewport height). Nothing here is measured in pixels, so tuning holds on a
 * phone in portrait and on a desktop in landscape alike.
 */

export const PHYSICS = {
  gravity: 2.9,
  flapImpulse: 0.86,
  /** A short window right after a flap where gravity is softened — makes the
   *  rise read as a powered wingbeat instead of a ballistic hop. */
  flapLiftTime: 0.09,
  flapLiftScale: 0.35,
  maxFall: 1.3,
  maxRise: 1.05,
  /** Minimum time between flaps; stops mashing from turning into a jetpack. */
  flapCooldown: 0.085,
} as const;

export const PLAYER = {
  /** Collision radius. Deliberately smaller than the drawn creature so the
   *  hitbox always feels generous rather than cruel. */
  radius: 0.037,
  /** Half the drawn sprite footprint; the body reads at roughly 2x the hitbox. */
  drawScale: 0.127,
  /** Sprite frame size as a multiple of `drawScale`. */
  drawFrame: 1.85,
  xFraction: 0.29,
  /** Rotation limits, radians. */
  tiltUp: -0.46,
  tiltDown: 1.24,
} as const;

export const OBSTACLE = {
  width: 0.118,
  capOverhang: 0.026,
  capHeight: 0.052,
  /** Extra forgiveness carved off the collider on every side. */
  colliderInset: 0.008,
} as const;

export const WORLD = {
  /** Death plane: the cloud sea at the bottom of the frame. */
  floorInset: 0.02,
  /** Soft ceiling — you bounce off it rather than dying. */
  ceilingInset: 0.015,
} as const;

export interface Difficulty {
  /** Horizontal scroll speed, units/second. */
  speed: number;
  /** Vertical opening between the two monoliths, units. */
  gap: number;
  /** Distance between obstacle centres, units. */
  spacing: number;
  /** Largest allowed vertical jump between consecutive gap centres, units. */
  variance: number;
  /** Probability that an obstacle drifts vertically. */
  driftChance: number;
  /** Peak drift amplitude, units. */
  driftAmp: number;
  /** Probability of a tight "double gate" pair. */
  twinChance: number;
  /** 0..1 overall intensity, drives music, grade and particle energy. */
  intensity: number;
}

type Key = readonly [score: number, value: number];

const curve = (points: readonly Key[], score: number): number => {
  if (score <= points[0][0]) return points[0][1];
  const last = points[points.length - 1];
  if (score >= last[0]) return last[1];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (score <= b[0]) {
      const t = (score - a[0]) / (b[0] - a[0]);
      // Smooth the joints so the ramp never feels like a step.
      return lerp(a[1], b[1], t * t * (3 - 2 * t));
    }
  }
  return last[1];
};

const SPEED: Key[] = [
  [0, 0.44],
  [10, 0.49],
  [25, 0.56],
  [50, 0.65],
  [80, 0.72],
  [130, 0.79],
];

const GAP: Key[] = [
  [0, 0.33],
  [10, 0.305],
  [25, 0.267],
  [50, 0.232],
  [80, 0.216],
  [130, 0.208],
];

const SPACING: Key[] = [
  [0, 0.79],
  [10, 0.75],
  [25, 0.69],
  [50, 0.63],
  [80, 0.595],
  [130, 0.57],
];

const VARIANCE: Key[] = [
  [0, 0.1],
  [8, 0.14],
  [25, 0.2],
  [50, 0.25],
  [90, 0.29],
];

export const difficultyFor = (score: number): Difficulty => {
  const s = Math.max(0, score);
  return {
    speed: curve(SPEED, s),
    gap: curve(GAP, s),
    spacing: curve(SPACING, s),
    variance: curve(VARIANCE, s),
    driftChance: s < 16 ? 0 : clamp((s - 16) / 60, 0, 0.34),
    driftAmp: lerp(0.03, 0.075, clamp((s - 16) / 70, 0, 1)),
    twinChance: s < 30 ? 0 : clamp((s - 30) / 90, 0, 0.2),
    intensity: clamp(s / 70, 0, 1),
  };
};

/** Human-readable tier, shown nowhere but used to colour the HUD + music. */
export const tierFor = (score: number): 0 | 1 | 2 | 3 =>
  score < 10 ? 0 : score < 25 ? 1 : score < 50 ? 2 : 3;

/** A pass is a "near miss" when the creature clears an edge by less than this
 *  fraction of the gap — worth extra particles, a sparkle and a sound. */
export const NEAR_MISS_FRACTION = 0.17;
