import { useEffect, useRef, useState } from 'react';
import type { Dict, Lang } from '../i18n';
import type { StepDef } from '../steps';

export function StepByStepModal({
  lang,
  d,
  steps,
  open,
  onClose,
  onStepLine,
}: {
  lang: Lang;
  d: Dict;
  steps: StepDef[];
  open: boolean;
  onClose: () => void;
  onStepLine: (line: number | null) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // The window always stays fully inside the viewport — it can never get lost.
  function setClampedPos(x: number, y: number) {
    const w = panelRef.current?.offsetWidth ?? 520;
    const h = panelRef.current?.offsetHeight ?? 400;
    const maxX = Math.max(8, Math.min(window.innerWidth - w - 8, window.innerWidth - 120));
    const maxY = Math.max(8, Math.min(window.innerHeight - h - 8, window.innerHeight - 48));
    const nx = Math.min(Math.max(8, x), maxX);
    const ny = Math.min(Math.max(8, y), maxY);
    posRef.current = { x: nx, y: ny };
    setPos(posRef.current);
  }

  useEffect(() => {
    if (open) {
      setIdx(0);
      onStepLine(steps[0]?.line ?? null);
      // Start centered; the user can drag it anywhere afterwards.
      setClampedPos((window.innerWidth - 520) / 2, (window.innerHeight - 520) / 2);
    } else {
      onStepLine(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  // ESC closes the floating window too.
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  // Dragging uses window-level listeners: the drag always ends on pointerup,
  // wherever the pointer happens to be, so the window can never get "stuck"
  // following the cursor.
  function onHeadPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('button')) return; // let the ✕ work
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = posRef.current.x;
    const origY = posRef.current.y;
    setDragging(true);
    const onMove = (ev: PointerEvent) => {
      setClampedPos(origX + ev.clientX - startX, origY + ev.clientY - startY);
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  useEffect(() => {
    if (open) onStepLine(steps[idx]?.line ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  if (!open || steps.length === 0) return null;
  const step = steps[idx];

  return (
    <div
      ref={panelRef}
      className="modal step-float"
      style={{ left: pos.x, top: pos.y }}
      role="dialog"
      aria-label={d.steps.title}
    >
      <div
        className={`modal-head step-drag${dragging ? ' dragging' : ''}`}
        onPointerDown={onHeadPointerDown}
      >
        <h2>{d.steps.title}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={d.steps.close}>
          ✕
        </button>
      </div>
        <p className="modal-intro">{d.steps.intro}</p>

        <div className="step-counter">
          {d.steps.step} {idx + 1} {d.steps.of} {steps.length}
          <span className="step-line-badge">
            {d.errors.line} {step.line}
          </span>
        </div>

        <p className="step-note">{step.note[lang]}</p>

        {step.vars.length > 0 && (
          <div className="step-section">
            <h4>{d.steps.variables}</h4>
            <table className="vars-table">
              <tbody>
                {step.vars.map(([name, val], i) => (
                  <tr key={i}>
                    <td className="vars-name">
                      <code>{name}</code>
                    </td>
                    <td>
                      <code className="v-str">{val}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {step.out != null && (
          <div className="step-section">
            <h4>{d.steps.output}</h4>
            <pre className="step-out">{step.out}</pre>
          </div>
        )}

        {step.isResult && <div className="step-result">✓ {d.steps.result}</div>}

        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
            ← {d.steps.prev}
          </button>
          <div className="step-dots">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`step-dot${i === idx ? ' active' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`${d.steps.step} ${i + 1}`}
              />
            ))}
          </div>
          {idx === steps.length - 1 ? (
            <button type="button" className="btn primary" onClick={onClose}>
              ✓ {d.steps.finish}
            </button>
          ) : (
            <button
              type="button"
              className="btn primary"
              onClick={() => setIdx((i) => Math.min(steps.length - 1, i + 1))}
            >
              {d.steps.next} →
            </button>
          )}
        </div>
    </div>
  );
}
