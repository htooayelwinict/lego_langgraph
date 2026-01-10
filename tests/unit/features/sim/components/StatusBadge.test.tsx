import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/features/sim/components/StatusBadge';

describe('StatusBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fired status', () => {
    it('renders with correct label', () => {
      render(<StatusBadge status="fired" />);
      expect(screen.getByText('Fired')).toBeInTheDocument();
    });

    it('renders with emerald colors', () => {
      const { container } = render(<StatusBadge status="fired" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/30');
    });

    it('has correct aria-label', () => {
      const { container } = render(<StatusBadge status="fired" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveAttribute('aria-label', 'Step fired - edges executed successfully');
    });

    it('has role="status"', () => {
      const { container } = render(<StatusBadge status="fired" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('renders CheckCircle2 icon', () => {
      const { container } = render(<StatusBadge status="fired" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('blocked status', () => {
    it('renders with correct label', () => {
      render(<StatusBadge status="blocked" />);
      expect(screen.getByText('Blocked')).toBeInTheDocument();
    });

    it('renders with amber colors', () => {
      const { container } = render(<StatusBadge status="blocked" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-amber-500/10', 'text-amber-400', 'border-amber-500/30');
    });

    it('has correct aria-label', () => {
      const { container } = render(<StatusBadge status="blocked" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveAttribute('aria-label', 'Step blocked - conditions not met');
    });

    it('renders Ban icon', () => {
      const { container } = render(<StatusBadge status="blocked" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('pending status', () => {
    it('renders with correct label', () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('renders with slate colors', () => {
      const { container } = render(<StatusBadge status="pending" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-slate-500/10', 'text-slate-400', 'border-slate-500/30');
    });

    it('has correct aria-label', () => {
      const { container } = render(<StatusBadge status="pending" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveAttribute('aria-label', 'Step pending - awaiting execution');
    });

    it('renders Clock icon', () => {
      const { container } = render(<StatusBadge status="pending" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('error status', () => {
    it('renders with correct label', () => {
      render(<StatusBadge status="error" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('renders with red colors', () => {
      const { container } = render(<StatusBadge status="error" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-red-500/10', 'text-red-400', 'border-red-500/30');
    });

    it('has correct aria-label', () => {
      const { container } = render(<StatusBadge status="error" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveAttribute('aria-label', 'Step error - execution failed');
    });

    it('renders AlertCircle icon', () => {
      const { container } = render(<StatusBadge status="error" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('renders with sm size by default', () => {
      const { container } = render(<StatusBadge status="fired" size="sm" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('px-1.5', 'py-0.5', 'text-xs', 'gap-1');
    });

    it('renders with md size', () => {
      const { container } = render(<StatusBadge status="fired" size="md" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('px-2', 'py-1', 'text-sm', 'gap-1.5');
    });

    it('has correct base classes', () => {
      const { container } = render(<StatusBadge status="fired" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded', 'font-medium');
    });
  });

  describe('className prop', () => {
    it('forwards className prop', () => {
      const { container } = render(<StatusBadge status="fired" className="custom-class" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      const { container } = render(
        <StatusBadge status="fired" className="custom-class another-class" />
      );
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('custom-class', 'another-class', 'bg-emerald-500/10');
    });
  });

  describe('icon rendering', () => {
    it('icon has aria-hidden="true"', () => {
      const { container } = render(<StatusBadge status="fired" />);
      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('icon has consistent size', () => {
      const { container } = render(<StatusBadge status="fired" />);
      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('w-3', 'h-3');
    });
  });

  describe('label rendering', () => {
    it('renders label in a separate span', () => {
      render(<StatusBadge status="fired" />);
      const badge = screen.getByRole('status');
      const labelSpan = badge.querySelector('span:not([aria-hidden])');
      expect(labelSpan).toHaveTextContent('Fired');
    });
  });

  describe('all statuses', () => {
    const statuses: Array<'fired' | 'blocked' | 'pending' | 'error'> = ['fired', 'blocked', 'pending', 'error'];

    it.each(statuses)('renders %s status with required attributes', (status) => {
      const { container } = render(<StatusBadge status={status} />);
      const badge = container.querySelector('span');

      expect(badge).toHaveAttribute('role', 'status');
      expect(badge).toHaveAttribute('aria-label');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded', 'font-medium');
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
