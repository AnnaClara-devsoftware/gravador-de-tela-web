import { Check, AlertTriangle, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { SupportLevel } from '@/lib/compat/detectCapabilities';
import type { MatrixSupport } from '@/lib/compat/browserMatrix';

const SUPPORT_LEVEL_CONFIG: Record<SupportLevel, { tone: 'success' | 'warning' | 'danger'; label: string; icon: typeof Check }> = {
  supported: { tone: 'success', label: 'Compatível', icon: Check },
  unsure: { tone: 'warning', label: 'Pode variar', icon: AlertTriangle },
  unsupported: { tone: 'danger', label: 'Não compatível', icon: X },
};

export function SupportLevelBadge({ level }: { level: SupportLevel }) {
  const config = SUPPORT_LEVEL_CONFIG[level];
  const Icon = config.icon;
  return (
    <Badge tone={config.tone}>
      <Icon size={12} />
      {config.label}
    </Badge>
  );
}

const MATRIX_CONFIG: Record<MatrixSupport, { symbol: string; className: string; label: string }> = {
  yes: { symbol: '✓', className: 'text-[var(--color-success)]', label: 'Compatível' },
  partial: { symbol: '~', className: 'text-[var(--color-warn)]', label: 'Parcial' },
  no: { symbol: '✕', className: 'text-[var(--color-text-faint)]', label: 'Não suportado' },
};

export function MatrixCell({ value }: { value: MatrixSupport }) {
  const config = MATRIX_CONFIG[value];
  return (
    <span className={`font-semibold ${config.className}`} title={config.label} aria-label={config.label}>
      {config.symbol}
    </span>
  );
}
