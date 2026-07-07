interface CacheEntry<V> {
  readonly value: V;
  readonly expiresAt: number;
}

/**
 * Bounded in-memory cache: entries expire after `ttlMs` (stale data self-heals)
 * and the least-recently-used one is evicted at `maxSize` (memory stays bounded).
 * In-process only; the database stays the source of truth.
 */
export class TtlCache<K, V> {
  private readonly entries = new Map<K, CacheEntry<V>>();

  /**
   * @param maxSize Max live entries; the least-recently-used is evicted past it.
   * @param ttlMs Lifetime of an entry, in milliseconds, after it is written.
   */
  public constructor(
    private readonly maxSize: number,
    private readonly ttlMs: number,
  ) {}

  /** Cached value, or `undefined` if absent or expired; a hit becomes most-recently-used. */
  public get(key: K): V | undefined {
    const entry = this.entries.get(key);
    if (entry === undefined) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }
    // Re-insert so this key becomes the most recently used one.
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }

  /** Caches `value` under `key`, evicting the least-recently-used entry when full. */
  public set(key: K, value: V): void {
    this.entries.delete(key);
    if (this.entries.size >= this.maxSize) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  /** Drops `key`; a no-op if absent. */
  public delete(key: K): void {
    this.entries.delete(key);
  }

  /** Cached value for `key`, else runs and caches `load`. `V` must exclude `undefined` (the miss marker). */
  public async getOrLoad(key: K, load: (key: K) => Promise<V>): Promise<V> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const value = await load(key);
    this.set(key, value);
    return value;
  }
}
