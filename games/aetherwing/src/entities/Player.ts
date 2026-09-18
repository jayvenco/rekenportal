import { PHYSICS, PLAYER } from '../config/balance';
import { TAU, clamp, damp, easeInOutCubic, easeOutQuad, invLerp, lerp } from '../core/math';

export enum PlayerState {
  Hover = 0,
  Flying = 1,
  Dying = 2,
  Dead = 3,
}

const FLAP_DURATION = 0.3;

/**
 * The flyer. Deliberately the simplest object in the game: one vertical axis,
 * one impulse, no horizontal control. Everything else here exists to make that
 * single input *read* — tilt, wing pose, squash, and the little burst of extra
 * lift right after a beat that separates a wing from a bouncing ball.
 */
export class Player {
  x = 0;
  y = 0;
  vy = 0;

  /** Previous-step position, for render interpolation. */
  prevY = 0;
  prevRot = 0;

  state: PlayerState = PlayerState.Hover;

  /** -1 = wings fully raised, +1 = fully lowered. Drives the sprite frame. */
  wing = -0.2;
  rotation = 0;
  /** >1 stretches vertically (a dive), <1 squashes (the top of a beat). */
  squash = 1;

  /** Seconds remaining in the current wingbeat. */
  flapTimer = 0;
  /** Seconds remaining of softened gravity after a beat. */
  liftTimer = 0;
  private cooldown = 0;
  /** Counts up forever; drives idle oscillation. */
  private clock = 0;
  /** 0..1, spikes on a beat — used by the renderer for the glow pulse. */
  beat = 0;
  /** 0..1, spikes on impact — used for the red flash. */
  hurt = 0;

  private hoverBase = 0;
  private tumble = 0;

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.prevY = y;
    this.vy = 0;
    this.state = PlayerState.Hover;
    this.wing = -0.2;
    this.rotation = 0;
    this.prevRot = 0;
    this.squash = 1;
    this.flapTimer = 0;
    this.liftTimer = 0;
    this.cooldown = 0;
    this.beat = 0;
    this.hurt = 0;
    this.tumble = 0;
    this.hoverBase = y;
  }

  launch(): void {
    this.state = PlayerState.Flying;
    this.vy = -PHYSICS.flapImpulse * 0.72;
    this.flap(true);
  }

  canFlap(): boolean {
    return this.state === PlayerState.Flying && this.cooldown <= 0;
  }

  flap(force = false): boolean {
    if (!force && !this.canFlap()) return false;
    this.vy = -PHYSICS.flapImpulse;
    this.flapTimer = FLAP_DURATION;
    this.liftTimer = PHYSICS.flapLiftTime;
    this.cooldown = PHYSICS.flapCooldown;
    this.beat = 1;
    this.squash = 0.86;
    return true;
  }

  kill(): void {
    if (this.state === PlayerState.Dying || this.state === PlayerState.Dead) return;
    this.state = PlayerState.Dying;
    this.vy = Math.min(this.vy, 0) - 0.34;
    this.hurt = 1;
    this.tumble = 0;
    this.flapTimer = 0;
  }

  update(dt: number, worldH: number, ceiling: number): void {
    this.prevY = this.y;
    this.prevRot = this.rotation;
    this.clock += dt;
    this.beat = Math.max(0, this.beat - dt * 3.6);
    this.hurt = Math.max(0, this.hurt - dt * 2.2);
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.flapTimer > 0) this.flapTimer -= dt;

    switch (this.state) {
      case PlayerState.Hover:
        this.updateHover(dt);
        break;
      case PlayerState.Flying:
        this.updateFlying(dt, ceiling);
        break;
      case PlayerState.Dying:
        this.updateDying(dt, worldH);
        break;
      case PlayerState.Dead:
        break;
    }
  }

  private updateHover(dt: number): void {
    // A patient, weightless idle so the start screen is never static.
    const bob = Math.sin(this.clock * 1.5) * 0.022 + Math.sin(this.clock * 0.83 + 1.2) * 0.01;
    this.y = this.hoverBase + bob;
    this.vy = Math.cos(this.clock * 1.5) * 0.033;
    this.rotation = damp(this.rotation, Math.sin(this.clock * 1.5 + 0.4) * 0.12, 8, dt);
    this.wing = damp(this.wing, this.idleWing(0.5), 9, dt);
    this.squash = damp(this.squash, 1, 8, dt);
  }

  private updateFlying(dt: number, ceiling: number): void {
    let g = PHYSICS.gravity;
    if (this.liftTimer > 0) {
      this.liftTimer -= dt;
      g *= PHYSICS.flapLiftScale;
    }
    this.vy = clamp(this.vy + g * dt, -PHYSICS.maxRise, PHYSICS.maxFall);
    this.y += this.vy * dt;

    // The ceiling deflects rather than kills — dying to an invisible lid is
    // the least satisfying death in the genre.
    if (this.y < ceiling) {
      this.y = ceiling;
      if (this.vy < 0) this.vy *= -0.18;
    }

    this.updatePose(dt);
  }

  private updateDying(dt: number, worldH: number): void {
    this.vy = clamp(this.vy + PHYSICS.gravity * 1.35 * dt, -2, PHYSICS.maxFall * 1.7);
    this.y += this.vy * dt;
    this.tumble += dt * (2.4 + Math.abs(this.vy) * 1.6);
    this.rotation = this.tumble;
    this.wing = damp(this.wing, 0.9, 5, dt);
    this.squash = damp(this.squash, 1.08, 6, dt);
    if (this.y > worldH + 0.3) this.state = PlayerState.Dead;
  }

  private updatePose(dt: number): void {
    let wingTarget: number;
    if (this.flapTimer > 0) {
      const p = 1 - this.flapTimer / FLAP_DURATION;
      wingTarget =
        p < 0.3
          ? lerp(-0.75, 1.05, easeOutQuad(p / 0.3))
          : lerp(1.05, -0.55, easeInOutCubic((p - 0.3) / 0.7));
    } else {
      wingTarget = this.idleWing(1);
    }
    this.wing = damp(this.wing, wingTarget, this.flapTimer > 0 ? 34 : 11, dt);

    // Tilt: whip upward on a beat, ease nose-down as speed builds.
    const t = invLerp(-PHYSICS.flapImpulse, PHYSICS.maxFall, this.vy);
    const target = lerp(PLAYER.tiltUp, PLAYER.tiltDown, t * t * 0.72 + t * 0.28);
    this.rotation = damp(this.rotation, target, this.vy < 0 ? 15 : 6.5, dt);

    const stretch = 1 + clamp(this.vy, -1, 1.3) * 0.055;
    this.squash = damp(this.squash, stretch, 9, dt);
  }

  /** Slow wing sweep while gliding; spreads wider the faster you fall. */
  private idleWing(scale: number): number {
    const fall = clamp(this.vy / PHYSICS.maxFall, -1, 1);
    const base = -0.16 - fall * 0.22;
    return base + Math.sin(this.clock * TAU * 0.55) * 0.14 * scale;
  }

  /** Interpolated Y for rendering between fixed steps. */
  renderY(alpha: number): number {
    return lerp(this.prevY, this.y, alpha);
  }

  renderRotation(alpha: number): number {
    let d = this.rotation - this.prevRot;
    // Guard the tumble wrapping past ±π during the death spin.
    if (d > Math.PI) d -= TAU;
    else if (d < -Math.PI) d += TAU;
    return this.prevRot + d * alpha;
  }
}
