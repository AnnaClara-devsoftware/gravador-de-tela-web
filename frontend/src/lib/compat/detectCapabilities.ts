/**
 * Detecção de capacidades do navegador.
 *
 * Nada aqui é adivinhado: cada campo reflete a presença real de uma API,
 * método ou contexto no `window`/`navigator` do ambiente em que o código
 * está rodando. Quando uma capacidade não pode ser verificada de forma
 * síncrona e confiável (ex.: áudio do sistema), o resultado é `unsure`
 * em vez de `true`/`false` — a UI trata isso como um aviso, nunca como
 * uma promessa.
 */

export type SupportLevel = 'supported' | 'unsupported' | 'unsure';

export interface CodecSupport {
  mimeType: string;
  label: string;
  supported: boolean;
}

export interface CapabilityReport {
  isSecureContext: boolean;
  browserName: BrowserName;
  browserVersion: string | null;
  os: OperatingSystem;
  isMobile: boolean;

  hasMediaDevices: boolean;
  hasGetDisplayMedia: boolean;
  hasGetUserMedia: boolean;
  hasMediaRecorder: boolean;
  hasPictureInPicture: boolean;
  hasStorageEstimate: boolean;
  hasIndexedDB: boolean;

  screenRecording: SupportLevel;
  microphone: SupportLevel;
  webcam: SupportLevel;
  systemAudio: SupportLevel;

  supportedVideoCodecs: CodecSupport[];
  preferredMimeType: string | null;
}

export type BrowserName =
  | 'chrome'
  | 'edge'
  | 'firefox'
  | 'safari'
  | 'opera'
  | 'unknown';

export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown';

const CANDIDATE_VIDEO_MIME_TYPES: Array<{ mimeType: string; label: string }> = [
  { mimeType: 'video/webm;codecs=vp9,opus', label: 'WebM (VP9 + Opus)' },
  { mimeType: 'video/webm;codecs=vp8,opus', label: 'WebM (VP8 + Opus)' },
  { mimeType: 'video/webm;codecs=h264,opus', label: 'WebM (H.264 + Opus)' },
  { mimeType: 'video/webm', label: 'WebM (padrão do navegador)' },
  { mimeType: 'video/mp4;codecs=h264,aac', label: 'MP4 (H.264 + AAC)' },
  { mimeType: 'video/mp4', label: 'MP4 (padrão do navegador)' },
];

function detectBrowser(ua: string): { name: BrowserName; version: string | null } {
  const rules: Array<{ name: BrowserName; re: RegExp }> = [
    { name: 'edge', re: /Edg\/([\d.]+)/ },
    { name: 'opera', re: /(OPR|Opera)\/([\d.]+)/ },
    { name: 'chrome', re: /Chrome\/([\d.]+)/ },
    { name: 'firefox', re: /Firefox\/([\d.]+)/ },
    { name: 'safari', re: /Version\/([\d.]+).*Safari/ },
  ];

  for (const rule of rules) {
    const match = ua.match(rule.re);
    if (match) {
      const version = match[match.length - 1] ?? null;
      return { name: rule.name, version };
    }
  }
  return { name: 'unknown', version: null };
}

function detectOS(ua: string): OperatingSystem {
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Mac OS X/i.test(ua)) return 'macos';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Linux/i.test(ua)) return 'linux';
  return 'unknown';
}

function detectSupportedCodecs(): CodecSupport[] {
  const MediaRecorderCtor = (globalThis as { MediaRecorder?: typeof MediaRecorder }).MediaRecorder;
  if (!MediaRecorderCtor || typeof MediaRecorderCtor.isTypeSupported !== 'function') {
    return CANDIDATE_VIDEO_MIME_TYPES.map((c) => ({ ...c, supported: false }));
  }
  return CANDIDATE_VIDEO_MIME_TYPES.map((candidate) => ({
    ...candidate,
    supported: MediaRecorderCtor.isTypeSupported(candidate.mimeType),
  }));
}

/**
 * Gera o relatório de capacidades do ambiente atual. Sempre síncrono e
 * sem efeitos colaterais — nenhuma permissão é solicitada aqui.
 */
export function detectCapabilities(): CapabilityReport {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  const win = typeof window !== 'undefined' ? window : undefined;
  const ua = nav?.userAgent ?? '';

  const { name: browserName, version: browserVersion } = detectBrowser(ua);
  const os = detectOS(ua);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

  const isSecureContext = win?.isSecureContext ?? false;

  const hasMediaDevices = !!nav?.mediaDevices;
  const hasGetDisplayMedia = !!nav?.mediaDevices && typeof nav.mediaDevices.getDisplayMedia === 'function';
  const hasGetUserMedia = !!nav?.mediaDevices && typeof nav.mediaDevices.getUserMedia === 'function';
  const hasMediaRecorder = typeof (globalThis as { MediaRecorder?: unknown }).MediaRecorder !== 'undefined';
  const hasPictureInPicture = !!(document as unknown as { pictureInPictureEnabled?: boolean })?.pictureInPictureEnabled;
  const hasStorageEstimate = !!nav?.storage && typeof nav.storage.estimate === 'function';
  const hasIndexedDB = typeof indexedDB !== 'undefined';

  const supportedVideoCodecs = detectSupportedCodecs();
  const preferredMimeType = supportedVideoCodecs.find((c) => c.supported)?.mimeType ?? null;

  // Gravação de tela: depende de getDisplayMedia + MediaRecorder + contexto seguro.
  const screenRecording: SupportLevel =
    !isSecureContext
      ? 'unsupported'
      : hasGetDisplayMedia && hasMediaRecorder
        ? 'supported'
        : 'unsupported';

  // Microfone/webcam: getUserMedia existindo é um forte indicador, mas a
  // permissão real e a presença física do dispositivo só se confirmam
  // no momento da solicitação — por isso tratamos como "unsure" em vez
  // de "supported" quando não há como checar mais.
  const microphone: SupportLevel = !isSecureContext
    ? 'unsupported'
    : hasGetUserMedia
      ? 'unsure'
      : 'unsupported';

  const webcam: SupportLevel = !isSecureContext
    ? 'unsupported'
    : hasGetUserMedia
      ? 'unsure'
      : 'unsupported';

  // Áudio do sistema é a capacidade mais inconsistente entre navegadores/SO
  // e não existe uma forma de checagem síncrona confiável: Chrome/Edge no
  // Windows e Linux geralmente permitem (ao compartilhar uma aba, ou toda
  // a tela em alguns casos), o Firefox tem suporte parcial, e o Safari não
  // suporta. Nunca é reportado como "supported" antes da tentativa real.
  const systemAudio: SupportLevel = !isSecureContext
    ? 'unsupported'
    : browserName === 'safari'
      ? 'unsupported'
      : hasGetDisplayMedia
        ? 'unsure'
        : 'unsupported';

  return {
    isSecureContext,
    browserName,
    browserVersion,
    os,
    isMobile,
    hasMediaDevices,
    hasGetDisplayMedia,
    hasGetUserMedia,
    hasMediaRecorder,
    hasPictureInPicture,
    hasStorageEstimate,
    hasIndexedDB,
    screenRecording,
    microphone,
    webcam,
    systemAudio,
    supportedVideoCodecs,
    preferredMimeType,
  };
}

export const BROWSER_LABELS: Record<BrowserName, string> = {
  chrome: 'Google Chrome',
  edge: 'Microsoft Edge',
  firefox: 'Mozilla Firefox',
  safari: 'Safari',
  opera: 'Opera',
  unknown: 'Navegador não identificado',
};
