import { useCallback, useRef, useState } from 'react';
import { RecordingEngine, type FinishedRecording } from '@/lib/recording/RecordingEngine';
import { AppError, type RecorderStatus, type RecordingOptions } from '@/types/recording';

interface UseRecorderResult {
  status: RecorderStatus;
  elapsedMs: number;
  previewStream: MediaStream | null;
  error: AppError | null;
  start: (options: RecordingOptions) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<FinishedRecording | null>;
  cancel: () => void;
  clearError: () => void;
}

export function useRecorder(): UseRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const engineRef = useRef<RecordingEngine | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const start = useCallback(async (options: RecordingOptions) => {
    setStatus('requesting-permission');
    setError(null);

    const engine = new RecordingEngine({
      onTick: (ms) => setElapsedMs(ms),
      onStateChange: (state) => setStatus(state),
      onNativeStop: () => {
        void stop();
      },
      onError: (err) => {
        setError(err);
        setStatus('error');
      },
    });

    try {
      await engine.prepare(options);
      engineRef.current = engine;
      setPreviewStream(engine.previewStream);
      engine.start();
      setStatus('recording');
    } catch (err) {
      const appError = err instanceof AppError ? err : new AppError('UNKNOWN', 'Não foi possível iniciar a gravação.', err);
      setError(appError);
      setStatus('error');
      engineRef.current = null;
      setPreviewStream(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const stop = useCallback(async (): Promise<FinishedRecording | null> => {
    const engine = engineRef.current;
    if (!engine) return null;
    setStatus('processing');
    try {
      const finished = await engine.stop();
      engineRef.current = null;
      setPreviewStream(null);
      setStatus('idle');
      setElapsedMs(0);
      return finished;
    } catch (err) {
      const appError = err instanceof AppError ? err : new AppError('RECORDER_ERROR', 'Erro ao finalizar a gravação.', err);
      setError(appError);
      setStatus('error');
      return null;
    }
  }, []);

  const cancel = useCallback(() => {
    engineRef.current?.cancel();
    engineRef.current = null;
    setPreviewStream(null);
    setStatus('idle');
    setElapsedMs(0);
  }, []);

  return { status, elapsedMs, previewStream, error, start, pause, resume, stop, cancel, clearError };
}
