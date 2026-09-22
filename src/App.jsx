import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import StartScreen from "./components/StartScreen.jsx";
import FilterScreen from "./components/FilterScreen.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";
import ArcadeBackdrop from "./components/ArcadeBackdrop.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import EmptyState from "./components/EmptyState.jsx";

/** Temporary stand-in for screens built in later steps. */
function ComingSoon({ name }) {
  return (
    <EmptyState
      icon="▦"
      title={`${name} — coming soon`}
      message="This screen gets built in a later step."
      action={
        <Link to="/" className="btn btn--ghost">
          Back to start
        </Link>
      }
    />
  );
}

export default function App() {
  const { pathname } = useLocation();

  // The start screen carries its own oversized title, so the compact
  // wordmark would only repeat it.
  const showHeader = pathname !== "/";

  return (
    <>
      <ArcadeBackdrop />

      <div className="app-shell">
        {showHeader && <Header />}

        <main className="app-main">
          <Routes>
            <Route path="/" element={<StartScreen />} />
            <Route path="/filters" element={<FilterScreen />} />
            <Route path="/swipe" element={<SwipeDeck />} />
            <Route path="/game/:id" element={<ComingSoon name="Game details" />} />
            <Route path="/matches" element={<ComingSoon name="Match list" />} />
            <Route path="/result" element={<ComingSoon name="Gamer personality" />} />
            {/* Anything unknown goes back to the attract screen. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </>
  );
}
