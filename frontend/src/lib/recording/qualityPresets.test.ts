import { describe, expect, it, vi, afterEach } from 'vitest';
import { resolveQualitySettings } from '@/lib/recording/qualityPresets';

describe('resolveQualitySettings', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retorna o preset explícito quando não é "auto"', () => {
    const settings = resolveQualitySettings('low');
    expect(settings.preset).toBe('low');
    expect(settings.width).toBe(1280);
    expect(settings.height).toBe(720);
  });

  it('escolhe qualidade alta para telas grandes no modo automático', () => {
    vi.stubGlobal('screen', { width: 2560, height: 1440 });
    vi.stubGlobal('devicePixelRatio', 1);
    const settings = resolveQualitySettings('auto');
    expect(settings.width).toBe(2560);
  });

  it('escolhe qualidade baixa para telas pequenas no modo automático', () => {
    vi.stubGlobal('screen', { width: 1280, height: 720 });
    vi.stubGlobal('devicePixelRatio', 1);
    const settings = resolveQualitySettings('auto');
    expect(settings.width).toBe(1280);
  });
});
