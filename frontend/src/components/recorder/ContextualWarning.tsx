import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

type WarningTone = 'info' | 'warning' | 'blocking';

const TONE_CONFIG: Record<WarningTone, { icon: LucideIcon; className: string }> = {
  info: { icon: Info, className: 'border-[var(--color-border-strong)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]' },
  warning: { icon: AlertTriangle, className: 'border-[var(--color-warn)]/30 bg-[var(--color-warn-muted)] text-[var(--color-warn)]' },
  blocking: { icon: ShieldAlert, className: 'border-[var(--color-rec)]/30 bg-[var(--color-rec-muted)] text-[var(--color-rec)]' },
};

interface ContextualWarningProps {
  tone?: WarningTone;
  title: string;
  description: string;
}

export function ContextualWarning({ tone = 'warning', title, description }: ContextualWarningProps) {
  const config = TONE_CONFIG[tone];
  const Icon = config.icon;

  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3.5 ${config.className}`} role="alert">
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-sm opacity-90">{description}</p>
      </div>
    </div>
  );
}
