import "./MessageState.css";

/** Failure message on an orange neon card, with a retry button. */
export default function ErrorState({ title = "Game over", message, onRetry }) {
  return (
    <div className="msg-state neon-card neon-card--orange" role="alert">
      <div className="msg-state__icon msg-state__icon--orange" aria-hidden="true">✕</div>
      <h2 className="msg-state__title msg-state__title--orange">{title}</h2>
      <p className="msg-state__body">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--orange" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
