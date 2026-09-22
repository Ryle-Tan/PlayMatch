import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { getGameDetails, getScreenshots, getMovies } from "../lib/api.js";
import { errorTitle } from "../lib/errorCopy.js";
import { addSeen, bumpSwipeCount } from "../lib/storage.js";
import { useMatches } from "../hooks/useMatches.js";

import Loader from "./Loader.jsx";
import ErrorState from "./ErrorState.jsx";
import ScreenshotGallery from "./ScreenshotGallery.jsx";
import TrailerPlayer from "./TrailerPlayer.jsx";
import "./DetailsView.css";

/** Longer descriptions get collapsed behind a "read more". */
const DESCRIPTION_LIMIT = 340;

export default function DetailsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add: addMatch, isMatched } = useMatches();

  const [game, setGame] = useState(null);
  const [shots, setShots] = useState([]);
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    setStatus("loading");
    setExpanded(false);
    window.scrollTo(0, 0);

    (async () => {
      // The game itself is essential: if this fails there is nothing to show.
      try {
        const details = await getGameDetails(id, { signal: controller.signal });
        if (!alive) return;
        setGame(details);
        setStatus("ready");
      } catch (err) {
        if (err.name === "AbortError" || !alive) return;
        setError(err);
        setStatus("error");
        return;
      }

      // Screenshots and trailers are extras. Plenty of games have neither,
      // so a failure here just means less media, never an error screen.
      const [shotResult, movieResult] = await Promise.allSettled([
        getScreenshots(id, { signal: controller.signal }),
        getMovies(id, { signal: controller.signal }),
      ]);
      if (!alive) return;
      if (shotResult.status === "fulfilled") setShots(shotResult.value.results ?? []);
      if (movieResult.status === "fulfilled") setMovies(movieResult.value.results ?? []);
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [id, attempt]);

  /**
   * Liking or passing here counts exactly the same as swiping on the deck:
   * the game is remembered as seen so it will not be dealt again.
   */
  function decide(action) {
    if (!game) return;
    if (action === "like") addMatch(game);
    addSeen(game.id); // game.id is a number, matching what the deck stores
    bumpSwipeCount();
    navigate("/swipe");
  }

  if (status === "loading") return <Loader label="LOADING GAME" />;

  if (status === "error") {
    return (
      <ErrorState
        title={errorTitle(error.code)}
        message={error.message}
        onRetry={() => setAttempt((n) => n + 1)}
      />
    );
  }

  const year = game.released ? game.released.slice(0, 4) : "TBA";
  const trailer = movies[0] ?? null;
  const description = game.description || "";
  const needsClamp = description.length > DESCRIPTION_LIMIT;
  const shownDescription =
    needsClamp && !expanded ? `${description.slice(0, DESCRIPTION_LIMIT).trimEnd()}…` : description;

  return (
    <article className="details">
      <Link to="/swipe" className="details__back">
        ← Back to deck
      </Link>

      {/* Hero */}
      <header className="details__hero">
        {game.image && (
          <img className="details__hero-img" src={game.image} alt="" loading="eager" />
        )}
        <div className="details__hero-scrim" aria-hidden="true" />
        <div className="details__hero-text">
          <h1 className="details__title">{game.name}</h1>
          <p className="details__facts">
            <span className="stat-figure">{year}</span>
            {game.metacritic != null && (
              <>
                <span aria-hidden="true"> · </span>
                <span>
                  Metacritic <span className="stat-figure">{game.metacritic}</span>
                </span>
              </>
            )}
            {game.playtime > 0 && (
              <>
                <span aria-hidden="true"> · </span>
                <span>
                  <span className="stat-figure">{game.playtime}</span> h average
                </span>
              </>
            )}
          </p>
        </div>
      </header>

      {isMatched(game.id) && (
        <p className="details__matched">Already in your matches</p>
      )}

      {/* Media: trailer when there is one, screenshots either way. */}
      <section className="details__section">
        <h2 className="details__h2">{trailer ? "Trailer" : "Screenshots"}</h2>

        {trailer ? (
          <div className="details__media">
            <TrailerPlayer movie={trailer} />
            <ScreenshotGallery shots={shots} gameName={game.name} />
          </div>
        ) : shots.length > 0 ? (
          <ScreenshotGallery shots={shots} gameName={game.name} />
        ) : (
          <p className="details__none">
            No trailer or screenshots on RAWG for this one.
          </p>
        )}
      </section>

      {/* About */}
      {description && (
        <section className="details__section">
          <h2 className="details__h2">About</h2>
          <p className="details__description">{shownDescription}</p>
          {needsClamp && (
            <button
              type="button"
              className="details__more"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </section>
      )}

      {/* Credits and tags */}
      <section className="details__section">
        <dl className="spec">
          {game.developers.length > 0 && (
            <>
              <dt>Developer</dt>
              <dd>{game.developers.join(", ")}</dd>
            </>
          )}
          {game.publishers.length > 0 && (
            <>
              <dt>Publisher</dt>
              <dd>{game.publishers.join(", ")}</dd>
            </>
          )}
          {game.released && (
            <>
              <dt>Released</dt>
              <dd className="stat-figure">{game.released}</dd>
            </>
          )}
          {game.esrb && (
            <>
              <dt>Rating</dt>
              <dd>{game.esrb}</dd>
            </>
          )}
          {game.platforms.length > 0 && (
            <>
              <dt>Platforms</dt>
              <dd>{game.platforms.map((p) => p.name).join(" · ")}</dd>
            </>
          )}
        </dl>

        {game.genres.length > 0 && (
          <ul className="tag-row details__genres" aria-label="Genres">
            {game.genres.map((genre) => (
              <li key={genre.id} className="tag">
                {genre.name}
              </li>
            ))}
          </ul>
        )}

        <a
          className="details__rawg"
          href={game.rawgUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          View on RAWG ↗
        </a>
      </section>

      {/* Decide without going back to the deck first. */}
      <div className="details__actions">
        <button type="button" className="btn btn--orange" onClick={() => decide("nope")}>
          Pass
        </button>
        <button type="button" className="btn" onClick={() => decide("like")}>
          Like
        </button>
      </div>
    </article>
  );
}
