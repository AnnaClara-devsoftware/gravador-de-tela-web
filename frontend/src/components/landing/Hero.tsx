import { Link } from 'react-router-dom';
import { ArrowRight, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HeroIllustration } from './HeroIllustration';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text-muted)]">
            <MonitorPlay size={13} className="text-[var(--color-accent)]" />
            Direto do navegador, sem instalar nada
          </div>

          <h1 className="text-balance font-display text-4xl font-semibold leading-[1.08] text-[var(--color-text)] sm:text-5xl lg:text-[3.4rem]">
            Grave sua tela. Crie. Compartilhe.
          </h1>

          <p className="mt-5 max-w-lg text-balance text-lg leading-relaxed text-[var(--color-text-muted)]">
            Capture tela, microfone e webcam com qualidade profissional — tudo processado
            localmente no seu navegador. Nenhuma imagem da sua tela passa pelos nossos
            servidores em momento algum.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/gravar">
              <Button size="lg" className="w-full sm:w-auto">
                Começar a gravar
                <ArrowRight size={17} />
              </Button>
            </Link>
            <Link to="/gravacoes">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Ver minhas gravações
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[var(--color-text-faint)]">
            <span>Sem cadastro obrigatório</span>
            <span>Gravações ficam no seu dispositivo</span>
            <span>Gratuito</span>
          </div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}
