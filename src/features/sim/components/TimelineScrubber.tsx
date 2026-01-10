import { useSimulationStore } from '@/store/simulationStore';
import { useTraceUiStore } from '@/store/traceUiStore';
import { useCallback, useRef, useEffect } from 'react';

interface TimelineScrubberProps {
  totalSteps: number;
  className?: string;
}

export function TimelineScrubber({ totalSteps, className = '' }: TimelineScrubberProps) {
  const currentStep = useSimulationStore((state) => state.trace.currentStep);
  const jumpToStep = useSimulationStore((state) => state.jumpToStep);
  const scrubPreviewStep = useTraceUiStore((state) => state.scrubPreviewStep);
  const setScrubPreviewStep = useTraceUiStore((state) => state.setScrubPreviewStep);

  const scrubberRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Calculate positions
  const displayStep = scrubPreviewStep ?? currentStep;
  const progress = totalSteps > 0 ? (Math.max(-1, displayStep) + 1) / totalSteps : 0;
  const percentage = Math.min(100, Math.max(0, progress * 100));

  // Handle scrubber interaction
  const handleUpdatePosition = useCallback((clientX: number) => {
    if (!scrubberRef.current) return;

    const rect = scrubberRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const newStep = Math.floor(ratio * totalSteps) - 1;

    setScrubPreviewStep(newStep);
  }, [totalSteps, setScrubPreviewStep]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    handleUpdatePosition(e.clientX);

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        handleUpdatePosition(e.clientX);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current && scrubPreviewStep !== null) {
        jumpToStep(Math.max(-1, scrubPreviewStep));
      }
      isDraggingRef.current = false;
      setScrubPreviewStep(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const stepToJumpTo = scrubPreviewStep ?? currentStep;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (stepToJumpTo > -1) {
          jumpToStep(stepToJumpTo - 1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (stepToJumpTo < totalSteps - 1) {
          jumpToStep(stepToJumpTo + 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        jumpToStep(-1);
        break;
      case 'End':
        e.preventDefault();
        jumpToStep(totalSteps - 1);
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        if (scrubPreviewStep !== null) {
          jumpToStep(Math.max(-1, scrubPreviewStep));
          setScrubPreviewStep(null);
        }
        break;
    }
  };

  // Clear preview on unmount
  useEffect(() => {
    return () => {
      setScrubPreviewStep(null);
    };
  }, [setScrubPreviewStep]);

  return (
    <div
      ref={scrubberRef}
      className={`relative h-6 bg-slate-800 rounded cursor-pointer ${className}`}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      role="slider"
      aria-label="Timeline scrubber"
      aria-valuemin={-1}
      aria-valuemax={totalSteps - 1}
      aria-valuenow={scrubPreviewStep ?? currentStep}
      aria-valuetext={`Step ${Math.max(0, displayStep + 1)} of ${totalSteps}`}
      tabIndex={0}
    >
      {/* Progress bar background */}
      <div className="absolute inset-0 bg-slate-700/30 rounded" />

      {/* Progress bar fill */}
      <div
        className="absolute inset-y-0 left-0 bg-indigo-400/30 rounded transition-all duration-75"
        style={{ width: `${percentage}%` }}
      />

      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-400 rounded-full shadow-lg shadow-indigo-400/30 transition-all duration-75"
        style={{ left: `calc(${percentage}% - 6px)` }}
      />

      {/* Step indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xs font-medium text-slate-300">
          {Math.max(0, displayStep + 1)} / {totalSteps}
        </span>
      </div>
    </div>
  );
}
