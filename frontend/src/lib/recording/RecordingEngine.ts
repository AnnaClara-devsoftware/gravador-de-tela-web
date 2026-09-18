import { AppError, type CaptureSurface, type RecordingOptions } from '@/types/recording';
import { resolveQualitySettings } from './qualityPresets';
import { detectCapabilities } from '@/lib/compat/detectCapabilities';
import { getWebcamRect } from './webcamLayout';

export interface EngineEvents {
  onTick?: (elapsedMs: number) => void;
  onStateChange?: (state: 'recording' | 'paused') => void;
  /** Disparado quando o usuário encerra o compartilhamento pela UI nativa do navegador. */
  onNativeStop?: () => void;
  onError?: (error: AppError) => void;
}

export interface FinishedRecording {
  blob: Blob;
  mimeType: string;
  durationMs: number;
  width: number;
  height: number;
  captureSurface: CaptureSurface;
}

/**
 * Orquestra a captura de tela, microfone e webcam inteiramente no
 * cliente. Nenhum frame de vídeo ou áudio passa por um servidor em
 * momento algum — o pipeline inteiro roda em memória no navegador:
 *
 *   getDisplayMedia ──┐
 *                     ├─► <canvas> (composição com webcam) ─► captureStream()
 *   getUserMedia(cam)─┘                                            │
 *                                                                   ▼
 *   getUserMedia(mic) ─► AudioContext (mixagem) ───────────► MediaRecorder ─► Blob
 */
export class RecordingEngine {
  private screenStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private webcamStream: MediaStream | null = null;

  private canvas: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private screenVideoEl: HTMLVideoElement | null = null;
  private webcamVideoEl: HTMLVideoElement | null = null;

  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private rafHandle: number | null = null;
  private tickInterval: number | null = null;

  private startedAt = 0;
  private pausedAccumulatedMs = 0;
  private pausedAt = 0;
  private mimeType = 'video/webm';
  private captureSurface: CaptureSurface = 'unknown';
  private options: RecordingOptions | null = null;
  private readonly events: EngineEvents;

  constructor(events: EngineEvents = {}) {
    this.events = events;
  }

  get previewStream(): MediaStream | null {
    return this.screenStream;
  }

