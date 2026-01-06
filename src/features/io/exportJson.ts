import { GraphModel } from '@/models/graph';

/**
 * Export graph to JSON file
 */
export function exportGraphToFile(graph: GraphModel): void {
  const blob = new Blob([JSON.stringify(graph, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${graph.metadata?.name || 'graph'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export graph to JSON string
 */
export function exportGraphToString(graph: GraphModel): string {
  return JSON.stringify(graph, null, 2);
}

/**
 * Copy graph JSON to clipboard
 */
export async function copyGraphToClipboard(graph: GraphModel): Promise<boolean> {
  try {
    const json = exportGraphToString(graph);
    await navigator.clipboard.writeText(json);
    return true;
  } catch {
    return false;
  }
}
