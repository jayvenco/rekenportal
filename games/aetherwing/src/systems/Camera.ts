import { clamp, clamp01, damp, noise1 } from '../core/math';

/**
 * Trauma-driven camera. Callers add "trauma" for events; the actual shake is
 * trauma squared, so small bumps are barely felt while a collision is violent.
 * Offsets come from smooth noise rather than random jitter — the difference
 * between a camera being knocked and a camera having a seizure.
 */
export class Camera {
  x = 0;
  y = 0;
  rotation = 0;
  zoom = 1;

  /** Set false by the "screen shake" setting. */
  shakeEnabled = true;
  /** Global multiplier, lowered by the reduced-motion setting. */
  intensityScale = 1;

  private trauma = 0;
  private time = 0;
  private seed = Math.random() * 1000;
  private swayPhase = Math.random() * 100;
  private followY = 0;
  private zoomTarget = 1;

  addTrauma(amount: number): void {
    this.trauma = clamp01(this.trauma + amount);
  }

  punchZoom(amount: number): void {
    this.zoomTarget = 1 + amount;
  }

  reset(): void {
    this.trauma = 0;
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.zoom = 1;
    this.zoomTarget = 1;
    this.followY = 0;
  }

  /**
   * @param dt        seconds
   * @param focusY    the player's vertical position, in units
   * @param restY     the neutral vertical position, in units
   * @param scrollAmp how much lateral drift the sky currently has
   */
  update(dt: number, focusY: number, restY: number, scrollAmp: number): void {
    this.time += dt;
    this.trauma = Math.max(0, this.trauma - dt * 1.55);

    const power = this.shakeEnabled ? this.trauma * this.trauma * this.intensityScale : 0;
    const t = this.time * 21;
    const shakeX = (noise1(t + this.seed) * 2 - 1) * power;
    const shakeY = (noise1(t + this.seed + 57.3) * 2 - 1) * power;
    const shakeR = (noise1(t + this.seed + 129.7) * 2 - 1) * power;

    // A slow figure-eight drift keeps the frame alive even when nothing moves.
    this.swayPhase += dt * 0.27;
    const swayX = Math.sin(this.swayPhase) * 0.006 * this.intensityScale;
    const swayY = Math.sin(this.swayPhase * 1.63 + 1.1) * 0.0085 * this.intensityScale;

    // Ease toward the flyer so steep dives widen the view downward.
    this.followY = damp(this.followY, (focusY - restY) * 0.13, 5.5, dt);

    this.x = shakeX * 0.055 + swayX * scrollAmp;
    this.y = shakeY * 0.055 + swayY * scrollAmp + this.followY;
    this.rotation = shakeR * 0.028 * this.intensityScale;

    this.zoomTarget = damp(this.zoomTarget, 1, 7, dt);
    this.zoom = damp(this.zoom, clamp(this.zoomTarget, 0.9, 1.2), 14, dt);
  }
}
