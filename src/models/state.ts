/**
 * State schema models for LangGraph Visual Modeler
 */

export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum';

export interface StateField {
  key: string;
  type: FieldType;
  required?: boolean;
  default?: unknown;
  description?: string;
  enumValues?: string[];
}

export interface StateSchema {
  version: 'v1';
  fields: StateField[];
}

/**
 * Create a new empty state schema
 */
export function createEmptyStateSchema(): StateSchema {
  return {
    version: 'v1',
    fields: [
      {
        key: 'messages',
        type: 'array',
        required: true,
        default: [],
        description: 'Conversation messages',
      },
      {
        key: 'input',
        type: 'string',
        required: true,
        default: '',
        description: 'User input',
      },
    ],
  };
}

/**
 * Validate state field
 */
export interface FieldValidationError {
  field: string;
  message: string;
}

export function validateField(field: StateField, allKeys: Set<string>): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  // Validate key format
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.key)) {
    errors.push({
      field: field.key,
      message: 'Invalid identifier: must start with letter or underscore',
    });
  }

  // Check for duplicate keys
  if (allKeys.has(field.key)) {
    errors.push({
      field: field.key,
      message: 'Duplicate field key',
    });
  }

  // Required fields need defaults
  if (field.required && field.default === undefined) {
    errors.push({
      field: field.key,
      message: 'Required fields must have a default value',
    });
  }

  // Enum types need values
  if (field.type === 'enum' && (!field.enumValues || field.enumValues.length === 0)) {
    errors.push({
      field: field.key,
      message: 'Enum fields must have at least one value',
    });
  }

  // Type validation for default value
  if (field.default !== undefined) {
    switch (field.type) {
      case 'string':
        if (typeof field.default !== 'string') {
          errors.push({ field: field.key, message: 'Default must be a string' });
        }
        break;
      case 'number':
        if (typeof field.default !== 'number') {
          errors.push({ field: field.key, message: 'Default must be a number' });
        }
        break;
      case 'boolean':
        if (typeof field.default !== 'boolean') {
          errors.push({ field: field.key, message: 'Default must be a boolean' });
        }
        break;
      case 'array':
        if (!Array.isArray(field.default)) {
          errors.push({ field: field.key, message: 'Default must be an array' });
        }
        break;
      case 'object':
        if (typeof field.default !== 'object' || field.default === null || Array.isArray(field.default)) {
          errors.push({ field: field.key, message: 'Default must be an object' });
        }
        break;
      case 'enum':
        if (field.enumValues && !field.enumValues.includes(field.default as string)) {
          errors.push({ field: field.key, message: 'Default must be one of the enum values' });
        }
        break;
    }
  }

  return errors;
}

/**
 * Validate entire state schema
 */
export function validateStateSchema(schema: StateSchema): FieldValidationError[] {
  const errors: FieldValidationError[] = [];
  const seenKeys = new Set<string>();

  for (const field of schema.fields) {
    const fieldErrors = validateField(field, seenKeys);
    errors.push(...fieldErrors);
    seenKeys.add(field.key);
  }

  return errors;
}

/**
 * Create initial state from schema
 */
export function createInitialState(schema: StateSchema): Record<string, unknown> {
  const state: Record<string, unknown> = {};

  for (const field of schema.fields) {
    if (field.default !== undefined) {
      state[field.key] = field.default;
    } else {
      // Set sensible defaults based on type
      switch (field.type) {
        case 'string':
          state[field.key] = '';
          break;
        case 'number':
          state[field.key] = 0;
          break;
        case 'boolean':
          state[field.key] = false;
          break;
        case 'array':
          state[field.key] = [];
          break;
        case 'object':
          state[field.key] = {};
          break;
        case 'enum':
          state[field.key] = field.enumValues?.[0] || '';
          break;
      }
    }
  }

  return state;
}
