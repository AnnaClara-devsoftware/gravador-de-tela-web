export type QualityPreset = 'auto' | 'high' | 'medium' | 'low';

export type CaptureSurface = 'monitor' | 'window' | 'browser' | 'unknown';

export type RecorderStatus =
  | 'idle'
  | 'requesting-permission'
  | 'countdown'
  | 'recording'
  | 'paused'
  | 'processing'
  | 'error';

export interface QualitySettings {
  preset: QualityPreset;
  width: number;
  height: number;
  frameRate: number;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
}

export interface RecordingOptions {
  quality: QualityPreset;
  microphone: boolean;
  systemAudio: boolean;
  webcam: boolean;
  webcamPosition: WebcamPosition;
  webcamSize: WebcamSize;
  microphoneDeviceId?: string;
  webcamDeviceId?: string;
}

export type WebcamPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left';

export type WebcamSize = 'small' | 'medium' | 'large';

export interface RecordingMeta {
  id: string;
  name: string;
  createdAt: number;
  durationMs: number;
  sizeBytes: number;
  mimeType: string;
  quality: QualityPreset;
  width: number;
  height: number;
  hasMicrophone: boolean;
  hasSystemAudio: boolean;
  hasWebcam: boolean;
  captureSurface: CaptureSurface;
}

export interface RecordingRecord extends RecordingMeta {
  videoBlob: Blob;
  thumbnailBlob: Blob | null;
}

export type SortField = 'createdAt' | 'name' | 'durationMs' | 'sizeBytes';
export type SortDirection = 'asc' | 'desc';

export interface LibraryFilters {
  query: string;
  sortField: SortField;
  sortDirection: SortDirection;
  onlyWithWebcam: boolean;
  onlyWithAudio: boolean;
}

export type AppErrorCode =
  | 'PERMISSION_DENIED_SCREEN'
  | 'PERMISSION_DENIED_MIC'
  | 'PERMISSION_DENIED_CAMERA'
  | 'SHARE_CANCELLED'
  | 'NO_SECURE_CONTEXT'
  | 'UNSUPPORTED_BROWSER'
  | 'UNSUPPORTED_CODEC'
  | 'NO_CAMERA_DEVICE'
  | 'NO_MIC_DEVICE'
  | 'RECORDER_ERROR'
  | 'STORAGE_ERROR'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'UPLOAD_ERROR'
  | 'UNKNOWN';

export class AppError extends Error {
  code: AppErrorCode;
  cause?: unknown;

  constructor(code: AppErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}
