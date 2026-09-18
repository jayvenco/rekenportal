import type { QualityPreference } from './Storage';

export interface QualityProfile {
  tier: 'high' | 'medium' | 'low';
  dprCap: number;
  /** Multiplier applied to every particle emitter. */
  particleScale: number;
  /** Ambient weather particle count multiplier. */
  weatherScale: number;
  /** Number of parallax ridge layers to render. */
  ridgeLayers: number;
  volumetricLight: boolean;
  softShadows: boolean;
  afterImages: boolean;
  filmGrain: boolean;
}

const PROFILES: Record<QualityProfile['tier'], QualityProfile> = {
  high: {
    tier: 'high',
    dprCap: 2,
    particleScale: 1,
    weatherScale: 1,
    ridgeLayers: 4,
    volumetricLight: true,
    softShadows: true,
    afterImages: true,
    filmGrain: true,
  },
  medium: {
    tier: 'medium',
    dprCap: 1.5,
    particleScale: 0.62,
    weatherScale: 0.6,
    ridgeLayers: 4,
    volumetricLight: true,
    softShadows: true,
    afterImages: false,
    filmGrain: false,
  },
  low: {
    tier: 'low',
    dprCap: 1,
    particleScale: 0.34,
    weatherScale: 0.32,
    ridgeLayers: 3,
    volumetricLight: false,
    softShadows: false,
    afterImages: false,
    filmGrain: false,
  },
};

/**
 * Watches frame time and slides the renderer between three presets.
 *
 * The rule is simple and deliberately conservative: drop a tier quickly when
 * frames are consistently slow, climb back only after a long clean stretch.
 * A player should never see the quality oscillate.
 */
export class Quality {
  profile: QualityProfile = PROFILES.high;
  preference: QualityPreference = 'auto';

  private slowMs = 0;
  private fastMs = 0;
  private cooldown = 2.5;
  private onChange?: (p: QualityProfile) => void;

  constructor(onChange?: (p: QualityProfile) => void) {
    this.onChange = onChange;
    this.profile = PROFILES[guessStartingTier()];
  }

  setPreference(pref: QualityPreference): void {
    this.preference = pref;
    if (pref !== 'auto') this.apply(PROFILES[pref]);
    else this.apply(PROFILES[guessStartingTier()]);
    this.slowMs = 0;
    this.fastMs = 0;
    this.cooldown = 2.5;
  }

  update(dt: number, frameMs: number): void {
    if (this.preference !== 'auto') return;
    if (this.cooldown > 0) {
      this.cooldown -= dt;
      return;
    }

    // 22 ms ≈ below 45 fps; 15 ms ≈ comfortably above 60 fps.
    if (frameMs > 22) {
      this.slowMs += dt;
      this.fastMs = 0;
    } else if (frameMs < 15) {
      this.fastMs += dt;
      this.slowMs = 0;
    } else {
      this.slowMs = Math.max(0, this.slowMs - dt * 0.5);
      this.fastMs = Math.max(0, this.fastMs - dt * 0.5);
    }

    if (this.slowMs > 1.1) {
      if (this.profile.tier === 'high') this.apply(PROFILES.medium);
      else if (this.profile.tier === 'medium') this.apply(PROFILES.low);
      this.slowMs = 0;
      this.cooldown = 4;
    } else if (this.fastMs > 9) {
      if (this.profile.tier === 'low') this.apply(PROFILES.medium);
      else if (this.profile.tier === 'medium') this.apply(PROFILES.high);
      this.fastMs = 0;
      this.cooldown = 8;
    }
  }

  private apply(p: QualityProfile): void {
    if (p.tier === this.profile.tier) return;
    this.profile = p;
    this.onChange?.(p);
  }
}

/** A cheap first guess so slow devices never see a janky first few seconds. */
function guessStartingTier(): QualityProfile['tier'] {
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const pixels = window.innerWidth * window.innerHeight * (window.devicePixelRatio || 1) ** 2;

  if (cores <= 4 && (mem <= 4 || coarse)) return 'medium';
  if (cores <= 2 || mem <= 2) return 'low';
  if (coarse && pixels > 3_000_000) return 'medium';
  return 'high';
}
