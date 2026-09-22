/**
 * The dark arcade room behind every screen: a faint neon wash plus a
 * field of slowly drifting game symbols. Decorative only.
 *
 * Positions are fixed rather than random so the layout is stable
 * between renders, and the count stays low so phones do not have to
 * animate a crowd of elements.
 */

const SYMBOLS = [
  // Spread two to a side, well clear of the centre where content sits.
  { glyph: "○", tone: "teal",   top: "10%", left: "7%",  size: 34, delay: "0s" },
  { glyph: "+", tone: "gold",   top: "9%",  left: "62%", size: 30, delay: "-4s" },
  { glyph: "□", tone: "orange", top: "34%", left: "90%", size: 28, delay: "-8s" },
  { glyph: "△", tone: "teal",   top: "66%", left: "93%", size: 32, delay: "-12s" },
  { glyph: "○", tone: "gold",   top: "86%", left: "70%", size: 26, delay: "-2s" },
  { glyph: "□", tone: "teal",   top: "89%", left: "26%", size: 30, delay: "-6s" },
  { glyph: "△", tone: "orange", top: "64%", left: "5%",  size: 28, delay: "-10s" },
  { glyph: "+", tone: "gold",   top: "38%", left: "3%",  size: 34, delay: "-14s" },
];

export default function ArcadeBackdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__wash" />

      {SYMBOLS.map((s, i) => (
        <span
          key={i}
          className={`symbol symbol--${s.tone}`}
          style={{
            top: s.top,
            left: s.left,
            fontSize: `${s.size}px`,
            animationDelay: s.delay,
          }}
        >
          {s.glyph}
        </span>
      ))}
    </div>
  );
}
