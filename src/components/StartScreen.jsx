import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGenres } from "../lib/api.js";
import { errorTitle } from "../lib/errorCopy.js";
import Loader from "./Loader.jsx";
import ErrorState from "./ErrorState.jsx";
import ControllerIcon from "./ControllerIcon.jsx";
import "./StartScreen.css";

/**
 * The attract screen.
 *
 * It also quietly checks that the Netlify Function proxy is reachable,
 * because nothing else in the app works if it is not.
 */
export default function StartScreen() {
  const [status, setStatus] = useState("checking"); // checking | ready | error
  const [error, setError] = useState(null); // an ApiError: has .code and .message
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
        setError(err);
        setStatus("error");
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="start">
      {/* Solid colour discs that peek out from behind the panel. */}
      <div className="start__stage">
        <span className="start__disc start__disc--teal" aria-hidden="true" />
        <span className="start__disc start__disc--gold" aria-hidden="true" />
        <span className="start__disc start__disc--orange" aria-hidden="true" />
        <span className="start__disc start__disc--teal-sm" aria-hidden="true" />

        <div className="start__panel">
          <div className="start__hero">
            <div className="starburst" aria-hidden="true" />
            <h1 className="start__title">PlayMatch</h1>
          </div>

          <p className="start__tagline">Swipe · Match · Play</p>

          <ControllerIcon className="start__controller" />

          <p className="start__pitch">
            Swipe through thousands of video games, keep the ones you like, and
            discover your gamer personality.
          </p>

          <div className="start__cta">
            {status === "checking" && <Loader label="BOOTING" />}

            {status === "error" && (
              <ErrorState
                title={errorTitle(error.code)}
                message={error.message}
                onRetry={() => setAttempt((n) => n + 1)}
              />
            )}

            {status === "ready" && (
              <>
                <Link to="/filters" className="btn btn--lg start__coin">
                  Insert coin
                </Link>
                <p className="start__ready">
                  <span className="start__led" aria-hidden="true" />
                  System ready — <span className="stat-figure">{genreCount}</span> genres loaded
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
