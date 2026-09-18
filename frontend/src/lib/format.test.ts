import { describe, expect, it } from 'vitest';
import { buildRecordingFilename, extensionFromMimeType, formatBytes, formatDuration } from '@/lib/format';

describe('formatDuration', () => {
  it('formata minutos e segundos', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(65_000)).toBe('1:05');
    expect(formatDuration(59_000)).toBe('0:59');
  });

  it('formata horas quando necessário', () => {
    expect(formatDuration(3_661_000)).toBe('1:01:01');
  });
});

describe('formatBytes', () => {
  it('formata bytes em unidades legíveis', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.5 MB');
  });
});

describe('extensionFromMimeType', () => {
  it('detecta mp4', () => {
    expect(extensionFromMimeType('video/mp4;codecs=h264,aac')).toBe('mp4');
  });
  it('assume webm por padrão', () => {
    expect(extensionFromMimeType('video/webm;codecs=vp9,opus')).toBe('webm');
  });
});

describe('buildRecordingFilename', () => {
  it('gera nome de arquivo profissional e determinístico', () => {
    const date = new Date(2026, 8, 15, 10, 32);
    expect(buildRecordingFilename(date, 'webm')).toBe('gravacao-tela-2026-09-15-10-32.webm');
  });
});
