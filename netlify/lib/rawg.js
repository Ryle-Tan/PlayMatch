/**
 * Shared RAWG helper for every Netlify Function.
 *
 * This file runs ONLY on Netlify's servers, never in the browser.
 * It is the single place where RAWG_API_KEY is read, so the key can
 * never leak into the frontend bundle.
 */

const RAWG_BASE = "https://api.rawg.io/api";
const TIMEOUT_MS = 10_000;

/** An error we already know how to show to the user. */
export class RawgError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Call RAWG with the secret key attached server-side.
 * @param {string} path   e.g. "/games" or "/games/3498/screenshots"
 * @param {object} params query string values (blank/undefined ones are dropped)
 */
export async function rawgFetch(path, params = {}) {
  const key = process.env.RAWG_API_KEY;
  if (!key) {
    throw new RawgError(
      500,
      "NO_KEY",
      "The server has no RAWG_API_KEY configured. Add it to .env (local) or to Netlify's environment variables (production)."
    );
  }

  const url = new URL(RAWG_BASE + path);
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(name, String(value));
    }
  }
  url.searchParams.set("key", key);

  let response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "PlayMatch (student project)" },
    });
  } catch {
    throw new RawgError(504, "NETWORK", "Could not reach RAWG. Check your connection and try again.");
  }

  if (response.status === 401 || response.status === 403) {
    throw new RawgError(502, "BAD_KEY", "RAWG rejected the API key. Check that RAWG_API_KEY is correct.");
  }
  if (response.status === 429) {
    throw new RawgError(429, "RATE_LIMIT", "RAWG's request limit was hit. Wait a minute, then retry.");
  }
  if (response.status === 404) {
    throw new RawgError(404, "NOT_FOUND", "RAWG has no record of that.");
  }
  if (!response.ok) {
    throw new RawgError(502, "UPSTREAM", `RAWG returned an unexpected error (${response.status}).`);
  }

  return response.json();
}

/**
 * A successful JSON response.
 *
 * `netlify-cdn-cache-control` lets Netlify's CDN serve repeat requests
 * without calling RAWG again — this is what protects the monthly quota.
 * `maxAge` is in seconds.
 */
export function ok(data, { maxAge = 300, swr = 86_400 } = {}) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60",
      "netlify-cdn-cache-control": `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}, durable`,
    },
  });
}

/** An error response the frontend can show as a friendly retro message. */
export function fail(error) {
  const known = error instanceof RawgError;
  if (!known) console.error("[PlayMatch] Unexpected function error:", error);

  const status = known ? error.status : 500;
  const code = known ? error.code : "UNKNOWN";
  const message = known ? error.message : "Something went wrong on our side.";

  return new Response(JSON.stringify({ error: code, message }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

/** Read a positive integer from the query string, with bounds. */
export function intParam(params, name, { fallback, min = 1, max = 1000 }) {
  const raw = params.get(name);
  if (raw === null || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

/** Require a numeric RAWG game id. */
export function requireGameId(params) {
  const id = params.get("id");
  if (!id || !/^\d+$/.test(id)) {
    throw new RawgError(400, "BAD_REQUEST", "A numeric game id is required.");
  }
  return id;
}

/** Trim a RAWG game object down to just what a PlayMatch card needs. */
export function shapeGame(game) {
  return {
    id: game.id,
    slug: game.slug,
    name: game.name,
    released: game.released ?? null,
    image: game.background_image ?? null,
    metacritic: game.metacritic ?? null,
    rating: game.rating ?? null,
    ratingsCount: game.ratings_count ?? 0,
    playtime: game.playtime ?? 0,
    genres: (game.genres ?? []).map((g) => ({ id: g.id, name: g.name, slug: g.slug })),
    platforms: (game.parent_platforms ?? []).map((p) => ({
      id: p.platform.id,
      name: p.platform.name,
      slug: p.platform.slug,
    })),
    // Tags drive the Gamer Personality scoring later on.
    tags: (game.tags ?? [])
      .filter((t) => t.language === "eng")
      .slice(0, 12)
      .map((t) => ({ name: t.name, slug: t.slug })),
    previewShots: (game.short_screenshots ?? []).slice(1, 5).map((s) => s.image),
  };
}
