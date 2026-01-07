import { useSimulationStore } from '@/store/simulationStore';
import { useGraphStore } from '@/store/graphStore';
import { useStateStore } from '@/store/stateStore';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Zap, GripVertical } from 'lucide-react';
import { useEffect } from 'react';

export function StepControls() {
  const { trace, isPlaying, speed, stepForward, stepBackward, reset, setPlaying, runSimulation } =
    useSimulationStore();
  const { nodes, edges } = useGraphStore();
  const { schema: stateSchema } = useStateStore();

  const hasSteps = trace.steps.length > 0;
  const canStepForward = trace.currentStep < trace.steps.length - 1;
  const canStepBackward = trace.currentStep >= 0;

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (canStepForward) {
        stepForward();
      } else {
        setPlaying(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, canStepForward, speed, stepForward, setPlaying]);

  const handleRun = () => {
    // Build initial state from schema defaults
    const initialState: Record<string, unknown> = {};
    for (const field of stateSchema.fields) {
      if (field.default !== undefined) {
        try {
          initialState[field.key] = JSON.parse(field.default as string);
        } catch {
          initialState[field.key] = field.default;
        }
      }
    }

    // Convert React Flow nodes to GraphNode format
    const graphNodes = nodes.map((node) => ({
      id: node.id,
      type: node.data.type as 'Start' | 'LLM' | 'Tool' | 'Router' | 'Reducer' | 'LoopGuard' | 'End',
      position: node.position,
      data: {
        label: node.data.label,
        config: node.data.config,
      },
    }));

    // Convert React Flow edges to GraphEdge format
    const graphEdges = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
      data: edge.data,
    }));

    runSimulation(
      {
        version: 'v1',
        nodes: graphNodes,
        edges: graphEdges,
      },
      initialState
    );
  };

  const handlePlay = () => {
    if (!hasSteps) {
      handleRun();
    }
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="step-controls">
      <style>{`
        .step-controls {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--bg-glass);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
        }

        .step-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .step-btn:hover:not(:disabled) {
          background: var(--bg-glass-light);
          color: var(--text-primary);
        }

        .step-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .step-btn.run {
          background: var(--gradient-primary);
          color: white;
        }

        .step-btn.run:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: var(--shadow-glow-blue);
        }

        .step-btn.pause {
          color: var(--accent-amber);
        }

        .step-btn.play {
          color: var(--accent-emerald);
        }

        .step-divider {
          width: 1px;
          height: 20px;
          background: var(--border-default);
          margin: 0 var(--space-1);
        }

        .speed-control {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .speed-label {
          font-size: 11px;
          color: var(--text-muted);
        }

        .speed-slider {
          width: 80px;
        }

        .speed-value {
          font-size: 11px;
          color: var(--text-muted);
          min-width: 40px;
        }

        .step-counter {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1) var(--space-3);
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-idle {
          background: rgba(148, 163, 184, 0.2);
          color: #94a3b8;
        }

        .status-running {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .status-paused {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
        }

        .status-complete {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .status-error {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 32px;
          cursor: grab;
          user-select: none;
          color: var(--text-muted);
          padding-right: var(--space-2);
          border-right: 1px solid var(--border-subtle);
          margin-right: var(--space-2);
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .drag-handle:hover {
          color: var(--text-secondary);
        }
      `}</style>

      {/* Drag handle */}
      <div className="drag-handle" data-drag-handle>
        <GripVertical size={16} />
      </div>

      {/* Run button */}
      <button
        onClick={handleRun}
        className="step-btn run"
        title="Run simulation"
      >
        <Zap size={16} />
      </button>

      <div className="step-divider" />

      {/* Step backward */}
      <button
        onClick={stepBackward}
        disabled={!canStepBackward}
        className="step-btn"
        title="Step back"
      >
        <SkipBack size={16} />
      </button>

      {/* Play/Pause */}
      {isPlaying ? (
        <button
          onClick={handlePause}
          className="step-btn pause"
          title="Pause"
        >
          <Pause size={16} />
        </button>
      ) : (
        <button
          onClick={handlePlay}
          disabled={!hasSteps}
          className="step-btn play"
          title="Play"
        >
          <Play size={16} />
        </button>
      )}

      {/* Step forward */}
      <button
        onClick={stepForward}
        disabled={!canStepForward}
        className="step-btn"
        title="Step forward"
      >
        <SkipForward size={16} />
      </button>

      <div className="step-divider" />

      {/* Reset */}
      <button
        onClick={handleReset}
        disabled={!hasSteps}
        className="step-btn"
        title="Reset"
      >
        <RotateCcw size={16} />
      </button>

      <div className="step-divider" />

      {/* Speed control */}
      <div className="speed-control">
        <span className="speed-label">Speed:</span>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={speed}
          onChange={(e) => {
            const newSpeed = Number.parseInt(e.target.value, 10);
            useSimulationStore.getState().setSpeed(newSpeed);
          }}
          className="speed-slider"
          title={`Speed: ${speed}ms delay`}
          style={{ direction: 'rtl' }}
        />
        <span className="speed-value">
          {speed}ms
        </span>
      </div>

      {/* Step counter */}
      {hasSteps && (
        <div className="step-counter">
          {trace.currentStep + 1} / {trace.steps.length}
        </div>
      )}

      {/* Status indicator */}
      <StatusBadge status={trace.status} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusClass = `status-badge status-${status}`;

  return (
    <span className={statusClass}>
      {status}
    </span>
  );
}
