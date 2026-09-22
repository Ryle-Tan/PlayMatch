import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { useDeck } from "../hooks/useDeck.js";
import { useMatches } from "../hooks/useMatches.js";
import { buildQuery, describeFilters } from "../lib/filters.js";
import {
  getFilters,
  bumpSwipeCount,
  getSwipeCount,
  hasDragged,
  markDragged,
} from "../lib/storage.js";
import { errorTitle } from "../lib/errorCopy.js";

import SwipeCard from "./SwipeCard.jsx";
import { IconCross, IconHeart } from "./icons.jsx";
import SwipeControls from "./SwipeControls.jsx";
import Loader from "./Loader.jsx";
import ErrorState from "./ErrorState.jsx";
import EmptyState from "./EmptyState.jsx";
import "./SwipeDeck.css";

/** How many swipes unlock the Gamer Personality card. */
const UNLOCK_AT = 15;

/** Cards rendered at once. Two behind the top one is enough for depth. */
const VISIBLE = 3;

export default function SwipeDeck() {
  const navigate = useNavigate();

  // Read the saved filters once — re-reading on every render would
  // hand useDeck a brand new object and restart the deck endlessly.
  const filters = useMemo(() => getFilters(), []);
  const query = useMemo(() => buildQuery(filters), [filters]);

  const { queue, status, error, swipe, retry, isEmptyResult, isRunOut, isRefilling } =
    useDeck(query);

  const { add: addMatch, count: matchCount } = useMatches();
  const [swipeCount, setSwipeCount] = useState(() => getSwipeCount());
  const [lastAction, setLastAction] = useState(null);

  /*
   * Drag coaching.
   *
   * The hints stay up until the player has actually dragged a card —
   * pressing the buttons does not dismiss them, because tapping
   * buttons is the habit the hints are meant to break.
   */
  const [hintState, setHintState] = useState(() => (hasDragged() ? "gone" : "visible"));
  const [isDragging, setIsDragging] = useState(false);

  const retireHint = useCallback(() => {
    markDragged();
    setHintState((state) => (state === "visible" ? "fading" : state));
  }, []);

  // Let the fade finish before taking the hints out of the DOM.
  useEffect(() => {
    if (hintState !== "fading") return;
    const timer = setTimeout(() => setHintState("gone"), 700);
    return () => clearTimeout(timer);
  }, [hintState]);

  const top = queue[0] ?? null;

  const decide = useCallback(
    (action, source = "button") => {
      if (!top) return;

      // Only a real drag proves the gesture has been learned.
      if (source === "drag") retireHint();

      // "More" opens the details view and deliberately leaves the card
      // in the deck, so you can still like or pass it afterwards.
      if (action === "more") {
        navigate(`/game/${top.id}`);
        return;
      }

      if (action === "like") addMatch(top);

      setLastAction(action);
      swipe(top);
      setSwipeCount(bumpSwipeCount());
    },
    [top, addMatch, swipe, navigate, retireHint]
  );

  // Arrow keys mirror the gestures, so the deck is fully usable
  // without a mouse or a touchscreen.
  useEffect(() => {
    function onKeyDown(event) {
      // Never hijack typing or a focused control.
      const tag = event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const action = { ArrowLeft: "nope", ArrowRight: "like", ArrowUp: "more" }[event.key];
      if (!action) return;

      event.preventDefault();
      decide(action);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [decide]);

  const unlocked = swipeCount >= UNLOCK_AT;
  const remaining = Math.max(0, UNLOCK_AT - swipeCount);

  // ---- Screens that replace the deck entirely ----

  if (status === "loading" && queue.length === 0) {
    return <Loader label="DEALING CARDS" />;
  }

  if (status === "error" && queue.length === 0) {
    return (
      <ErrorState title={errorTitle(error.code)} message={error.message} onRetry={retry} />
    );
  }

  if (isEmptyResult) {
    return (
      <EmptyState
        icon="⌀"
        title="No games matched"
        message="Those filters are a bit too narrow. Try removing one and dealing again."
        action={
          <Link to="/filters" className="btn">
            Change filters
          </Link>
        }
      />
    );
  }

  if (isRunOut) {
    return (
      <EmptyState
        icon="✦"
        title="Deck cleared"
        message={`You swiped through every game matching these filters. You have ${matchCount} match${matchCount === 1 ? "" : "es"}.`}
        action={
          <div className="deck__empty-actions">
            <Link to="/filters" className="btn">
              New filters
            </Link>
            <Link to="/matches" className="btn btn--ghost">
              View matches
            </Link>
          </div>
        }
      />
    );
  }

  // ---- The deck ----

  return (
    <div className="deck">
      <div className="deck__bar">
        <div className="deck__filters">
          <p className="eyebrow deck__filters-label">Dealing</p>
          <p className="deck__filters-value">{describeFilters(filters)}</p>
        </div>

        <div className="deck__bar-actions">
          <Link to="/filters" className="btn btn--ghost btn--sm">
            Filters
          </Link>
          <Link to="/matches" className="btn btn--ghost btn--sm">
            Matches <span className="stat-figure">{matchCount}</span>
          </Link>
        </div>
      </div>

      <div className="deck__stage">
        <AnimatePresence custom={lastAction} initial={false}>
          {queue.slice(0, VISIBLE).map((game, index) => (
            <SwipeCard
              key={game.id}
              game={game}
              depth={index}
              isTop={index === 0}
              onDecide={decide}
              onDragStart={index === 0 ? () => setIsDragging(true) : undefined}
              onDragEnd={index === 0 ? () => setIsDragging(false) : undefined}
            />
          ))}
        </AnimatePresence>

        {/* Shown once, to anyone who has never swiped before. */}
        {top && hintState !== "gone" && (
          <div
            className={`drag-hint ${hintState === "fading" ? "is-fading" : ""} ${
              isDragging ? "is-dragging" : ""
            }`}
            aria-hidden="true"
          >
            <span className="drag-hint__side drag-hint__side--left">
              <span className="drag-hint__badge">
                <IconCross />
              </span>
              <span className="drag-hint__label">Drag ←</span>
            </span>

            <span className="drag-hint__nudge">Drag a card</span>

            <span className="drag-hint__side drag-hint__side--right">
              <span className="drag-hint__badge">
                <IconHeart />
              </span>
              <span className="drag-hint__label">→ Drag</span>
            </span>
          </div>
        )}

        {/* The deck is briefly empty while the next page arrives. */}
        {queue.length === 0 && <Loader label="DEALING CARDS" />}
      </div>

      <SwipeControls onDecide={decide} disabled={!top} />

      <div className="deck__status">
        {unlocked ? (
          <Link to="/result" className="btn btn--sm deck__unlock">
            Personality ready
          </Link>
        ) : (
          <p className="deck__progress">
            <span className="stat-figure">{remaining}</span> more swipe
            {remaining === 1 ? "" : "s"} to unlock your gamer personality
          </p>
        )}

        {isRefilling && <p className="deck__refill">Loading more games…</p>}
      </div>

      <p className="deck__hint">
        Drag the card, use the buttons, or press{" "}
        <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd>
      </p>
    </div>
  );
}
