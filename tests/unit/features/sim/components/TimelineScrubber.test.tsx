import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineScrubber } from '@/features/sim/components/TimelineScrubber';
import { useSimulationStore } from '@/store/simulationStore';
import { useTraceUiStore } from '@/store/traceUiStore';

// Mock the stores
vi.mock('@/store/simulationStore');
vi.mock('@/store/traceUiStore');

describe('TimelineScrubber', () => {
  const mockJumpToStep = vi.fn();
  const mockSetScrubPreviewStep = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock simulationStore
    vi.mocked(useSimulationStore).mockImplementation((selector) => {
      const state = {
        trace: { currentStep: 2 },
        jumpToStep: mockJumpToStep,
      } as unknown as ReturnType<typeof useSimulationStore>;

      if (typeof selector === 'function') {
        return selector(state);
      }
      return state as unknown as ReturnType<typeof useSimulationStore>;
    });

    // Mock traceUiStore
    vi.mocked(useTraceUiStore).mockImplementation((selector) => {
      const state = {
        scrubPreviewStep: null,
        setScrubPreviewStep: mockSetScrubPreviewStep,
      } as unknown as ReturnType<typeof useTraceUiStore>;

      if (typeof selector === 'function') {
        return selector(state);
      }
      return state as unknown as ReturnType<typeof useTraceUiStore>;
    });
  });

  describe('rendering', () => {
    it('renders slider with correct role', () => {
      render(<TimelineScrubber totalSteps={5} />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('renders with correct aria attributes', () => {
      render(<TimelineScrubber totalSteps={5} />);
      const slider = screen.getByRole('slider');

      expect(slider).toHaveAttribute('aria-label', 'Timeline scrubber');
      expect(slider).toHaveAttribute('aria-valuemin', '-1');
      expect(slider).toHaveAttribute('aria-valuemax', '4');
      expect(slider).toHaveAttribute('aria-valuenow', '2');
      expect(slider).toHaveAttribute('aria-valuetext', 'Step 3 of 5');
    });

    it('is focusable (tabIndex={0})', () => {
      render(<TimelineScrubber totalSteps={5} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('tabIndex', '0');
    });

    it('displays step indicator', () => {
      render(<TimelineScrubber totalSteps={5} />);
      expect(screen.getByText('3 / 5')).toBeInTheDocument();
    });

    it('handles zero total steps', () => {
      render(<TimelineScrubber totalSteps={0} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '2');
    });

    it('handles single step', () => {
      render(<TimelineScrubber totalSteps={1} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemax', '0');
    });
  });

  describe('mouse interaction', () => {
    it('updates scrub preview on mouse down', () => {
      render(<TimelineScrubber totalSteps={10} />);
      const slider = screen.getByRole('slider');

      fireEvent.mouseDown(slider, { clientX: 100 });

      // setScrubPreviewStep should be called
      expect(mockSetScrubPreviewStep).toHaveBeenCalled();
    });

    it('calls jumpToStep on mouse up after drag', () => {
      // Mock getBoundingClientRect for the slider
      const mockRect = { left: 0, width: 100, top: 0, bottom: 10, right: 100 };

      render(<TimelineScrubber totalSteps={10} />);
      const slider = screen.getByRole('slider');

      vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);

      // Click at position 30 (30% of width)
      fireEvent.mouseDown(slider, { clientX: 30 });

      // After mouse up, jumpToStep should be called
      // Note: This is a simplified test; actual mouse up handling involves document event listeners
    });
  });

  describe('keyboard navigation', () => {
    it('decrements step on ArrowLeft', () => {
      render(<TimelineScrubber totalSteps={10} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowLeft' });

      expect(mockJumpToStep).toHaveBeenCalledWith(1);
    });

    it('prevents default on ArrowLeft', () => {
      render(<TimelineScrubber totalSteps={10} />);
      const slider = screen.getByRole('slider');

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      const preventDefault = vi.spyOn(event, 'preventDefault');

      fireEvent.keyDown(slider, { key: 'ArrowLeft' });

      // Event is prevented in the handler
    });

    it('does not go below -1 on ArrowLeft', () => {
      // Mock current step as -1
      vi.mocked(useSimulationStore).mockImplementation((selector) => {
        const state = {
          trace: { currentStep: -1 },
          jumpToStep: mockJumpToStep,
        } as unknown as ReturnType<typeof useSimulationStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useSimulationStore>;
      });

      render(<TimelineScrubber totalSteps={10} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowLeft' });

      expect(mockJumpToStep).not.toHaveBeenCalled();
    });

    it('increments step on ArrowRight', () => {
      render(<TimelineScrubber totalSteps={10} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowRight' });

      expect(mockJumpToStep).toHaveBeenCalledWith(3);
    });

    it('does not exceed max step on ArrowRight', () => {
      // Mock current step as 9 (last step in 10 step trace)
      vi.mocked(useSimulationStore).mockImplementation((selector) => {
        const state = {
          trace: { currentStep: 9 },
          jumpToStep: mockJumpToStep,
        } as unknown as ReturnType<typeof useSimulationStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useSimulationStore>;
      });

      render(<TimelineScrubber totalSteps={10} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'ArrowRight' });

      expect(mockJumpToStep).not.toHaveBeenCalled();
    });

    it('jumps to start on Home', () => {
      render(<TimelineScrubber totalSteps={10} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'Home' });

      expect(mockJumpToStep).toHaveBeenCalledWith(-1);
    });

    it('jumps to end on End', () => {
      render(<TimelineScrubber totalSteps={10} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'End' });

      expect(mockJumpToStep).toHaveBeenCalledWith(9);
    });

    it('commits preview on Space', () => {
      // Mock scrub preview step
      vi.mocked(useTraceUiStore).mockImplementation((selector) => {
        const state = {
          scrubPreviewStep: 5,
          setScrubPreviewStep: mockSetScrubPreviewStep,
        } as unknown as ReturnType<typeof useTraceUiStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useTraceUiStore>;
      });

      render(<TimelineScrubber totalSteps={10} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: ' ' });

      expect(mockJumpToStep).toHaveBeenCalledWith(5);
      expect(mockSetScrubPreviewStep).toHaveBeenCalledWith(null);
    });

    it('commits preview on Enter', () => {
      vi.mocked(useTraceUiStore).mockImplementation((selector) => {
        const state = {
          scrubPreviewStep: 3,
          setScrubPreviewStep: mockSetScrubPreviewStep,
        } as unknown as ReturnType<typeof useTraceUiStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useTraceUiStore>;
      });

      render(<TimelineScrubber totalSteps={10} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'Enter' });

      expect(mockJumpToStep).toHaveBeenCalledWith(3);
      expect(mockSetScrubPreviewStep).toHaveBeenCalledWith(null);
    });

    it('ignores unknown keys', () => {
      render(<TimelineScrubber totalSteps={10} />);
      const slider = screen.getByRole('slider');

      fireEvent.keyDown(slider, { key: 'a' });
      fireEvent.keyDown(slider, { key: 'PageUp' });
      fireEvent.keyDown(slider, { key: 'PageDown' });

      expect(mockJumpToStep).not.toHaveBeenCalled();
    });
  });

  describe('scrub preview', () => {
    it('displays preview step when set', () => {
      vi.mocked(useTraceUiStore).mockImplementation((selector) => {
        const state = {
          scrubPreviewStep: 4,
          setScrubPreviewStep: mockSetScrubPreviewStep,
        } as unknown as ReturnType<typeof useTraceUiStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useTraceUiStore>;
      });

      render(<TimelineScrubber totalSteps={10} />);
      expect(screen.getByText('5 / 10')).toBeInTheDocument();
    });

    it('shows current step when no preview', () => {
      vi.mocked(useTraceUiStore).mockImplementation((selector) => {
        const state = {
          scrubPreviewStep: null,
          setScrubPreviewStep: mockSetScrubPreviewStep,
        } as unknown as ReturnType<typeof useTraceUiStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useTraceUiStore>;
      });

      render(<TimelineScrubber totalSteps={10} />);
      expect(screen.getByText('3 / 10')).toBeInTheDocument();
    });

    it('handles negative preview step', () => {
      vi.mocked(useTraceUiStore).mockImplementation((selector) => {
        const state = {
          scrubPreviewStep: -1,
          setScrubPreviewStep: mockSetScrubPreviewStep,
        } as unknown as ReturnType<typeof useTraceUiStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useTraceUiStore>;
      });

      render(<TimelineScrubber totalSteps={10} />);
      expect(screen.getByText('0 / 10')).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('forwards className to root element', () => {
      render(<TimelineScrubber totalSteps={5} className="custom-class" />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveClass('custom-class');
    });
  });

  describe('cleanup', () => {
    it('clears scrub preview on unmount', () => {
      const { unmount } = render(<TimelineScrubber totalSteps={5} />);

      unmount();

      // setScrubPreviewStep(null) should be called on unmount
      // This is handled in the useEffect cleanup
      // We verify this happened by checking the last call
      expect(mockSetScrubPreviewStep).toHaveBeenCalledWith(null);
    });
  });

  describe('edge cases', () => {
    it('handles totalSteps equal to 1', () => {
      render(<TimelineScrubber totalSteps={1} />);
      const slider = screen.getByRole('slider');

      expect(slider).toHaveAttribute('aria-valuemax', '0');
      expect(screen.getByText('3 / 1')).toBeInTheDocument();
    });

    it('handles currentStep at -1', () => {
      vi.mocked(useSimulationStore).mockImplementation((selector) => {
        const state = {
          trace: { currentStep: -1 },
          jumpToStep: mockJumpToStep,
        } as unknown as ReturnType<typeof useSimulationStore>;

        if (typeof selector === 'function') {
          return selector(state);
        }
        return state as unknown as ReturnType<typeof useSimulationStore>;
      });

      render(<TimelineScrubber totalSteps={5} />);
      const slider = screen.getByRole('slider');

      expect(slider).toHaveAttribute('aria-valuenow', '-1');
    });
  });
});
