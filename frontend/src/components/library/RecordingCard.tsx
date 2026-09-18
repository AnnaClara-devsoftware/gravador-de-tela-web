import { Play, Download, Trash2, Mic, Camera, Volume2 } from 'lucide-react';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { formatBytes, formatDuration, formatRelativeDate, extensionFromMimeType } from '@/lib/format';
import type { RecordingRecord } from '@/types/recording';

interface RecordingCardProps {
  record: RecordingRecord;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpen: (record: RecordingRecord) => void;
  onDownload: (record: RecordingRecord) => void;
  onDeleteRequest: (record: RecordingRecord) => void;
}

export function RecordingCard({
  record,
  isSelected,
  onToggleSelect,
  onOpen,
  onDownload,
  onDeleteRequest,
}: RecordingCardProps) {
  const thumbnailUrl = useObjectUrl(record.thumbnailBlob);

  return (
    <div className="group overflow-hidden rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-border-strong)]">
      <div className="relative aspect-video cursor-pointer bg-[var(--color-bg-raised)]" onClick={() => onOpen(record)}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-text-faint)]">
            <Play size={24} />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[var(--color-bg)]">
            <Play size={16} fill="currentColor" />
          </span>
        </div>

        <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[11px] text-white">
          {formatDuration(record.durationMs)}
        </span>

        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect(record.id);
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Selecionar gravação ${record.name}`}
          className="absolute left-2 top-2 h-4 w-4 accent-[var(--color-accent)]"
        />
      </div>

      <div className="p-3.5">
        <p className="truncate text-sm font-medium text-[var(--color-text)]" title={record.name}>
          {record.name}
        </p>
        <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">
          {formatRelativeDate(record.createdAt)} · {formatBytes(record.sizeBytes)} · .{extensionFromMimeType(record.mimeType)}
        </p>

        <div className="mt-2.5 flex items-center gap-1.5">
          {record.hasMicrophone && <Mic size={13} className="text-[var(--color-text-faint)]" aria-label="Com microfone" />}
          {record.hasSystemAudio && <Volume2 size={13} className="text-[var(--color-text-faint)]" aria-label="Com áudio do sistema" />}
          {record.hasWebcam && <Camera size={13} className="text-[var(--color-text-faint)]" aria-label="Com webcam" />}
        </div>

        <div className="mt-3 flex items-center gap-1 border-t border-[var(--color-border)] pt-3">
          <button
            onClick={() => onOpen(record)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
          >
            <Play size={13} /> Reproduzir
          </button>
          <button
            onClick={() => onDownload(record)}
            aria-label="Baixar gravação"
            className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
          >
            <Download size={15} />
          </button>
          <button
            onClick={() => onDeleteRequest(record)}
            aria-label="Excluir gravação"
            className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-rec-muted)] hover:text-[var(--color-rec)]"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
