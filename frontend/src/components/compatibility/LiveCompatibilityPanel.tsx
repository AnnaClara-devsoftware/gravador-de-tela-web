import { useCapabilities } from '@/hooks/useCapabilities';
import { BROWSER_LABELS } from '@/lib/compat/detectCapabilities';
import { SupportLevelBadge } from './SupportBadge';
import { Lock, LockOpen } from 'lucide-react';

const ROWS: Array<{ key: 'screenRecording' | 'microphone' | 'systemAudio' | 'webcam'; label: string }> = [
  { key: 'screenRecording', label: 'Tela' },
  { key: 'microphone', label: 'Microfone' },
  { key: 'systemAudio', label: 'Áudio do sistema' },
  { key: 'webcam', label: 'Webcam' },
];

export function LiveCompatibilityPanel() {
  const caps = useCapabilities();

  const summary = caps.screenRecording === 'supported'
    ? caps.systemAudio === 'unsupported'
      ? 'Seu navegador permite gravação de tela, mas o áudio do sistema pode não estar disponível.'
      : 'Seu navegador é compatível com a gravação de tela.'
    : !caps.isSecureContext
      ? 'Esta página não está em uma conexão segura (HTTPS), então a gravação está desativada.'
      : 'Este navegador não suporta as APIs necessárias para gravação de tela.';

  return (
    <div className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-faint)]">Seu ambiente agora</p>
          <p className="mt-1 text-base font-medium text-[var(--color-text)]">
            {BROWSER_LABELS[caps.browserName]}
            {caps.browserVersion ? ` ${caps.browserVersion.split('.')[0]}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-xs text-[var(--color-text-muted)]">
          {caps.isSecureContext ? <Lock size={13} className="text-[var(--color-success)]" /> : <LockOpen size={13} className="text-[var(--color-rec)]" />}
          {caps.isSecureContext ? 'Conexão segura' : 'Sem HTTPS'}
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
        {summary}
      </p>

      <dl className="mt-5 divide-y divide-[var(--color-border)]">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between py-3">
            <dt className="text-sm text-[var(--color-text)]">{row.label}</dt>
            <dd>
              <SupportLevelBadge level={caps[row.key]} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
