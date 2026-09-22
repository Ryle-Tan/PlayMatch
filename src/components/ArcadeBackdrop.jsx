/**
 * The dark arcade room behind every screen: a faint neon wash plus a
 * field of slowly drifting game symbols. Decorative only.
 *
 * Positions are fixed rather than random so the layout is stable
 * between renders, and the count stays low so phones do not have to
 * animate a crowd of elements.
 */

const SYMBOLS = [
  { glyph: "○", tone: "teal",   top: "12%", left: "8%",  size: 30, delay: "0s" },
  { glyph: "□", tone: "gold",   top: "24%", left: "86%", size: 24, delay: "-3s" },
  { glyph: "△", tone: "orange", top: "62%", left: "14%", size: 28, delay: "-6s" },
  { glyph: "+", tone: "teal",   top: "78%", left: "78%", size: 34, delay: "-9s" },
  { glyph: "○", tone: "gold",   top: "46%", left: "92%", size: 20, delay: "-2s" },
  { glyph: "□", tone: "orange", top: "86%", left: "42%", size: 22, delay: "-7s" },
  { glyph: "△", tone: "teal",   top: "8%",  left: "58%", size: 22, delay: "-11s" },
  { glyph: "+", tone: "gold",   top: "56%", left: "4%",  size: 26, delay: "-5s" },
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
