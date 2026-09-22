/**
 * Neon line-art game controller.
 *
 * Drawn as strokes only, tinted teal with gold and orange accents,
 * and lit with a CSS drop-shadow so the glow follows the line art
 * rather than sitting in a box behind it.
 */
export default function ControllerIcon({ className = "" }) {
  return (
    <svg
      className={`controller ${className}`}
      viewBox="0 0 128 80"
      fill="none"
      role="img"
      aria-label="Game controller"
    >
      {/* Body */}
      <path
        d="M38 20h52c16.6 0 30 13.4 30 30 0 9.4-7.6 17-17 17-5.1 0-9.9-2.3-13.1-6.2L83.6 52H44.4l-6.3 8.8C34.9 64.7 30.1 67 25 67 15.6 67 8 59.4 8 50c0-16.6 13.4-30 30-30Z"
        stroke="var(--neon-teal)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* D-pad */}
      <path
        d="M30 34v16M22 42h16"
        stroke="var(--neon-gold)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Face buttons */}
      <circle cx="94" cy="34" r="5" stroke="var(--neon-orange)" strokeWidth="3.5" />
      <circle cx="106" cy="46" r="5" stroke="var(--neon-gold)" strokeWidth="3.5" />
      <circle cx="82" cy="46" r="5" stroke="var(--neon-teal)" strokeWidth="3.5" />

      {/* Centre detail */}
      <path
        d="M58 36h12M58 43h12"
        stroke="var(--neon-teal)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}
