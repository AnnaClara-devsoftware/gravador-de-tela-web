import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border-strong)] px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
        <Icon size={22} />
      </div>
      <h3 className="text-base font-medium text-[var(--color-text)]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--color-text-muted)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
