/**
 * GET /.netlify/functions/game-details?id=3498
 * The long-form info shown in the "tell me more" view.
 */
import { rawgFetch, ok, fail, requireGameId } from "../lib/rawg.js";

export default async (request) => {
  const params = new URL(request.url).searchParams;

  try {
    const id = requireGameId(params);
    const game = await rawgFetch(`/games/${id}`);

    return ok(
      {
        id: game.id,
        slug: game.slug,
        name: game.name,
        description: game.description_raw ?? "",
        released: game.released ?? null,
        image: game.background_image ?? null,
        imageExtra: game.background_image_additional ?? null,
        metacritic: game.metacritic ?? null,
        rating: game.rating ?? null,
        playtime: game.playtime ?? 0,
        website: game.website || null,
        rawgUrl: `https://rawg.io/games/${game.slug}`,
        esrb: game.esrb_rating?.name ?? null,
        developers: (game.developers ?? []).slice(0, 3).map((d) => d.name),
        publishers: (game.publishers ?? []).slice(0, 2).map((p) => p.name),
        genres: (game.genres ?? []).map((g) => ({ id: g.id, name: g.name, slug: g.slug })),
        platforms: (game.parent_platforms ?? []).map((p) => ({
          id: p.platform.id,
          name: p.platform.name,
          slug: p.platform.slug,
        })),
        tags: (game.tags ?? [])
          .filter((t) => t.language === "eng")
          .slice(0, 12)
          .map((t) => ({ name: t.name, slug: t.slug })),
      },
      // A single game's details are very stable — cache for a day.
      { maxAge: 86_400 }
    );
  } catch (error) {
    return fail(error);
  }
};
