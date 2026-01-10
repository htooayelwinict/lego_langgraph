import { useMemo } from 'react';
import type { DetailedStepTrace } from '@/models/simulation';
import { TraceMetaText } from './TraceTypography';

interface TraceWaterfallProps {
  steps: DetailedStepTrace[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function TraceWaterfall({ steps, currentStep, onStepClick, className = '' }: TraceWaterfallProps) {
  if (steps.length === 0) {
    return null;
  }

  // Calculate timeline scale
  const { maxDuration, totalDuration } = useMemo(() => {
    let max = 0;
    let total = 0;
    for (const step of steps) {
      max = Math.max(max, step.durationMs);
      total += step.durationMs;
    }
    return { maxDuration: max, totalDuration: total };
  }, [steps]);

  // Calculate relative start times for waterfall visualization
  const timelineData = useMemo(() => {
    let elapsed = 0;
    return steps.map((step) => {
      const data = {
        ...step,
        relativeStart: elapsed,
      };
      elapsed += step.durationMs;
      return data;
    });
  }, [steps]);

  return (
    <div className={`trace-waterfall ${className}`}>
      <style>{`
        .trace-waterfall {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          padding: var(--space-2);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .waterfall-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .waterfall-row:hover {
          background: var(--bg-elevated);
        }

        .waterfall-row.active {
          background: rgba(99, 102, 241, 0.2);
        }

        .waterfall-label {
          min-width: 60px;
          text-align: right;
        }

        .waterfall-track {
          flex: 1;
          height: 20px;
          background: var(--bg-elevated);
          border-radius: var(--radius-sm);
          position: relative;
          overflow: hidden;
        }

        .waterfall-bar {
          position: absolute;
          height: 100%;
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.6), rgba(99, 102, 241, 0.8));
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .waterfall-bar:hover {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.8), rgba(99, 102, 241, 1));
        }

        .waterfall-bar.active {
          background: linear-gradient(90deg, rgba(34, 197, 94, 0.6), rgba(34, 197, 94, 0.8));
        }

        .waterfall-duration {
          min-width: 60px;
          text-align: right;
          font-family: monospace;
        }
      `}</style>

      {timelineData.map((step, index) => {
        const isActive = index === currentStep;
        const widthPercent = (step.durationMs / maxDuration) * 100;
        const leftPercent = (step.relativeStart / totalDuration) * 100;

        return (
          <div
            key={index}
            className={`waterfall-row ${isActive ? 'active' : ''}`}
            onClick={() => onStepClick?.(index)}
            title={`${step.nodeType} (${step.durationMs}ms) - ${step.explanation}`}
          >
            <div className="waterfall-label">
              <TraceMetaText>Step {index + 1}</TraceMetaText>
            </div>
            <div className="waterfall-track">
              <div
                className={`waterfall-bar ${isActive ? 'active' : ''}`}
                style={{
                  left: `${leftPercent}%`,
                  width: `${Math.max(2, widthPercent)}%`,
                }}
              />
            </div>
            <div className="waterfall-duration">
              <TraceMetaText>{step.durationMs}ms</TraceMetaText>
            </div>
          </div>
        );
      })}
    </div>
  );
}
