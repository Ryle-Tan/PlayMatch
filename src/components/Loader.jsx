import "./Loader.css";

/** Three glowing arcade blocks with a mono label. */
export default function Loader({ label = "LOADING" }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader__blocks" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="loader__text">
        {label}
        <span className="loader__dots" aria-hidden="true">...</span>
      </p>
    </div>
  );
}
