import type { GraphState } from '@/models/simulation';

/**
 * Simple diff utility for state objects
 */
export function diffObjects(
  before: GraphState,
  after: GraphState
): Record<string, { before: unknown; after: unknown }> {
  const changes: Record<string, { before: unknown; after: unknown }> = {};
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const beforeVal = before[key];
    const afterVal = after[key];

    // Check if value changed
    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      changes[key] = {
        before: beforeVal,
        after: afterVal,
      };
    }
  }

  return changes;
}

/**
 * Get color class for value change
 */
export function getDiffColor(before: unknown, after: unknown): string {
  if (before === undefined) {
    return 'text-green-600'; // Added
  }
  if (after === undefined) {
    return 'text-red-600'; // Removed
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    return 'text-amber-600'; // Changed
  }
  return 'text-gray-600'; // Unchanged
}
