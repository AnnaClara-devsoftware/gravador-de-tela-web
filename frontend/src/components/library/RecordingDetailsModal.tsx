import { useState } from 'react';
import { Download, Trash2, Check, Pencil } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { VideoPlayer } from './VideoPlayer';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { formatBytes, formatDuration, formatRelativeDate, extensionFromMimeType } from '@/lib/format';
import { QUALITY_LABELS } from '@/lib/recording/qualityPresets';
import type { RecordingRecord } from '@/types/recording';

interface RecordingDetailsModalProps {
  record: RecordingRecord | null;
  onClose: () => void;
  onRename: (id: string, name: string) => void;
  onDownload: (record: RecordingRecord) => void;
  onDeleteRequest: (record: RecordingRecord) => void;
}

export function RecordingDetailsModal({ record, onClose, onRename, onDownload, onDeleteRequest }: RecordingDetailsModalProps) {
  const videoUrl = useObjectUrl(record?.videoBlob);
  const thumbnailUrl = useObjectUrl(record?.thumbnailBlob);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');

  if (!record) return null;

  function startEditing() {
    setDraftName(record!.name);
    setIsEditingName(true);
  }

  function confirmRename() {
    const trimmed = draftName.trim();
    if (trimmed) onRename(record!.id, trimmed);
    setIsEditingName(false);
  }

  return (
    <Modal isOpen={!!record} onClose={onClose} title="" size="xl">
      <div className="-mt-8">
        {videoUrl && <VideoPlayer src={videoUrl} poster={thumbnailUrl ?? undefined} />}

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
                  className="w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] px-2 py-1 text-base font-medium text-[var(--color-text)]"
                />
                <button onClick={confirmRename} aria-label="Confirmar novo nome" className="text-[var(--color-success)]">
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <button onClick={startEditing} className="group flex items-center gap-2 text-left">
                <h3 className="truncate text-base font-medium text-[var(--color-text)]">{record.name}</h3>
                <Pencil size={13} className="shrink-0 text-[var(--color-text-faint)] opacity-0 group-hover:opacity-100" />
              </button>
            )}

            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)] sm:grid-cols-3">
              <div><dt className="inline text-[var(--color-text-faint)]">Data: </dt><dd className="inline">{formatRelativeDate(record.createdAt)}</dd></div>
              <div><dt className="inline text-[var(--color-text-faint)]">Duração: </dt><dd className="inline">{formatDuration(record.durationMs)}</dd></div>
              <div><dt className="inline text-[var(--color-text-faint)]">Tamanho: </dt><dd className="inline">{formatBytes(record.sizeBytes)}</dd></div>
              <div><dt className="inline text-[var(--color-text-faint)]">Formato: </dt><dd className="inline">.{extensionFromMimeType(record.mimeType)}</dd></div>
              <div><dt className="inline text-[var(--color-text-faint)]">Qualidade: </dt><dd className="inline">{QUALITY_LABELS[record.quality]}</dd></div>
              <div><dt className="inline text-[var(--color-text-faint)]">Resolução: </dt><dd className="inline">{record.width}×{record.height}</dd></div>
            </dl>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="sm" onClick={() => onDownload(record)}>
              <Download size={14} /> Baixar
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDeleteRequest(record)}>
              <Trash2 size={14} /> Excluir
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
