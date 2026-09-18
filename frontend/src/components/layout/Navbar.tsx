import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const LINKS = [
  { to: '/#como-funciona', label: 'Como funciona' },
  { to: '/#recursos', label: 'Recursos' },
  { to: '/compatibilidade', label: 'Compatibilidade' },
  { to: '/gravacoes', label: 'Minhas gravações' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-[15px] font-semibold text-[var(--color-text)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-ink)]">
            <MonitorPlay size={17} strokeWidth={2.4} />
          </span>
          Gravador de Tela
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'text-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:block">
          <Link to="/gravar">
            <Button size="sm">Começar a gravar</Button>
          </Link>
        </div>

        <button
          className="text-[var(--color-text)] md:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-[var(--color-border)] px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/gravar" onClick={() => setIsOpen(false)} className="mt-2">
              <Button size="sm" className="w-full">
                Começar a gravar
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
