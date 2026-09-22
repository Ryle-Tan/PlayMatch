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

// RAWG wants dates as "YYYY-MM-DD,YYYY-MM-DD"
const DATES_PATTERN = /^\d{4}-\d{2}-\d{2},\d{4}-\d{2}-\d{2}$/;

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
    const dates = params.get("dates");

    const data = await rawgFetch("/games", {
      page: intParam(params, "page", { fallback: 1, min: 1, max: 500 }),
      page_size: intParam(params, "page_size", { fallback: 20, min: 1, max: 40 }),
      parent_platforms: idList(params, "platforms"),
      genres: idList(params, "genres"),
      dates: dates && DATES_PATTERN.test(dates) ? dates : undefined,
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
