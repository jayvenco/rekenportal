import type { RGB } from '../core/math';

export type WeatherKind = 'dust' | 'rain' | 'snow' | 'spark' | 'ember';
export type SkyEffect = 'godrays' | 'storm' | 'aurora' | 'grid' | 'ashfall';

export interface RidgeStyle {
  /** Base colour of the ridge, before aerial perspective. */
  color: RGB;
  /** Colour the ridge fades toward with distance/altitude. */
  haze: RGB;
  /** 0 = crisp, 1 = fully dissolved into haze. */
  hazeAmount: number;
  /** Height of the snow/ice cap as a fraction of the ridge, 0 disables it. */
  snowLine: number;
  snowColor: RGB;
  /** Warm light catching the sunward face. */
  rim: RGB;
  rimAmount: number;
}

export interface Theme {
  id: string;
  name: string;
  tagline: string;
  /** Best-score required before this sky can be chosen as a starting world. */
  unlockAt: number;

  skyTop: RGB;
  skyMid: RGB;
  skyLow: RGB;

  /** Sun/moon position as a fraction of the viewport. */
  sunX: number;
  sunY: number;
  sunSize: number;
  sunCore: RGB;
  sunGlow: RGB;
  sunStrength: number;

  cloudHi: RGB;
  cloudLo: RGB;
  cloudAlpha: number;
  cloudCover: number;

  /** Far → near parallax ridges. */
  ridges: [RidgeStyle, RidgeStyle, RidgeStyle, RidgeStyle];

  /** Monolith materials. */
  stoneDark: RGB;
  stoneMid: RGB;
  stoneLit: RGB;
  stoneRim: RGB;
  runeColor: RGB;
  runeGlow: number;
  /** Overgrowth / ice / neon trim colour along the capstones. */
  trim: RGB;
  trimAmount: number;

  fogColor: RGB;
  fogStrength: number;

  weather: WeatherKind;
  weatherDensity: number;
  weatherColor: RGB;
  effect: SkyEffect;

  /** Full-frame colour grade. */
  gradeTint: RGB;
  gradeAmount: number;
  vignette: number;

  /** Creature lighting. */
  creatureRim: RGB;
  creatureFill: RGB;

  /** Ambient audio character. */
  windLevel: number;
  windTone: number;
  musicRoot: number;
  musicMode: 'major' | 'minor' | 'lydian' | 'phrygian';

  /** CSS gradient used by the sky-select UI. */
  swatch: string;
}

