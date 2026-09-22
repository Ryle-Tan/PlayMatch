import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGenres } from "../lib/api.js";
import Loader from "./Loader.jsx";
import ErrorState from "./ErrorState.jsx";
import "./StartScreen.css";

/**
 * The cabinet's attract screen.
 *
 * It also quietly checks that the Netlify Function proxy is reachable,
 * because nothing else in the app works if it is not.
 */
export default function StartScreen() {
  const [status, setStatus] = useState("checking"); // checking | ready | error
  const [error, setError] = useState(null);
  const [genreCount, setGenreCount] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("checking");

    getGenres({ signal: controller.signal })
      .then((data) => {
        setGenreCount(data.results?.length ?? 0);
        setStatus("ready");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="start">
      <div className="start__logo">
        <h1 className="start__title">
          <span className="start__title-play">PLAY</span>
          <span className="start__title-match">MATCH</span>
        </h1>
        <p className="start__tagline">SWIPE · MATCH · PLAY</p>
      </div>

      <p className="start__pitch">
        Swipe through thousands of video games, keep the ones you like, and
        discover your gamer personality.
      </p>

      <div className="start__cabinet">
        {status === "checking" && <Loader label="BOOTING" />}

        {status === "error" && (
          <ErrorState
            title="NO CONNECTION"
            message={error}
            onRetry={() => setAttempt((n) => n + 1)}
          />
        )}

        {status === "ready" && (
          <>
            <Link to="/filters" className="pixel-btn pixel-btn--magenta start__coin">
              INSERT COIN
            </Link>
            <p className="start__ready">
              <span className="start__led" aria-hidden="true" />
              SYSTEM READY — {genreCount} GENRES LOADED
            </p>
          </>
        )}
      </div>
    </div>
  );
}
