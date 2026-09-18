import { describe, expect, it, vi, afterEach } from 'vitest';
import { detectCapabilities } from '@/lib/compat/detectCapabilities';

describe('detectCapabilities', () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, configurable: true });
  });

  it('reporta screenRecording como unsupported fora de contexto seguro', () => {
    vi.stubGlobal('window', { ...window, isSecureContext: false });
    const report = detectCapabilities();
    expect(report.isSecureContext).toBe(false);
    expect(report.screenRecording).toBe('unsupported');
    expect(report.microphone).toBe('unsupported');
    expect(report.systemAudio).toBe('unsupported');
  });

  it('identifica o Chrome a partir do user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      configurable: true,
    });
    const report = detectCapabilities();
    expect(report.browserName).toBe('chrome');
    expect(report.os).toBe('windows');
  });

  it('identifica o Safari a partir do user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      configurable: true,
    });
    const report = detectCapabilities();
    expect(report.browserName).toBe('safari');
    expect(report.os).toBe('macos');
    // Safari nunca reporta suporte a áudio do sistema, mesmo em contexto seguro.
    expect(report.systemAudio).toBe(report.isSecureContext ? 'unsupported' : 'unsupported');
  });
});
