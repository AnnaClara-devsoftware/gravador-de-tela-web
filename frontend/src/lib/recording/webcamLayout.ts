import type { WebcamPosition, WebcamSize } from '@/types/recording';

const SIZE_RATIOS: Record<WebcamSize, number> = {
  small: 0.16,
  medium: 0.22,
  large: 0.3,
};

const MARGIN_RATIO = 0.03;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Calcula o retângulo (16:9 -> recorta para 4:3 “bolha”) da webcam sobre o canvas. */
export function getWebcamRect(
  canvasWidth: number,
  canvasHeight: number,
  position: WebcamPosition,
  size: WebcamSize,
): Rect {
  const width = canvasWidth * SIZE_RATIOS[size];
  const height = width * 0.75; // 4:3
  const margin = canvasWidth * MARGIN_RATIO;

  const positions: Record<WebcamPosition, Rect> = {
    'bottom-right': { x: canvasWidth - width - margin, y: canvasHeight - height - margin, width, height },
    'bottom-left': { x: margin, y: canvasHeight - height - margin, width, height },
    'top-right': { x: canvasWidth - width - margin, y: margin, width, height },
    'top-left': { x: margin, y: margin, width, height },
  };

  return positions[position];
}
