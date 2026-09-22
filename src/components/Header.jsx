import { Link } from "react-router-dom";
import "./Header.css";

/**
 * Compact neon wordmark shown at the top of every screen except the
 * start screen, which has its own oversized title.
 */
export default function Header({ children }) {
  return (
    <header className="site-header">
      <Link to="/" className="wordmark" aria-label="PlayMatch — back to start">
        PlayMatch
      </Link>
      {children && <nav className="site-header__nav">{children}</nav>}
    </header>
  );
}
