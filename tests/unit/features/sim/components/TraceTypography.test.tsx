import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  TraceHeader,
  TraceSectionTitle,
  TraceMetaText,
  TraceBody,
  TraceCode,
  TraceCard,
  TraceDivider,
} from '@/features/sim/components/TraceTypography';

describe('TraceTypography', () => {
  describe('TraceHeader', () => {
    it('renders with correct className', () => {
      render(<TraceHeader>Header Text</TraceHeader>);
      const header = screen.getByRole('heading', { level: 2 });
      expect(header).toHaveClass('text-sm', 'font-semibold', 'text-slate-100');
    });

    it('forwards className prop', () => {
      render(<TraceHeader className="custom-class">Header</TraceHeader>);
      const header = screen.getByRole('heading', { level: 2 });
      expect(header).toHaveClass('custom-class');
    });

    it('renders children', () => {
      render(<TraceHeader>Test Header</TraceHeader>);
      expect(screen.getByText('Test Header')).toBeInTheDocument();
    });

    it('is an h2 element', () => {
      render(<TraceHeader>Header</TraceHeader>);
      const header = screen.getByRole('heading', { level: 2 });
      expect(header.tagName).toBe('H2');
    });
  });

  describe('TraceSectionTitle', () => {
    it('renders with correct className', () => {
      render(<TraceSectionTitle>Section Title</TraceSectionTitle>);
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveClass('text-xs', 'font-semibold', 'uppercase', 'tracking-wide', 'text-slate-200');
    });

    it('forwards className prop', () => {
      render(<TraceSectionTitle className="custom-class">Title</TraceSectionTitle>);
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveClass('custom-class');
    });

    it('renders children', () => {
      render(<TraceSectionTitle>Test Title</TraceSectionTitle>);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('is an h3 element', () => {
      render(<TraceSectionTitle>Title</TraceSectionTitle>);
      const title = screen.getByRole('heading', { level: 3 });
      expect(title.tagName).toBe('H3');
    });
  });

  describe('TraceMetaText', () => {
    it('renders with correct className', () => {
      render(<TraceMetaText>Meta Text</TraceMetaText>);
      const span = screen.getByText('Meta Text');
      expect(span).toHaveClass('text-xs', 'text-slate-400');
    });

    it('forwards className prop', () => {
      render(<TraceMetaText className="custom-class">Meta</TraceMetaText>);
      const span = screen.getByText('Meta');
      expect(span).toHaveClass('custom-class');
    });

    it('renders children', () => {
      render(<TraceMetaText>Step 1 of 5</TraceMetaText>);
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    });

    it('is a span element', () => {
      render(<TraceMetaText>Meta</TraceMetaText>);
      const span = screen.getByText('Meta');
      expect(span.tagName).toBe('SPAN');
    });
  });

  describe('TraceBody', () => {
    it('renders with correct className', () => {
      render(<TraceBody>Body text</TraceBody>);
      const p = screen.getByText('Body text');
      expect(p).toHaveClass('text-sm', 'text-slate-300');
    });

    it('forwards className prop', () => {
      render(<TraceBody className="custom-class">Body</TraceBody>);
      const p = screen.getByText('Body');
      expect(p).toHaveClass('custom-class');
    });

    it('renders children', () => {
      render(<TraceBody>This is explanation text</TraceBody>);
      expect(screen.getByText('This is explanation text')).toBeInTheDocument();
    });

    it('is a paragraph element', () => {
      render(<TraceBody>Body</TraceBody>);
      const p = screen.getByText('Body');
      expect(p.tagName).toBe('P');
    });
  });

  describe('TraceCode', () => {
    it('renders with correct className', () => {
      render(<TraceCode>code_text</TraceCode>);
      const code = screen.getByText('code_text');
      expect(code).toHaveClass('text-xs', 'font-mono', 'text-slate-200');
    });

    it('forwards className prop', () => {
      render(<TraceCode className="custom-class">code</TraceCode>);
      const code = screen.getByText('code');
      expect(code).toHaveClass('custom-class');
    });

    it('renders children', () => {
      render(<TraceCode>{`const x = 1;`}</TraceCode>);
      expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    });

    it('is a code element', () => {
      render(<TraceCode>code</TraceCode>);
      const code = screen.getByText('code');
      expect(code.tagName).toBe('CODE');
    });
  });

  describe('TraceCard', () => {
    it('renders with correct className', () => {
      render(<TraceCard>Card content</TraceCard>);
      const card = screen.getByText('Card content');
      expect(card).toHaveClass('bg-slate-900/70', 'border', 'border-slate-800', 'rounded-lg');
    });

    it('forwards className prop', () => {
      render(<TraceCard className="custom-class">Card</TraceCard>);
      const card = screen.getByText('Card');
      expect(card).toHaveClass('custom-class');
    });

    it('renders children', () => {
      render(<TraceCard><span>Card content</span></TraceCard>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('is a div element', () => {
      render(<TraceCard>Card</TraceCard>);
      const card = screen.getByText('Card');
      expect(card.tagName).toBe('DIV');
    });
  });

  describe('TraceDivider', () => {
    it('renders with correct className', () => {
      const { container } = render(<TraceDivider />);
      const hr = container.querySelector('hr');
      expect(hr).toHaveClass('border-t', 'border-slate-800/50');
    });

    it('forwards className prop', () => {
      const { container } = render(<TraceDivider className="custom-class" />);
      const hr = container.querySelector('hr');
      expect(hr).toHaveClass('custom-class');
    });

    it('is an hr element', () => {
      const { container } = render(<TraceDivider />);
      const hr = container.querySelector('hr');
      expect(hr?.tagName).toBe('HR');
    });
  });

  describe('component integration', () => {
    it('renders multiple components together', () => {
      render(
        <TraceCard>
          <TraceHeader>Title</TraceHeader>
          <TraceDivider />
          <TraceSectionTitle>Section</TraceSectionTitle>
          <TraceBody>Body text</TraceBody>
          <TraceMetaText>Meta info</TraceMetaText>
          <TraceCode>code_value</TraceCode>
        </TraceCard>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Section')).toBeInTheDocument();
      expect(screen.getByText('Body text')).toBeInTheDocument();
      expect(screen.getByText('Meta info')).toBeInTheDocument();
      expect(screen.getByText('code_value')).toBeInTheDocument();
    });
  });
});
