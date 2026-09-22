/**
 * GET /.netlify/functions/genres
 * Powers the genre picker on the filter screen.
 */
import { rawgFetch, ok, fail } from "../lib/rawg.js";

export default async () => {
  try {
    const data = await rawgFetch("/genres", { page_size: 40 });

    return ok(
      {
        results: (data.results ?? []).map((g) => ({
          id: g.id,
          name: g.name,
          slug: g.slug,
          gamesCount: g.games_count ?? 0,
          image: g.image_background ?? null,
        })),
      },
      // The genre list basically never changes — cache it for a week.
      { maxAge: 604_800 }
    );
  } catch (error) {
    return fail(error);
  }
};
