import { db } from './database';
import { AppError, type LibraryFilters, type RecordingRecord } from '@/types/recording';

export async function saveRecording(record: RecordingRecord): Promise<void> {
  try {
    await db.recordings.put(record);
  } catch (err) {
    throw new AppError('STORAGE_ERROR', 'Não foi possível salvar a gravação no armazenamento local.', err);
  }
}

export async function deleteRecording(id: string): Promise<void> {
  try {
    await db.recordings.delete(id);
  } catch (err) {
    throw new AppError('STORAGE_ERROR', 'Não foi possível excluir a gravação.', err);
  }
}

export async function deleteRecordings(ids: string[]): Promise<void> {
  try {
    await db.recordings.bulkDelete(ids);
  } catch (err) {
    throw new AppError('STORAGE_ERROR', 'Não foi possível excluir as gravações selecionadas.', err);
  }
}

export async function renameRecording(id: string, name: string): Promise<void> {
  try {
    await db.recordings.update(id, { name });
  } catch (err) {
    throw new AppError('STORAGE_ERROR', 'Não foi possível renomear a gravação.', err);
  }
}

export async function getRecording(id: string): Promise<RecordingRecord | undefined> {
  return db.recordings.get(id);
}

export async function listAllRecordings(): Promise<RecordingRecord[]> {
  return db.recordings.toArray();
}

/** Aplica busca por nome, filtros e ordenação em memória (coleções tipicamente pequenas). */
export function applyLibraryFilters(
  records: RecordingRecord[],
  filters: LibraryFilters,
): RecordingRecord[] {
  const query = filters.query.trim().toLowerCase();

  let result = records.filter((record) => {
    if (query && !record.name.toLowerCase().includes(query)) return false;
    if (filters.onlyWithWebcam && !record.hasWebcam) return false;
    if (filters.onlyWithAudio && !record.hasMicrophone && !record.hasSystemAudio) return false;
    return true;
  });

  result = result.sort((a, b) => {
    const direction = filters.sortDirection === 'asc' ? 1 : -1;
    const field = filters.sortField;

    if (field === 'name') {
      return a.name.localeCompare(b.name, 'pt-BR') * direction;
    }
    return (a[field] - b[field]) * direction;
  });

  return result;
}
