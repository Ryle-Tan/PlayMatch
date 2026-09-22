import "./MessageState.css";

/** Friendly arcade-flavoured failure message with a retry button. */
export default function ErrorState({ title = "GAME OVER", message, onRetry }) {
  return (
    <div className="msg-state msg-state--error" role="alert">
      <div className="msg-state__icon" aria-hidden="true">✖</div>
      <h2 className="msg-state__title">{title}</h2>
      <p className="msg-state__body">{message}</p>
      {onRetry && (
        <button type="button" className="pixel-btn pixel-btn--magenta" onClick={onRetry}>
          RETRY
        </button>
      )}
    </div>
  );
}
