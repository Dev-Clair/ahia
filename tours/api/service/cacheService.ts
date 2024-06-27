class MapCache<K, V> {
  private map: Map<K, { value: V; expiry: number }>;

  private ttl: number;

  constructor(ttl: number = 10800000) {
    this.map = new Map();

    this.ttl = ttl;
  }

  set(key: K, value: V): void {
    const expiry = Date.now() + this.ttl;

    this.map.set(key, { value, expiry });

    this.cleanup();
  }

  get(key: K): V | undefined {
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

  has(key: K): boolean {
    return this.map.has(key);
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  size(): number {
    return this.map.size;
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
