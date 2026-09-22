import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGenres } from "../lib/api.js";
import { errorTitle } from "../lib/errorCopy.js";
import { PLATFORMS, ERAS } from "../lib/filters.js";
import { getFilters, saveFilters, EMPTY_FILTERS } from "../lib/storage.js";
import Loader from "./Loader.jsx";
import ErrorState from "./ErrorState.jsx";
import "./FilterScreen.css";

/**
 * Choose what goes in the deck.
 *
 * Every group is multi-select, and leaving a group empty means
 * "no limit" rather than "nothing" — that keeps the common case
 * (just hit start) working without any choices at all.
 */
export default function FilterScreen() {
  const navigate = useNavigate();

  const [genres, setGenres] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [filters, setFilters] = useState(() => getFilters());

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    getGenres({ signal: controller.signal })
      .then((data) => {
        setGenres(data.results ?? []);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err);
        setStatus("error");
      });

    return () => controller.abort();
  }, [attempt]);

  /** Add or remove one value from a filter group. */
  function toggle(group, value) {
    setFilters((prev) => {
      const current = prev[group];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [group]: next };
    });
  }

  function start() {
    saveFilters(filters);
    navigate("/swipe");
  }

  function reset() {
    setFilters({ ...EMPTY_FILTERS });
  }

  const totalChosen =
    filters.platforms.length + filters.genres.length + filters.eras.length;

  if (status === "loading") {
    return <Loader label="LOADING FILTERS" />;
  }

  if (status === "error") {
    return (
      <ErrorState
        title={errorTitle(error.code)}
        message={error.message}
        onRetry={() => setAttempt((n) => n + 1)}
      />
    );
  }

  return (
    <div className="filters">
      <div className="filters__intro">
        <h1 className="filters__heading">Choose your deck</h1>
        <p className="filters__sub">
          Pick as many as you like, or skip straight to swiping. Empty means
          everything.
        </p>
      </div>

      <fieldset className="filter-group">
        <legend className="filter-group__legend">Platform</legend>
        <div className="chip-row">
          {PLATFORMS.map((platform) => (
            <Chip
              key={platform.key}
              selected={filters.platforms.includes(platform.key)}
              onClick={() => toggle("platforms", platform.key)}
              tone="teal"
            >
              <span aria-hidden="true" className="chip__icon">{platform.icon}</span>
              {platform.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend className="filter-group__legend">Era</legend>
        <div className="chip-row">
          {ERAS.map((era) => (
            <Chip
              key={era.key}
              selected={filters.eras.includes(era.key)}
              onClick={() => toggle("eras", era.key)}
              tone="orange"
            >
              {era.label}
              <span className="chip__sub">{era.sub}</span>
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend className="filter-group__legend">Genre</legend>
        <div className="chip-row">
          {genres.map((genre) => (
            <Chip
              key={genre.id}
              selected={filters.genres.includes(String(genre.id))}
              onClick={() => toggle("genres", String(genre.id))}
              tone="gold"
            >
              {genre.name}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="filters__actions">
        <button type="button" className="btn btn--lg" onClick={start}>
          Start swiping
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={reset}
          disabled={totalChosen === 0}
        >
          Clear {totalChosen > 0 ? `(${totalChosen})` : ""}
        </button>
      </div>
    </div>
  );
}

/** A toggle button. aria-pressed tells screen readers it is a switch. */
function Chip({ selected, onClick, tone, children }) {
  return (
    <button
      type="button"
      className={`chip chip--${tone} ${selected ? "is-selected" : ""}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
