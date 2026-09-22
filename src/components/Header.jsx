import { Link } from "react-router-dom";
import { LogoLockup } from "./Logo.jsx";
import "./Header.css";

/**
 * Compact logo shown at the top of every screen except the start
 * screen, which shows the same lockup at hero size.
 */
export default function Header({ children }) {
  return (
    <header className="site-header">
      <Link to="/" className="wordmark" aria-label="PlayMatch — back to start">
        <LogoLockup />
      </Link>
      {children && <nav className="site-header__nav">{children}</nav>}
    </header>
  );
}
