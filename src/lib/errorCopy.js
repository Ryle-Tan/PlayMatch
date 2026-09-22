/**
 * Turns an API error code into a heading.
 *
 * The message text comes from the server and explains what happened;
 * this just picks a heading that matches, so a rate limit does not
 * get announced as a connection problem.
 */

const TITLES = {
  RATE_LIMIT: "Rate limit hit",
  OFFLINE: "No connection",
  NETWORK: "No connection",
  NO_KEY: "Server key missing",
  BAD_KEY: "Server key rejected",
  NOT_FOUND: "Not found",
  BAD_REQUEST: "Bad request",
  UPSTREAM: "RAWG is down",
  HTTP_ERROR: "RAWG is down",
};

export function errorTitle(code) {
  return TITLES[code] ?? "Game over";
}
