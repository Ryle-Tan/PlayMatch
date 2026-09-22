/**
 * Everything PlayMatch remembers between visits, kept in localStorage.
 *
 * Three separate things are stored:
 *   matches — the games you liked
 *   seen    — every game id you have swiped on, so none come back
 *   filters — your last filter choices
 *   swipes  — how many swipes you have made (unlocks the personality card)
 *
 * Every read is wrapped: storage can be unavailable in private windows,
 * and a corrupt value should never take the whole app down.
 */

const KEYS = {
  matches: "playmatch:matches",
  seen: "playmatch:seen",
  filters: "playmatch:filters",
  swipes: "playmatch:swipes",
};

// The seen list grows with every swipe, so cap it. 600 ids is far more
// than a session needs and keeps localStorage small.
const MAX_SEEN = 600;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ---- Matches -----------------------------------------------------------

export function getMatches() {
  const list = read(KEYS.matches, []);
  return Array.isArray(list) ? list : [];
}

/**
 * Keep only the fields the match list and the personality card need.
 *
 * Likes can come from a deck card or from the details view, and those
 * two RAWG responses are shaped slightly differently — normalising
 * here means everything downstream sees one consistent record.
 */
function toMatchRecord(game) {
  return {
    id: game.id,
    slug: game.slug,
    name: game.name,
    image: game.image ?? null,
    released: game.released ?? null,
    metacritic: game.metacritic ?? null,
    rating: game.rating ?? null,
    playtime: game.playtime ?? 0,
    genres: (game.genres ?? []).map((g) => ({ id: g.id, name: g.name, slug: g.slug })),
    tags: (game.tags ?? []).map((t) => ({ name: t.name, slug: t.slug })),
  };
}

/** Add a liked game. Newest first, and never stored twice. */
export function addMatch(game) {
  const list = getMatches().filter((m) => m.id !== game.id);
  const next = [{ ...toMatchRecord(game), likedAt: Date.now() }, ...list];
  write(KEYS.matches, next);
  return next;
}

export function removeMatch(id) {
  const next = getMatches().filter((m) => m.id !== id);
  write(KEYS.matches, next);
  return next;
}

export function clearMatches() {
  write(KEYS.matches, []);
  return [];
}

// ---- Seen games --------------------------------------------------------

export function getSeen() {
  const list = read(KEYS.seen, []);
  return new Set(Array.isArray(list) ? list : []);
}

export function addSeen(id) {
  const list = read(KEYS.seen, []);
  const safe = Array.isArray(list) ? list : [];
  if (safe.includes(id)) return;
  // Keep the most recent ids and drop the oldest.
  write(KEYS.seen, [id, ...safe].slice(0, MAX_SEEN));
}

export function clearSeen() {
  write(KEYS.seen, []);
}

// ---- Filters -----------------------------------------------------------

export const EMPTY_FILTERS = { platforms: [], genres: [], eras: [] };

export function getFilters() {
  const saved = read(KEYS.filters, null);
  if (!saved || typeof saved !== "object") return { ...EMPTY_FILTERS };
  return {
    platforms: Array.isArray(saved.platforms) ? saved.platforms : [],
    genres: Array.isArray(saved.genres) ? saved.genres : [],
    eras: Array.isArray(saved.eras) ? saved.eras : [],
  };
}

export function saveFilters(filters) {
  write(KEYS.filters, filters);
}

// ---- Swipe counter -----------------------------------------------------

export function getSwipeCount() {
  const n = read(KEYS.swipes, 0);
  return Number.isFinite(n) ? n : 0;
}

export function bumpSwipeCount() {
  const next = getSwipeCount() + 1;
  write(KEYS.swipes, next);
  return next;
}

export function resetSwipeCount() {
  write(KEYS.swipes, 0);
}
