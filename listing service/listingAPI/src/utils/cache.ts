import { LRUCache } from "lru-cache";

export class MapCache {
  private map: Map<any, { value: any; expiry: number }>;

  private ttl: number;

  constructor(ttl: number = 14400000) {
    this.map = new Map();

    this.ttl = ttl;
  }

  public set(key: any, value: any): void {
    const expiry = Date.now() + this.ttl;

    this.map.set(key, { value, expiry });

    this.cleanup();
  }

  public get(key: any): any | undefined {
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

  public has(key: any): boolean {
    return this.map.has(key);
  }

  public delete(key: any): boolean {
    return this.map.delete(key);
  }

  public size(): number {
    return this.map.size;
  }

  public entries(): IterableIterator<[any, { value: any; expiry: any }]> {
    return this.map.entries();
  }

  public clear(): void {
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

export class LruCache {
  private cache: LRUCache<string, any>;

  constructor(maxSize: number = 50000, ttl: number = 14400000) {
    this.cache = new LRUCache({ max: maxSize, ttl, allowStale: false });
  }

  public set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  public get(key: string): any | undefined {
    return this.cache.get(key);
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  static Create(): LruCache {
    return new LruCache();
  }
}
