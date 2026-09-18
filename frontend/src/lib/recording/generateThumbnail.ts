/**
 * Gera uma thumbnail a partir de um frame real do vídeo gravado
 * (por padrão, ~1s ou 10% da duração, o que for menor — evita pegar um
 * primeiro frame preto em transições de tela).
 */
export async function generateThumbnail(blob: Blob): Promise<Blob | null> {
  const url = URL.createObjectURL(blob);
  const video = document.createElement('video');
  video.muted = true;
  video.src = url;
  video.preload = 'auto';

  try {
    await new Promise<void>((resolve, reject) => {
      const onError = () => reject(new Error('Falha ao carregar vídeo para thumbnail'));
      video.addEventListener('loadedmetadata', () => resolve(), { once: true });
      video.addEventListener('error', onError, { once: true });
    });

    const seekTo = Math.min(1, video.duration * 0.1 || 0);
    await new Promise<void>((resolve, reject) => {
      const onSeeked = () => resolve();
      const onError = () => reject(new Error('Falha ao buscar frame para thumbnail'));
      video.addEventListener('seeked', onSeeked, { once: true });
      video.addEventListener('error', onError, { once: true });
      video.currentTime = seekTo;
    });

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((thumbBlob) => resolve(thumbBlob), 'image/jpeg', 0.72);
    });
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
