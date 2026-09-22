import "./MessageState.css";

/** Shown when a screen has nothing to display (no results, no matches yet). */
export default function EmptyState({ icon = "◆", title, message, action }) {
  return (
    <div className="msg-state neon-card">
      <div className="msg-state__icon" aria-hidden="true">{icon}</div>
      <h2 className="msg-state__title">{title}</h2>
      {message && <p className="msg-state__body">{message}</p>}
      {action}
    </div>
  );
}
