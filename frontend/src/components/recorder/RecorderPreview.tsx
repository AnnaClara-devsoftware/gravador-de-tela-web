import { useEffect, useRef } from 'react';
import { MonitorPlay } from 'lucide-react';
import type { RecorderStatus } from '@/types/recording';
import { formatDuration } from '@/lib/format';

interface RecorderPreviewProps {
  stream: MediaStream | null;
  status: RecorderStatus;
  elapsedMs: number;
}

export function RecorderPreview({ stream, status, elapsedMs }: RecorderPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const isLive = status === 'recording' || status === 'paused';

  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-bg-raised)]">
      {stream ? (
        <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-contain" />
      ) : (
        <div className="flex flex-col items-center gap-3 text-[var(--color-text-faint)]">
          <MonitorPlay size={32} />
          <p className="text-sm">O preview da sua tela aparecerá aqui</p>
        </div>
      )}

      {isLive && (
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          <span
            className="h-2 w-2 rounded-full bg-[var(--color-rec)]"
            style={{ animation: status === 'recording' ? 'pulse-rec 1.6s ease-in-out infinite' : undefined }}
          />
          <span className="font-mono text-xs font-medium text-white">
            {status === 'paused' ? 'Pausado' : 'Gravando'} · {formatDuration(elapsedMs)}
          </span>
        </div>
      )}
    </div>
  );
}
