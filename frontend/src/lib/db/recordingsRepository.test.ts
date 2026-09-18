import { describe, expect, it, beforeEach } from 'vitest';
import { db } from '@/lib/db/database';
import { applyLibraryFilters, deleteRecording, saveRecording } from '@/lib/db/recordingsRepository';
import type { LibraryFilters, RecordingRecord } from '@/types/recording';

function buildRecord(overrides: Partial<RecordingRecord>): RecordingRecord {
  return {
    id: crypto.randomUUID(),
    name: 'Gravação de teste',
    createdAt: Date.now(),
    durationMs: 60_000,
    sizeBytes: 1024,
    mimeType: 'video/webm',
    quality: 'auto',
    width: 1920,
    height: 1080,
    hasMicrophone: false,
    hasSystemAudio: false,
    hasWebcam: false,
    captureSurface: 'monitor',
    videoBlob: new Blob(['x']),
    thumbnailBlob: null,
    ...overrides,
  };
}

const BASE_FILTERS: LibraryFilters = {
  query: '',
  sortField: 'createdAt',
  sortDirection: 'desc',
  onlyWithWebcam: false,
  onlyWithAudio: false,
};

describe('recordingsRepository', () => {
  beforeEach(async () => {
    await db.recordings.clear();
  });

  it('salva e recupera uma gravação', async () => {
    const record = buildRecord({ name: 'Minha aula' });
    await saveRecording(record);
    const stored = await db.recordings.get(record.id);
    expect(stored?.name).toBe('Minha aula');
  });

  it('exclui uma gravação', async () => {
    const record = buildRecord({});
    await saveRecording(record);
    await deleteRecording(record.id);
    const stored = await db.recordings.get(record.id);
    expect(stored).toBeUndefined();
  });

  it('filtra por nome (case-insensitive)', () => {
    const records = [buildRecord({ name: 'Aula de React' }), buildRecord({ name: 'Reunião de equipe' })];
    const result = applyLibraryFilters(records, { ...BASE_FILTERS, query: 'react' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Aula de React');
  });

  it('filtra somente gravações com webcam', () => {
    const records = [buildRecord({ hasWebcam: true }), buildRecord({ hasWebcam: false })];
    const result = applyLibraryFilters(records, { ...BASE_FILTERS, onlyWithWebcam: true });
    expect(result).toHaveLength(1);
    expect(result[0].hasWebcam).toBe(true);
  });

  it('ordena por duração crescente', () => {
    const records = [
      buildRecord({ name: 'Longa', durationMs: 300_000 }),
      buildRecord({ name: 'Curta', durationMs: 10_000 }),
    ];
    const result = applyLibraryFilters(records, { ...BASE_FILTERS, sortField: 'durationMs', sortDirection: 'asc' });
    expect(result.map((r) => r.name)).toEqual(['Curta', 'Longa']);
  });
});
