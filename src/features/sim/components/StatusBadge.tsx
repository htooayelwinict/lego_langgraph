import { CheckCircle2, Ban, Clock, AlertCircle } from 'lucide-react';

type StepStatus = 'fired' | 'blocked' | 'pending' | 'error';

interface StatusBadgeProps {
  status: StepStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig = {
  fired: {
    label: 'Fired',
    icon: CheckCircle2,
    colors: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    ariaLabel: 'Step fired - edges executed successfully',
  },
  blocked: {
    label: 'Blocked',
    icon: Ban,
    colors: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    ariaLabel: 'Step blocked - conditions not met',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    colors: 'bg-slate-500/10 text-slate-400 border border-slate-500/30',
    ariaLabel: 'Step pending - awaiting execution',
  },
  error: {
    label: 'Error',
    icon: AlertCircle,
    colors: 'bg-red-500/10 text-red-400 border border-red-500/30',
    ariaLabel: 'Step error - execution failed',
  },
};

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-xs gap-1',
  md: 'px-2 py-1 text-sm gap-1.5',
};

export function StatusBadge({ status, size = 'sm', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeClass = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${config.colors} ${sizeClass} ${className}`}
      aria-label={config.ariaLabel}
      role="status"
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
