/**
 * Fixed-timestep loop with an accumulator and interpolated presentation.
 *
 * Physics runs at a constant 120 Hz so a flap arc is bit-for-bit identical on
 * a 60 Hz laptop, a 144 Hz monitor and a throttled phone. Rendering happens
 * once per animation frame with an interpolation factor, which keeps motion
 * perfectly smooth on high-refresh displays without simulating faster.
 */
export class Loop {
  /** Simulation step in seconds. */
  readonly step = 1 / 120;
  /** Never simulate more than this much wall time in one frame (spiral guard). */
  private readonly maxFrame = 0.25;

  private accumulator = 0;
  private last = 0;
  private rafId = 0;
  private running = false;

  /** Smoothed frame time in ms, for the adaptive quality system + FPS meter. */
  smoothedFrameMs = 16.7;
  fps = 60;
  private fpsAccum = 0;
  private fpsFrames = 0;

  constructor(
    private readonly update: (dt: number) => void,
    private readonly render: (alpha: number, frameDt: number) => void,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  /** Drop accumulated time — call after a long stall (tab restore, pause). */
  resync(): void {
    this.last = performance.now();
    this.accumulator = 0;
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.tick);

    let frameDt = (now - this.last) / 1000;
    this.last = now;

    const frameMs = frameDt * 1000;
    if (frameMs > 0 && frameMs < 200) {
      this.smoothedFrameMs += (frameMs - this.smoothedFrameMs) * 0.09;
      this.fpsAccum += frameMs;
      this.fpsFrames++;
      if (this.fpsAccum >= 400) {
        this.fps = Math.round(1000 / (this.fpsAccum / this.fpsFrames));
        this.fpsAccum = 0;
        this.fpsFrames = 0;
      }
    }

    if (frameDt > this.maxFrame) frameDt = this.maxFrame;
    this.accumulator += frameDt;

    let steps = 0;
    while (this.accumulator >= this.step && steps < 8) {
      this.update(this.step);
      this.accumulator -= this.step;
      steps++;
    }
    if (steps === 8) this.accumulator = 0;

    this.render(this.accumulator / this.step, frameDt);
  };
}
