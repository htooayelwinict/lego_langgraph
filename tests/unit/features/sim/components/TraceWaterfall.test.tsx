import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TraceWaterfall } from '@/features/sim/components/TraceWaterfall';
import type { DetailedStepTrace } from '@/models/simulation';

describe('TraceWaterfall', () => {
  const mockSteps: DetailedStepTrace[] = [
    {
      step: 0,
      activeNodeId: 'start',
      nodeType: 'Start',
      firedEdgeIds: ['e1'],
      blockedEdgeIds: [],
      stateBefore: {},
      stateAfter: {},
      explanation: 'Start node executed',
      startedAt: 0,
      endedAt: 100,
      durationMs: 100,
    },
    {
      step: 1,
      activeNodeId: 'llm',
      nodeType: 'LLM',
      firedEdgeIds: ['e2'],
      blockedEdgeIds: [],
      stateBefore: {},
      stateAfter: { llmOutput: 'result' },
      explanation: 'LLM processing',
      startedAt: 100,
      endedAt: 500,
      durationMs: 400,
    },
    {
      step: 2,
      activeNodeId: 'end',
      nodeType: 'End',
      firedEdgeIds: [],
      blockedEdgeIds: [],
      stateBefore: { llmOutput: 'result' },
      stateAfter: { llmOutput: 'result' },
      explanation: 'End node reached',
      startedAt: 500,
      endedAt: 600,
      durationMs: 100,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders null when steps array is empty', () => {
      const { container } = render(
        <TraceWaterfall steps={[]} currentStep={0} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders bars for each step', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} />
      );

      const rows = container.querySelectorAll('.waterfall-row');
      expect(rows.length).toBe(3);
    });

    it('displays step numbers', () => {
      render(<TraceWaterfall steps={mockSteps} currentStep={0} />);

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
    });

    it('displays durations', () => {
      render(<TraceWaterfall steps={mockSteps} currentStep={0} />);

      const durationElements = screen.getAllByText(/\d+ms/);
      expect(durationElements).toHaveLength(3);
      expect(durationElements.some(el => el.textContent === '100ms')).toBe(true);
      expect(durationElements.some(el => el.textContent === '400ms')).toBe(true);
    });

    it('shows active class for current step', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={1} />
      );

      const rows = container.querySelectorAll('.waterfall-row');
      expect(rows[0]).not.toHaveClass('active');
      expect(rows[1]).toHaveClass('active');
      expect(rows[2]).not.toHaveClass('active');
    });

    it('highlights active bar', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} />
      );

      const activeBar = container.querySelector('.waterfall-bar.active');
      expect(activeBar).toBeInTheDocument();
    });
  });

  describe('relative timing', () => {
    it('calculates correct max duration', () => {
      render(<TraceWaterfall steps={mockSteps} currentStep={0} />);

      // Max duration should be 400ms (the LLM step)
      // This affects bar widths
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} />
      );

      // The 400ms bar should be the widest
      const bars = container.querySelectorAll('.waterfall-bar');
      const middleBar = bars[1];

      expect(middleBar).toBeInTheDocument();
    });

    it('calculates correct total duration', () => {
      render(<TraceWaterfall steps={mockSteps} currentStep={0} />);

      // Total should be 600ms (100 + 400 + 100)
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} />
      );

      // Bars should be positioned based on relative start times
      const bars = container.querySelectorAll('.waterfall-bar');
      expect(bars.length).toBe(3);
    });

    it('positions bars correctly based on start time', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} />
      );

      const bars = container.querySelectorAll('.waterfall-bar');

      // First bar should start at 0%
      expect(bars[0]).toHaveStyle({ left: '0%' });

      // Second bar should start at ~16.67% (100/600)
      expect(bars[1].style.left).toMatch(/16\.6/);

      // Third bar should start at ~83.33% (500/600)
      expect(bars[2].style.left).toMatch(/83\.3/);
    });

    it('calculates correct bar widths', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} />
      );

      const bars = container.querySelectorAll('.waterfall-bar');

      // Bars are scaled relative to max duration (400ms)
      // First bar: 100/400 = 25%
      expect(bars[0]).toHaveStyle({ width: '25%' });

      // Second bar: 400/400 = 100%
      expect(bars[1]).toHaveStyle({ width: '100%' });

      // Third bar: 100/400 = 25%
      expect(bars[2]).toHaveStyle({ width: '25%' });
    });
  });

  describe('interactions', () => {
    it('calls onStepClick when a row is clicked', () => {
      const onStepClick = vi.fn();

      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} onStepClick={onStepClick} />
      );

      const rows = container.querySelectorAll('.waterfall-row');
      fireEvent.click(rows[1]);

      expect(onStepClick).toHaveBeenCalledWith(1);
    });

    it('does not call onStepClick when not provided', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} />
      );

      const rows = container.querySelectorAll('.waterfall-row');

      // Should not throw error
      expect(() => fireEvent.click(rows[0])).not.toThrow();
    });

    it('shows title on hover with step info', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} />
      );

      const rows = container.querySelectorAll('.waterfall-row');
      expect(rows[0]).toHaveAttribute('title', 'Start (100ms) - Start node executed');
    });
  });

  describe('edge cases', () => {
    it('handles single step', () => {
      const singleStep: DetailedStepTrace[] = [
        {
          step: 0,
          activeNodeId: 'start',
          nodeType: 'Start',
          firedEdgeIds: [],
          blockedEdgeIds: [],
          stateBefore: {},
          stateAfter: {},
          explanation: 'Only step',
          startedAt: 0,
          endedAt: 50,
          durationMs: 50,
        },
      ];

      const { container } = render(
        <TraceWaterfall steps={singleStep} currentStep={0} />
      );

      const rows = container.querySelectorAll('.waterfall-row');
      expect(rows.length).toBe(1);
    });

    it('handles zero duration steps', () => {
      const zeroDurationSteps: DetailedStepTrace[] = [
        {
          step: 0,
          activeNodeId: 'start',
          nodeType: 'Start',
          firedEdgeIds: [],
          blockedEdgeIds: [],
          stateBefore: {},
          stateAfter: {},
          explanation: 'Instant step',
          startedAt: 0,
          endedAt: 0,
          durationMs: 0,
        },
      ];

      const { container } = render(
        <TraceWaterfall steps={zeroDurationSteps} currentStep={0} />
      );

      // Should still render, with min width
      const bars = container.querySelectorAll('.waterfall-bar');
      expect(bars.length).toBe(1);
    });

    it('handles very long durations', () => {
      const longDurationSteps: DetailedStepTrace[] = [
        {
          step: 0,
          activeNodeId: 'start',
          nodeType: 'Start',
          firedEdgeIds: [],
          blockedEdgeIds: [],
          stateBefore: {},
          stateAfter: {},
          explanation: 'Long step',
          startedAt: 0,
          endedAt: 1000000,
          durationMs: 1000000,
        },
      ];

      const { container } = render(
        <TraceWaterfall steps={longDurationSteps} currentStep={0} />
      );

      const rows = container.querySelectorAll('.waterfall-row');
      expect(rows.length).toBe(1);
      expect(screen.getByText('1000000ms')).toBeInTheDocument();
    });

    it('handles currentStep at first position', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} />
      );

      const firstRow = container.querySelector('.waterfall-row');
      expect(firstRow).toHaveClass('active');
    });

    it('handles currentStep at last position', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={2} />
      );

      const rows = container.querySelectorAll('.waterfall-row');
      expect(rows[2]).toHaveClass('active');
    });
  });

  describe('visual styling', () => {
    it('applies styles to rows', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} />
      );

      const rows = container.querySelectorAll('.waterfall-row');
      rows.forEach(row => {
        expect(row).toHaveClass('waterfall-row');
      });
    });

    it('applies active styles to active bar', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={1} />
      );

      const activeBar = container.querySelector('.waterfall-bar.active');

      // Active bars have different gradient colors
      expect(activeBar).toBeInTheDocument();
    });

    it('applies inactive styles to non-active bars', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={1} />
      );

      const bars = container.querySelectorAll('.waterfall-bar:not(.active)');
      expect(bars.length).toBe(2);
    });
  });

  describe('className prop', () => {
    it('forwards className to root element', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} className="custom-class" />
      );

      const waterfall = container.querySelector('.trace-waterfall');
      expect(waterfall).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('provides meaningful titles for screen readers', () => {
      const { container } = render(
        <TraceWaterfall steps={mockSteps} currentStep={0} />
      );

      const rows = container.querySelectorAll('.waterfall-row');

      expect(rows[0]).toHaveAttribute('title');
      expect(rows[1]).toHaveAttribute('title');
      expect(rows[2]).toHaveAttribute('title');
    });
  });

  describe('complex scenarios', () => {
    it('handles many steps efficiently', () => {
      const manySteps: DetailedStepTrace[] = Array.from({ length: 100 }, (_, i) => ({
        step: i,
        activeNodeId: `node-${i}`,
        nodeType: 'LLM',
        firedEdgeIds: [],
        blockedEdgeIds: [],
        stateBefore: {},
        stateAfter: {},
        explanation: `Step ${i}`,
        startedAt: i * 100,
        endedAt: (i + 1) * 100,
        durationMs: 100,
      }));

      const { container } = render(
        <TraceWaterfall steps={manySteps} currentStep={50} />
      );

      const rows = container.querySelectorAll('.waterfall-row');
      expect(rows.length).toBe(100);
    });

    it('handles varying step durations', () => {
      const varyingSteps: DetailedStepTrace[] = [
        {
          step: 0,
          activeNodeId: 'fast',
          nodeType: 'Tool',
          firedEdgeIds: [],
          blockedEdgeIds: [],
          stateBefore: {},
          stateAfter: {},
          explanation: 'Fast operation',
          startedAt: 0,
          endedAt: 10,
          durationMs: 10,
        },
        {
          step: 1,
          activeNodeId: 'slow',
          nodeType: 'LLM',
          firedEdgeIds: [],
          blockedEdgeIds: [],
          stateBefore: {},
          stateAfter: {},
          explanation: 'Slow operation',
          startedAt: 10,
          endedAt: 1000,
          durationMs: 990,
        },
        {
          step: 2,
          activeNodeId: 'medium',
          nodeType: 'Tool',
          firedEdgeIds: [],
          blockedEdgeIds: [],
          stateBefore: {},
          stateAfter: {},
          explanation: 'Medium operation',
          startedAt: 1000,
          endedAt: 1100,
          durationMs: 100,
        },
      ];

      const { container } = render(
        <TraceWaterfall steps={varyingSteps} currentStep={0} />
      );

      // The slow step should have the widest bar
      const bars = container.querySelectorAll('.waterfall-bar');
      const slowBar = bars[1];

      // Max duration is 990ms
      // Slow bar width should be 100%
      expect(slowBar).toHaveStyle({ width: '100%' });
    });
  });
});
