import { GraphModel } from '@/models/graph';
import { validateGraph } from '@/models/graph';
import { createEmptyStateSchema, validateStateSchema } from '@/models/state';
import { useStateStore } from '@/store/stateStore';

// Maximum file size for JSON import (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Safe JSON parse with prototype pollution protection
 */
function safeJSONParse(text: string): unknown {
  return JSON.parse(text, (key, value) => {
    // Prevent prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });
}

/**
 * Import graph from JSON file
 */
export async function importGraphFromFile(file: File): Promise<GraphModel> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
  }

  const text = await file.text();
  const graph = safeJSONParse(text) as GraphModel;
  return validateAndNormalizeGraph(graph);
}

/**
 * Import graph from JSON string
 */
export function importGraphFromString(json: string): GraphModel {
  // Check string length
  if (json.length > MAX_FILE_SIZE) {
    throw new Error(`JSON too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
  }

  const graph = safeJSONParse(json) as GraphModel;
  return validateAndNormalizeGraph(graph);
}

/**
 * Import graph from clipboard
 */
export async function importGraphFromClipboard(): Promise<GraphModel> {
  const text = await navigator.clipboard.readText();

  // Check string length
  if (text.length > MAX_FILE_SIZE) {
    throw new Error(`Clipboard content too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
  }

  const graph = safeJSONParse(text) as GraphModel;
  return validateAndNormalizeGraph(graph);
}

/**
 * Validate and normalize imported graph
 */
function validateAndNormalizeGraph(graph: unknown): GraphModel {
  if (!graph || typeof graph !== 'object') {
    throw new Error('Invalid graph: not an object');
  }

  const g = graph as Partial<GraphModel>;

  // Validate version
  if (g.version !== 'v1') {
    throw new Error(`Unsupported graph version: ${g.version}`);
  }

  // Validate nodes
  if (!Array.isArray(g.nodes)) {
    throw new Error('Invalid graph: nodes must be an array');
  }

  // Validate edges
  if (!Array.isArray(g.edges)) {
    throw new Error('Invalid graph: edges must be an array');
  }

  // Validate structure
  const errors = validateGraph(g as GraphModel);
  if (errors.length > 0) {
    console.warn('Graph validation warnings:', errors);
  }

  // Handle state schema
  let schema = g.stateSchema;
  if (schema) {
    // Validate the schema
    const schemaErrors = validateStateSchema(schema);
    if (schemaErrors.length > 0) {
      console.warn('State schema validation errors:', schemaErrors);
    }
    // Set the schema in the store
    useStateStore.getState().setSchema(schema);
  } else {
    // No schema in file - create empty
    const emptySchema = createEmptyStateSchema();
    useStateStore.getState().setSchema(emptySchema);
    schema = emptySchema;
  }

  return {
    version: 'v1',
    nodes: g.nodes || [],
    edges: g.edges || [],
    metadata: g.metadata || {
      name: 'Imported Graph',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    stateSchema: schema,
  };
}
