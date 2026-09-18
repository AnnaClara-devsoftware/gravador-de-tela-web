import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Em produção, isto é onde uma ferramenta de monitoramento entraria.
    console.error('Erro não tratado na interface:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <AlertOctagon size={28} className="text-[var(--color-rec)]" />
          <h1 className="mt-4 font-display text-xl font-semibold text-[var(--color-text)]">Algo deu errado</h1>
          <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">
            A interface encontrou um erro inesperado. Recarregar a página costuma resolver.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Recarregar página
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
