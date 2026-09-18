import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, description, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${SIZE_CLASSES[size]} max-h-[85vh] overflow-y-auto scrollbar-thin rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6 shadow-2xl`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-[var(--color-text)]">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
