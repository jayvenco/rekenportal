import { clamp } from '../core/math';
import type { Theme } from '../config/themes';

type Ctx = AudioContext;

const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
};

/** Scale degrees of the four-chord loop each sky drifts through. */
const PROGRESSION = [0, 5, 3, 4];

/**
 * Every sound in Aetherwing is generated at runtime by the Web Audio API.
 * That keeps the download at zero bytes of audio, sidesteps licensing
 * entirely, and lets the score, wind and music react continuously to the run.
 */
export class AudioEngine {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private ambientBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;

  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientLfo: OscillatorNode | null = null;

  private schedulerId = 0;
  private nextNoteTime = 0;
  private step = 0;

  private theme: Theme | null = null;
  private intensity = 0;

  sfxEnabled = true;
  musicEnabled = true;
  private started = false;
  private failed = false;

  /** Called on the first user gesture — browsers require this. */
  unlock(): void {
    if (this.failed) return;
    try {
      if (!this.ctx) this.build();
      const ctx = this.ctx;
      if (!ctx) return;
      if (ctx.state === 'suspended') void ctx.resume();
      this.started = true;
      this.applyBusLevels();
      if (this.musicEnabled) this.startMusic();
      this.startAmbient();
    } catch {
      this.failed = true;
    }
  }

  private build(): void {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) {
      this.failed = true;
      return;
    }
    const ctx = new Ctor({ latencyHint: 'interactive' });
    this.ctx = ctx;

    // A gentle limiter keeps stacked sound effects from clipping.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -8;
    limiter.knee.value = 24;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.22;
    limiter.connect(ctx.destination);

    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(limiter);
    this.master = master;

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.85;
    this.sfxBus.connect(master);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0;
    this.musicBus.connect(master);

    this.ambientBus = ctx.createGain();
    this.ambientBus.gain.value = 0;
    this.ambientBus.connect(master);

