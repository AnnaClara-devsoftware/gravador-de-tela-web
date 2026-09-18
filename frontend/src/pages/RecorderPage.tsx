import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecorderSetupPanel } from '@/components/recorder/RecorderSetupPanel';
import { RecorderPreview } from '@/components/recorder/RecorderPreview';
import { RecorderControls } from '@/components/recorder/RecorderControls';
import { ContextualWarning } from '@/components/recorder/ContextualWarning';
import { SaveRecordingDialog } from '@/components/recorder/SaveRecordingDialog';
import { useRecorder } from '@/hooks/useRecorder';
import { useCapabilities } from '@/hooks/useCapabilities';
import { useToast } from '@/hooks/useToast';
import { saveRecording } from '@/lib/db/recordingsRepository';
import { generateThumbnail } from '@/lib/recording/generateThumbnail';
import { buildRecordingFilename, extensionFromMimeType } from '@/lib/format';
import { ERROR_MESSAGES } from '@/lib/errorMessages';
import type { FinishedRecording } from '@/lib/recording/RecordingEngine';
import type { RecordingOptions, RecordingRecord } from '@/types/recording';

const DEFAULT_OPTIONS: RecordingOptions = {
  quality: 'auto',
  microphone: true,
  systemAudio: false,
  webcam: false,
  webcamPosition: 'bottom-right',
  webcamSize: 'medium',
};

export function RecorderPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const capabilities = useCapabilities();
  const recorder = useRecorder();

  const [options, setOptions] = useState<RecordingOptions>(DEFAULT_OPTIONS);
  const [preferredSurface, setPreferredSurface] = useState<'monitor' | 'window' | 'browser'>('monitor');
  const [pendingRecording, setPendingRecording] = useState<FinishedRecording | null>(null);
  const [usedOptions, setUsedOptions] = useState<RecordingOptions>(DEFAULT_OPTIONS);
  const [isSaving, setIsSaving] = useState(false);

  const isBusy = recorder.status !== 'idle' && recorder.status !== 'error';

  useEffect(() => {
    if (recorder.error) {
      const message = ERROR_MESSAGES[recorder.error.code];
      showToast({ variant: 'error', title: message.title, description: message.description });
      recorder.clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.error]);

  async function handleStart() {
    setUsedOptions(options);
    await recorder.start(options);
  }

  async function handleStop() {
    const finished = await recorder.stop();
    if (finished) setPendingRecording(finished);
  }

  async function handleSave(name: string) {
    if (!pendingRecording) return;
    setIsSaving(true);
    try {
      const thumbnailBlob = await generateThumbnail(pendingRecording.blob);
      const record: RecordingRecord = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        durationMs: pendingRecording.durationMs,
        sizeBytes: pendingRecording.blob.size,
        mimeType: pendingRecording.mimeType,
        quality: usedOptions.quality,
        width: pendingRecording.width,
        height: pendingRecording.height,
        hasMicrophone: usedOptions.microphone,
        hasSystemAudio: usedOptions.systemAudio,
        hasWebcam: usedOptions.webcam,
        captureSurface: pendingRecording.captureSurface,
        videoBlob: pendingRecording.blob,
        thumbnailBlob,
      };
      await saveRecording(record);
      showToast({ variant: 'success', title: 'Gravação salva', description: `"${name}" está disponível na sua biblioteca.` });
      setPendingRecording(null);
      navigate('/gravacoes');
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Não foi possível salvar',
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    setPendingRecording(null);
  }

  const blockingError = recorder.status === 'error' && recorder.error ? ERROR_MESSAGES[recorder.error.code] : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Gravar tela</h1>
        <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
          Configure sua gravação e clique em iniciar. O navegador vai pedir para você escolher o que compartilhar.
        </p>
      </div>

      {!capabilities.isSecureContext && (
        <div className="mb-6">
          <ContextualWarning
            tone="blocking"
            title="Conexão segura necessária"
            description="Para proteger sua privacidade, a gravação de tela só funciona em conexões seguras (HTTPS) ou em localhost."
          />
        </div>
      )}

      {capabilities.isSecureContext && capabilities.screenRecording === 'unsupported' && (
        <div className="mb-6">
          <ContextualWarning
            tone="blocking"
            title="Navegador não compatível"
            description="Este navegador não oferece suporte às APIs necessárias. Tente uma versão atualizada do Chrome, Edge ou Firefox."
          />
        </div>
      )}

      {blockingError && (
        <div className="mb-6">
          <ContextualWarning tone="warning" title={blockingError.title} description={blockingError.description} />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <RecorderPreview stream={recorder.previewStream} status={recorder.status} elapsedMs={recorder.elapsedMs} />
          <RecorderControls
            status={recorder.status}
            onStart={handleStart}
            onPause={recorder.pause}
            onResume={recorder.resume}
            onStop={handleStop}
            onCancel={recorder.cancel}
          />
        </div>

        <div className={isBusy ? 'pointer-events-none opacity-50' : ''}>
          <RecorderSetupPanel
            options={options}
            onChange={setOptions}
            capabilities={capabilities}
            preferredSurface={preferredSurface}
            onPreferredSurfaceChange={setPreferredSurface}
          />
        </div>
      </div>

      <SaveRecordingDialog
        isOpen={!!pendingRecording}
        finished={pendingRecording}
        defaultName={
          pendingRecording
            ? buildRecordingFilename(new Date(), extensionFromMimeType(pendingRecording.mimeType)).replace(/\.\w+$/, '')
            : ''
        }
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </div>
  );
}
