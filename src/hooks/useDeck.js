import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getGames } from "../lib/api.js";
import { getSeen, addSeen } from "../lib/storage.js";

/** RAWG page size. 20 is a good trade: one request fills the deck for a while. */
const PAGE_SIZE = 20;

/** Fetch the next page once the deck drops to this many cards. */
const LOW_WATER = 5;

/**
 * If this many pages in a row give us nothing usable (all seen, or all
 * missing cover art) we stop asking. Without this the hook could walk
 * through hundreds of pages spending RAWG requests for nothing.
 */
const MAX_BARREN_PAGES = 6;

/** Fisher-Yates, so the deck is not in the same order on every visit. */
function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Supplies the swipe deck with games.
 *
 * @param {object} query  RAWG params from buildQuery()
 * @returns deck state plus a swipe() to drop the top card
 */
export function useDeck(query) {
  // A stable string so the effect only re-runs when the filters truly change.
  const queryKey = useMemo(() => JSON.stringify(query ?? {}), [query]);

  const [queue, setQueue] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [exhausted, setExhausted] = useState(false);
  const [everLoaded, setEverLoaded] = useState(0);

  // Bookkeeping that must not cause re-renders.
  const ref = useRef({
    page: 1,
    hasNext: true,
    inFlight: false,
    barren: 0,
    seen: new Set(),
    queued: new Set(),
    controller: null,
  });

  const loadMore = useCallback(async () => {
    const s = ref.current;
    if (s.inFlight || !s.hasNext) return;

    s.inFlight = true;
    const controller = new AbortController();
    s.controller = controller;

    try {
      const data = await getGames(
        { ...JSON.parse(queryKey), page: s.page, page_size: PAGE_SIZE },
        { signal: controller.signal }
      );

      // Drop games with no cover art, ones already swiped, and any
      // duplicate RAWG happens to return across pages.
      const usable = (data.results ?? []).filter(
        (game) => game.image && !s.seen.has(game.id) && !s.queued.has(game.id)
      );
      usable.forEach((game) => s.queued.add(game.id));

      s.page += 1;
      s.hasNext = Boolean(data.hasNext);
      s.barren = usable.length > 0 ? 0 : s.barren + 1;

      if (usable.length) {
        setQueue((prev) => [...prev, ...shuffle(usable)]);
        setEverLoaded((n) => n + usable.length);
      }

      if (!s.hasNext || s.barren >= MAX_BARREN_PAGES) setExhausted(true);
      setStatus("ready");
      setError(null);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err);
      setStatus("error");
    } finally {
      s.inFlight = false;
    }
  }, [queryKey]);

  // Start over whenever the filters change.
  useEffect(() => {
    const s = ref.current;
    s.controller?.abort();
    s.page = 1;
    s.hasNext = true;
    s.inFlight = false;
    s.barren = 0;
    s.queued = new Set();
    s.seen = getSeen();

    setQueue([]);
    setExhausted(false);
    setEverLoaded(0);
    setError(null);
    setStatus("loading");

    loadMore();

    return () => s.controller?.abort();
  }, [loadMore]);

  // Top the deck up before it runs dry.
  useEffect(() => {
    if (status !== "ready" || exhausted) return;
    if (queue.length >= LOW_WATER) return;
    loadMore();
  }, [queue.length, status, exhausted, loadMore]);

  /** Remove the top card and remember that it has been seen. */
  const swipe = useCallback((game) => {
    ref.current.seen.add(game.id);
    addSeen(game.id);
    setQueue((prev) => prev.filter((item) => item.id !== game.id));
  }, []);

  const retry = useCallback(() => {
    setStatus("loading");
    setError(null);
    loadMore();
  }, [loadMore]);

  // "No games matched these filters" and "you swiped through them all"
  // are different situations and need different empty states.
  const isEmptyResult = status === "ready" && exhausted && everLoaded === 0;
  const isRunOut = status === "ready" && exhausted && queue.length === 0 && everLoaded > 0;

  return {
    queue,
    status,
    error,
    swipe,
    retry,
    isEmptyResult,
    isRunOut,
    isRefilling: queue.length > 0 && queue.length < LOW_WATER && !exhausted,
  };
}
