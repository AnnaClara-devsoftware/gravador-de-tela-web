import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center">
        <div>
          <p className="font-display text-sm font-semibold text-[var(--color-text)]">Gravador de Tela</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Projeto de portfólio — gravação de tela 100% no navegador.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--color-text-muted)]">
          <Link to="/compatibilidade" className="hover:text-[var(--color-text)]">Compatibilidade</Link>
          <Link to="/#privacidade" className="hover:text-[var(--color-text)]">Privacidade</Link>
          <Link to="/gravacoes" className="hover:text-[var(--color-text)]">Minhas gravações</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[var(--color-text)]">
            Código-fonte
          </a>
        </div>
      </div>
    </footer>
  );
}
