import type { ReactNode } from 'react';
import clsx from 'clsx';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border-strong)]',
  success: 'bg-[var(--color-success-muted)] text-[var(--color-success)] border-transparent',
  warning: 'bg-[var(--color-warn-muted)] text-[var(--color-warn)] border-transparent',
  danger: 'bg-[var(--color-rec-muted)] text-[var(--color-rec)] border-transparent',
  accent: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-transparent',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
