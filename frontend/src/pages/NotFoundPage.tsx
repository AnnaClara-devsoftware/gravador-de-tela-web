import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-sm text-[var(--color-text-faint)]">Erro 404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-[var(--color-text)]">Página não encontrada</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <Link to="/" className="mt-6">
        <Button>Voltar ao início</Button>
      </Link>
    </div>
  );
}
