import type { Theme } from '../config/themes';
import { lerp, type RGB } from '../core/math';

const mixInto = (dst: number[], a: RGB, b: RGB, t: number): void => {
  dst[0] = a[0] + (b[0] - a[0]) * t;
  dst[1] = a[1] + (b[1] - a[1]) * t;
  dst[2] = a[2] + (b[2] - a[2]) * t;
};

/**
 * The live, interpolated sky palette.
 *
 * When the world shifts from one sky to the next, the baked terrain layers
 * cross-fade as images while everything drawn live — gradient, sun, fog,
 * colour grade, creature lighting — walks continuously between the two
 * palettes. Reusing one mutable instance keeps a 60 Hz colour blend free of
 * per-frame allocation.
 */
export class SkyState {
  readonly skyTop: number[] = [0, 0, 0];
  readonly skyMid: number[] = [0, 0, 0];
  readonly skyLow: number[] = [0, 0, 0];
  readonly sunCore: number[] = [0, 0, 0];
  readonly sunGlow: number[] = [0, 0, 0];
  readonly cloudHi: number[] = [0, 0, 0];
  readonly fogColor: number[] = [0, 0, 0];
  readonly gradeTint: number[] = [0, 0, 0];
  readonly weatherColor: number[] = [0, 0, 0];
  readonly creatureRim: number[] = [0, 0, 0];
  readonly creatureFill: number[] = [0, 0, 0];
  readonly runeColor: number[] = [0, 0, 0];

  sunX = 0.5;
  sunY = 0.4;
  sunSize = 0.1;
  sunStrength = 1;
  fogStrength = 0.3;
  gradeAmount = 0.1;
  vignette = 0.4;
  weatherDensity = 0.5;

  /** The two themes being blended, and how far between them we are. */
  from!: Theme;
  to!: Theme;
  t = 0;

  set(from: Theme, to: Theme, t: number): void {
    this.from = from;
    this.to = to;
    this.t = t;

    mixInto(this.skyTop, from.skyTop, to.skyTop, t);
    mixInto(this.skyMid, from.skyMid, to.skyMid, t);
    mixInto(this.skyLow, from.skyLow, to.skyLow, t);
    mixInto(this.sunCore, from.sunCore, to.sunCore, t);
    mixInto(this.sunGlow, from.sunGlow, to.sunGlow, t);
    mixInto(this.cloudHi, from.cloudHi, to.cloudHi, t);
    mixInto(this.fogColor, from.fogColor, to.fogColor, t);
    mixInto(this.gradeTint, from.gradeTint, to.gradeTint, t);
    mixInto(this.weatherColor, from.weatherColor, to.weatherColor, t);
    mixInto(this.creatureRim, from.creatureRim, to.creatureRim, t);
    mixInto(this.creatureFill, from.creatureFill, to.creatureFill, t);
    mixInto(this.runeColor, from.runeColor, to.runeColor, t);

    this.sunX = lerp(from.sunX, to.sunX, t);
    this.sunY = lerp(from.sunY, to.sunY, t);
    this.sunSize = lerp(from.sunSize, to.sunSize, t);
    this.sunStrength = lerp(from.sunStrength, to.sunStrength, t);
    this.fogStrength = lerp(from.fogStrength, to.fogStrength, t);
    this.gradeAmount = lerp(from.gradeAmount, to.gradeAmount, t);
    this.vignette = lerp(from.vignette, to.vignette, t);
    this.weatherDensity = lerp(from.weatherDensity, to.weatherDensity, t);
  }

  /** The theme whose discrete character (weather kind, effect) currently wins. */
  get dominant(): Theme {
    return this.t < 0.5 ? this.from : this.to;
  }
}
