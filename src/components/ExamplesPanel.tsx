import { TEMPLATES, type Template, type TemplateCategory } from '../templates';
import type { Dict, Lang } from '../i18n';

const ORDER: TemplateCategory[] = ['fundamentals', 'modern', 'async', 'other'];

export function ExamplesPanel({
  lang,
  d,
  activeId,
  onSelect,
  onClose,
}: {
  lang: Lang;
  d: Dict;
  activeId: string | null;
  onSelect: (t: Template) => void;
  onClose: () => void;
}) {
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={d.examples.title}>
        <div className="drawer-head">
          <h2>{d.examples.title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={d.examples.close}>
            ✕
          </button>
        </div>
        <p className="drawer-hint">{d.examples.hint}</p>
        <div className="drawer-body">
          {ORDER.map((cat) => (
            <section key={cat} className="drawer-cat">
              <h3>{d.examples.categories[cat]}</h3>
              <ul>
                {TEMPLATES.filter((t) => t.category === cat).map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className={`tpl-btn${activeId === t.id ? ' active' : ''}`}
                      onClick={() => onSelect(t)}
                    >
                      <span className="tpl-name">{t.name[lang]}</span>
                      <span className="tpl-arrow">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
}
