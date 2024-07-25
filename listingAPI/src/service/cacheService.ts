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
}

export default MapCache;
