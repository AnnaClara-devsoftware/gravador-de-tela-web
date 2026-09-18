import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useToast, type ToastVariant } from '@/hooks/useToast';

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const ACCENT: Record<ToastVariant, string> = {
  success: 'text-[var(--color-success)]',
  error: 'text-[var(--color-rec)]',
  warning: 'text-[var(--color-warn)]',
  info: 'text-[var(--color-accent)]',
};

export function Toaster() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-4 shadow-xl animate-[slideUp_0.2s_ease-out]"
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${ACCENT[toast.variant]}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--color-text)]">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dispensar notificação"
              className="shrink-0 text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
