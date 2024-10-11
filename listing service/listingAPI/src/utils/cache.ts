import { LRUCache } from "lru-cache";

class MapCache {
  private map: Map<any, { value: any; expiry: number }>;

  private ttl: number;

  constructor(ttl: number = 10800000) {
    this.map = new Map();

    this.ttl = ttl;
  }

  set(key: any, value: any): void {
    const expiry = Date.now() + this.ttl;

    this.map.set(key, { value, expiry });

    this.cleanup();
  }

  get(key: any): any | undefined {
    const entry = this.map.get(key);

    if (entry) {
      if (Date.now() < entry.expiry) {
        return entry.value;
      } else {
        this.delete(key);
      }
    }

    return undefined;
  }

  has(key: any): boolean {
    return this.map.has(key);
  }

  delete(key: any): boolean {
    return this.map.delete(key);
  }

  size(): number {
    return this.map.size;
  }

  entries(): IterableIterator<[any, { value: any; expiry: any }]> {
    return this.map.entries();
  }

  clear(): void {
    this.map.clear();
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.map.entries()) {
      if (now >= entry.expiry) {
        this.delete(key);
      }
    }
  }

  static Create(): MapCache {
    return new MapCache();
  }
}

class LruCache {
  private cache: LRUCache<string, any>;

  constructor(maxSize: number = 500, ttl: number = 10800000) {
    this.cache = new LRUCache({ max: maxSize, ttl, allowStale: false });
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  get(key: string): any | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  static Create(): LruCache {
    return new LruCache();
  }
}

export default { MapCache: MapCache.Create(), LruCache: LruCache.Create() };
