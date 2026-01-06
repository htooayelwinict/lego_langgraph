import { GraphState } from '@/models/simulation';
import { diffObjects, getDiffColor } from './stateDiffUtils';

interface StateSnapshotViewerProps {
  before: GraphState;
  after: GraphState;
}

export function StateSnapshotViewer({ before, after }: StateSnapshotViewerProps) {
  const changes = diffObjects(before, after);
  const hasChanges = Object.keys(changes).length > 0;

  if (!hasChanges) {
    return (
      <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded">
        No state changes
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        State Changes
      </div>

      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        {Object.entries(changes).map(([key, { before: beforeVal, after: afterVal }]) => (
          <div key={key} className="text-sm">
            <span className="font-medium text-gray-700">{key}:</span>{' '}
            <span className={getDiffColor(beforeVal, afterVal)}>
              {formatValue(beforeVal)} → {formatValue(afterVal)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatValue(val: unknown): string {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return `"${val}"`;
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}
