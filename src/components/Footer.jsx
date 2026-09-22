import "./Footer.css";

/**
 * RAWG's terms require visible attribution wherever their data appears,
 * so this footer is shown on every screen.
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <p className="site-footer__credit">
        Game data by{" "}
        <a href="https://rawg.io" target="_blank" rel="noreferrer noopener">
          RAWG
        </a>
      </p>
      <p className="eyebrow site-footer__note">PlayMatch · student project</p>
    </footer>
  );
}
