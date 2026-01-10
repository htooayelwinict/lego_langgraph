import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { DetailedStepTrace } from '@/models/simulation';

// Mock StateSnapshotViewer to render a simple div
vi.mock('@/features/sim/StateSnapshotViewer', () => ({
  StateSnapshotViewer: ({ before, after }: { before: Record<string, unknown>; after: Record<string, unknown> }) => (
    <div className="state-snapshot-mock" data-before={JSON.stringify(before)} data-after={JSON.stringify(after)}>
      State Snapshot
    </div>
  ),
}));

// Mock the store and selector
const mockToggleExpanded = vi.fn();
const mockSetHoveredNodeId = vi.fn();

vi.mock('@/store/traceUiStore', () => ({
  useTraceUiStore: (selector: (state: unknown) => unknown) => {
    const state = {
      expandedStepIds: new Set<string>(),
      toggleExpanded: mockToggleExpanded,
      setHoveredNodeId: mockSetHoveredNodeId,
    };

    if (typeof selector === 'function') {
      return selector(state);
    }
    return state;
  },
  selectIsExpanded: (stepId: string) => (state: { expandedStepIds: Set<string> }) =>
    state.expandedStepIds.has(stepId),
}));

// Import after mocks
import { TraceStepItem } from '@/features/sim/TraceStepItem';