  /** Solicita as permissões e monta o pipeline. Não inicia a gravação ainda. */
  async prepare(options: RecordingOptions): Promise<void> {
    const caps = detectCapabilities();

    if (!caps.isSecureContext) {
      throw new AppError('NO_SECURE_CONTEXT', 'É necessário HTTPS (ou localhost) para gravar a tela.');
    }
    if (caps.screenRecording === 'unsupported') {
      throw new AppError('UNSUPPORTED_BROWSER', 'Este navegador não oferece suporte à gravação de tela.');
    }
    if (!caps.preferredMimeType) {
      throw new AppError('UNSUPPORTED_CODEC', 'Nenhum codec de vídeo compatível foi encontrado neste navegador.');
    }

    this.options = options;
    this.mimeType = caps.preferredMimeType;

    const quality = resolveQualitySettings(options.quality);

    // 1) Tela / janela / aba
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: quality.width },
          height: { ideal: quality.height },
          frameRate: { ideal: quality.frameRate },
        },
        audio: options.systemAudio,
      });
    } catch (err) {
      throw this.mapGetDisplayMediaError(err);
    }

    this.captureSurface = this.inferCaptureSurface();

    // Se o usuário parar o compartilhamento pela barra nativa do navegador,
    // tratamos isso como o sinal de "finalizar gravação".
    const [screenVideoTrack] = this.screenStream.getVideoTracks();
    screenVideoTrack?.addEventListener('ended', () => this.events.onNativeStop?.());

    // 2) Microfone (opcional)
    if (options.microphone) {
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: options.microphoneDeviceId
            ? { deviceId: { exact: options.microphoneDeviceId } }
            : true,
        });
      } catch (err) {
        this.cleanupTracks();
        throw this.mapGetUserMediaError(err, 'mic');
      }
    }

    // 3) Webcam (opcional)
    if (options.webcam) {
      try {
        this.webcamStream = await navigator.mediaDevices.getUserMedia({
          video: options.webcamDeviceId
            ? { deviceId: { exact: options.webcamDeviceId }, width: { ideal: 640 } }
            : { width: { ideal: 640 } },
        });
      } catch (err) {
        this.cleanupTracks();
        throw this.mapGetUserMediaError(err, 'camera');
      }
    }

    await this.buildPipeline(quality.width, quality.height, quality.frameRate, quality);
  }

  private async buildPipeline(
    width: number,
    height: number,
    frameRate: number,
    quality: ReturnType<typeof resolveQualitySettings>,
  ): Promise<void> {
    this.screenVideoEl = document.createElement('video');
    this.screenVideoEl.muted = true;
    this.screenVideoEl.srcObject = this.screenStream;
    await this.screenVideoEl.play();

    const needsComposition = !!this.webcamStream;

    let outputVideoTrack: MediaStreamTrack;

    if (needsComposition) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.screenVideoEl.videoWidth || width;
      this.canvas.height = this.screenVideoEl.videoHeight || height;
      this.canvasCtx = this.canvas.getContext('2d', { alpha: false });

      if (this.webcamStream) {
        this.webcamVideoEl = document.createElement('video');
        this.webcamVideoEl.muted = true;
        this.webcamVideoEl.srcObject = this.webcamStream;
        await this.webcamVideoEl.play();
      }

      this.drawFrame();
      const canvasStream = this.canvas.captureStream(frameRate);
      [outputVideoTrack] = canvasStream.getVideoTracks();
    } else {
      [outputVideoTrack] = this.screenStream!.getVideoTracks();
    }

    const mixedAudioTrack = this.mixAudioTracks();

    const outputStream = new MediaStream();
    outputStream.addTrack(outputVideoTrack);
    if (mixedAudioTrack) outputStream.addTrack(mixedAudioTrack);

    this.mediaRecorder = new MediaRecorder(outputStream, {
      mimeType: this.mimeType,
      videoBitsPerSecond: quality.videoBitsPerSecond,
      audioBitsPerSecond: mixedAudioTrack ? quality.audioBitsPerSecond : undefined,
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };

    this.mediaRecorder.onerror = () => {
      this.events.onError?.(new AppError('RECORDER_ERROR', 'Ocorreu um erro durante a gravação.'));
    };
  }

  private mixAudioTracks(): MediaStreamTrack | null {
    const systemAudioTracks = this.screenStream?.getAudioTracks() ?? [];
    const micAudioTracks = this.micStream?.getAudioTracks() ?? [];

    const allTracks = [...systemAudioTracks, ...micAudioTracks];
    if (allTracks.length === 0) return null;
    if (allTracks.length === 1) return allTracks[0];

    // Duas ou mais fontes de áudio: mixamos via Web Audio API para gerar
    // uma única faixa combinada em vez de descartar uma delas.
    this.audioContext = new AudioContext();
    const destination = this.audioContext.createMediaStreamDestination();

    for (const track of allTracks) {
      const source = this.audioContext.createMediaStreamSource(new MediaStream([track]));
      source.connect(destination);
    }

    return destination.stream.getAudioTracks()[0] ?? null;
  }

  private drawFrame = (): void => {
    if (!this.canvas || !this.canvasCtx || !this.screenVideoEl) return;

    this.canvasCtx.drawImage(this.screenVideoEl, 0, 0, this.canvas.width, this.canvas.height);

    if (this.webcamVideoEl && this.options) {
      const rect = getWebcamRect(this.canvas.width, this.canvas.height, this.options.webcamPosition, this.options.webcamSize);
      this.canvasCtx.save();
      this.canvasCtx.beginPath();
      this.canvasCtx.roundRect(rect.x, rect.y, rect.width, rect.height, 16);
      this.canvasCtx.clip();
      this.canvasCtx.drawImage(this.webcamVideoEl, rect.x, rect.y, rect.width, rect.height);
      this.canvasCtx.restore();

      this.canvasCtx.save();
      this.canvasCtx.beginPath();
      this.canvasCtx.roundRect(rect.x, rect.y, rect.width, rect.height, 16);
      this.canvasCtx.lineWidth = 3;
      this.canvasCtx.strokeStyle = 'rgba(255,255,255,0.85)';
      this.canvasCtx.stroke();
      this.canvasCtx.restore();
    }

    this.rafHandle = requestAnimationFrame(this.drawFrame);
  };

  start(): void {
    if (!this.mediaRecorder) throw new AppError('RECORDER_ERROR', 'A gravação não foi preparada corretamente.');
    this.chunks = [];
    this.startedAt = Date.now();
    this.pausedAccumulatedMs = 0;
    this.mediaRecorder.start(1000);
    this.startTicking();
    this.events.onStateChange?.('recording');
  }

  pause(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') return;
    this.mediaRecorder.pause();
    this.pausedAt = Date.now();
    this.stopTicking();
    this.events.onStateChange?.('paused');
  }

  resume(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'paused') return;
    this.mediaRecorder.resume();
    this.pausedAccumulatedMs += Date.now() - this.pausedAt;
    this.startTicking();
    this.events.onStateChange?.('recording');
  }

  private startTicking(): void {
    this.stopTicking();
    this.tickInterval = window.setInterval(() => {
      this.events.onTick?.(this.getElapsedMs());
    }, 250);
  }

  private stopTicking(): void {
    if (this.tickInterval !== null) {
      window.clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  getElapsedMs(): number {
    if (!this.startedAt) return 0;
    return Date.now() - this.startedAt - this.pausedAccumulatedMs;
  }

  async stop(): Promise<FinishedRecording> {
    const recorder = this.mediaRecorder;
    if (!recorder) throw new AppError('RECORDER_ERROR', 'Nenhuma gravação em andamento.');

    const durationMs = this.getElapsedMs();
    const width = this.canvas?.width ?? this.screenVideoEl?.videoWidth ?? 0;
    const height = this.canvas?.height ?? this.screenVideoEl?.videoHeight ?? 0;

    const finished = await new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => {
        try {
          resolve(new Blob(this.chunks, { type: this.mimeType }));
        } catch (err) {
          reject(err);
        }
      };
      if (recorder.state === 'inactive') {
        resolve(new Blob(this.chunks, { type: this.mimeType }));
      } else {
        recorder.stop();
      }
    });

    this.stopTicking();
    this.cleanupTracks();

    return {
      blob: finished,
      mimeType: this.mimeType,
      durationMs,
      width,
      height,
      captureSurface: this.captureSurface,
    };
  }

  /** Cancela e descarta tudo sem gerar um blob final. */
  cancel(): void {
    this.stopTicking();
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    } catch {
      // já finalizado — sem problema.
    }
    this.chunks = [];
    this.cleanupTracks();
  }

  private cleanupTracks(): void {
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
    for (const stream of [this.screenStream, this.micStream, this.webcamStream]) {
      stream?.getTracks().forEach((track) => track.stop());
    }
    this.screenStream = null;
    this.micStream = null;
    this.webcamStream = null;

    if (this.screenVideoEl) {
      this.screenVideoEl.pause();
      this.screenVideoEl.srcObject = null;
      this.screenVideoEl = null;
    }
    if (this.webcamVideoEl) {
      this.webcamVideoEl.pause();
      this.webcamVideoEl.srcObject = null;
      this.webcamVideoEl = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.canvas = null;
    this.canvasCtx = null;
  }

  private inferCaptureSurface(): CaptureSurface {
    const [track] = this.screenStream?.getVideoTracks() ?? [];
    const settings = track?.getSettings() as { displaySurface?: string } | undefined;
    switch (settings?.displaySurface) {
      case 'monitor':
        return 'monitor';
      case 'window':
        return 'window';
      case 'browser':
        return 'browser';
      default:
        return 'unknown';
    }
  }

  private mapGetDisplayMediaError(err: unknown): AppError {
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError') {
        return new AppError('PERMISSION_DENIED_SCREEN', 'Você não concedeu permissão para compartilhar a tela.', err);
      }
      if (err.name === 'AbortError') {
        return new AppError('SHARE_CANCELLED', 'O compartilhamento de tela foi cancelado.', err);
      }
    }
    return new AppError('UNKNOWN', 'Não foi possível iniciar a captura de tela.', err);
  }

  private mapGetUserMediaError(err: unknown, device: 'mic' | 'camera'): AppError {
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError') {
        return device === 'mic'
          ? new AppError('PERMISSION_DENIED_MIC', 'Permissão de microfone negada.', err)
          : new AppError('PERMISSION_DENIED_CAMERA', 'Permissão de câmera negada.', err);
      }
      if (err.name === 'NotFoundError') {
        return device === 'mic'
          ? new AppError('NO_MIC_DEVICE', 'Nenhum microfone foi encontrado neste dispositivo.', err)
          : new AppError('NO_CAMERA_DEVICE', 'Nenhuma câmera foi encontrada neste dispositivo.', err);
      }
    }
    return new AppError('UNKNOWN', 'Não foi possível acessar o dispositivo solicitado.', err);
  }
}
