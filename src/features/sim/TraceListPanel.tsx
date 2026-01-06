import { useSimulationStore } from '@/store/simulationStore';
import { TraceStepItem } from './TraceStepItem';
import { List } from 'lucide-react';

export function TraceListPanel() {
  const { trace, executionTrace, jumpToStep } = useSimulationStore();

  if (!executionTrace || executionTrace.steps.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No trace yet</p>
        <p className="text-xs mt-1">Run simulation to see execution history</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <List className="w-4 h-4" />
          Execution Trace
        </h3>
        <span className="text-xs text-gray-500">
          {executionTrace.steps.length} steps
        </span>
      </div>

      {/* Trace list */}
      <div className="flex-1 overflow-y-auto">
        {executionTrace.steps.map((step, index) => (
          <TraceStepItem
            key={index}
            step={step}
            index={index}
            isActive={index === trace.currentStep}
            onClick={() => jumpToStep(index)}
          />
        ))}
      </div>

      {/* Final state indicator */}
      {trace.status === 'complete' && (
        <div className="px-4 py-3 bg-green-50 border-t border-green-200">
          <p className="text-sm font-medium text-green-800">Simulation complete</p>
        </div>
      )}

      {trace.status === 'error' && trace.error && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200">
          <p className="text-sm font-medium text-red-800">{trace.error}</p>
        </div>
      )}
    </div>
  );
}
