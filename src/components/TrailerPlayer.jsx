import "./TrailerPlayer.css";

/**
 * A RAWG trailer.
 *
 * preload="none" means the video file is only downloaded if the
 * viewer presses play — the poster frame is all that loads up front.
 */
export default function TrailerPlayer({ movie }) {
  return (
    <div className="trailer">
      <video
        className="trailer__video"
        controls
        preload="none"
        playsInline
        poster={movie.preview ?? undefined}
      >
        <source src={movie.src} type="video/mp4" />
        Your browser cannot play this trailer.
      </video>
      <p className="trailer__caption">{movie.name}</p>
    </div>
  );
}
