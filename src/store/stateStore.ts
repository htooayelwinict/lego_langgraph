import { create } from 'zustand';
import { StateSchema, StateField, validateStateSchema, createEmptyStateSchema, createInitialState } from '@/models/state';

interface StateStore {
  schema: StateSchema;
  errors: string[];

  setSchema: (schema: StateSchema) => void;
  addField: (field: StateField) => void;
  updateField: (key: string, updates: Partial<StateField>) => void;
  deleteField: (key: string) => void;
  clearErrors: () => void;

  getInitialState: () => Record<string, unknown>;
}

export const useStateStore = create<StateStore>((set, get) => ({
  schema: createEmptyStateSchema(),
  errors: [],

  setSchema: (schema) => {
    const errors = validateStateSchema(schema);
    set({
      schema,
      errors: errors.map((e) => `${e.field}: ${e.message}`),
    });
  },

  addField: (field) => {
    const schema = get().schema;
    const newSchema: StateSchema = {
      ...schema,
      fields: [...schema.fields, field],
    };
    get().setSchema(newSchema);
  },

  updateField: (key, updates) => {
    const schema = get().schema;
    const newSchema: StateSchema = {
      ...schema,
      fields: schema.fields.map((f) =>
        f.key === key ? { ...f, ...updates } : f
      ),
    };
    get().setSchema(newSchema);
  },

  deleteField: (key) => {
    const schema = get().schema;
    const newSchema: StateSchema = {
      ...schema,
      fields: schema.fields.filter((f) => f.key !== key),
    };
    get().setSchema(newSchema);
  },

  clearErrors: () => set({ errors: [] }),

  getInitialState: () => createInitialState(get().schema),
}));

// Local storage persistence
export function persistStateStore() {
  const schema = useStateStore.getState().schema;
  try {
    localStorage.setItem('langgraph-state-schema', JSON.stringify(schema));
  } catch (e) {
    console.error('Failed to persist state schema:', e);
  }
}

export function loadPersistedState() {
  try {
    const saved = localStorage.getItem('langgraph-state-schema');
    if (saved) {
      const schema = JSON.parse(saved) as StateSchema;
      useStateStore.getState().setSchema(schema);
      return true;
    }
  } catch (e) {
    console.error('Failed to load persisted state schema:', e);
  }
  return false;
}

/**
 * Build initial state by merging schema defaults with user-provided state
 * User values override defaults
 */
export function buildStateDefaults(
  userState: Record<string, unknown> = {}
): Record<string, unknown> {
  const schemaDefaults = createInitialState(useStateStore.getState().schema);
  return { ...schemaDefaults, ...userState };
}

// Auto-save on changes
useStateStore.subscribe(() => persistStateStore());
