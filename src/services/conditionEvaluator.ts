/**
 * Condition evaluator for LangGraph simulation
 * Safely evaluates boolean expressions against graph state
 */

import type { GraphState } from '@/models/simulation';
import type { GraphEdge } from '@/models/graph';
import type { StateSchema } from '@/models/state';

/**
 * Validation result for conditions
 */
export interface ConditionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a condition against a state schema
 */
export function validateCondition(
  condition: string,
  schema: StateSchema
): ConditionValidationResult {
  const refs = extractStateReferences(condition);
  const schemaKeys = new Set(schema.fields.map((f) => f.key));

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const ref of refs) {
    const topKey = ref.split('.')[0];
    if (topKey && !schemaKeys.has(topKey)) {
      warnings.push(`Unknown field reference: state.${ref}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate a field reference (for node configs)
 */
export function validateFieldReference(
  fieldKey: string,
  schema: StateSchema,
  expectedType?: string
): ConditionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const field = schema.fields.find((f) => f.key === fieldKey);

  if (!field) {
    errors.push(`Unknown field: "${fieldKey}"`);
    return { valid: false, errors, warnings };
  }

  if (expectedType && field.type !== expectedType) {
    errors.push(`Field "${fieldKey}" has type "${field.type}", expected "${expectedType}"`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Safely evaluate a condition expression against state
 *
 * Supported syntax:
 * - state.field === "value"
 * - state.field != "value"
 * - state.count > 5
 * - state.input in ["a", "b"]
 *
 * @param condition - Condition expression (e.g., 'state.status === "success"')
 * @param state - Current graph state
 * @returns true if condition evaluates to true, false otherwise
 */
export function evaluateCondition(
  condition: string | undefined,
  state: GraphState
): boolean {
  // No condition means edge always fires
  if (!condition || condition.trim() === '') {
    return true;
  }

  const trimmed = condition.trim();

  // Simple pattern matching for common conditions
  const equalsMatch = trimmed.match(/^(.+?)\s*===?\s*(.+)$/);
  if (equalsMatch) {
    const [, left, right] = equalsMatch;
    return resolveValue(left!.trim(), state) == resolveValue(right!.trim(), state);
  }

  const notEqualsMatch = trimmed.match(/^(.+?)\s*!=\s*(.+)$/);
  if (notEqualsMatch) {
    const [, left, right] = notEqualsMatch;
    return resolveValue(left!.trim(), state) != resolveValue(right!.trim(), state);
  }

  const greaterMatch = trimmed.match(/^(.+?)\s*>\s*(.+)$/);
  if (greaterMatch) {
    const [, left, right] = greaterMatch;
    return Number(resolveValue(left!.trim(), state)) > Number(resolveValue(right!.trim(), state));
  }

  const lessMatch = trimmed.match(/^(.+?)\s*<\s*(.+)$/);
  if (lessMatch) {
    const [, left, right] = lessMatch;
    return Number(resolveValue(left!.trim(), state)) < Number(resolveValue(right!.trim(), state));
  }

  const greaterOrEqualMatch = trimmed.match(/^(.+?)\s*>=\s*(.+)$/);
  if (greaterOrEqualMatch) {
    const [, left, right] = greaterOrEqualMatch;
    return Number(resolveValue(left!.trim(), state)) >= Number(resolveValue(right!.trim(), state));
  }

  const lessOrEqualMatch = trimmed.match(/^(.+?)\s*<=\s*(.+)$/);
  if (lessOrEqualMatch) {
    const [, left, right] = lessOrEqualMatch;
    return Number(resolveValue(left!.trim(), state)) <= Number(resolveValue(right!.trim(), state));
  }

  const inMatch = trimmed.match(/^(.+?)\s+in\s+(.+)$/);
  if (inMatch) {
    const [, left, right] = inMatch;
    const leftValue = resolveValue(left!.trim(), state);
    const rightValue = resolveValue(right!.trim(), state);
    return Array.isArray(rightValue) && rightValue.includes(leftValue);
  }

  const andMatch = trimmed.match(/^(.+?)\s*&&\s*(.+)$/);
  if (andMatch) {
    const [, left, right] = andMatch;
    return evaluateCondition(left!.trim(), state) && evaluateCondition(right!.trim(), state);
  }

  const orMatch = trimmed.match(/^(.+?)\s*\|\|\s*(.+)$/);
  if (orMatch) {
    const [, left, right] = orMatch;
    return evaluateCondition(left!.trim(), state) || evaluateCondition(right!.trim(), state);
  }

  const notMatch = trimmed.match(/^!\s*(.+)$/);
  if (notMatch) {
    return !evaluateCondition(notMatch[1]!.trim(), state);
  }

  // Unknown condition format - log warning and return false
  console.warn(`Unsupported condition format: ${condition}`);
  return false;
}

/**
 * Resolve a value reference (e.g., state.field or literal)
 */
function resolveValue(ref: string, state: GraphState): unknown {
  // Handle state.field references
  if (ref.startsWith('state.')) {
    const path = ref.slice(6); // Remove 'state.'
    return getNestedValue(state, path);
  }

  // Handle string literals
  if ((ref.startsWith('"') && ref.endsWith('"')) || (ref.startsWith("'") && ref.endsWith("'"))) {
    return ref.slice(1, -1);
  }

  // Handle array literals
  if (ref.startsWith('[') && ref.endsWith(']')) {
    try {
      return JSON.parse(ref);
    } catch {
      return [];
    }
  }

  // Handle numbers
  if (!isNaN(Number(ref))) {
    return Number(ref);
  }

  // Handle booleans
  if (ref === 'true') return true;
  if (ref === 'false') return false;
  if (ref === 'null' || ref === 'undefined') return null;

  return ref;
}

/**
 * Get nested value from state using dot notation
 */
function getNestedValue(obj: GraphState, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Check if an edge fires based on its condition and current state
 */
export function edgeFires(edge: GraphEdge, state: GraphState): boolean {
  return evaluateCondition(edge.data?.condition, state);
}

/**
 * Get human-readable explanation of why an edge fired or didn't fire
 */
export function explainEdgeFiring(
  edge: GraphEdge,
  state: GraphState
): { fired: boolean; explanation: string } {
  const condition = edge.data?.condition;

  if (!condition || condition.trim() === '') {
    return {
      fired: true,
      explanation: `Edge "${edge.data?.label || edge.id}" always fires (no condition)`,
    };
  }

  const result = evaluateCondition(condition, state);

  // Extract relevant state values for explanation
  const stateRefs = extractStateReferences(condition);
  const stateValues = stateRefs.map((ref) => {
    const value = getNestedValue(state, ref);
    return `${ref} = ${JSON.stringify(value)}`;
  });

  const stateInfo = stateValues.length > 0 ? `\nState: ${stateValues.join(', ')}` : '';

  return {
    fired: result,
    explanation: `Condition "${condition}" evaluated to ${result}${stateInfo}`,
  };
}

/**
 * Extract state.field references from a condition
 */
function extractStateReferences(condition: string): string[] {
  const matches = condition.match(/state\.(\w+(\.\w+)*)/g) || [];
  return matches.map((m) => m.slice(6)); // Remove 'state.' prefix
}
