import { useEffect, useState } from 'react';
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={d.steps.title}>
        <div className="modal-head">
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
    </div>
  );
}
