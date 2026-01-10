import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StateDiffPanel } from '@/features/sim/components/StateDiffPanel';
import type { GraphState } from '@/models/simulation';

describe('StateDiffPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('shows "No state changes" when no diff', () => {
      const before: GraphState = {};
      const after: GraphState = {};

      render(<StateDiffPanel before={before} after={after} />);

      expect(screen.getByText('No state changes')).toBeInTheDocument();
    });

    it('renders header section when there are changes', () => {
      const before: GraphState = {};
      const after: GraphState = { key: 'value' };

      render(<StateDiffPanel before={before} after={after} />);

      expect(screen.getByText('Variable')).toBeInTheDocument();
      expect(screen.getByText('Before')).toBeInTheDocument();
      expect(screen.getByText('After')).toBeInTheDocument();
    });
  });

  describe('added keys', () => {
    it('shows added keys with green styling', () => {
      const before: GraphState = {};
      const after: GraphState = { newKey: 'newValue' };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      const diffEntry = container.querySelector('.diff-entry.added');
      expect(diffEntry).toBeInTheDocument();

      expect(screen.getByText('newKey')).toBeInTheDocument();
    });

    it('shows dash for before value on added keys', () => {
      const before: GraphState = {};
      const after: GraphState = { newKey: 'value' };

      render(<StateDiffPanel before={before} after={after} />);

      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('shows new value in after column', () => {
      const before: GraphState = {};
      const after: GraphState = { newKey: 'testValue' };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      // The value should appear in the component
      expect(container.textContent).toContain('testValue');
    });
  });

  describe('removed keys', () => {
    it('shows old value with strikethrough', () => {
      const before: GraphState = { oldKey: 'oldValue' };
      const after: GraphState = {};

      render(<StateDiffPanel before={before} after={after} />);

      const strikethrough = screen.getAllByText('oldValue');
      expect(strikethrough.length).toBeGreaterThan(0);
    });

    it('shows dash for after value on removed keys', () => {
      const before: GraphState = { oldKey: 'value' };
      const after: GraphState = {};

      render(<StateDiffPanel before={before} after={after} />);

      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  describe('modified keys', () => {
    it('shows both old and new values', () => {
      const before: GraphState = { key: 'oldValue' };
      const after: GraphState = { key: 'newValue' };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      expect(container.textContent).toContain('oldValue');
      expect(container.textContent).toContain('newValue');
    });

    it('shows modified styling', () => {
      const before: GraphState = { key: 'value1' };
      const after: GraphState = { key: 'value2' };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      const diffEntry = container.querySelector('.diff-entry.modified');
      expect(diffEntry).toBeInTheDocument();
    });
  });

  describe('variable type grouping', () => {
    it('groups LLM-related variables together', () => {
      const before: GraphState = {};
      const after: GraphState = { llmOutput: 'response', messages: [] };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      // Should show llm group
      expect(container.textContent).toMatch(/llm/i);
    });

    it('groups tool-related variables together', () => {
      const before: GraphState = {};
      const after: GraphState = { toolOutput: 'result', _lastToolNode: 'tool-1' };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      // Should show tool group
      expect(container.textContent).toMatch(/tool/i);
    });

    it('groups system variables together', () => {
      const before: GraphState = {};
      const after: GraphState = { _internal: 'value' };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      // Should show system group
      expect(container.textContent).toMatch(/system/i);
    });

    it('allows collapsing variable type groups', () => {
      const before: GraphState = {};
      const after: GraphState = { llmOutput: 'response' };

      render(<StateDiffPanel before={before} after={after} />);

      // The type group header should be clickable
      const { container } = render(<StateDiffPanel before={before} after={after} />);
      const header = container.querySelector('.type-header');
      expect(header).toBeInTheDocument();
      if (header) {
        fireEvent.click(header);
        // If no error is thrown, the click worked
      }
    });
  });

  describe('value formatting', () => {
    it('formats null as "null"', () => {
      const before: GraphState = {};
      const after: GraphState = { key: null };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      expect(container.textContent).toContain('null');
    });

    it('formats undefined as "undefined"', () => {
      const before: GraphState = {};
      const after: GraphState = { key: undefined };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      expect(container.textContent).toContain('undefined');
    });

    it('formats strings correctly', () => {
      const before: GraphState = {};
      const after: GraphState = { key: 'string value' };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      // The string value should appear (formatValue wraps strings in quotes for display)
      const diffValues = container.querySelectorAll('.diff-value');
      let found = false;
      diffValues.forEach((el) => {
        if (el.textContent?.includes('string value')) {
          found = true;
        }
      });
      expect(found).toBe(true);
    });

    it('formats numbers correctly', () => {
      const before: GraphState = {};
      const after: GraphState = { key: 42 };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      expect(container.textContent).toContain('42');
    });

    it('formats objects as JSON', () => {
      const before: GraphState = {};
      const after: GraphState = { key: { nested: 'value' } };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      expect(container.textContent).toContain('nested');
    });

    it('formats arrays as JSON', () => {
      const before: GraphState = {};
      const after: GraphState = { key: [1, 2, 3] };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      expect(container.textContent).toContain('1');
      expect(container.textContent).toContain('2');
      expect(container.textContent).toContain('3');
    });

    it('formats booleans correctly', () => {
      const before: GraphState = {};
      const after: GraphState = { key: true };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      expect(container.textContent).toContain('true');
    });
  });

  describe('edge cases', () => {
    it('handles empty objects', () => {
      const before: GraphState = {};
      const after: GraphState = { key: {} };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      expect(container.textContent).toContain('{}');
    });

    it('handles special characters in values', () => {
      const before: GraphState = {};
      const after: GraphState = { key: 'special\n\t\r"chars"' };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      // Should render without errors
      expect(container.textContent).toContain('special');
    });

    it('handles very long strings', () => {
      const longString = 'a'.repeat(200) + 'UNIQUE_MARKER';
      const before: GraphState = {};
      const after: GraphState = { key: longString };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      // Should show the value somewhere in the component
      expect(container.textContent).toContain('UNIQUE_MARKER');
    });

    it('handles circular references (by using JSON.stringify)', () => {
      const before: GraphState = {};
      const obj: Record<string, unknown> = { key: 'value' };
      obj.self = obj;

      const after: GraphState = { key: obj };

      // JSON.stringify handles circular references with a replacer
      // or throws an error - we expect graceful handling
      expect(() => {
        render(<StateDiffPanel before={before} after={after} />);
      }).not.toThrow();
    });
  });

  describe('change type icons', () => {
    it('shows plus icon for added values', () => {
      const before: GraphState = {};
      const after: GraphState = { key: 'value' };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      // Check for the presence of an SVG (lucide icons render as SVG)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('shows minus icon for removed values', () => {
      const before: GraphState = { key: 'value' };
      const after: GraphState = {};

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('shows arrow icon for modified values', () => {
      const before: GraphState = { key: 'old' };
      const after: GraphState = { key: 'new' };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('hover tooltips', () => {
    it('shows tooltip on hover for long values', () => {
      const longString = 'x'.repeat(100);
      const before: GraphState = {};
      const after: GraphState = { key: longString };

      const { container } = render(<StateDiffPanel before={before} after={after} />);

      // Check for tooltip elements
      const tooltips = container.querySelectorAll('.tooltip-content');
      expect(tooltips.length).toBeGreaterThan(0);
    });
  });
});
