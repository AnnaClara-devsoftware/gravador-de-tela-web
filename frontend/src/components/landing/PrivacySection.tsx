import { ShieldCheck, Server, Lock, HardDrive } from 'lucide-react';

const POINTS = [
  {
    icon: Server,
    title: 'Sua tela não passa pelo nosso servidor',
    description: 'A captura e a gravação acontecem inteiramente no seu navegador. Nenhum frame de vídeo é enviado para nós durante a gravação.',
  },
  {
    icon: Lock,
    title: 'Você decide o que compartilhar',
    description: 'O navegador sempre pergunta explicitamente qual tela, janela ou aba você quer capturar — nunca é uma escolha automática.',
  },
  {
    icon: ShieldCheck,
    title: 'Microfone e câmera só com permissão',
    description: 'Nenhum áudio ou vídeo de webcam é capturado sem que você conceda a permissão correspondente no navegador.',
  },
  {
    icon: HardDrive,
    title: 'Gravações locais ficam no seu dispositivo',
    description: 'Por padrão, os vídeos são salvos apenas no armazenamento local do navegador (IndexedDB). Se a sincronização com conta estiver ativa, isso é informado de forma explícita.',
  },
];

export function PrivacySection() {
  return (
    <section id="privacidade" className="border-t border-[var(--color-border)] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-semibold text-[var(--color-text)]">Sua privacidade</h2>
          <p className="mt-3 text-[var(--color-text-muted)]">
            Isso não é uma promessa de marketing — reflete exatamente como a arquitetura foi construída.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {POINTS.map((point) => (
            <div key={point.title} className="flex gap-4 rounded-xl border border-[var(--color-border)] p-5">
              <point.icon size={20} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text)]">{point.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
