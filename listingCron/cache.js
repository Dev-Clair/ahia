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

class SetCache {
  set;

  ttl;

  constructor(ttl = 450000) {
    this.set = new Set();

    this.ttl = ttl;
  }

  set(key, value) {
    if (this.has(key)) {
      return;
    }

    const expiry = Date.now() + this.ttl;

    this.set.add({ key, value, expiry });

    this.cleanup();
  }

  get(key) {
    for (const item of this.set) {
      if (item.key === key) {
        if (Date.now() < item.expiry) {
          return item.value;
        } else {
          this.delete(key);
        }
      }
    }
    return undefined;
  }

  has(key) {
    for (const item of this.set) {
      if (item.key === key) {
        return true;
      }
    }
    return false;
  }

  delete(key) {
    for (const item of this.set) {
      if (item.key === key) {
        return this.set.delete(item);
      }
    }
    return false;
  }

  size() {
    return this.set.size;
  }

  entries() {
    return Array.from(this.set).map(({ key, value }) => [key, value]);
  }

  clear() {
    this.set.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const item of this.set) {
      if (now >= item.expiry) {
        this.set.delete(item);
      }
    }
  }
}

const Cache = { MapCache, SetCache };

module.exports = Cache;
