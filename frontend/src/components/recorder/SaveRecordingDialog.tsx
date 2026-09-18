import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatBytes, formatDuration } from '@/lib/format';
import type { FinishedRecording } from '@/lib/recording/RecordingEngine';

interface SaveRecordingDialogProps {
  isOpen: boolean;
  finished: FinishedRecording | null;
  defaultName: string;
  isSaving: boolean;
  onSave: (name: string) => void;
  onDiscard: () => void;
}

export function SaveRecordingDialog({
  isOpen,
  finished,
  defaultName,
  isSaving,
  onSave,
  onDiscard,
}: SaveRecordingDialogProps) {
  const [name, setName] = useState(defaultName);

  if (!finished) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onDiscard}
      title="Gravação concluída"
      description="Dê um nome para salvar na sua biblioteca local, ou descarte se não precisar dela."
      size="md"
    >
      <div className="space-y-4">
        <video
          src={URL.createObjectURL(finished.blob)}
          controls
          className="w-full rounded-lg border border-[var(--color-border-strong)]"
        />

        <div className="flex gap-4 text-xs text-[var(--color-text-muted)]">
          <span>Duração: {formatDuration(finished.durationMs)}</span>
          <span>Tamanho: {formatBytes(finished.blob.size)}</span>
        </div>

        <div>
          <label htmlFor="recording-name" className="text-xs font-medium text-[var(--color-text-muted)]">
            Nome da gravação
          </label>
          <input
            id="recording-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)]"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onDiscard} disabled={isSaving}>
            Descartar
          </Button>
          <Button onClick={() => onSave(name.trim() || defaultName)} isLoading={isSaving}>
            Salvar na biblioteca
          </Button>
        </div>
      </div>
    </Modal>
  );
}
