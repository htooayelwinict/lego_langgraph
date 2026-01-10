import { useDeferredValue, useMemo, useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useTraceUiStore } from '@/store/traceUiStore';
import { TraceMetaText } from './TraceTypography';

interface TraceFiltersProps {
  className?: string;
}

export function TraceFilters({ className = '' }: TraceFiltersProps) {
  const filterQuery = useTraceUiStore((state) => state.filterQuery);
  const statusFilters = useTraceUiStore((state) => state.statusFilters);
  const setFilterQuery = useTraceUiStore((state) => state.setFilterQuery);
  const toggleStatusFilter = useTraceUiStore((state) => state.toggleStatusFilter);
  const clearFilters = useTraceUiStore((state) => state.clearFilters);

  // Defer search input for better performance with large traces
  const [localQuery, setLocalQuery] = useState(filterQuery);
  const deferredQuery = useDeferredValue(localQuery);

  // Sync deferred value to store
  useMemo(() => {
    setFilterQuery(deferredQuery);
  }, [deferredQuery, setFilterQuery]);

  const hasActiveFilters = filterQuery.length > 0 || statusFilters.length > 0;

  const statusOptions: Array<{ value: string; label: string }> = [
    { value: 'fired', label: 'Fired' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'error', label: 'Error' },
  ];

  const handleClear = useCallback(() => {
    setLocalQuery('');
    clearFilters();
  }, [clearFilters]);

  return (
    <div className={`trace-filters ${className}`}>
      <style>{`
        .trace-filters {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .filter-search {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          transition: border-color var(--transition-fast);
        }

        .filter-search:focus-within {
          border-color: var(--accent-indigo);
        }

        .filter-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 13px;
        }

        .filter-search-input::placeholder {
          color: var(--text-muted);
        }

        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .filter-chip {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-full);
          font-size: 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: 1px solid transparent;
        }

        .filter-chip.active {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.5);
          color: rgb(165, 180, 252);
        }

        .filter-chip:not(.active) {
          background: var(--bg-elevated);
          color: var(--text-muted);
        }

        .filter-chip:not(.active):hover {
          background: var(--bg-elevated);
          color: var(--text-secondary);
        }

        .clear-filters-btn {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-2);
          background: transparent;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .clear-filters-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-secondary);
        }
      `}</style>

      {/* Search input */}
      <div className="filter-search">
        <Search size={14} className="text-slate-500 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search steps, nodes, explanations..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="filter-search-input"
        />
        {localQuery && (
          <button
            onClick={() => setLocalQuery('')}
            className="p-0.5 hover:bg-slate-700 rounded flex-shrink-0"
          >
            <X size={14} className="text-slate-500" />
          </button>
        )}
      </div>

      {/* Status filter chips */}
      <div className="flex flex-col gap-2">
        <TraceMetaText className="text-xs font-medium">Filter by status</TraceMetaText>
        <div className="filter-chips">
          {statusOptions.map((option) => {
            const isActive = statusFilters.includes(option.value);
            return (
              <button
                key={option.value}
                className={`filter-chip ${isActive ? 'active' : ''}`}
                onClick={() => toggleStatusFilter(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button onClick={handleClear} className="clear-filters-btn">
          <X size={12} />
          Clear all filters
        </button>
      )}
    </div>
  );
}
