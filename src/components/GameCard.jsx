import "./GameCard.css";

/** Metacritic's own colour bands: green / yellow / red. */
function metacriticTone(score) {
  if (score >= 75) return "good";
  if (score >= 50) return "mixed";
  return "poor";
}

/**
 * One game, shown as an arcade cabinet screen.
 * Purely presentational — the deck handles all the gestures.
 */
export default function GameCard({ game, eager = false }) {
  const year = game.released ? game.released.slice(0, 4) : "TBA";

  return (
    <article className="game-card">
      <div className="game-card__art">
        <img
          className="game-card__img"
          src={game.image}
          alt={`Cover art for ${game.name}`}
          loading={eager ? "eager" : "lazy"}
          draggable="false"
        />
        <div className="game-card__scrim" aria-hidden="true" />

        {game.metacritic != null && (
          <span
            className={`metacritic metacritic--${metacriticTone(game.metacritic)}`}
            title="Metacritic score"
          >
            <span className="stat-figure">{game.metacritic}</span>
          </span>
        )}
      </div>

      <div className="game-card__body">
        <h2 className="game-card__title">{game.name}</h2>

        <p className="game-card__meta">
          <span className="stat-figure">{year}</span>
          {game.rating > 0 && (
            <>
              <span className="game-card__dot" aria-hidden="true">·</span>
              <span>
                <span className="stat-figure">{game.rating.toFixed(1)}</span>
                <span className="game-card__muted"> / 5</span>
              </span>
            </>
          )}
          {game.playtime > 0 && (
            <>
              <span className="game-card__dot" aria-hidden="true">·</span>
              <span>
                <span className="stat-figure">{game.playtime}</span>
                <span className="game-card__muted"> h avg</span>
              </span>
            </>
          )}
        </p>

        {game.genres.length > 0 && (
          <ul className="tag-row" aria-label="Genres">
            {game.genres.slice(0, 3).map((genre) => (
              <li key={genre.id} className="tag">
                {genre.name}
              </li>
            ))}
          </ul>
        )}

        {game.platforms.length > 0 && (
          <p className="game-card__platforms">
            {game.platforms.map((p) => p.name).join(" · ")}
          </p>
        )}
      </div>
    </article>
  );
}
