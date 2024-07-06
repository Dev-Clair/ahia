class MapCache {
  map;

  ttl;

  constructor(ttl = 450000) {
    this.map = new Map();

    this.ttl = ttl;
  }

  set(key, value) {
    const expiry = Date.now() + this.ttl;

    this.map.set(key, { value, expiry });

    this.cleanup();
  }

  get(key) {
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

  has(key) {
    return this.map.has(key);
  }

  delete(key) {
    return this.map.delete(key);
  }

  size() {
    return this.map.size;
  }

  entries() {
    return this.map.entries();
  }

  clear() {
    this.map.clear();
  }

  cleanup() {
    const now = Date.now();

    for (const [key, entry] of this.map.entries()) {
      if (now >= entry.expiry) {
        this.delete(key);
      }
    }
  }
}

module.exports = MapCache;
