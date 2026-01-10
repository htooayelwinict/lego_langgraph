import type { HTMLAttributes } from 'react';

// Design tokens for trace UI typography
// Aligns with slate dark theme for WCAG AA compliance
const tokens = {
  // Background colors
  bgPrimary: 'bg-slate-950',
  bgSecondary: 'bg-slate-900/70',
  bgElevated: 'bg-slate-800/50',

  // Text colors (WCAG AA: 4.5:1 for body, 3:1 for large)
  textPrimary: 'text-slate-100',
  textSecondary: 'text-slate-200',
  textTertiary: 'text-slate-300',
  textMuted: 'text-slate-400',

  // Border colors
  borderDefault: 'border-slate-800',
  borderSubtle: 'border-slate-800/50',

  // Accent colors
  accentIndigo: 'text-indigo-400',
  accentIndigoBg: 'bg-indigo-400/10',
  accentIndigoBorder: 'border-indigo-400/30',
};

/**
 * TraceHeader - Panel titles with high contrast
 * Usage: Top-level section headers like "Execution Trace"
 */
export function TraceHeader({ className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={`text-sm font-semibold ${tokens.textPrimary} ${className}`}
      {...props}
    />
  );
}

/**
 * TraceSectionTitle - Section headers within panels
 * Usage: Sub-section titles like "State Before", "State After"
 */
export function TraceSectionTitle({ className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-xs font-semibold uppercase tracking-wide ${tokens.textSecondary} ${className}`}
      {...props}
    />
  );
}

/**
 * TraceMetaText - Muted metadata labels
 * Usage: Secondary info like step counts, timestamps, status hints
 */
export function TraceMetaText({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`text-xs ${tokens.textMuted} ${className}`}
      {...props}
    />
  );
}

/**
 * TraceBody - Primary body text
 * Usage: Explanations, descriptions, main content
 */
export function TraceBody({ className = '', ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm ${tokens.textTertiary} ${className}`}
      {...props}
    />
  );
}

/**
 * TraceCode - Monospace text for values, IDs
 * Usage: JSON values, node IDs, edge IDs
 */
export function TraceCode({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={`text-xs font-mono ${tokens.textSecondary} ${className}`}
      {...props}
    />
  );
}

/**
 * TraceCard - Card container with dark theme styling
 * Usage: Expandable trace step cards, panels
 */
export function TraceCard({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`${tokens.bgSecondary} ${tokens.borderDefault} border rounded-lg ${className}`}
      {...props}
    />
  );
}

/**
 * TraceDivider - Visual separator with subtle border
 * Usage: Between sections, steps
 */
export function TraceDivider({ className = '', ...props }: HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={`${tokens.borderSubtle} border-t ${className}`}
      {...props}
    />
  );
}

// Export tokens for use in inline styles
export { tokens as traceTokens };
