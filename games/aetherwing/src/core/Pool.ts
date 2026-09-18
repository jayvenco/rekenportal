/**
 * A fixed-capacity object pool with a swap-remove active list.
 *
 * Particles and obstacles churn every frame; allocating them would hand the
 * garbage collector a steady stream of short-lived objects and cause visible
 * hitches. Everything is created once up front and recycled forever.
 */
export class Pool<T> {
  readonly items: T[];
  /** Number of live entries; the first `active` items in `items` are alive. */
  active = 0;

  constructor(
    readonly capacity: number,
    factory: () => T,
  ) {
    this.items = new Array<T>(capacity);
    for (let i = 0; i < capacity; i++) this.items[i] = factory();
  }

  /**
   * Returns the next free item, or `null` when the pool is saturated.
   * Saturation is intentional back-pressure: dropping a spark is always
   * better than dropping a frame.
   */
  obtain(): T | null {
    if (this.active >= this.capacity) return null;
    return this.items[this.active++];
  }

  /** Release the item at `index` (must be < active). O(1) swap-remove. */
  releaseAt(index: number): void {
    const last = this.active - 1;
    if (index !== last) {
      const tmp = this.items[index];
      this.items[index] = this.items[last];
      this.items[last] = tmp;
    }
    this.active = last;
  }

  clear(): void {
    this.active = 0;
  }
}
