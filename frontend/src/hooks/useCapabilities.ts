import { useEffect, useMemo, useState } from 'react';
import { detectCapabilities, type CapabilityReport } from '@/lib/compat/detectCapabilities';

export function useCapabilities(): CapabilityReport {
  const [report, setReport] = useState<CapabilityReport>(() => detectCapabilities());

  useEffect(() => {
    // Recalcula se o usuário trocar de rede/contexto (raro, mas cobre o
    // caso de abrir via HTTP e o service worker forçar HTTPS depois, etc).
    const recompute = () => setReport(detectCapabilities());
    window.addEventListener('online', recompute);
    window.addEventListener('offline', recompute);
    return () => {
      window.removeEventListener('online', recompute);
      window.removeEventListener('offline', recompute);
    };
  }, []);

  return useMemo(() => report, [report]);
}
