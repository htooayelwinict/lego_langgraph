export type ConceptualRole = 'input' | 'processing' | 'decision' | 'state' | 'output';

export interface NodeRoleInfo {
  role: ConceptualRole;
  label: string;
  description: string;
  color: string;
  icon: string;
}

export const NODE_ROLES: Record<string, NodeRoleInfo> = {
  Start: {
    role: 'input',
    label: 'Entry Point',
    description: 'Where the workflow begins. Initializes the state.',
    color: '#3b82f6',
    icon: '→',
  },
  LLM: {
    role: 'processing',
    label: 'LLM Call',
    description: 'Calls a language model to generate text or make decisions.',
    color: '#22c55e',
    icon: '🧠',
  },
  Tool: {
    role: 'processing',
    label: 'Tool Function',
    description: 'Executes a function (API call, calculation, database query).',
    color: '#22c55e',
    icon: '⚙️',
  },
  Router: {
    role: 'decision',
    label: 'Decision Point',
    description: 'Routes execution based on state conditions.',
    color: '#eab308',
    icon: '🔀',
  },
  Reducer: {
    role: 'state',
    label: 'State Merger',
    description: 'Combines multiple state updates into one.',
    color: '#a855f7',
    icon: '🔀',
  },
  LoopGuard: {
    role: 'decision',
    label: 'Loop Condition',
    description: 'Checks if execution should continue looping.',
    color: '#eab308',
    icon: '🔄',
  },
  End: {
    role: 'output',
    label: 'Terminal',
    description: 'Where the workflow ends. Returns final state.',
    color: '#ef4444',
    icon: '■',
  },
};

export const ROLE_COLORS: Record<ConceptualRole, string> = {
  input: '#3b82f6',
  processing: '#22c55e',
  decision: '#eab308',
  state: '#a855f7',
  output: '#ef4444',
};

export function getNodeConceptualType(nodeType: string): NodeRoleInfo {
  return NODE_ROLES[nodeType] ?? (NODE_ROLES.LLM as NodeRoleInfo);
}
