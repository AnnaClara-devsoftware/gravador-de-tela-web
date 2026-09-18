import { HardDrive } from 'lucide-react';
import { useStorageEstimate } from '@/hooks/useStorageEstimate';
import { formatBytes } from '@/lib/format';

export function StoragePanel({ recordingCount, refreshKey }: { recordingCount: number; refreshKey: unknown }) {
  const estimate = useStorageEstimate(refreshKey);

  const percentUsed = estimate.quotaBytes ? Math.min(100, (estimate.usageBytes / estimate.quotaBytes) * 100) : null;
  const isNearLimit = percentUsed !== null && percentUsed >= 85;

  return (
    <div className="rounded-xl border border-[var(--color-border)] p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
          <HardDrive size={15} className="text-[var(--color-text-muted)]" /> Armazenamento
        </span>
        <span className="text-xs text-[var(--color-text-faint)]">{recordingCount} gravações</span>
      </div>

      {estimate.supported ? (
        <>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
            <div
              className={`h-full rounded-full ${isNearLimit ? 'bg-[var(--color-rec)]' : 'bg-[var(--color-accent)]'}`}
              style={{ width: `${percentUsed ?? 8}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            {formatBytes(estimate.usageBytes)}
            {estimate.quotaBytes ? ` de ~${formatBytes(estimate.quotaBytes)} estimados pelo navegador` : ''}
          </p>
          {isNearLimit && (
            <p className="mt-1 text-xs text-[var(--color-warn)]">
              Armazenamento quase no limite — considere excluir gravações antigas.
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-xs text-[var(--color-text-faint)]">
          Este navegador não permite estimar o espaço usado com precisão. O limite real varia por dispositivo.
        </p>
      )}
    </div>
  );
}