    // 2 s of white noise, reused by every noise-based voice.
    const len = Math.floor(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      brown = (brown + white * 0.02) / 1.02;
      // Blend white and brown so one buffer serves both airy and rumbly uses.
      data[i] = white * 0.55 + brown * 5.5;
    }
    this.noise = buf;
  }

  /* ------------------------------- routing ------------------------------ */

  setTheme(theme: Theme): void {
    this.theme = theme;
    if (!this.ctx || !this.ambientFilter) return;
    const t = this.ctx.currentTime;
    this.ambientFilter.frequency.cancelScheduledValues(t);
    this.ambientFilter.frequency.setTargetAtTime(theme.windTone, t, 1.4);
    if (this.ambientBus) {
      this.ambientBus.gain.setTargetAtTime(
        this.sfxEnabled ? theme.windLevel * 0.2 : 0,
        t,
        1.4,
      );
    }
  }

  setIntensity(v: number): void {
    this.intensity = clamp(v, 0, 1);
  }

  setSfx(on: boolean): void {
    this.sfxEnabled = on;
    this.applyBusLevels();
  }

  setMusic(on: boolean): void {
    this.musicEnabled = on;
    if (!this.ctx) return;
    if (on) this.startMusic();
    else this.stopMusic();
    this.applyBusLevels();
  }

  private applyBusLevels(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.sfxBus?.gain.setTargetAtTime(this.sfxEnabled ? 0.85 : 0, t, 0.08);
    this.musicBus?.gain.setTargetAtTime(this.musicEnabled ? 0.3 : 0, t, 0.4);
    const wind = this.theme?.windLevel ?? 0.4;
    this.ambientBus?.gain.setTargetAtTime(this.sfxEnabled ? wind * 0.2 : 0, t, 0.5);
  }

  /** Fade everything down (pause / tab hidden) without tearing nodes down. */
  duck(amount: number): void {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(0.9 * (1 - clamp(amount, 0, 1)), this.ctx.currentTime, 0.12);
  }

  suspend(): void {
    if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend();
  }

  resume(): void {
    if (this.started && this.ctx && this.ctx.state === 'suspended') void this.ctx.resume();
  }

  /* -------------------------------- ambience ----------------------------- */

  private startAmbient(): void {
    const ctx = this.ctx;
    if (!ctx || !this.noise || !this.ambientBus || this.ambientSource) return;

    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = this.theme?.windTone ?? 600;
    filter.Q.value = 0.7;

    // Slow cutoff wobble turns flat noise into moving air.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    src.connect(filter).connect(this.ambientBus);
    src.start();

    this.ambientSource = src;
    this.ambientFilter = filter;
    this.ambientLfo = lfo;
    this.applyBusLevels();
  }

  /* --------------------------------- music ------------------------------- */

  private startMusic(): void {
    if (!this.ctx || this.schedulerId || !this.started) return;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.step = 0;
    this.schedulerId = window.setInterval(() => this.pump(), 110);
  }

  private stopMusic(): void {
    if (this.schedulerId) clearInterval(this.schedulerId);
    this.schedulerId = 0;
  }

  private pump(): void {
    const ctx = this.ctx;
    if (!ctx || !this.musicBus) return;
    const beat = 0.52;
    while (this.nextNoteTime < ctx.currentTime + 0.5) {
      this.scheduleStep(this.step, this.nextNoteTime);
      this.nextNoteTime += beat;
      this.step++;
    }
  }

  private scheduleStep(step: number, when: number): void {
    const ctx = this.ctx;
    const bus = this.musicBus;
    if (!ctx || !bus) return;

    const theme = this.theme;
    const root = theme?.musicRoot ?? 164.81;
    const scale = SCALES[theme?.musicMode ?? 'minor'];
    const bar = Math.floor(step / 8) % PROGRESSION.length;
    const degree = PROGRESSION[bar];

    const noteAt = (deg: number, octave = 0): number => {
      const idx = ((deg % 7) + 7) % 7;
      const oct = Math.floor(deg / 7) + octave;
      return root * Math.pow(2, scale[idx] / 12 + oct);
    };

    // Pad: one long chord per bar.
    if (step % 8 === 0) {
      const chord = [degree, degree + 2, degree + 4];
      for (let i = 0; i < chord.length; i++) {
        this.pad(noteAt(chord[i], i === 2 ? 1 : 0), when, 4.6, 0.16 - i * 0.03);
      }
      this.pad(noteAt(degree, -1), when, 4.6, 0.2);
    }

    // Bell arpeggio: sparse, denser as the run gets hotter.
    const density = 0.16 + this.intensity * 0.4;
    if (step % 2 === 1 && Math.random() < density) {
      const pick = [degree, degree + 2, degree + 4, degree + 6][step % 4];
      this.bell(noteAt(pick, 1 + (Math.random() < 0.3 ? 1 : 0)), when, 0.1);
    }

    // Low pulse that only appears once the run is genuinely fast.
    if (this.intensity > 0.42 && step % 4 === 0) {
      this.pad(noteAt(degree, -2), when, 0.6, 0.16 * this.intensity);
    }
  }

  private pad(freq: number, when: number, dur: number, level: number): void {
    const ctx = this.ctx;
    const bus = this.musicBus;
    if (!ctx || !bus) return;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), when + dur * 0.34);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500 + this.intensity * 900, when);
    filter.Q.value = 0.6;
    filter.connect(gain).connect(bus);

    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'triangle' : 'sawtooth';
      osc.frequency.value = freq * (i === 0 ? 1 : 1.005);
      const sub = ctx.createGain();
      sub.gain.value = i === 0 ? 0.75 : 0.22;
      osc.connect(sub).connect(filter);
      osc.start(when);
      osc.stop(when + dur + 0.05);
    }
  }

  private bell(freq: number, when: number, level: number): void {
    const ctx = this.ctx;
    const bus = this.musicBus;
    if (!ctx || !bus) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(level, when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 1.3);
    osc.connect(gain).connect(bus);
    osc.start(when);
    osc.stop(when + 1.35);
  }

  /* ------------------------------ sound effects -------------------------- */

  private get t(): number {
    return this.ctx?.currentTime ?? 0;
  }

  private canPlay(): boolean {
    return !!this.ctx && !!this.sfxBus && this.sfxEnabled && this.started;
  }

  private burst(
    when: number,
    dur: number,
    level: number,
    type: BiquadFilterType,
    from: number,
    to: number,
    q = 1,
  ): void {
    const ctx = this.ctx;
    if (!ctx || !this.noise || !this.sfxBus) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;

    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(from, when);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, to), when + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(level, when + Math.min(0.02, dur * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);

    src.connect(filter).connect(gain).connect(this.sfxBus);
    src.start(when);
    src.stop(when + dur + 0.02);
  }

  private tone(
    when: number,
    dur: number,
    level: number,
    f0: number,
    f1: number,
    type: OscillatorType = 'sine',
    attack = 0.006,
  ): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfxBus) return;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, when);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), when + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(level, when + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(gain).connect(this.sfxBus);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  flap(power = 1): void {
    if (!this.canPlay()) return;
    const t = this.t;
    // Air rushing over a membrane: a swept band of noise…
    this.burst(t, 0.17, 0.2 * power, 'bandpass', 900, 260, 1.4);
    // …plus a soft body thump so it lands with weight.
    this.tone(t, 0.13, 0.1 * power, 168, 74, 'sine', 0.004);
  }

  score(streak: number): void {
    if (!this.canPlay()) return;
    const t = this.t;
    const semis = Math.min(streak, 7) * 2;
    const f = 523.25 * Math.pow(2, semis / 12);
    this.tone(t, 0.2, 0.14, f, f, 'triangle', 0.004);
    this.tone(t + 0.045, 0.26, 0.09, f * 1.5, f * 1.5, 'sine', 0.004);
  }

  nearMiss(): void {
    if (!this.canPlay()) return;
    const t = this.t;
    this.burst(t, 0.26, 0.1, 'highpass', 2600, 7000, 0.7);
    this.tone(t, 0.3, 0.045, 2100, 3400, 'sine', 0.02);
  }

  milestone(): void {
    if (!this.canPlay()) return;
    const t = this.t;
    [0, 4, 7, 12].forEach((s, i) => {
      this.tone(t + i * 0.055, 0.5, 0.1, 392 * Math.pow(2, s / 12), 392 * Math.pow(2, s / 12), 'triangle', 0.006);
    });
  }

  hit(): void {
    if (!this.canPlay()) return;
    const t = this.t;
    this.burst(t, 0.42, 0.4, 'lowpass', 2400, 120, 0.8);
    this.tone(t, 0.5, 0.32, 150, 34, 'square', 0.002);
    this.tone(t + 0.01, 0.34, 0.16, 92, 40, 'sawtooth', 0.002);
  }

  gameOver(): void {
    if (!this.canPlay()) return;
    const t = this.t + 0.34;
    const root = this.theme?.musicRoot ?? 164.81;
    [0, -3, -5, -12].forEach((s, i) => {
      this.tone(
        t + i * 0.15,
        1.5 + i * 0.35,
        0.11,
        root * Math.pow(2, s / 12),
        root * Math.pow(2, s / 12),
        'triangle',
        0.06,
      );
    });
    this.burst(t, 1.6, 0.07, 'lowpass', 700, 110, 0.5);
  }

  celebrate(): void {
    if (!this.canPlay()) return;
    const t = this.t + 0.1;
    [0, 4, 7, 12, 16, 19].forEach((s, i) => {
      this.tone(
        t + i * 0.075,
        0.7,
        0.1,
        523.25 * Math.pow(2, s / 12),
        523.25 * Math.pow(2, s / 12),
        'sine',
        0.005,
      );
    });
    this.burst(t, 0.9, 0.05, 'highpass', 3400, 8200, 0.6);
  }

  button(kind: 'tap' | 'confirm' = 'tap'): void {
    if (!this.canPlay()) return;
    const t = this.t;
    if (kind === 'confirm') {
      this.tone(t, 0.14, 0.11, 660, 990, 'triangle', 0.003);
      this.tone(t + 0.06, 0.2, 0.07, 1320, 1320, 'sine', 0.003);
    } else {
      this.tone(t, 0.075, 0.08, 900, 620, 'triangle', 0.002);
    }
  }

  whoosh(): void {
    if (!this.canPlay()) return;
    this.burst(this.t, 0.5, 0.13, 'bandpass', 380, 2400, 0.9);
  }

  dispose(): void {
    this.stopMusic();
    try {
      this.ambientSource?.stop();
      this.ambientLfo?.stop();
      void this.ctx?.close();
    } catch {
      /* nothing meaningful to do if teardown fails */
    }
  }
}
