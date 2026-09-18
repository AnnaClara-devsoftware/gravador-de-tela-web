import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/database';
import {
  applyLibraryFilters,
  deleteRecording,
  deleteRecordings,
  renameRecording,
} from '@/lib/db/recordingsRepository';
import type { LibraryFilters, RecordingRecord } from '@/types/recording';

const DEFAULT_FILTERS: LibraryFilters = {
  query: '',
  sortField: 'createdAt',
  sortDirection: 'desc',
  onlyWithWebcam: false,
  onlyWithAudio: false,
};

export function useRecordings() {
  const [filters, setFilters] = useState<LibraryFilters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allRecordings = useLiveQuery(() => db.recordings.toArray(), [], [] as RecordingRecord[]);

  const filtered = useMemo(
    () => applyLibraryFilters(allRecordings ?? [], filters),
    [allRecordings, filters],
  );

  useEffect(() => {
    // Se uma gravação selecionada for excluída em outra aba/fluxo, removemos da seleção.
    setSelectedIds((current) => {
      const validIds = new Set((allRecordings ?? []).map((r) => r.id));
      const next = new Set([...current].filter((id) => validIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [allRecordings]);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const remove = useCallback(async (id: string) => {
    await deleteRecording(id);
  }, []);

  const removeSelected = useCallback(async () => {
    await deleteRecordings([...selectedIds]);
    clearSelection();
  }, [selectedIds, clearSelection]);

  const rename = useCallback(async (id: string, name: string) => {
    await renameRecording(id, name);
  }, []);

  return {
    recordings: filtered,
    isLoading: allRecordings === undefined,
    isEmpty: (allRecordings ?? []).length === 0,
    filters,
    setFilters,
    selectedIds,
    toggleSelected,
    clearSelection,
    remove,
    removeSelected,
    rename,
  };
}
