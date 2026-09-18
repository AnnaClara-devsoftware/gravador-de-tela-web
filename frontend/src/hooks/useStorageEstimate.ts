import { useEffect, useState } from 'react';
import { estimateStorage } from '@/lib/db/database';

interface StorageEstimateState {
  usageBytes: number;
  quotaBytes: number | null;
  supported: boolean;
  loading: boolean;
}

export function useStorageEstimate(refreshKey: unknown): StorageEstimateState {
  const [state, setState] = useState<StorageEstimateState>({
    usageBytes: 0,
    quotaBytes: null,
    supported: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    estimateStorage().then((result) => {
      if (!cancelled) setState({ ...result, loading: false });
    });
    return () => {
      cancelled = true;
    };
    // refreshKey força reconsulta após novas gravações serem salvas/excluídas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return state;
}
