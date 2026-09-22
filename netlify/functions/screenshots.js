/**
 * GET /.netlify/functions/screenshots?id=3498
 * Gallery images for the details view.
 */
import { rawgFetch, ok, fail, requireGameId, RawgError } from "../lib/rawg.js";

export default async (request) => {
  const params = new URL(request.url).searchParams;

  try {
    const id = requireGameId(params);
    const data = await rawgFetch(`/games/${id}/screenshots`, { page_size: 10 });

    return ok(
      {
        results: (data.results ?? [])
          .filter((shot) => shot.image)
          .map((shot) => ({ id: shot.id, image: shot.image })),
      },
      { maxAge: 86_400 }
    );
  } catch (error) {
    // No screenshots is a normal outcome, not a failure.
    if (error instanceof RawgError && error.code === "NOT_FOUND") {
      return ok({ results: [] }, { maxAge: 86_400 });
    }
    return fail(error);
  }
};
