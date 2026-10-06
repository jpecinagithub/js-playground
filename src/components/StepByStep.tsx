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
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setIdx(0);
      onStepLine(steps[0]?.line ?? null);
      // Start centered; the user can drag it anywhere afterwards.
      setPos({
        x: Math.max(8, (window.innerWidth - 520) / 2),
        y: Math.max(8, (window.innerHeight - 520) / 2),
      });
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

  function onHeadPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('button')) return; // let the ✕ work
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onHeadPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const dx = drag.current.dx;
    const dy = drag.current.dy;
    setPos({
      x: Math.min(Math.max(-(panelRef.current?.offsetWidth ?? 520) + 120, e.clientX - dx), window.innerWidth - 120),
      y: Math.min(Math.max(0, e.clientY - dy), window.innerHeight - 48),
    });
  }
  function endDrag() {
    drag.current = null;
    setDragging(false);
  }

  useEffect(() => {
    if (open) {
      setIdx(0);
      onStepLine(steps[0]?.line ?? null);
    } else {
      onStepLine(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

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
        onPointerMove={onHeadPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
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
          <button
            type="button"
            className="btn primary"
            onClick={() => setIdx((i) => Math.min(steps.length - 1, i + 1))}
            disabled={idx === steps.length - 1}
          >
            {d.steps.next} →
          </button>
        </div>
    </div>
  );
}
