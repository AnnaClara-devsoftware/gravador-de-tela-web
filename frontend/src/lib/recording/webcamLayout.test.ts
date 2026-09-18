import { describe, expect, it } from 'vitest';
import { getWebcamRect } from '@/lib/recording/webcamLayout';

describe('getWebcamRect', () => {
  it('mantém a proporção 4:3 em qualquer tamanho', () => {
    const rect = getWebcamRect(1920, 1080, 'bottom-right', 'medium');
    expect(rect.height).toBeCloseTo(rect.width * 0.75, 5);
  });

  it('posiciona no canto inferior direito corretamente', () => {
    const rect = getWebcamRect(1000, 1000, 'bottom-right', 'small');
    expect(rect.x + rect.width).toBeLessThanOrEqual(1000);
    expect(rect.y + rect.height).toBeLessThanOrEqual(1000);
    expect(rect.x).toBeGreaterThan(500);
    expect(rect.y).toBeGreaterThan(500);
  });

  it('posiciona no canto superior esquerdo corretamente', () => {
    const rect = getWebcamRect(1000, 1000, 'top-left', 'small');
    expect(rect.x).toBeLessThan(200);
    expect(rect.y).toBeLessThan(200);
  });

  it('tamanhos maiores geram retângulos maiores', () => {
    const small = getWebcamRect(1000, 1000, 'bottom-right', 'small');
    const large = getWebcamRect(1000, 1000, 'bottom-right', 'large');
    expect(large.width).toBeGreaterThan(small.width);
  });
});
