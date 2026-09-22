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
 * Fetch from one of our functions, using the localStorage cache when possible.
 * @param {string} endpoint  function name, e.g. "games"
 * @param {object} params    query string values
 * @param {number} ttl       how long to cache the result
 */
async function request(endpoint, params = {}, ttl = TTL.HOUR, { signal } = {}) {
  const url = buildUrl(endpoint, params);
  const cacheKey = url.pathname + url.search;

  const cached = readCache(cacheKey);
  if (cached) return cached;

  let response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      "No signal. Check your internet connection and try again.",
      "OFFLINE"
    );
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
