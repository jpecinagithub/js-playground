import type { Dict } from '../i18n';

export function Landing({ d, onStart }: { d: Dict; onStart: () => void }) {
  return (
    <div className="landing">
      <div className="landing-inner">
        <div className="logo big">
          <span className="logo-mark">&gt;_</span>
          <span className="logo-text">{d.landing.title}</span>
        </div>
        <h1 className="landing-lines">
          {d.landing.lines.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </h1>
        <button type="button" className="btn primary xl" onClick={onStart}>
          {d.landing.cta} →
        </button>
        <ul className="landing-bullets">
          {d.landing.bullets.map((b, i) => (
            <li key={i}>✓ {b}</li>
          ))}
        </ul>
      </div>
      <footer className="landing-foot">{d.landing.footer}</footer>
    </div>
  );
}
