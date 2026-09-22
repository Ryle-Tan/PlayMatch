import { useState } from "react";
import "./ScreenshotGallery.css";

/**
 * A large image with a thumbnail strip underneath.
 *
 * Thumbnails are real buttons so the gallery works with a keyboard
 * and announces itself properly to a screen reader.
 */
export default function ScreenshotGallery({ shots, gameName }) {
  const [active, setActive] = useState(0);

  if (!shots.length) return null;

  const current = shots[Math.min(active, shots.length - 1)];

  return (
    <div className="gallery">
      <div className="gallery__main">
        <img
          src={current.image}
          alt={`Screenshot ${active + 1} of ${shots.length} from ${gameName}`}
          loading="lazy"
        />
      </div>

      {shots.length > 1 && (
        <ul className="gallery__strip">
          {shots.map((shot, index) => (
            <li key={shot.id}>
              <button
                type="button"
                className={`gallery__thumb ${index === active ? "is-active" : ""}`}
                onClick={() => setActive(index)}
                aria-label={`Show screenshot ${index + 1}`}
                aria-current={index === active}
              >
                <img src={shot.image} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