describe('TraceStepItem', () => {
  const mockStep: DetailedStepTrace = {
    step: 0,
    activeNodeId: 'node-start',
    nodeType: 'Start',
    firedEdgeIds: ['e1', 'e2'],
    blockedEdgeIds: [],
    stateBefore: {},
    stateAfter: { initialized: true },
    explanation: 'Start node executed successfully',
    startedAt: 0,
    endedAt: 100,
    durationMs: 100,
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders step number', () => {
      render(<TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders step number for later steps', () => {
      render(<TraceStepItem step={mockStep} index={5} isActive={false} onClick={mockOnClick} />);

      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('renders node type badge', () => {
      render(<TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />);

      expect(screen.getByText('Start')).toBeInTheDocument();
    });

    it('renders explanation', () => {
      render(<TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />);

      expect(screen.getByText('Start node executed successfully')).toBeInTheDocument();
    });

    it('shows fired edges count', () => {
      render(<TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />);

      expect(screen.getByText('2 edges fired')).toBeInTheDocument();
    });

    it('shows singular "edge" when only one fired', () => {
      const singleEdgeStep = { ...mockStep, firedEdgeIds: ['e1'] };

      render(<TraceStepItem step={singleEdgeStep} index={0} isActive={false} onClick={mockOnClick} />);

      expect(screen.getByText('1 edge fired')).toBeInTheDocument();
    });

    it('shows blocked edges count when present', () => {
      const blockedStep = { ...mockStep, blockedEdgeIds: ['e3'] };

      render(<TraceStepItem step={blockedStep} index={0} isActive={false} onClick={mockOnClick} />);

      expect(screen.getByText('1 blocked')).toBeInTheDocument();
    });

    it('does not render state snapshot when not expanded (default)', () => {
      render(<TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />);

      expect(screen.queryByText('State Snapshot')).not.toBeInTheDocument();
    });

    it('renders Active badge when isActive is true', () => {
      render(<TraceStepItem step={mockStep} index={0} isActive={true} onClick={mockOnClick} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('does not render Active badge when isActive is false', () => {
      render(<TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />);

      expect(screen.queryByText('Active')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('renders clickable element', () => {
      render(<TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />);

      // The component should have a root div with cursor-pointer
      const { container } = render(<TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />);
      const stepItem = container.firstChild as HTMLElement;

      expect(stepItem).toHaveClass('cursor-pointer');
      expect(stepItem).toHaveClass('transition-all');
    });

    it('has onClick handler available', () => {
      // Verify the component accepts onClick prop
      expect(() => {
        render(<TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />);
      }).not.toThrow();
    });
  });

  describe('styling', () => {
    it('applies active styles when isActive is true', () => {
      const { container } = render(
        <TraceStepItem step={mockStep} index={0} isActive={true} onClick={mockOnClick} />
      );

      const stepItem = container.firstChild as HTMLElement;
      expect(stepItem).toHaveClass('border-indigo-400', 'bg-indigo-500/5');
    });

    it('applies inactive styles when isActive is false', () => {
      const { container } = render(
        <TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />
      );

      const stepItem = container.firstChild as HTMLElement;
      expect(stepItem).toHaveClass('border-transparent', 'hover:bg-slate-800/30');
    });

    it('applies node type specific colors for Start', () => {
      render(<TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />);

      const badge = screen.getByText('Start');
      expect(badge).toHaveClass('bg-emerald-500/10', 'text-emerald-400');
    });

    it('applies node type specific colors for LLM', () => {
      const llmStep = { ...mockStep, nodeType: 'LLM' as const };

      render(<TraceStepItem step={llmStep} index={0} isActive={false} onClick={mockOnClick} />);

      const badge = screen.getByText('LLM');
      expect(badge).toHaveClass('bg-purple-500/10', 'text-purple-400');
    });

    it('applies node type specific colors for Tool', () => {
      const toolStep = { ...mockStep, nodeType: 'Tool' as const };

      render(<TraceStepItem step={toolStep} index={0} isActive={false} onClick={mockOnClick} />);

      const badge = screen.getByText('Tool');
      expect(badge).toHaveClass('bg-blue-500/10', 'text-blue-400');
    });

    it('applies node type specific colors for Router', () => {
      const routerStep = { ...mockStep, nodeType: 'Router' as const };

      render(<TraceStepItem step={routerStep} index={0} isActive={false} onClick={mockOnClick} />);

      const badge = screen.getByText('Router');
      expect(badge).toHaveClass('bg-amber-500/10', 'text-amber-400');
    });

    it('applies node type specific colors for Reducer', () => {
      const reducerStep = { ...mockStep, nodeType: 'Reducer' as const };

      render(<TraceStepItem step={reducerStep} index={0} isActive={false} onClick={mockOnClick} />);

      const badge = screen.getByText('Reducer');
      expect(badge).toHaveClass('bg-cyan-500/10', 'text-cyan-400');
    });

    it('applies node type specific colors for LoopGuard', () => {
      const loopGuardStep = { ...mockStep, nodeType: 'LoopGuard' as const };

      render(<TraceStepItem step={loopGuardStep} index={0} isActive={false} onClick={mockOnClick} />);

      const badge = screen.getByText('LoopGuard');
      expect(badge).toHaveClass('bg-orange-500/10', 'text-orange-400');
    });

    it('applies node type specific colors for End', () => {
      const endStep = { ...mockStep, nodeType: 'End' as const };

      render(<TraceStepItem step={endStep} index={0} isActive={false} onClick={mockOnClick} />);

      const badge = screen.getByText('End');
      expect(badge).toHaveClass('bg-rose-500/10', 'text-rose-400');
    });
  });

  describe('edge cases', () => {
    it('handles step with no fired edges', () => {
      const noFiredStep = { ...mockStep, firedEdgeIds: [] };

      render(<TraceStepItem step={noFiredStep} index={0} isActive={false} onClick={mockOnClick} />);

      expect(screen.queryByText(/edges? fired/)).not.toBeInTheDocument();
    });

    it('handles step with no blocked edges', () => {
      render(<TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />);

      expect(screen.queryByText(/blocked/)).not.toBeInTheDocument();
    });

    it('handles step with both fired and blocked edges', () => {
      const bothStep = { ...mockStep, firedEdgeIds: ['e1'], blockedEdgeIds: ['e2'] };

      render(<TraceStepItem step={bothStep} index={0} isActive={false} onClick={mockOnClick} />);

      expect(screen.getByText('1 edge fired')).toBeInTheDocument();
      expect(screen.getByText('1 blocked')).toBeInTheDocument();
    });

    it('handles very long explanation text', () => {
      const longExplanationStep = {
        ...mockStep,
        explanation: 'This is a very long explanation that should wrap properly '.repeat(10),
      };

      render(<TraceStepItem step={longExplanationStep} index={0} isActive={false} onClick={mockOnClick} />);

      const explanation = screen.getByText((content) => content.includes('This is a very long'));
      expect(explanation).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has cursor-pointer class for interactivity', () => {
      const { container } = render(
        <TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />
      );

      const stepItem = container.firstChild as HTMLElement;
      expect(stepItem).toHaveClass('cursor-pointer');
    });

    it('has transition classes', () => {
      const { container } = render(
        <TraceStepItem step={mockStep} index={0} isActive={false} onClick={mockOnClick} />
      );

      const stepItem = container.firstChild as HTMLElement;
      expect(stepItem).toHaveClass('transition-all');
    });
  });
});
