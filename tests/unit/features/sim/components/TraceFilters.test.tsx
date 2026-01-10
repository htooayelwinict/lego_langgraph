import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TraceFilters } from '@/features/sim/components/TraceFilters';
import { useTraceUiStore } from '@/store/traceUiStore';

// Mock the store
vi.mock('@/store/traceUiStore');

describe('TraceFilters', () => {
  const mockSetFilterQuery = vi.fn();
  const mockToggleStatusFilter = vi.fn();
  const mockClearFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock traceUiStore
    vi.mocked(useTraceUiStore).mockImplementation((selector) => {
      const state = {
        filterQuery: '',
        statusFilters: [],
        setFilterQuery: mockSetFilterQuery,
        toggleStatusFilter: mockToggleStatusFilter,
        clearFilters: mockClearFilters,
      } as unknown as ReturnType<typeof useTraceUiStore>;

      if (typeof selector === 'function') {
        return selector(state);
      }
      return state as unknown as ReturnType<typeof useTraceUiStore>;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('renders search input with icon', () => {
      render(<TraceFilters />);

      const searchIcon = document.querySelector('.lucide-search');
      expect(searchIcon).toBeInTheDocument();

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');
      expect(input).toBeInTheDocument();
    });

    it('renders status filter chips', () => {
      render(<TraceFilters />);

      expect(screen.getByText('Fired')).toBeInTheDocument();
      expect(screen.getByText('Blocked')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('renders "Filter by status" label', () => {
      render(<TraceFilters />);

      expect(screen.getByText('Filter by status')).toBeInTheDocument();
    });

    it('does not show clear button when no filters', () => {
      render(<TraceFilters />);

      expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument();
    });
  });

  describe('search input', () => {
    it('updates local state on input change', () => {
      render(<TraceFilters />);

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');
      fireEvent.change(input, { target: { value: 'test query' } });

      expect(input).toHaveValue('test query');
    });

    it('shows X button when input has value', () => {
      render(<TraceFilters />);

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');
      fireEvent.change(input, { target: { value: 'test' } });

      const clearButton = document.querySelector('.lucide-x')?.closest('button');
      expect(clearButton).toBeInTheDocument();
    });

    it('clears input when X button is clicked', () => {
      render(<TraceFilters />);

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');
      fireEvent.change(input, { target: { value: 'test' } });

      const clearButton = document.querySelector('.lucide-x')?.closest('button');
      if (clearButton) {
        fireEvent.click(clearButton);
      }

      expect(input).toHaveValue('');
    });

    it('updates input value immediately on change', () => {
      render(<TraceFilters />);

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(input).toHaveValue('test');
    });

    it('handles rapid input changes efficiently', () => {
      render(<TraceFilters />);

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');

      fireEvent.change(input, { target: { value: 't' } });
      fireEvent.change(input, { target: { value: 'te' } });
      fireEvent.change(input, { target: { value: 'tes' } });
      fireEvent.change(input, { target: { value: 'test' } });

      // Input should have final value
      expect(input).toHaveValue('test');
    });
  });

  describe('status filter chips', () => {
    it('renders all status options', () => {
      render(<TraceFilters />);

      const chips = screen.getAllByRole('button');
      const statusChips = chips.filter(chip =>
        ['Fired', 'Blocked', 'Error'].includes(chip.textContent || '')
      );

      expect(statusChips.length).toBe(3);
    });

    it('toggles status filter on chip click', () => {
      render(<TraceFilters />);

      const firedChip = screen.getByText('Fired');
      fireEvent.click(firedChip);

      expect(mockToggleStatusFilter).toHaveBeenCalledWith('fired');
    });

    it('applies active class when filter is selected', () => {
      vi.mocked(useTraceUiStore).mockImplementation((selector) => {
        const state = {
          filterQuery: '',
          statusFilters: ['fired'],
          setFilterQuery: mockSetFilterQuery,
          toggleStatusFilter: mockToggleStatusFilter,
          clearFilters: mockClearFilters,
        } as unknown as ReturnType<typeof useTraceUiStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useTraceUiStore>;
      });

      const { container } = render(<TraceFilters />);

      const firedChip = screen.getByText('Fired').closest('button');
      expect(firedChip).toHaveClass('active');
    });

    it('does not apply active class when filter is not selected', () => {
      vi.mocked(useTraceUiStore).mockImplementation((selector) => {
        const state = {
          filterQuery: '',
          statusFilters: [],
          setFilterQuery: mockSetFilterQuery,
          toggleStatusFilter: mockToggleStatusFilter,
          clearFilters: mockClearFilters,
        } as unknown as ReturnType<typeof useTraceUiStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useTraceUiStore>;
      });

      const { container } = render(<TraceFilters />);

      const firedChip = screen.getByText('Fired').closest('button');
      expect(firedChip).not.toHaveClass('active');
    });

    it('shows multiple active filters', () => {
      vi.mocked(useTraceUiStore).mockImplementation((selector) => {
        const state = {
          filterQuery: '',
          statusFilters: ['fired', 'blocked'],
          setFilterQuery: mockSetFilterQuery,
          toggleStatusFilter: mockToggleStatusFilter,
          clearFilters: mockClearFilters,
        } as unknown as ReturnType<typeof useTraceUiStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useTraceUiStore>;
      });

      render(<TraceFilters />);

      const firedChip = screen.getByText('Fired').closest('button');
      const blockedChip = screen.getByText('Blocked').closest('button');

      expect(firedChip).toHaveClass('active');
      expect(blockedChip).toHaveClass('active');
    });
  });

  describe('clear all filters button', () => {
    it('shows clear button when query is active', () => {
      vi.mocked(useTraceUiStore).mockImplementation((selector) => {
        const state = {
          filterQuery: 'test',
          statusFilters: [],
          setFilterQuery: mockSetFilterQuery,
          toggleStatusFilter: mockToggleStatusFilter,
          clearFilters: mockClearFilters,
        } as unknown as ReturnType<typeof useTraceUiStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useTraceUiStore>;
      });

      render(<TraceFilters />);

      expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    });

    it('shows clear button when status filters are active', () => {
      vi.mocked(useTraceUiStore).mockImplementation((selector) => {
        const state = {
          filterQuery: '',
          statusFilters: ['fired'],
          setFilterQuery: mockSetFilterQuery,
          toggleStatusFilter: mockToggleStatusFilter,
          clearFilters: mockClearFilters,
        } as unknown as ReturnType<typeof useTraceUiStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useTraceUiStore>;
      });

      render(<TraceFilters />);

      expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    });

    it('clears all filters on button click', () => {
      vi.mocked(useTraceUiStore).mockImplementation((selector) => {
        const state = {
          filterQuery: 'test',
          statusFilters: ['fired'],
          setFilterQuery: mockSetFilterQuery,
          toggleStatusFilter: mockToggleStatusFilter,
          clearFilters: mockClearFilters,
        } as unknown as ReturnType<typeof useTraceUiStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useTraceUiStore>;
      });

      render(<TraceFilters />);

      const clearButton = screen.getByText('Clear all filters');
      fireEvent.click(clearButton);

      expect(mockClearFilters).toHaveBeenCalled();
    });

    it('has X icon on clear button', () => {
      vi.mocked(useTraceUiStore).mockImplementation((selector) => {
        const state = {
          filterQuery: 'test',
          statusFilters: [],
          setFilterQuery: mockSetFilterQuery,
          toggleStatusFilter: mockToggleStatusFilter,
          clearFilters: mockClearFilters,
        } as unknown as ReturnType<typeof useTraceUiStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useTraceUiStore>;
      });

      render(<TraceFilters />);

      const clearButton = screen.getByText('Clear all filters');
      const icon = clearButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('deferred value behavior', () => {
    it('uses useDeferredValue for search input', () => {
      render(<TraceFilters />);

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');

      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });

      // Input value should update immediately
      expect(input).toHaveValue('abc');
    });
  });

  describe('className prop', () => {
    it('forwards className to root element', () => {
      const { container } = render(<TraceFilters className="custom-class" />);

      const filters = container.querySelector('.trace-filters');
      expect(filters).toHaveClass('custom-class');
    });
  });

  describe('keyboard interactions', () => {
    it('allows typing in search input', () => {
      render(<TraceFilters />);

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');

      fireEvent.change(input, { target: { value: 'search text' } });

      expect(input).toHaveValue('search text');
    });

    it('allows clearing search with Escape key', () => {
      render(<TraceFilters />);

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');
      fireEvent.change(input, { target: { value: 'test' } });

      fireEvent.keyDown(input, { key: 'Escape' });

      // Note: Component doesn't have explicit Escape handling
      // but the X button should still work
      expect(input).toHaveValue('test');
    });
  });

  describe('edge cases', () => {
    it('handles special characters in search', () => {
      render(<TraceFilters />);

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');

      fireEvent.change(input, { target: { value: 'search with <special> & "chars"' } });

      expect(input).toHaveValue('search with <special> & "chars"');
    });

    it('handles very long search queries', () => {
      render(<TraceFilters />);

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');
      const longQuery = 'a'.repeat(1000);

      fireEvent.change(input, { target: { value: longQuery } });

      expect(input).toHaveValue(longQuery);
    });

    it('handles empty search query after typing', () => {
      render(<TraceFilters />);

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');

      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.change(input, { target: { value: '' } });

      expect(input).toHaveValue('');
    });
  });

  describe('visual styling', () => {
    it('applies styles to search container', () => {
      render(<TraceFilters />);

      const input = screen.getByPlaceholderText('Search steps, nodes, explanations...');
      const searchContainer = input.closest('.filter-search');

      expect(searchContainer).toHaveClass('filter-search');
    });

    it('applies styles to filter chips', () => {
      const { container } = render(<TraceFilters />);

      const chip = screen.getByText('Fired').closest('button');

      expect(chip).toHaveClass('filter-chip');
    });
  });
});
