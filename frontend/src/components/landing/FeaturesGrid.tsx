import {
  MonitorPlay,
  Mic,
  Camera,
  Volume2,
  Eye,
  Library,
  Download,
  HardDrive,
  ShieldCheck,
  ListChecks,
} from 'lucide-react';

const FEATURES = [
  { icon: MonitorPlay, title: 'Gravação de tela', description: 'Tela inteira, janela ou aba, com a Screen Capture API nativa do navegador.' },
  { icon: Mic, title: 'Microfone', description: 'Narre sua gravação com o microfone que você escolher, com permissão explícita.' },
  { icon: Camera, title: 'Webcam em bolha', description: 'Sobreponha sua câmera à gravação, com posição e tamanho ajustáveis.' },
  { icon: Volume2, title: 'Áudio do sistema', description: 'Capture o som da tela quando o navegador e o sistema operacional permitirem.' },
  { icon: Eye, title: 'Preview em tempo real', description: 'Veja exatamente o que está sendo gravado antes e durante a captura.' },
  { icon: Library, title: 'Biblioteca de gravações', description: 'Busca, ordenação e filtros para organizar tudo o que você já gravou.' },
  { icon: Download, title: 'Download com um clique', description: 'Baixe qualquer gravação com um nome de arquivo claro e organizado.' },
  { icon: HardDrive, title: 'Armazenamento local', description: 'Gravações ficam salvas no seu navegador via IndexedDB — sem upload automático.' },
  { icon: ShieldCheck, title: 'Privacidade por padrão', description: 'Sua tela nunca é enviada a um servidor. Você decide o que compartilhar.' },
  { icon: ListChecks, title: 'Compatibilidade transparente', description: 'A aplicação te avisa exatamente o que seu navegador suporta, sem surpresas.' },
];

export function FeaturesGrid() {
  return (
    <section id="recursos" className="border-t border-[var(--color-border)] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-semibold text-[var(--color-text)]">Recursos</h2>
          <p className="mt-3 text-[var(--color-text-muted)]">
            Tudo o que você espera de uma ferramenta de gravação, sem esconder o que depende do navegador.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="bg-[var(--color-bg)] p-6 transition-colors hover:bg-[var(--color-surface)]">
              <feature.icon size={20} className="text-[var(--color-accent)]" />
              <h3 className="mt-4 text-sm font-medium text-[var(--color-text)]">{feature.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-muted)]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
