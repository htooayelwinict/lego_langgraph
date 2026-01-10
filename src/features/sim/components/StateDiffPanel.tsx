import { useMemo, useState } from 'react';
import type { GraphState } from '@/models/simulation';
import { Plus, Minus, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';

interface DiffEntry {
  key: string;
  before: unknown;
  after: unknown;
  changeType: 'added' | 'removed' | 'modified' | 'unchanged';
  variableType: 'llm' | 'tool' | 'system' | 'user' | 'other';
}

// Variable type categorization
function getVariableType(key: string): DiffEntry['variableType'] {
  const lowerKey = key.toLowerCase();

  // LLM-related variables
  if (lowerKey.includes('llm') || lowerKey.includes('message') || lowerKey === 'llmoutput' || lowerKey === '_lastllmnode') {
    return 'llm';
  }

  // Tool-related variables
  if (lowerKey.includes('tool') || lowerKey === 'tooloutput' || lowerKey === '_lasttoolnode') {
    return 'tool';
  }

  // System/flow control variables
  if (lowerKey.startsWith('_') || lowerKey.includes('loop') || lowerKey.includes('router') || lowerKey.includes('reducer')) {
    return 'system';
  }

  // User-defined variables
  if (['input', 'messages', 'context', 'state'].includes(lowerKey)) {
    return 'user';
  }

  return 'other';
}

// Variable type colors
const variableTypeColors: Record<DiffEntry['variableType'], { bg: string; text: string; border: string }> = {
  llm: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  tool: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  system: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  user: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  other: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

interface StateDiffPanelProps {
  before: GraphState;
  after: GraphState;
  className?: string;
}

// Compute diff between two states
function computeDiff(before: GraphState, after: GraphState): DiffEntry[] {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const diff: DiffEntry[] = [];

  for (const key of allKeys) {
    const beforeValue = before[key];
    const afterValue = after[key];

    const hasBefore = key in before;
    const hasAfter = key in after;

    let changeType: DiffEntry['changeType'] = 'unchanged';

    if (!hasBefore && hasAfter) {
      changeType = 'added';
    } else if (hasBefore && !hasAfter) {
      changeType = 'removed';
    } else if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changeType = 'modified';
    }

    diff.push({
      key,
      before: beforeValue,
      after: afterValue,
      changeType,
      variableType: getVariableType(key),
    });
  }

  return diff.sort((a, b) => a.key.localeCompare(b.key));
}

// Format value for display
function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function StateDiffPanel({ before, after, className = '' }: StateDiffPanelProps) {
  const diff = useMemo(() => computeDiff(before, after), [before, after]);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const hasChanges = diff.some((entry) => entry.changeType !== 'unchanged');

  // Group by variable type
  const groupedByType = useMemo(() => {
    const groups: Record<DiffEntry['variableType'], DiffEntry[]> = {
      llm: [],
      tool: [],
      system: [],
      user: [],
      other: [],
    };

    for (const entry of diff) {
      if (entry.changeType !== 'unchanged') {
        groups[entry.variableType].push(entry);
      }
    }

    return groups;
  }, [diff]);

  const toggleSection = (type: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const getChangeIcon = (changeType: DiffEntry['changeType']) => {
    switch (changeType) {
      case 'added':
        return <Plus className="w-3 h-3 text-emerald-400" />;
      case 'removed':
        return <Minus className="w-3 h-3 text-red-400" />;
      case 'modified':
        return <ArrowRight className="w-3 h-3 text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <div className={`state-diff-panel ${className}`}>
      <style>{`
        .state-diff-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .type-group {
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          overflow: hidden;
        }

        .type-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          cursor: pointer;
          user-select: none;
          transition: background var(--transition-fast);
        }

        .type-header:hover {
          background: var(--bg-elevated);
        }

        .diff-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-2);
          border-top: 1px solid var(--border-subtle);
        }

        .diff-entry {
          display: grid;
          grid-template-columns: 24px 140px 1fr 1fr;
          gap: var(--space-2);
          padding: var(--space-2);
          border-radius: var(--radius-sm);
          font-size: 12px;
          align-items: start;
        }

        .diff-entry.modified {
          background: rgba(245, 158, 11, 0.08);
          border-left: 2px solid rgb(245, 158, 11);
        }

        .diff-entry.added {
          background: rgba(16, 185, 129, 0.08);
          border-left: 2px solid rgb(16, 185, 129);
        }

        .diff-entry.removed {
          background: rgba(239, 68, 68, 0.08);
          border-left: 2px solid rgb(239, 68, 68);
        }

        .diff-key {
          font-weight: 500;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .diff-value {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 11px;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 80px;
          overflow-y: auto;
        }

        .diff-value.before {
          background: var(--bg-elevated);
          color: var(--text-secondary);
        }

        .diff-value.after {
          background: var(--bg-elevated);
          color: var(--text-secondary);
        }

        .diff-value.modified-add {
          background: rgba(16, 185, 129, 0.15);
          color: rgb(52, 211, 153);
        }

        .diff-value.modified-remove {
          background: rgba(245, 158, 11, 0.15);
          color: rgb(251, 191, 36);
        }

        .value-tooltip {
          position: relative;
        }

        .value-tooltip:hover .tooltip-content {
          visibility: visible;
          opacity: 1;
        }

        .tooltip-content {
          visibility: hidden;
          opacity: 0;
          position: absolute;
          z-index: 100;
          bottom: 100%;
          left: 0;
          margin-bottom: 4px;
          padding: 8px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-lg);
          font-size: 11px;
          white-space: pre-wrap;
          max-width: 300px;
          transition: opacity 0.15s;
        }
      `}</style>

      {!hasChanges && (
        <div className="text-center text-slate-500 text-xs py-4">
          No state changes
        </div>
      )}

      {hasChanges && (
        <div className="diff-section">
          {/* Header */}
          <div className="grid grid-cols-[24px_140px_1fr_1fr] gap-2 px-2 text-xs text-slate-500 font-medium">
            <div />
            <div>Variable</div>
            <div>Before</div>
            <div>After</div>
          </div>

          {/* Variable type groups */}
          {(Object.entries(groupedByType) as Array<[string, DiffEntry[]]>).map(([type, entries]) => {
            if (entries.length === 0) return null;
            const isCollapsed = collapsedSections.has(type);
            const colors = variableTypeColors[type as DiffEntry['variableType']];

            return (
              <div key={type} className="type-group">
                {/* Type header */}
                <div
                  className={`type-header ${colors.bg} ${colors.text}`}
                  onClick={() => toggleSection(type)}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="font-medium capitalize text-xs">{type}</span>
                  <span className="text-xs opacity-70">({entries.length})</span>
                </div>

                {/* Entries */}
                {!isCollapsed && (
                  <div className="diff-section">
                    {entries.map((entry) => (
                      <div key={entry.key} className={`diff-entry ${entry.changeType}`}>
                        {/* Change type icon */}
                        <div className="flex items-center justify-center">
                          {getChangeIcon(entry.changeType)}
                        </div>

                        {/* Key with variable type badge */}
                        <div className="diff-key">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${colors.bg} ${colors.text} ${colors.border} border`}>
                            {entry.key}
                          </span>
                        </div>

                        {/* Before value */}
                        <div className="value-tooltip">
                          {entry.changeType === 'added' ? (
                            <div className="diff-value before text-slate-500 italic">—</div>
                          ) : (
                            <div className="diff-value before">
                              {entry.changeType === 'modified' ? (
                                <span className="diff-value modified-remove">
                                  {formatValue(entry.before)}
                                </span>
                              ) : (
                                <span className="line-through opacity-50">
                                  {formatValue(entry.before)}
                                </span>
                              )}
                            </div>
                          )}
                          {entry.changeType !== 'added' && (
                            <div className="tooltip-content">
                              <strong>Before:</strong>
                              {formatValue(entry.before)}
                            </div>
                          )}
                        </div>

                        {/* After value */}
                        <div className="value-tooltip">
                          {entry.changeType === 'removed' ? (
                            <div className="diff-value after text-slate-500 italic">—</div>
                          ) : (
                            <div className="diff-value after">
                              {entry.changeType === 'modified' ? (
                                <span className="diff-value modified-add">
                                  {formatValue(entry.after)}
                                </span>
                              ) : (
                                <span>{formatValue(entry.after)}</span>
                              )}
                            </div>
                          )}
                          {entry.changeType !== 'removed' && (
                            <div className="tooltip-content">
                              <strong>After:</strong>
                              {formatValue(entry.after)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
