/**
 * A tiny localStorage cache with expiry.
 *
 * RAWG's free tier has a monthly request limit, so every response we
 * can serve from the browser is a request we do not spend.
 */

const PREFIX = "playmatch:cache:";

/** How long different kinds of data stay fresh, in milliseconds. */
export const TTL = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
};

export function readCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    if (!entry || typeof entry.expiresAt !== "number") return null;

    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.value;
  } catch {
    // Private browsing, disabled storage, or corrupt JSON — just skip the cache.
    return null;
  }
}

export function writeCache(key, value, ttl) {
  try {
    localStorage.setItem(
      PREFIX + key,
      JSON.stringify({ value, expiresAt: Date.now() + ttl })
    );
  } catch {
    // Most likely the quota is full: clear our own old entries and give up quietly.
    clearExpired();
  }
}

/** Drop every cache entry whose expiry has passed. */
export function clearExpired() {
  try {
    const now = Date.now();
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(PREFIX)) continue;
      try {
        const entry = JSON.parse(localStorage.getItem(key));
        if (!entry || typeof entry.expiresAt !== "number" || now > entry.expiresAt) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
  } catch {
    /* storage unavailable */
  }
}

/** Wipe the whole API cache (used by the "clear cache" debug action). */
export function clearAllCache() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PREFIX)) localStorage.removeItem(key);
    }
  } catch {
    /* storage unavailable */
  }
}
