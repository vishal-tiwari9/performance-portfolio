

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class InMemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const cache = new InMemoryCache();

export const TTL = {
  MARKET_DATA: 60 * 1000,              // 60s — CMP (increased from 15s for dev)
  FUNDAMENTALS: 24 * 60 * 60 * 1000,  // 24hr — P/E, EPS (doesn't change often)
  ERROR_BACKOFF: 60 * 1000,            // 60s — after any source fails
  NSE_SESSION: 30 * 60 * 1000,        // 30min — NSE session cookies
};
