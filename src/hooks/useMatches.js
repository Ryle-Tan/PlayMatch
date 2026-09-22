import { useCallback, useEffect, useState } from "react";
import {
  getMatches,
  addMatch as persistMatch,
  removeMatch as dropMatch,
  clearMatches as wipeMatches,
} from "../lib/storage.js";

/**
 * The liked-games list, kept in sync with localStorage.
 *
 * Also listens for the browser's `storage` event so the list stays
 * correct if PlayMatch is open in two tabs at once.
 */
export function useMatches() {
  const [matches, setMatches] = useState(() => getMatches());

  useEffect(() => {
    const sync = (event) => {
      if (event.key === null || event.key === "playmatch:matches") {
        setMatches(getMatches());
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const add = useCallback((game) => setMatches(persistMatch(game)), []);
  const remove = useCallback((id) => setMatches(dropMatch(id)), []);
  const clear = useCallback(() => setMatches(wipeMatches()), []);

  const isMatched = useCallback(
    (id) => matches.some((m) => m.id === id),
    [matches]
  );

  return { matches, add, remove, clear, isMatched, count: matches.length };
}
