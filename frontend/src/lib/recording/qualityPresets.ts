import type { QualityPreset, QualitySettings } from '@/types/recording';

const PRESETS: Record<Exclude<QualityPreset, 'auto'>, Omit<QualitySettings, 'preset'>> = {
  high: {
    width: 2560,
    height: 1440,
    frameRate: 30,
    videoBitsPerSecond: 8_000_000,
    audioBitsPerSecond: 160_000,
  },
  medium: {
    width: 1920,
    height: 1080,
    frameRate: 30,
    videoBitsPerSecond: 4_000_000,
    audioBitsPerSecond: 128_000,
  },
  low: {
    width: 1280,
    height: 720,
    frameRate: 24,
    videoBitsPerSecond: 1_500_000,
    audioBitsPerSecond: 96_000,
  },
};

/**
 * "Automática" não é um valor mágico: ela observa a resolução real da
 * tela do usuário (`screen.width/height` com o `devicePixelRatio`) e
 * escolhe o preset mais próximo, evitando pedir 1440p de uma tela 720p
 * ou desperdiçar qualidade em uma tela 4K.
 */
export function resolveQualitySettings(preset: QualityPreset): QualitySettings {
  if (preset !== 'auto') {
    return { preset, ...PRESETS[preset] };
  }

  const screenWidth = (window.screen?.width ?? 1920) * (window.devicePixelRatio || 1);

  if (screenWidth >= 2400) {
    return { preset: 'auto', ...PRESETS.high };
  }
  if (screenWidth >= 1600) {
    return { preset: 'auto', ...PRESETS.medium };
  }
  return { preset: 'auto', ...PRESETS.low };
}

export const QUALITY_LABELS: Record<QualityPreset, string> = {
  auto: 'Automática',
  high: 'Alta (até 1440p)',
  medium: 'Média (1080p)',
  low: 'Baixa (720p)',
};

export const QUALITY_DESCRIPTIONS: Record<QualityPreset, string> = {
  auto: 'Ajusta a resolução com base na sua tela.',
  high: 'Melhor nitidez, arquivos maiores.',
  medium: 'Equilíbrio entre qualidade e tamanho.',
  low: 'Arquivos leves, ideal para compartilhar rápido.',
};
