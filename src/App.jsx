import { Routes, Route, Navigate, Link } from "react-router-dom";
import StartScreen from "./components/StartScreen.jsx";
import Footer from "./components/Footer.jsx";
import EmptyState from "./components/EmptyState.jsx";

/** Temporary stand-in for screens built in later steps. */
function ComingSoon({ name }) {
  return (
    <EmptyState
      icon="▦"
      title={`${name} — COMING SOON`}
      message="This screen gets built in a later step."
      action={
        <Link to="/" className="pixel-btn pixel-btn--ghost">
          BACK TO START
        </Link>
      }
    />
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/filters" element={<ComingSoon name="FILTERS" />} />
          <Route path="/swipe" element={<ComingSoon name="SWIPE DECK" />} />
          <Route path="/game/:id" element={<ComingSoon name="GAME DETAILS" />} />
          <Route path="/matches" element={<ComingSoon name="MATCH LIST" />} />
          <Route path="/result" element={<ComingSoon name="GAMER PERSONALITY" />} />
          {/* Anything unknown goes back to the attract screen. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Sits above everything and ignores clicks — purely cosmetic. */}
      <div className="crt-overlay" aria-hidden="true" />
    </div>
  );
}
