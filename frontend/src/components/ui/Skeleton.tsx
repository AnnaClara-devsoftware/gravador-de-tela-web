import clsx from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx('relative overflow-hidden rounded-lg bg-[var(--color-surface-2)]', className)}
    >
      <div className="absolute inset-0 -translate-x-full animate-[scan_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}
