import { Mic, Camera, Volume2, Monitor, AppWindow, Globe } from 'lucide-react';
import type { CapabilityReport } from '@/lib/compat/detectCapabilities';
import type { RecordingOptions, QualityPreset, WebcamPosition, WebcamSize } from '@/types/recording';
import { QUALITY_LABELS, QUALITY_DESCRIPTIONS } from '@/lib/recording/qualityPresets';
import { useMediaDevices } from '@/hooks/useMediaDevices';
import { ContextualWarning } from './ContextualWarning';

interface RecorderSetupPanelProps {
  options: RecordingOptions;
  onChange: (next: RecordingOptions) => void;
  capabilities: CapabilityReport;
  preferredSurface: 'monitor' | 'window' | 'browser';
  onPreferredSurfaceChange: (surface: 'monitor' | 'window' | 'browser') => void;
}

const QUALITY_OPTIONS: QualityPreset[] = ['auto', 'high', 'medium', 'low'];
const WEBCAM_POSITIONS: Array<{ value: WebcamPosition; label: string }> = [
  { value: 'bottom-right', label: 'Inferior direita' },
  { value: 'bottom-left', label: 'Inferior esquerda' },
  { value: 'top-right', label: 'Superior direita' },
  { value: 'top-left', label: 'Superior esquerda' },
];
const WEBCAM_SIZES: Array<{ value: WebcamSize; label: string }> = [
  { value: 'small', label: 'Pequena' },
  { value: 'medium', label: 'Média' },
  { value: 'large', label: 'Grande' },
];

const SURFACE_OPTIONS: Array<{ value: 'monitor' | 'window' | 'browser'; label: string; icon: typeof Monitor }> = [
  { value: 'monitor', label: 'Tela inteira', icon: Monitor },
  { value: 'window', label: 'Janela', icon: AppWindow },
  { value: 'browser', label: 'Aba do navegador', icon: Globe },
];

export function RecorderSetupPanel({
  options,
  onChange,
  capabilities,
  preferredSurface,
  onPreferredSurfaceChange,
}: RecorderSetupPanelProps) {
  const devices = useMediaDevices(options.microphone || options.webcam);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-medium text-[var(--color-text)]">O que você vai compartilhar</h3>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Isto é apenas uma preferência — a escolha final acontece na janela nativa do navegador.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {SURFACE_OPTIONS.map((surface) => (
            <button
              key={surface.value}
              onClick={() => onPreferredSurfaceChange(surface.value)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs transition-colors ${
                preferredSurface === surface.value
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border-strong)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              <surface.icon size={18} />
              {surface.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-[var(--color-text)]">Qualidade</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUALITY_OPTIONS.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange({ ...options, quality: preset })}
              className={`rounded-lg border px-3 py-2.5 text-left text-xs transition-colors ${
                options.quality === preset
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]'
                  : 'border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              <p className={options.quality === preset ? 'font-medium text-[var(--color-accent)]' : 'font-medium text-[var(--color-text)]'}>
                {QUALITY_LABELS[preset]}
              </p>
              <p className="mt-0.5 text-[var(--color-text-faint)]">{QUALITY_DESCRIPTIONS[preset]}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-[var(--color-text)]">Áudio e câmera</h3>

        <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border-strong)] px-4 py-3">
          <span className="flex items-center gap-2.5 text-sm text-[var(--color-text)]">
            <Mic size={16} className="text-[var(--color-text-muted)]" /> Microfone
          </span>
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--color-accent)]"
            checked={options.microphone}
            onChange={(e) => onChange({ ...options, microphone: e.target.checked })}
          />
        </label>
        {options.microphone && devices.microphones.length > 1 && (
          <select
            className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
            value={options.microphoneDeviceId ?? ''}
            onChange={(e) => onChange({ ...options, microphoneDeviceId: e.target.value || undefined })}
          >
            <option value="">Microfone padrão</option>
            {devices.microphones.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
            ))}
          </select>
        )}

        <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border-strong)] px-4 py-3">
          <span className="flex items-center gap-2.5 text-sm text-[var(--color-text)]">
            <Volume2 size={16} className="text-[var(--color-text-muted)]" /> Áudio do sistema
          </span>
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--color-accent)]"
            checked={options.systemAudio}
            onChange={(e) => onChange({ ...options, systemAudio: e.target.checked })}
          />
        </label>
        {options.systemAudio && capabilities.systemAudio !== 'supported' && (
          <ContextualWarning
            tone="warning"
            title="Áudio do sistema pode não estar disponível"
            description="Seu navegador ou sistema operacional pode não permitir capturar o áudio do sistema nesta configuração. Se isso acontecer, a gravação da tela continuará normalmente, apenas sem esse áudio."
          />
        )}

        <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border-strong)] px-4 py-3">
          <span className="flex items-center gap-2.5 text-sm text-[var(--color-text)]">
            <Camera size={16} className="text-[var(--color-text-muted)]" /> Webcam
          </span>
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--color-accent)]"
            checked={options.webcam}
            onChange={(e) => onChange({ ...options, webcam: e.target.checked })}
          />
        </label>

        {options.webcam && (
          <div className="grid grid-cols-2 gap-3 pl-1">
            <div>
              <label className="text-xs text-[var(--color-text-faint)]">Posição</label>
              <select
                className="mt-1 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
                value={options.webcamPosition}
                onChange={(e) => onChange({ ...options, webcamPosition: e.target.value as WebcamPosition })}
              >
                {WEBCAM_POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-faint)]">Tamanho</label>
              <select
                className="mt-1 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
                value={options.webcamSize}
                onChange={(e) => onChange({ ...options, webcamSize: e.target.value as WebcamSize })}
              >
                {WEBCAM_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {devices.cameras.length > 1 && (
              <div className="col-span-2">
                <label className="text-xs text-[var(--color-text-faint)]">Câmera</label>
                <select
                  className="mt-1 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
                  value={options.webcamDeviceId ?? ''}
                  onChange={(e) => onChange({ ...options, webcamDeviceId: e.target.value || undefined })}
                >
                  <option value="">Câmera padrão</option>
                  {devices.cameras.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
