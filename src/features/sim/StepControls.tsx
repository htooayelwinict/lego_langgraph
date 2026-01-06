import { useSimulationStore } from '@/store/simulationStore';
import { useGraphStore } from '@/store/graphStore';
import { useStateStore } from '@/store/stateStore';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
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
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Run button */}
      <button
        onClick={handleRun}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Run simulation"
      >
        <Play className="w-4 h-4 text-green-600" />
      </button>

      <div className="w-px h-6 bg-gray-200" />

      {/* Step backward */}
      <button
        onClick={stepBackward}
        disabled={!canStepBackward}
        className="p-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
        title="Step back"
      >
        <SkipBack className="w-4 h-4" />
      </button>

      {/* Play/Pause */}
      {isPlaying ? (
        <button
          onClick={handlePause}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Pause"
        >
          <Pause className="w-4 h-4 text-amber-600" />
        </button>
      ) : (
        <button
          onClick={handlePlay}
          disabled={!hasSteps}
          className="p-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          title="Play"
        >
          <Play className="w-4 h-4 text-green-600" />
        </button>
      )}

      {/* Step forward */}
      <button
        onClick={stepForward}
        disabled={!canStepForward}
        className="p-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
        title="Step forward"
      >
        <SkipForward className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-200" />

      {/* Reset */}
      <button
        onClick={handleReset}
        disabled={!hasSteps}
        className="p-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
        title="Reset"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-200" />

      {/* Speed control */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Speed:</span>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={speed}
          onChange={(e) => {
            const newSpeed = Number.parseInt(e.target.value, 10);
            // Invert: higher value = slower (delay), lower = faster
            // But for UI, show "faster" as higher
            useSimulationStore.getState().setSpeed(2100 - newSpeed);
          }}
          className="w-20"
          title={`Speed: ${2100 - speed}ms delay`}
        />
        <span className="text-xs text-gray-500 w-12">
          {2100 - speed}ms
        </span>
      </div>

      {/* Step counter */}
      {hasSteps && (
        <div className="ml-2 px-3 py-1 bg-gray-100 rounded-lg">
          <span className="text-sm font-medium text-gray-700">
            {trace.currentStep + 1} / {trace.steps.length}
          </span>
        </div>
      )}

      {/* Status indicator */}
      <div className="ml-2">
        <StatusBadge status={trace.status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    idle: 'bg-gray-100 text-gray-700',
    running: 'bg-blue-100 text-blue-700',
    paused: 'bg-amber-100 text-amber-700',
    complete: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
  };

  const className = styles[status] || styles.idle;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {status}
    </span>
  );
}
