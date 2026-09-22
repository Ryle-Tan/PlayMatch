/**
 * GET /.netlify/functions/games
 *
 * The swipe deck's source. Only the query params listed below are
 * forwarded to RAWG — anything else the browser sends is ignored,
 * so this cannot be used as an open proxy.
 *
 * Params: page, page_size, platforms, genres, dates, ordering
 */
import { rawgFetch, ok, fail, intParam, shapeGame } from "../lib/rawg.js";

const ALLOWED_ORDERING = new Set([
  "-added",
  "-rating",
  "-released",
  "released",
  "-metacritic",
  "name",
]);

/*
 * RAWG date syntax: one range is "YYYY-MM-DD,YYYY-MM-DD", and several
 * ranges are joined with a DOT, not a comma:
 *   one era  -> 2020-01-01,2029-12-31
 *   two eras -> 1970-01-01,1999-12-31.2020-01-01,2029-12-31
 * Getting this wrong makes RAWG ignore the filter and quietly return
 * everything, so the format is checked strictly here.
 */
const DATE_RANGE_PATTERN = /^\d{4}-\d{2}-\d{2},\d{4}-\d{2}-\d{2}$/;
const MAX_DATE_RANGES = 4;

function validDates(raw) {
  if (!raw) return undefined;
  const ranges = raw.split(".");
  if (ranges.length > MAX_DATE_RANGES) return undefined;
  return ranges.every((range) => DATE_RANGE_PATTERN.test(range)) ? raw : undefined;
}

// Comma-separated numeric ids, e.g. "4,187" — used for platforms and genres
const ID_LIST_PATTERN = /^\d+(,\d+)*$/;

function idList(params, name) {
  const raw = params.get(name);
  return raw && ID_LIST_PATTERN.test(raw) ? raw : undefined;
}

export default async (request) => {
  const params = new URL(request.url).searchParams;

  try {
    const ordering = params.get("ordering");

    const data = await rawgFetch("/games", {
      page: intParam(params, "page", { fallback: 1, min: 1, max: 500 }),
      page_size: intParam(params, "page_size", { fallback: 20, min: 1, max: 40 }),
      parent_platforms: idList(params, "platforms"),
      genres: idList(params, "genres"),
      dates: validDates(params.get("dates")),
      ordering: ALLOWED_ORDERING.has(ordering) ? ordering : "-added",
    });

    return ok(
      {
        count: data.count ?? 0,
        hasNext: Boolean(data.next),
        results: (data.results ?? []).map(shapeGame),
      },
      // Game lists change slowly; an hour on the CDN saves a lot of quota.
      { maxAge: 3600 }
    );
  } catch (error) {
    return fail(error);
  }
};
