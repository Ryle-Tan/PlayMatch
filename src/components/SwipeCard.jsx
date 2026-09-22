import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import GameCard from "./GameCard.jsx";
import { IconCross, IconHeart, IconInfo } from "./icons.jsx";
import "./SwipeCard.css";

/** How far (px) a drag must travel to count as a decision. */
const COMMIT_DISTANCE = 110;

/** A fast flick counts even if it did not travel far. */
const COMMIT_VELOCITY = 500;

/*
 * Where the card flies off to, depending on the choice made.
 *
 * Every variant turns pointer events off: a card stays in the DOM
 * while it animates away, and without this it would keep catching
 * gestures aimed at the card now underneath it.
 */
const exitVariants = {
  exit: (action) => {
    const common = { opacity: 0, pointerEvents: "none" };
    switch (action) {
      case "like":
        return { ...common, x: 700, rotate: 22, transition: { duration: 0.32 } };
      case "nope":
        return { ...common, x: -700, rotate: -22, transition: { duration: 0.32 } };
      default:
        return { ...common, scale: 0.9, transition: { duration: 0.2 } };
    }
  },
};

/**
 * One card in the stack.
 *
 * The top card is draggable; the cards behind it are inert and only
 * provide depth, so a gesture can never land on the wrong card.
 */
export default function SwipeCard({ game, depth, isTop, onDecide, onDragStart }) {
  const prefersReduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Tilt with the drag, but stay flat for anyone who asked for less motion.
  const rotate = useTransform(x, [-300, 0, 300], prefersReduced ? [0, 0, 0] : [-16, 0, 16]);

  // Stamps fade in as you commit to a direction.
  const likeOpacity = useTransform(x, [40, 130], [0, 1]);
  const nopeOpacity = useTransform(x, [-40, -130], [0, 1]);
  const moreOpacity = useTransform(y, [-40, -130], [0, 1]);

  function handleDragEnd(_event, info) {
    const { offset, velocity } = info;

    // An upward drag only counts when it clearly beats the sideways one,
    // otherwise a sloppy diagonal would open details by accident.
    const mostlyVertical = Math.abs(offset.y) > Math.abs(offset.x) * 1.3;
    if (mostlyVertical && (offset.y < -COMMIT_DISTANCE || velocity.y < -COMMIT_VELOCITY)) {
      onDecide("more");
      return;
    }

    if (offset.x > COMMIT_DISTANCE || velocity.x > COMMIT_VELOCITY) {
      onDecide("like");
      return;
    }

    if (offset.x < -COMMIT_DISTANCE || velocity.x < -COMMIT_VELOCITY) {
      onDecide("nope");
    }
    // Anything else falls short, and dragSnapToOrigin returns the card.
  }

  return (
    <motion.div
      className={`swipe-card ${isTop ? "is-top" : ""}`}
      style={{
        x,
        y,
        rotate,
        zIndex: 10 - depth,
        // Depth offset uses `top`, not a transform, so it cannot
        // interfere with the drag transform.
        top: depth * 12,
      }}
      animate={{ scale: 1 - depth * 0.04 }}
      variants={exitVariants}
      exit="exit"
      drag={isTop}
      dragSnapToOrigin
      dragElastic={0.55}
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing" }}
    >
      <GameCard game={game} eager={depth === 0} />

      {isTop && (
        <>
          <motion.span
            className="stamp stamp--like swipe-card__stamp swipe-card__stamp--like"
            style={{ opacity: likeOpacity }}
            aria-hidden="true"
          >
            <IconHeart />
          </motion.span>

          <motion.span
            className="stamp stamp--nope swipe-card__stamp swipe-card__stamp--nope"
            style={{ opacity: nopeOpacity }}
            aria-hidden="true"
          >
            <IconCross />
          </motion.span>

          <motion.span
            className="stamp stamp--more swipe-card__stamp swipe-card__stamp--more"
            style={{ opacity: moreOpacity }}
            aria-hidden="true"
          >
            <IconInfo />
          </motion.span>
        </>
      )}
    </motion.div>
  );
}
