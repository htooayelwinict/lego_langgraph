import { useSimulationStore } from '@/store/simulationStore';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

export function ErrorBanner() {
  const { error, clearError } = useSimulationStore();

  if (!error) return null;

  const isError = error.type === 'cycle' || error.type === 'no_start' || error.type === 'max_steps';

  return (
    <div
      className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full mx-4 ${
        isError ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
      } border rounded-lg shadow-lg p-4 flex items-start gap-3`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      )}

      <div className="flex-1 min-w-0">
        <h4
          className={`font-medium ${isError ? 'text-red-800' : 'text-amber-800'} text-sm`}
        >
          {error.type === 'cycle' && 'Cycle Detected'}
          {error.type === 'unreachable' && 'Unreachable Nodes'}
          {error.type === 'no_start' && 'Missing Start Node'}
          {error.type === 'max_steps' && 'Simulation Limit Exceeded'}
        </h4>
        <p
          className={`text-sm mt-1 ${isError ? 'text-red-700' : 'text-amber-700'}`}
        >
          {error.message}
        </p>

        {error.relatedIds.length > 0 && (
          <div className="mt-2">
            <p
              className={`text-xs font-medium ${
                isError ? 'text-red-600' : 'text-amber-600'
              }`}
            >
              Related elements ({error.relatedIds.length}):
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {error.relatedIds.slice(0, 5).map((id) => (
                <span
                  key={id}
                  className={`px-2 py-0.5 rounded text-xs font-mono ${
                    isError
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {id.length > 20 ? `${id.slice(0, 20)}...` : id}
                </span>
              ))}
              {error.relatedIds.length > 5 && (
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    isError ? 'text-red-600' : 'text-amber-600'
                  }`}
                >
                  +{error.relatedIds.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={clearError}
        className="shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}
