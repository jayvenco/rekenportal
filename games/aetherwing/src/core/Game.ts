import { PLAYER, WORLD, difficultyFor } from '../config/balance';
import {
  THEMES,
  skyShiftScore,
  skyStageForScore,
  themeAtStage,
  themeIndexById,
  type Theme,
} from '../config/themes';
import { ObstacleField, type PassEvent } from '../entities/ObstacleField';
import { Player, PlayerState } from '../entities/Player';
import { Renderer } from '../render/Renderer';
import { SkyState } from '../render/SkyState';
import { AudioEngine } from '../systems/Audio';
import { Camera } from '../systems/Camera';
import { Input } from '../systems/Input';
import { Particles } from '../systems/Particles';
import { Quality, type QualityProfile } from '../systems/Quality';
import { Storage } from '../systems/Storage';
import { UI, type UIAction } from '../ui/UI';
import { Loop } from './Loop';
import { Viewport } from './Viewport';
import { clamp, clamp01, damp } from './math';

enum State {
  Loading,
  Menu,
  Ready,
  Playing,
  Paused,
  Dying,
  GameOver,
}

/** Seconds the two skies spend blended into one another. */
const SKY_BLEND_TIME = 2.4;
/** Points before a shift at which the next sky starts baking. */
const SKY_PREBAKE_LEAD = 6;
/** Input deadzone after a crash, so the fatal tap can't also restart. */
const RESTART_LOCKOUT = 0.45;
/** Extra runway in front of the first gate of a run. */
const RUN_LEAD_IN = 0.34;

const LOADING_LINES = [
  'Raising the monoliths…',
  'Carving the mountains…',
  'Seeding the clouds…',
  'Lighting the sky…',
];

export class Game {
  private readonly view: Viewport;
  private readonly loop: Loop;
  private readonly ui: UI;
  private readonly store = new Storage();
  private readonly audio = new AudioEngine();
  private readonly quality: Quality;
  private readonly renderer: Renderer;
  private readonly camera = new Camera();
  private readonly particles = new Particles();
  private readonly field = new ObstacleField();
  private readonly player = new Player();
  private readonly sky = new SkyState();
  private input!: Input;

  private state: State = State.Loading;
  private returnScreen: 'menu' | 'paused' = 'menu';

  private score = 0;
  private nearChain = 0;
  private isBestRun = false;
  private unlockedThisRun: string | null = null;

  private scroll = 0;
  private worldTime = 0;
  private stateTime = 0;
  private lockout = 0;
  private hudVisible = 0;
  private playerAlpha = 1;
  private scrim = 0;

  private startThemeIndex = 0;
  private stage = 0;
  private themeFrom: Theme = THEMES[0];
  private themeTo: Theme = THEMES[0];
  private blend = 0;
  private transitioning = false;
  private particleThemeApplied = '';

  private passBuffer: PassEvent[] = [];
  private loadingLine = 0;
  private loadingTick = 0;
  private rebakeTimer = 0;

  constructor(canvas: HTMLCanvasElement, root: HTMLElement) {
    this.view = new Viewport(canvas);
    this.renderer = new Renderer(this.view);
    this.ui = new UI(root);

    this.quality = new Quality((profile) => this.applyQuality(profile));
    this.quality.setPreference(this.store.data.settings.quality);
    this.applyQuality(this.quality.profile);

    this.startThemeIndex = themeIndexById(this.store.data.startTheme);
    this.themeFrom = THEMES[this.startThemeIndex];
    this.themeTo = this.themeFrom;
    this.sky.set(this.themeFrom, this.themeTo, 0);

    this.loop = new Loop(
      (dt) => this.update(dt),
      (alpha, frameDt) => this.render(alpha, frameDt),
    );

    this.bindUI();
    this.bindInput(root);
    this.bindLifecycle();

    this.view.onResize(() => this.handleResize());
    this.handleResize();

    this.applySettings();
    this.ui.setMenuStats(this.store.data.best, this.store.data.runs);
    this.ui.syncSettings(this.store.data.settings);
    this.ui.buildThemes(this.store.data);

    this.renderer.background.requestNow(this.themeFrom);
    this.renderer.weather.prime(this.themeFrom.weather);
    this.audio.setTheme(this.themeFrom);
    this.syncParticleTheme(this.themeFrom);
    this.resetFlyer();

    this.loop.start();
  }

