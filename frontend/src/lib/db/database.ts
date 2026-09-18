import Dexie, { type EntityTable } from 'dexie';
import type { RecordingRecord } from '@/types/recording';

/**
 * Banco local (IndexedDB via Dexie). É o armazenamento primário e padrão
 * da aplicação: os blobs de vídeo nunca saem do dispositivo a menos que
 * o usuário explicitamente ative sincronização com o backend (feature
 * opcional, ver `lib/api`).
 */
export class RecorderDatabase extends Dexie {
  recordings!: EntityTable<RecordingRecord, 'id'>;

  constructor() {
    super('gravador-de-tela');
    this.version(1).stores({
      // Índices: id (chave primária), createdAt/name/durationMs/sizeBytes
      // para ordenação, e campos booleanos codificados como 0/1 para os
      // filtros "somente com webcam" / "somente com áudio".
      recordings: 'id, createdAt, name, durationMs, sizeBytes, hasWebcam, hasMicrophone',
    });
  }
}

export const db = new RecorderDatabase();

export async function estimateStorage(): Promise<{
  usageBytes: number;
  quotaBytes: number | null;
  supported: boolean;
}> {
  if (!navigator.storage || typeof navigator.storage.estimate !== 'function') {
    return { usageBytes: 0, quotaBytes: null, supported: false };
  }
  try {
    const { usage, quota } = await navigator.storage.estimate();
    return {
      usageBytes: usage ?? 0,
      quotaBytes: quota ?? null,
      supported: true,
    };
  } catch {
    return { usageBytes: 0, quotaBytes: null, supported: false };
  }
}
