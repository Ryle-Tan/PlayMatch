/**
 * The PlayMatch logo: two tilted swipe cards with a heart.
 *
 * Inlined rather than loaded from /public as an <img> for two reasons:
 *   1. An <img> SVG is an isolated document, so it cannot use the
 *      page's Lilita One webfont — the wordmark would silently fall
 *      back to Helvetica.
 *   2. Inlined, the shapes can read the theme's CSS variables, so the
 *      logo stays in step with the palette.
 *
 * The original files stay in /public as the source assets, and the
 * icon is also used directly as the browser tab icon.
 */

/** The icon on its own: a mark for tight spaces. */
function Mark() {
  return (
    <>
      {/* Card behind, tilted the other way */}
      <rect
        x="26" y="20" width="68" height="84" rx="16"
        fill="none" stroke="var(--neon-teal)" strokeWidth="8"
        transform="rotate(-14 60 62)" opacity="0.55"
      />
      {/* Card in front */}
      <rect
        x="26" y="20" width="68" height="84" rx="16"
        fill="none" stroke="var(--neon-gold)" strokeWidth="9"
        transform="rotate(10 60 62)"
      />
      {/* The match */}
      <path
        d="M62 84 C46 71 38 62 38 53 C38 45 44 40 51 40 C56 40 60 42.5 62 46.5 C64 42.5 68 40 73 40 C80 40 86 45 86 53 C86 62 78 71 62 84 Z"
        fill="var(--neon-orange)"
        transform="rotate(10 60 62)"
      />
    </>
  );
}

/** Icon only. */
export function LogoMark({ className = "", title }) {
  return (
    <svg
      className={`logo logo--mark ${className}`}
      viewBox="0 0 120 120"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
    >
      {title && <title>{title}</title>}
      <Mark />
    </svg>
  );
}

/** Icon plus the PLAYMATCH wordmark. */
export function LogoLockup({ className = "", title }) {
  return (
    <svg
      className={`logo logo--lockup ${className}`}
      viewBox="0 0 520 120"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
    >
      {title && <title>{title}</title>}
      <Mark />
      <text
        x="130"
        y="78"
        fontFamily="var(--font-title)"
        fontSize="56"
        letterSpacing="1"
        fill="var(--neon-gold)"
      >
        PLAY
        <tspan fill="var(--cream)">MATCH</tspan>
      </text>
    </svg>
  );
}
