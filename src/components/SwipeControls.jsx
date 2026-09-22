import { IconCross, IconHeart, IconInfo } from "./icons.jsx";
import "./SwipeControls.css";

/**
 * The button row under the deck.
 *
 * These call exactly the same handler as a drag gesture, and carry
 * exactly the same icons as the drag stamps, so desktop users,
 * keyboard users and touch users all read the same language.
 */
export default function SwipeControls({ onDecide, disabled }) {
  return (
    <div className="controls" role="group" aria-label="Swipe actions">
      <button
        type="button"
        className="ctrl ctrl--nope"
        onClick={() => onDecide("nope")}
        disabled={disabled}
        aria-label="Pass on this game (left arrow key)"
        title="Pass — drag left or press ←"
      >
        <IconCross />
      </button>

      <button
        type="button"
        className="ctrl ctrl--more"
        onClick={() => onDecide("more")}
        disabled={disabled}
        aria-label="See more about this game (up arrow key)"
        title="Info — drag up or press ↑"
      >
        <IconInfo />
      </button>

      <button
        type="button"
        className="ctrl ctrl--like"
        onClick={() => onDecide("like")}
        disabled={disabled}
        aria-label="Like this game (right arrow key)"
        title="Like — drag right or press →"
      >
        <IconHeart />
      </button>
    </div>
  );
}
