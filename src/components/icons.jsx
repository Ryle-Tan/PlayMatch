/**
 * The three swipe actions, drawn once and reused by both the buttons
 * and the drag stamps so they are literally the same artwork.
 *
 * All of them use currentColor, so each place they appear sets the
 * colour with plain CSS.
 */

export function IconCross({ className = "" }) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconHeart({ className = "" }) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20.4c-.3 0-.6-.1-.8-.3l-6.6-6.3a5.3 5.3 0 0 1 0-7.7 5.7 5.7 0 0 1 7.4 0 5.7 5.7 0 0 1 7.4 0 5.3 5.3 0 0 1 0 7.7l-6.6 6.3c-.2.2-.5.3-.8.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconInfo({ className = "" }) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 11v5.4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="7.6" r="1.3" fill="currentColor" />
    </svg>
  );
}
