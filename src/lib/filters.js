/**
 * The filter options shown on the filter screen, and the translation
 * from those choices into RAWG query parameters.
 */

/**
 * RAWG's "parent platform" ids group console families together, which
 * is what we want — a user picking PlayStation means any PlayStation.
 * Mobile is the one option that maps to two ids (iOS and Android).
 */
export const PLATFORMS = [
  { key: "pc", label: "PC", ids: [1], icon: "▭" },
  { key: "playstation", label: "PlayStation", ids: [2], icon: "✚" },
  { key: "xbox", label: "Xbox", ids: [3], icon: "◉" },
  { key: "nintendo", label: "Nintendo", ids: [7], icon: "◆" },
  { key: "mobile", label: "Mobile", ids: [4, 8], icon: "▯" },
];

/** Release windows, mapped to the date ranges RAWG expects. */
export const ERAS = [
  { key: "retro", label: "Retro", sub: "pre-2000", from: "1970-01-01", to: "1999-12-31" },
  { key: "2000s", label: "2000s", sub: "2000–2009", from: "2000-01-01", to: "2009-12-31" },
  { key: "2010s", label: "2010s", sub: "2010–2019", from: "2010-01-01", to: "2019-12-31" },
  { key: "2020s", label: "2020s", sub: "2020–now", from: "2020-01-01", to: "2029-12-31" },
];

/**
 * Turn the user's selections into RAWG query params.
 * Anything left unselected is simply omitted, which means "no limit".
 */
export function buildQuery(filters) {
  const query = {};

  const platformIds = PLATFORMS.filter((p) => filters.platforms.includes(p.key)).flatMap(
    (p) => p.ids
  );
  if (platformIds.length) query.platforms = platformIds.join(",");

  if (filters.genres.length) query.genres = filters.genres.join(",");

  /*
   * RAWG joins the two ends of one range with a comma, and separate
   * ranges with a dot:
   *   "1970-01-01,1999-12-31.2020-01-01,2029-12-31"
   * A comma between ranges makes RAWG ignore the filter entirely.
   */
  const ranges = ERAS.filter((e) => filters.eras.includes(e.key));
  if (ranges.length) {
    query.dates = ranges.map((e) => `${e.from},${e.to}`).join(".");
  }

  return query;
}

/** A short human summary of the active filters, for the deck header. */
export function describeFilters(filters, genreList = []) {
  const parts = [];

  const platforms = PLATFORMS.filter((p) => filters.platforms.includes(p.key)).map(
    (p) => p.label
  );
  if (platforms.length) parts.push(platforms.join(" / "));

  const genres = genreList
    .filter((g) => filters.genres.includes(String(g.id)))
    .map((g) => g.name);
  if (genres.length) parts.push(genres.join(" / "));

  const eras = ERAS.filter((e) => filters.eras.includes(e.key)).map((e) => e.label);
  if (eras.length) parts.push(eras.join(" / "));

  return parts.length ? parts.join(" · ") : "Everything";
}
