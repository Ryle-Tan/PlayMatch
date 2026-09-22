/**
 * The only place the frontend talks to the network.
 *
 * Every call goes to our own Netlify Function, never to RAWG directly,
 * so the API key stays on the server.
 */

import { readCache, writeCache, TTL } from "./cache.js";

const FUNCTIONS = "/.netlify/functions";

/** An API failure carrying a message we are happy to show on screen. */
export class ApiError extends Error {
  constructor(message, code = "UNKNOWN", status = 0) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function buildUrl(endpoint, params) {
  const url = new URL(`${FUNCTIONS}/${endpoint}`, window.location.origin);
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(name, String(value));
    }
  }
  return url;
}

/**
 * Requests that are in the air right now, keyed by URL.
 *
 * Without this, two components asking for the same thing at the same
 * moment each spend a RAWG request, because neither has finished in
 * time to fill the cache for the other. React's StrictMode does
 * exactly that in development.
 */
const inFlight = new Map();

/**
 * Let a caller walk away from a shared request without killing it.
 *
 * The underlying fetch is deliberately NOT given the caller's abort
 * signal: if it were, one component unmounting would cancel the
 * request that other components are still waiting on. Instead the
 * fetch always runs to completion and fills the cache, while each
 * caller races it against its own signal.
 */
function abortable(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"));

  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort));
  });
}

/** The actual network call, plus caching of the result. */
async function fetchAndCache(url, cacheKey, ttl) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new ApiError("No signal. Check your internet connection and try again.", "OFFLINE");
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    /* non-JSON response — handled below */
  }

  if (!response.ok) {
    throw new ApiError(
      body?.message ?? "The arcade cabinet jammed. Try again.",
      body?.error ?? "HTTP_ERROR",
      response.status
    );
  }

  writeCache(cacheKey, body, ttl);
  return body;
}

/**
 * Fetch from one of our functions, using the localStorage cache when possible.
 * @param {string} endpoint  function name, e.g. "games"
 * @param {object} params    query string values
 * @param {number} ttl       how long to cache the result
 */
function request(endpoint, params = {}, ttl = TTL.HOUR, { signal } = {}) {
  const url = buildUrl(endpoint, params);
  const cacheKey = url.pathname + url.search;

  const cached = readCache(cacheKey);
  if (cached) return Promise.resolve(cached);

  // Join a request already on its way rather than starting a second one.
  let pending = inFlight.get(cacheKey);
  if (!pending) {
    pending = fetchAndCache(url, cacheKey, ttl).finally(() => inFlight.delete(cacheKey));
    inFlight.set(cacheKey, pending);
  }

  return abortable(pending, signal);
}

// ---- The endpoints the app actually uses -------------------------------

export const getGames = (params, options) =>
  request("games", params, TTL.HOUR, options);

export const getGenres = (options) =>
  request("genres", {}, TTL.WEEK, options);

export const getGameDetails = (id, options) =>
  request("game-details", { id }, TTL.DAY, options);

export const getScreenshots = (id, options) =>
  request("screenshots", { id }, TTL.DAY, options);

export const getMovies = (id, options) =>
  request("movies", { id }, TTL.DAY, options);
