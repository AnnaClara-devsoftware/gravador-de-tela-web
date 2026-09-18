import { useEffect, useState } from 'react';

export interface DeviceOption {
  deviceId: string;
  label: string;
}

interface MediaDevicesState {
  microphones: DeviceOption[];
  cameras: DeviceOption[];
}

/**
 * Enumera dispositivos disponíveis. Rótulos completos só aparecem depois
 * que alguma permissão de mídia já foi concedida (limitação de privacidade
 * do próprio navegador) — antes disso, mostramos um rótulo genérico
 * numerado em vez de esconder a opção.
 */
export function useMediaDevices(refreshKey: unknown): MediaDevicesState {
  const [state, setState] = useState<MediaDevicesState>({ microphones: [], cameras: [] });

  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    let cancelled = false;

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      if (cancelled) return;
      let micCount = 0;
      let camCount = 0;
      const microphones: DeviceOption[] = [];
      const cameras: DeviceOption[] = [];

      for (const device of devices) {
        if (device.kind === 'audioinput') {
          micCount += 1;
          microphones.push({ deviceId: device.deviceId, label: device.label || `Microfone ${micCount}` });
        }
        if (device.kind === 'videoinput') {
          camCount += 1;
          cameras.push({ deviceId: device.deviceId, label: device.label || `Câmera ${camCount}` });
        }
      }
      setState({ microphones, cameras });
    });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return state;
}
