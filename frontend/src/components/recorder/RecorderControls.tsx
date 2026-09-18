import { Circle, Pause, Play, Square, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { RecorderStatus } from '@/types/recording';

interface RecorderControlsProps {
  status: RecorderStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onCancel: () => void;
}

export function RecorderControls({ status, onStart, onPause, onResume, onStop, onCancel }: RecorderControlsProps) {
  if (status === 'idle' || status === 'error') {
    return (
      <Button size="lg" onClick={onStart} className="w-full sm:w-auto">
        <Circle size={16} fill="currentColor" />
        Iniciar gravação
      </Button>
    );
  }

  if (status === 'requesting-permission' || status === 'processing') {
    return (
      <Button size="lg" isLoading disabled className="w-full sm:w-auto">
        {status === 'requesting-permission' ? 'Aguardando permissões…' : 'Processando gravação…'}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {status === 'recording' ? (
        <Button size="lg" variant="secondary" onClick={onPause}>
          <Pause size={16} /> Pausar
        </Button>
      ) : (
        <Button size="lg" variant="secondary" onClick={onResume}>
          <Play size={16} /> Continuar
        </Button>
      )}
      <Button size="lg" onClick={onStop}>
        <Square size={15} fill="currentColor" /> Finalizar
      </Button>
      <Button size="lg" variant="ghost" onClick={onCancel}>
        <XCircle size={16} /> Cancelar
      </Button>
    </div>
  );
}