  /* --------------------------------- setup -------------------------------- */

  private bindUI(): void {
    this.ui.onAction = (action) => this.handleAction(action);
    this.ui.onSetting = (key, value) => this.handleSetting(key, value);
    this.ui.onThemePick = (id) => {
      this.store.data.startTheme = id;
      this.store.save();
      this.startThemeIndex = themeIndexById(id);
      this.ui.buildThemes(this.store.data);
      this.audio.button('confirm');
      if (this.state === State.Menu || this.state === State.Ready) {
        this.applyStage(0, true);
      }
    };
    this.ui.onPauseClick = () => this.togglePause();
    this.ui.onMuteClick = () => this.toggleMute();
  }

  private bindInput(root: HTMLElement): void {
    this.input = new Input(root, {
      flap: () => this.handleTap(),
      pause: () => this.togglePause(),
      mute: () => this.toggleMute(),
      restart: () => {
        if (this.state === State.GameOver || this.state === State.Playing) this.beginRun(true);
      },
      firstGesture: () => this.audio.unlock(),
    });
  }

  private bindLifecycle(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.audio.suspend();
        if (this.state === State.Playing) this.togglePause();
      } else {
        this.audio.resume();
        this.loop.resync();
      }
    });
    window.addEventListener('blur', () => {
      if (this.state === State.Playing) this.togglePause();
    });
  }

  private handleResize(): void {
    this.renderer.onResize();
    this.renderer.syncArt(this.themeFrom, this.transitioning ? this.themeTo : null);
    this.resetFlyer(true);

    // Re-baking terrain is expensive, and a window drag fires resize
    // continuously. The stale layers stretch to the new viewport in the
    // meantime, which is invisible for something this soft and distant.
    clearTimeout(this.rebakeTimer);
    if (this.state === State.Loading) {
      this.renderer.background.invalidate();
      return;
    }
    this.rebakeTimer = window.setTimeout(() => {
      this.renderer.background.invalidate();
    }, 260);
  }

  private applyQuality(profile: QualityProfile): void {
    this.renderer.setQuality(profile);
    const reduced = this.store.data.settings.reducedMotion;
    this.particles.budget = profile.particleScale * (reduced ? 0.5 : 1);
    this.view.setDprCap(profile.dprCap);
  }

  private applySettings(): void {
    const s = this.store.data.settings;
    this.audio.setSfx(s.sfx);
    this.audio.setMusic(s.music);
    this.camera.shakeEnabled = s.shake && !s.reducedMotion;
    this.camera.intensityScale = s.reducedMotion ? 0.25 : 1;
    this.ui.setMuted(!s.sfx && !s.music);
    this.ui.setReducedMotion(s.reducedMotion);
    this.applyQuality(this.quality.profile);
  }

  /* ------------------------------- run control ---------------------------- */

  private resetFlyer(keepState = false): void {
    const x = this.view.worldW * PLAYER.xFraction;
    const y = this.view.worldH * 0.45;
    if (keepState && this.state === State.Playing) {
      this.player.x = x;
      return;
    }
    this.player.reset(x, y);
  }

  private prepareRun(): void {
    this.score = 0;
    this.nearChain = 0;
    this.isBestRun = false;
    this.unlockedThisRun = null;
    this.stage = 0;
    this.blend = 0;
    this.transitioning = false;
    this.renderer.background.discardNext();
    this.field.reset((Math.random() * 0xffffffff) >>> 0, this.view.worldH);
    this.particles.clear();
    this.camera.reset();
    this.renderer.hud.reset();
    this.applyStage(0, true);
    this.resetFlyer();
    this.player.state = PlayerState.Hover;
  }

  /** @param instant skip the "tap to fly" beat and launch immediately. */
  private beginRun(instant: boolean): void {
    this.prepareRun();
    this.setState(State.Ready);
    if (instant) this.launch();
  }

  private launch(): void {
    this.setState(State.Playing);
    this.player.launch();
    this.emitFlapFx(1.15);
    this.audio.flap(1.1);
    this.field.primeLeadIn(RUN_LEAD_IN);
  }

  private die(): void {
    if (this.state !== State.Playing) return;
    const u = this.view.u;
    this.player.kill();
    this.setState(State.Dying);
    this.lockout = RESTART_LOCKOUT;

    this.particles.impact(this.player.x * u, this.player.y * u, u);
    this.camera.addTrauma(1);
    this.camera.punchZoom(0.05);
    this.renderer.post.damage = 1;
    this.renderer.post.flash = 0.55;
    this.audio.hit();
    this.audio.gameOver();
    this.audio.duck(0.35);
    this.vibrate(38);
  }

  private finishRun(): void {
    this.setState(State.GameOver);
    this.isBestRun = this.store.recordRun(this.score);
    const fresh = this.store.syncUnlocks(this.score);
    this.unlockedThisRun = fresh.length
      ? (THEMES.find((t) => t.id === fresh[fresh.length - 1])?.name ?? null)
      : null;

    this.ui.setGameOver({
      score: this.score,
      best: this.store.data.best,
      isBest: this.isBestRun,
      themeName: this.themeTo.name,
      unlockedName: this.unlockedThisRun,
    });
    this.ui.setMenuStats(this.store.data.best, this.store.data.runs);
    this.ui.buildThemes(this.store.data);
    this.ui.show('gameover');
    this.ui.setPauseVisible(false);
    this.audio.duck(0);

    if (this.isBestRun && this.score > 0) {
      this.particles.celebrate(this.view.cssW * 0.5, this.view.cssH * 0.62, this.view.u);
      this.audio.celebrate();
      this.renderer.post.flash = 0.35;
      this.vibrate([0, 24, 60, 24, 60, 48]);
    } else if (this.unlockedThisRun) {
      this.audio.celebrate();
    }
  }

  private setState(next: State): void {
    this.state = next;
    this.stateTime = 0;
  }

  /* --------------------------------- input -------------------------------- */

  private handleTap(): void {
    switch (this.state) {
      case State.Loading:
        break;
      case State.Menu:
        this.handleAction('play');
        break;
      case State.Ready:
        this.launch();
        break;
      case State.Playing:
        if (this.player.flap()) {
          this.emitFlapFx(1);
          this.audio.flap(0.9 + Math.random() * 0.2);
          this.vibrate(5);
        }
        break;
      case State.Paused:
        break;
      case State.Dying:
        break;
      case State.GameOver:
        if (this.lockout <= 0) {
          this.audio.button('confirm');
          this.beginRun(true);
        }
        break;
    }
  }

  private handleAction(action: UIAction): void {
    this.audio.unlock();
    switch (action) {
      case 'play':
        this.audio.button('confirm');
        this.beginRun(false);
        break;
      case 'retry':
        this.audio.button('confirm');
        this.beginRun(true);
        break;
      case 'resume':
        this.audio.button();
        this.togglePause();
        break;
      case 'quit':
        this.audio.button();
        this.toMenu();
        break;
      case 'settings':
        this.audio.button();
        this.returnScreen = this.state === State.Paused ? 'paused' : 'menu';
        this.ui.syncSettings(this.store.data.settings);
        this.ui.show('settings');
        break;
      case 'themes':
        this.audio.button();
        this.returnScreen = this.state === State.Paused ? 'paused' : 'menu';
        this.ui.buildThemes(this.store.data);
        this.ui.show('themes');
        break;
      case 'back':
        this.audio.button();
        this.ui.show(this.returnScreen);
        break;
      case 'share':
        this.audio.button();
        void this.ui.share(this.score, this.store.data.best);
        break;
      case 'reset':
        this.audio.button();
        this.store.reset();
        this.startThemeIndex = 0;
        this.applySettings();
        this.ui.syncSettings(this.store.data.settings);
        this.ui.setMenuStats(0, 0);
        this.ui.buildThemes(this.store.data);
        this.ui.toast('Progress reset');
        this.applyStage(0, true);
        break;
    }
  }

  private toMenu(): void {
    this.prepareRun();
    this.setState(State.Menu);
    this.ui.show('menu');
    this.ui.setPauseVisible(false);
    this.audio.duck(0);
  }

  private togglePause(): void {
    if (this.state === State.Playing) {
      this.setState(State.Paused);
      this.ui.show('paused');
      this.audio.duck(0.55);
    } else if (this.state === State.Paused) {
      this.setState(State.Playing);
      this.ui.show('none');
      this.audio.duck(0);
      this.loop.resync();
    }
  }

  private toggleMute(): void {
    const s = this.store.data.settings;
    const muted = !s.sfx && !s.music;
    s.sfx = muted;
    s.music = muted;
    this.store.save();
    this.applySettings();
    this.ui.syncSettings(s);
    if (!muted) this.audio.button();
  }

  private handleSetting(key: string, value: boolean | string): void {
    const s = this.store.data.settings as unknown as Record<string, boolean | string>;
    s[key] = value;
    this.store.save();
    if (key === 'quality') {
      this.quality.setPreference(value as 'auto' | 'high' | 'medium' | 'low');
      this.applyQuality(this.quality.profile);
    }
    this.applySettings();
    this.audio.button();
  }

  private vibrate(pattern: number | number[]): void {
    if (!this.store.data.settings.haptics) return;
    try {
      navigator.vibrate?.(pattern);
    } catch {
      /* vibration is a nicety, never a requirement */
    }
  }

  /* --------------------------------- update ------------------------------- */

  private update(dt: number): void {
    this.stateTime += dt;
    if (this.lockout > 0) this.lockout -= dt;

    if (this.state === State.Loading) {
      this.updateLoading(dt);
      return;
    }

    // Terrain generation is always metered against a small slice of the frame,
    // whether it was triggered by a resize, a quality change or a sky shift.
    this.renderer.background.pump(2.4);

    const diff = difficultyFor(this.score);
    const u = this.view.u;
    const simulating = this.state !== State.Paused;

    // Ambient drift on the menu, full speed in flight.
    const speedScale =
      this.state === State.Playing || this.state === State.Dying
        ? 1
        : this.state === State.Ready
          ? 0.5
          : 0.34;
    const scrollUnits = simulating ? diff.speed * speedScale : 0;
    const scrollPx = scrollUnits * u;
    if (simulating) {
      this.scroll += scrollPx * dt;
      this.worldTime += dt;
    }

    if (simulating) {
      this.field.update(
        dt,
        scrollUnits,
        this.view.worldW,
        this.view.worldH,
        diff,
        this.state === State.Playing || this.state === State.Dying,
      );

      this.player.update(dt, this.view.worldH, WORLD.ceilingInset + PLAYER.radius);

      if (this.state === State.Menu || this.state === State.Ready) {
        this.updateIdleFlyer(dt);
      }

      if (this.state === State.Playing) {
        this.updateScoring(u);
        this.checkCollisions(u);
        if (Math.random() < dt * 26 * this.particles.budget && Math.abs(this.player.vy) > 0.2) {
          this.particles.trail(
            this.player.x * u - u * 0.03,
            this.player.y * u + u * 0.01,
            u,
            diff.speed,
          );
        }
      }

      if (this.state === State.Dying) {
        if (Math.random() < dt * 30) {
          this.particles.deathSmoke(this.player.x * u, this.player.y * u, u);
        }
        if (this.player.state === PlayerState.Dead || this.stateTime > 1.35) {
          this.finishRun();
        }
      }

      this.particles.update(dt, scrollPx);
      this.renderer.weather.update(dt, scrollPx, this.sky);
      this.updateSkyProgression(dt);
    }

    this.camera.update(
      dt,
      this.player.y,
      this.view.worldH * 0.5,
      this.state === State.Playing || this.state === State.Dying ? 1 : 0.5,
    );

    this.audio.setIntensity(diff.intensity);

    const wantHud = this.state === State.Playing || this.state === State.Dying;
    this.hudVisible = damp(this.hudVisible, wantHud ? 1 : 0, 9, dt);
    this.playerAlpha = damp(
      this.playerAlpha,
      this.state === State.GameOver && this.player.state === PlayerState.Dead ? 0 : 1,
      6,
      dt,
    );
    this.scrim = damp(this.scrim, this.state === State.Dying ? 0.5 : 0, 4, dt);
  }

  private updateLoading(dt: number): void {
    this.loadingTick += dt;
    if (this.loadingTick > 0.42) {
      this.loadingTick = 0;
      this.loadingLine = (this.loadingLine + 1) % LOADING_LINES.length;
    }
    this.renderer.background.pump(7);
    const progress = this.renderer.background.bakeProgress;
    this.ui.setLoading(progress * 0.94 + 0.03, LOADING_LINES[this.loadingLine]);
    if (progress >= 1 && this.stateTime > 0.55) {
      this.setState(State.Menu);
      this.ui.setLoading(1);
      this.ui.show('menu');
    }
  }

  /** Keeps the drake alive on the menu with an unhurried, automatic wingbeat. */
  private updateIdleFlyer(dt: number): void {
    if (Math.random() < dt * 0.42) {
      this.player.flapTimer = 0.3;
      this.player.beat = 0.7;
      this.emitFlapFx(0.5);
    }
  }

  private updateScoring(u: number): void {
    const passes = this.field.collectPasses(this.player.x, this.player.y, this.passBuffer);
    for (const pass of passes) {
      this.score++;
      if (pass.nearMiss) {
        this.nearChain = Math.min(7, this.nearChain + 1);
        this.renderer.hud.onNearMiss(this.player.x * u, this.player.y * u - u * 0.11);
        this.particles.scoreSparks(this.player.x * u, this.player.y * u, u, true);
        this.audio.nearMiss();
        this.camera.addTrauma(0.16);
      } else {
        this.nearChain = 0;
        this.particles.scoreSparks(this.player.x * u, this.player.y * u, u, false);
      }
      this.audio.score(this.nearChain);
      this.renderer.hud.onScore(this.score);
      this.camera.punchZoom(0.01);

      if (this.score % 10 === 0) {
        this.audio.milestone();
        this.renderer.post.flash = 0.28;
        this.camera.punchZoom(0.022);
        this.vibrate(9);
      }
    }
  }

  private checkCollisions(u: number): void {
    const p = this.player;
    const floor = this.view.worldH - WORLD.floorInset - PLAYER.radius * 0.4;
    if (p.y >= floor) {
      p.y = floor;
      this.particles.impact(p.x * u, p.y * u, u, 0);
      this.die();
      return;
    }
    const hit = this.field.hitTest(p.x, p.y, PLAYER.radius, this.view.worldH);
    if (hit) this.die();
  }

  private emitFlapFx(power: number): void {
    const u = this.view.u;
    this.particles.flapBurst(this.player.x * u - u * 0.02, this.player.y * u, u, power);
  }

  /* ------------------------------ sky progression ------------------------- */

  private applyStage(stage: number, instant: boolean): void {
    const theme = themeAtStage(this.startThemeIndex, stage);
    this.stage = stage;
    if (instant) {
      this.themeFrom = theme;
      this.themeTo = theme;
      this.blend = 0;
      this.transitioning = false;
      if (this.state === State.Loading) this.renderer.background.requestNow(theme);
      else this.renderer.background.requestSwap(theme);
      this.renderer.syncArt(theme, null);
      this.renderer.weather.prime(theme.weather);
      this.audio.setTheme(theme);
      this.syncParticleTheme(theme);
      this.sky.set(theme, theme, 0);
      return;
    }

    this.themeTo = theme;
    this.blend = 0;
    this.transitioning = true;
    if (this.renderer.background.nextTheme?.id !== theme.id) {
      this.renderer.background.requestNext(theme);
    }
    this.renderer.syncArt(this.themeFrom, theme);
    this.renderer.weather.setKind(theme.weather);
    this.audio.setTheme(theme);
    this.audio.whoosh();
    this.renderer.hud.showSkyCard(theme.name, theme.tagline);
  }

  private updateSkyProgression(dt: number): void {
    const bg = this.renderer.background;

    if (this.transitioning) {
      if (bg.nextReady) {
        this.blend = Math.min(1, this.blend + dt / SKY_BLEND_TIME);
        if (this.blend >= 0.5) this.syncParticleTheme(this.themeTo);
        if (this.blend >= 1) {
          bg.promote();
          this.themeFrom = this.themeTo;
          this.blend = 0;
          this.transitioning = false;
          this.renderer.syncArt(this.themeFrom, null);
        }
      }
    } else if (this.state === State.Playing) {
      const wanted = skyStageForScore(this.score);
      if (wanted > this.stage) {
        this.applyStage(wanted, false);
      } else if (this.score >= skyShiftScore(this.stage) - SKY_PREBAKE_LEAD) {
        // Bake the upcoming sky early so the shift itself never stutters.
        const upcoming = themeAtStage(this.startThemeIndex, this.stage + 1);
        if (bg.nextTheme?.id !== upcoming.id) bg.requestNext(upcoming);
      }
    }

    this.sky.set(this.themeFrom, this.themeTo, this.blend);
  }

  private syncParticleTheme(theme: Theme): void {
    if (this.particleThemeApplied === theme.id) return;
    this.particleThemeApplied = theme.id;
    this.particles.setTheme(theme);
  }

  /* --------------------------------- render ------------------------------- */

  private render(alpha: number, frameDt: number): void {
    const dt = Math.min(frameDt, 0.1);
    this.quality.update(dt, this.loop.smoothedFrameMs);
    this.renderer.update(dt);

    const diff = difficultyFor(this.score);
    this.renderer.draw({
      sky: this.sky,
      scroll: this.scroll,
      worldTime: this.field.clock,
      obstacles: this.field.items,
      obstacleCount: this.field.active,
      player: this.player,
      particles: this.particles,
      camera: this.camera,
      alpha: this.state === State.Paused ? 1 : clamp01(alpha),
      blend: this.transitioning ? this.blend : 0,
      scrim: this.scrim,
      hudVisible: this.hudVisible,
      intensity: clamp(diff.intensity, 0, 1) * (this.state === State.Playing ? 1 : 0.2),
      playerAlpha: this.playerAlpha,
      showFps: this.store.data.settings.showFps,
      fps: this.loop.fps,
    });

    // The "tap to fly" prompt lives in the DOM; keep it in step with the sim.
    if (this.state === State.Ready && this.ui.current !== 'ready') this.ui.show('ready');
    if (this.state === State.Playing && this.ui.current !== 'none') {
      this.ui.show('none');
      this.ui.setPauseVisible(true);
    }
  }

  dispose(): void {
    this.loop.stop();
    this.input.dispose();
    this.audio.dispose();
  }
}