export const THEMES: readonly Theme[] = [
  /* ------------------------------------------------------------------ 0 */
  {
    id: 'gilded',
    name: 'Gilded Reach',
    tagline: 'Endless golden hour',
    unlockAt: 0,

    skyTop: [38, 62, 122],
    skyMid: [156, 152, 176],
    skyLow: [255, 196, 122],

    sunX: 0.78,
    sunY: 0.42,
    sunSize: 0.11,
    sunCore: [255, 248, 226],
    sunGlow: [255, 176, 92],
    sunStrength: 1,

    cloudHi: [255, 226, 196],
    cloudLo: [128, 118, 148],
    cloudAlpha: 0.72,
    cloudCover: 0.5,

    ridges: [
      {
        color: [116, 122, 158],
        haze: [214, 194, 196],
        hazeAmount: 0.68,
        snowLine: 0.78,
        snowColor: [246, 236, 236],
        rim: [255, 198, 132],
        rimAmount: 0.5,
      },
      {
        color: [92, 92, 128],
        haze: [204, 176, 172],
        hazeAmount: 0.48,
        snowLine: 0.86,
        snowColor: [240, 228, 226],
        rim: [255, 186, 116],
        rimAmount: 0.6,
      },
      {
        color: [64, 60, 90],
        haze: [176, 140, 138],
        hazeAmount: 0.3,
        snowLine: 0,
        snowColor: [230, 220, 220],
        rim: [255, 170, 96],
        rimAmount: 0.62,
      },
      {
        color: [34, 30, 50],
        haze: [124, 92, 96],
        hazeAmount: 0.16,
        snowLine: 0,
        snowColor: [220, 210, 210],
        rim: [255, 158, 86],
        rimAmount: 0.55,
      },
    ],

    stoneDark: [44, 36, 40],
    stoneMid: [138, 118, 100],
    stoneLit: [232, 202, 158],
    stoneRim: [255, 206, 140],
    runeColor: [255, 196, 108],
    runeGlow: 0.85,
    trim: [96, 128, 74],
    trimAmount: 0.5,

    fogColor: [246, 196, 152],
    fogStrength: 0.34,

    weather: 'dust',
    weatherDensity: 0.55,
    weatherColor: [255, 224, 176],
    effect: 'godrays',

    gradeTint: [255, 186, 122],
    gradeAmount: 0.1,
    vignette: 0.42,

    creatureRim: [255, 206, 148],
    creatureFill: [92, 86, 112],

    windLevel: 0.34,
    windTone: 620,
    musicRoot: 174.61,
    musicMode: 'lydian',

    swatch:
      'linear-gradient(170deg,#2a3f7c 0%,#8e8bb0 42%,#ffc47a 76%,#e08a4a 100%)',
  },

  /* ------------------------------------------------------------------ 1 */
  {
    id: 'storm',
    name: 'Storm Vale',
    tagline: 'The sky breaks open',
    unlockAt: 12,

    skyTop: [16, 22, 40],
    skyMid: [46, 58, 84],
    skyLow: [104, 118, 140],

    sunX: 0.3,
    sunY: 0.3,
    sunSize: 0.16,
    sunCore: [196, 210, 232],
    sunGlow: [96, 116, 152],
    sunStrength: 0.42,

    cloudHi: [92, 104, 132],
    cloudLo: [26, 32, 52],
    cloudAlpha: 0.92,
    cloudCover: 0.92,

    ridges: [
      {
        color: [54, 64, 88],
        haze: [110, 124, 148],
        hazeAmount: 0.72,
        snowLine: 0.82,
        snowColor: [196, 208, 224],
        rim: [148, 176, 214],
        rimAmount: 0.34,
      },
      {
        color: [40, 48, 70],
        haze: [88, 100, 126],
        hazeAmount: 0.52,
        snowLine: 0.88,
        snowColor: [178, 192, 212],
        rim: [136, 164, 204],
        rimAmount: 0.4,
      },
      {
        color: [26, 32, 50],
        haze: [66, 78, 102],
        hazeAmount: 0.34,
        snowLine: 0,
        snowColor: [170, 184, 204],
        rim: [120, 150, 194],
        rimAmount: 0.42,
      },
      {
        color: [13, 16, 28],
        haze: [40, 50, 70],
        hazeAmount: 0.18,
        snowLine: 0,
        snowColor: [160, 176, 198],
        rim: [104, 134, 178],
        rimAmount: 0.36,
      },
    ],

    stoneDark: [22, 26, 36],
    stoneMid: [82, 92, 108],
    stoneLit: [166, 182, 202],
    stoneRim: [178, 204, 236],
    runeColor: [126, 196, 255],
    runeGlow: 1,
    trim: [58, 78, 88],
    trimAmount: 0.42,

    fogColor: [126, 142, 166],
    fogStrength: 0.5,

    weather: 'rain',
    weatherDensity: 1,
    weatherColor: [186, 208, 236],
    effect: 'storm',

    gradeTint: [96, 128, 176],
    gradeAmount: 0.14,
    vignette: 0.56,

    creatureRim: [168, 200, 240],
    creatureFill: [40, 50, 74],

    windLevel: 0.72,
    windTone: 380,
    musicRoot: 146.83,
    musicMode: 'minor',

    swatch:
      'linear-gradient(170deg,#0f1628 0%,#2e3a54 46%,#68768c 82%,#98a6bc 100%)',
  },

  /* ------------------------------------------------------------------ 2 */
  {
    id: 'frost',
    name: 'Hollow Frost',
    tagline: 'Where the light freezes',
    unlockAt: 26,

    skyTop: [12, 26, 56],
    skyMid: [66, 114, 164],
    skyLow: [206, 232, 246],

    sunX: 0.2,
    sunY: 0.24,
    sunSize: 0.085,
    sunCore: [255, 255, 252],
    sunGlow: [178, 222, 255],
    sunStrength: 0.78,

    cloudHi: [232, 244, 255],
    cloudLo: [124, 158, 196],
    cloudAlpha: 0.62,
    cloudCover: 0.44,

    ridges: [
      {
        color: [122, 158, 196],
        haze: [222, 238, 250],
        hazeAmount: 0.74,
        snowLine: 0.4,
        snowColor: [250, 253, 255],
        rim: [206, 238, 255],
        rimAmount: 0.5,
      },
      {
        color: [88, 124, 166],
        haze: [196, 220, 240],
        hazeAmount: 0.54,
        snowLine: 0.48,
        snowColor: [244, 250, 255],
        rim: [188, 228, 255],
        rimAmount: 0.52,
      },
      {
        color: [54, 84, 124],
        haze: [156, 190, 220],
        hazeAmount: 0.34,
        snowLine: 0.6,
        snowColor: [236, 246, 255],
        rim: [172, 216, 252],
        rimAmount: 0.5,
      },
      {
        color: [26, 44, 74],
        haze: [104, 140, 178],
        hazeAmount: 0.2,
        snowLine: 0.74,
        snowColor: [222, 236, 250],
        rim: [156, 204, 248],
        rimAmount: 0.44,
      },
    ],

    stoneDark: [28, 40, 62],
    stoneMid: [110, 138, 172],
    stoneLit: [222, 240, 252],
    stoneRim: [212, 240, 255],
    runeColor: [148, 232, 255],
    runeGlow: 0.95,
    trim: [188, 226, 248],
    trimAmount: 0.72,

    fogColor: [216, 234, 248],
    fogStrength: 0.46,

    weather: 'snow',
    weatherDensity: 0.9,
    weatherColor: [246, 252, 255],
    effect: 'aurora',

    gradeTint: [150, 200, 244],
    gradeAmount: 0.12,
    vignette: 0.44,

    creatureRim: [196, 234, 255],
    creatureFill: [52, 78, 116],

    windLevel: 0.62,
    windTone: 900,
    musicRoot: 164.81,
    musicMode: 'major',

    swatch:
      'linear-gradient(170deg,#0c1a38 0%,#4272a4 44%,#a8cfe6 78%,#e6f4fb 100%)',
  },

  /* ------------------------------------------------------------------ 3 */
  {
    id: 'neon',
    name: 'Neon Verge',
    tagline: 'Circuits in the clouds',
    unlockAt: 42,

    skyTop: [10, 6, 30],
    skyMid: [58, 18, 88],
    skyLow: [190, 46, 128],

    sunX: 0.5,
    sunY: 0.62,
    sunSize: 0.17,
    sunCore: [255, 174, 232],
    sunGlow: [190, 40, 150],
    sunStrength: 0.9,

    cloudHi: [124, 74, 176],
    cloudLo: [30, 14, 56],
    cloudAlpha: 0.68,
    cloudCover: 0.58,

    ridges: [
      {
        color: [64, 32, 96],
        haze: [148, 46, 124],
        hazeAmount: 0.66,
        snowLine: 0,
        snowColor: [230, 180, 255],
        rim: [255, 92, 196],
        rimAmount: 0.6,
      },
      {
        color: [44, 20, 72],
        haze: [116, 32, 108],
        hazeAmount: 0.46,
        snowLine: 0,
        snowColor: [220, 170, 255],
        rim: [244, 74, 186],
        rimAmount: 0.62,
      },
      {
        color: [26, 12, 46],
        haze: [78, 22, 82],
        hazeAmount: 0.3,
        snowLine: 0,
        snowColor: [210, 160, 250],
        rim: [96, 240, 255],
        rimAmount: 0.5,
      },
      {
        color: [12, 6, 24],
        haze: [44, 14, 52],
        hazeAmount: 0.16,
        snowLine: 0,
        snowColor: [200, 150, 246],
        rim: [72, 226, 255],
        rimAmount: 0.46,
      },
    ],

    stoneDark: [16, 10, 30],
    stoneMid: [70, 56, 104],
    stoneLit: [178, 158, 220],
    stoneRim: [124, 240, 255],
    runeColor: [104, 244, 255],
    runeGlow: 1.35,
    trim: [255, 78, 190],
    trimAmount: 0.8,

    fogColor: [122, 44, 132],
    fogStrength: 0.42,

    weather: 'spark',
    weatherDensity: 0.7,
    weatherColor: [140, 244, 255],
    effect: 'grid',

    gradeTint: [186, 60, 190],
    gradeAmount: 0.16,
    vignette: 0.6,

    creatureRim: [130, 240, 255],
    creatureFill: [46, 22, 72],

    windLevel: 0.3,
    windTone: 1400,
    musicRoot: 130.81,
    musicMode: 'phrygian',

    swatch:
      'linear-gradient(170deg,#0a061e 0%,#3a1258 44%,#8f1e78 74%,#ff4ebe 100%)',
  },

  /* ------------------------------------------------------------------ 4 */
  {
    id: 'ember',
    name: 'Ember Fall',
    tagline: 'The last warm sky',
    unlockAt: 60,

    skyTop: [26, 12, 26],
    skyMid: [104, 34, 40],
    skyLow: [246, 128, 60],

    sunX: 0.66,
    sunY: 0.68,
    sunSize: 0.19,
    sunCore: [255, 236, 186],
    sunGlow: [255, 108, 40],
    sunStrength: 1.15,

    cloudHi: [255, 150, 96],
    cloudLo: [64, 22, 34],
    cloudAlpha: 0.82,
    cloudCover: 0.72,

    ridges: [
      {
        color: [96, 46, 56],
        haze: [222, 118, 76],
        hazeAmount: 0.7,
        snowLine: 0,
        snowColor: [255, 210, 170],
        rim: [255, 152, 72],
        rimAmount: 0.62,
      },
      {
        color: [72, 32, 44],
        haze: [190, 88, 62],
        hazeAmount: 0.5,
        snowLine: 0,
        snowColor: [255, 200, 160],
        rim: [255, 136, 60],
        rimAmount: 0.66,
      },
      {
        color: [46, 20, 30],
        haze: [140, 58, 48],
        hazeAmount: 0.32,
        snowLine: 0,
        snowColor: [255, 190, 150],
        rim: [255, 122, 52],
        rimAmount: 0.64,
      },
      {
        color: [22, 10, 16],
        haze: [86, 32, 32],
        hazeAmount: 0.16,
        snowLine: 0,
        snowColor: [255, 180, 140],
        rim: [255, 110, 46],
        rimAmount: 0.56,
      },
    ],

    stoneDark: [18, 12, 16],
    stoneMid: [74, 60, 62],
    stoneLit: [186, 150, 130],
    stoneRim: [255, 150, 78],
    runeColor: [255, 122, 48],
    runeGlow: 1.2,
    trim: [126, 34, 26],
    trimAmount: 0.5,

    fogColor: [212, 106, 62],
    fogStrength: 0.44,

    weather: 'ember',
    weatherDensity: 0.85,
    weatherColor: [255, 156, 72],
    effect: 'ashfall',

    gradeTint: [255, 108, 48],
    gradeAmount: 0.15,
    vignette: 0.58,

    creatureRim: [255, 168, 96],
    creatureFill: [58, 26, 30],

    windLevel: 0.46,
    windTone: 300,
    musicRoot: 155.56,
    musicMode: 'phrygian',

    swatch:
      'linear-gradient(170deg,#1a0c1a 0%,#68222c 42%,#d4553a 74%,#ff9a48 100%)',
  },
];

export const DEFAULT_THEME_ID = THEMES[0].id;

export const themeIndexById = (id: string): number => {
  const i = THEMES.findIndex((t) => t.id === id);
  return i < 0 ? 0 : i;
};

/**
 * Score at which the sky performs its `n`-th shift during a run. The first
 * four line up with the unlock thresholds so crossing a milestone visibly
 * transports you into the world you just earned; after that they repeat.
 */
export const skyShiftScore = (n: number): number => {
  const fixed = [12, 26, 42, 60];
  if (n < fixed.length) return fixed[n];
  return 60 + 30 * (n - fixed.length + 1);
};

/** How many shifts have happened by `score`. */
export const skyStageForScore = (score: number): number => {
  let n = 0;
  while (n < 64 && score >= skyShiftScore(n)) n++;
  return n;
};

export const themeAtStage = (startIndex: number, stage: number): Theme =>
  THEMES[(startIndex + stage) % THEMES.length];
