/**
 * Tiny in-memory TTL cache with a max size cap.
 *
 * This is intentionally minimal (no deps) because we only need a small,
 * short-lived cache to reduce repeated seating requests.
 */

class TtlCache {
  /**
   * @param {object} options
   * @param {number} options.ttlMs Time to keep entries, in ms.
   * @param {number} options.maxEntries Maximum number of keys to keep.
   */
  constructor({ ttlMs, maxEntries }) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;

    /** @type {Map<string, { value: any, expiresAt: number, createdAt: number }>} */
    this.map = new Map();
  }

  /**
   * @param {string} key
   * @returns {any | undefined}
   */
  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    const now = Date.now();

    // Evict oldest if we exceed the cap.
    // With small caps (50-100), a linear scan is totally fine.
    if (this.map.size >= this.maxEntries && !this.map.has(key)) {
      let oldestKey;
      let oldestCreatedAt = Infinity;
      for (const [k, v] of this.map.entries()) {
        if (v.createdAt < oldestCreatedAt) {
          oldestCreatedAt = v.createdAt;
          oldestKey = k;
        }
      }
      if (oldestKey) this.map.delete(oldestKey);
    }

    this.map.set(key, {
      value,
      createdAt: now,
      expiresAt: now + this.ttlMs,
    });
  }

  /**
   * @param {string} key
   */
  delete(key) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }

  /**
   * Useful for debugging.
   */
  stats() {
    return {
      size: this.map.size,
      ttlMs: this.ttlMs,
      maxEntries: this.maxEntries,
    };
  }
}

module.exports = { TtlCache };
