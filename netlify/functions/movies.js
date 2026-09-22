/**
 * GET /.netlify/functions/movies?id=3498
 * Trailers. Plenty of games have none, so an empty list is a
 * normal, successful answer — the UI falls back to screenshots.
 */
import { rawgFetch, ok, fail, requireGameId, RawgError } from "../lib/rawg.js";

export default async (request) => {
  const params = new URL(request.url).searchParams;

  try {
    const id = requireGameId(params);
    const data = await rawgFetch(`/games/${id}/movies`);

    return ok(
      {
        results: (data.results ?? [])
          .map((movie) => ({
            id: movie.id,
            name: movie.name,
            preview: movie.preview ?? null,
            // RAWG offers a 480p and a "max" quality file.
            src: movie.data?.max ?? movie.data?.["480"] ?? null,
          }))
          .filter((movie) => movie.src),
      },
      { maxAge: 86_400 }
    );
  } catch (error) {
    if (error instanceof RawgError && error.code === "NOT_FOUND") {
      return ok({ results: [] }, { maxAge: 86_400 });
    }
    return fail(error);
  }
};
