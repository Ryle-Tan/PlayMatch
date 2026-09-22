import "./Logo.css";

/**
 * The PlayMatch logo: the swipe-card mark beside the wordmark.
 *
 * Laid out with CSS rather than as one fixed SVG so the two halves
 * can be balanced against each other and scaled together. The
 * wordmark is real HTML text, which means it uses the page's Lilita
 * One webfont — an SVG loaded as an image cannot reach page fonts.
 *
 * Everything sizes from a single `font-size` on the root element:
 * the mark's height is set in `em`, so changing that one value
 * scales the whole lockup as one unit.
 */
export function LogoLockup({ className = "", title }) {
  return (
    <span
      className={`logo-lockup ${className}`}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : "true"}
    >
      {/* viewBox is cropped tight to the artwork so the mark's height
          is predictable next to the text. */}
      <svg className="logo-lockup__mark" viewBox="14 10 92 104" fill="none" aria-hidden="true">
        <rect
          x="26" y="20" width="68" height="84" rx="16"
          fill="none" stroke="var(--neon-gold)" strokeWidth="9"
          transform="rotate(10 60 62)"
        />
        <path
          d="M62 84 C46 71 38 62 38 53 C38 45 44 40 51 40 C56 40 60 42.5 62 46.5 C64 42.5 68 40 73 40 C80 40 86 45 86 53 C86 62 78 71 62 84 Z"
          fill="var(--neon-orange)"
          transform="rotate(10 60 62)"
        />
      </svg>

      <span className="logo-lockup__word">PlayMatch</span>
    </span>
  );
}
