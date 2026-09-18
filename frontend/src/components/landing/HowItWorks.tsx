const STEPS = [
  {
    number: '01',
    title: 'Escolha o que compartilhar',
    description: 'Tela inteira, uma janela específica ou uma aba do navegador — você decide exatamente o que será capturado.',
  },
  {
    number: '02',
    title: 'Grave tela, áudio e webcam',
    description: 'Ative microfone e webcam se quiser. Pause, retome e acompanhe o tempo em tempo real durante a gravação.',
  },
  {
    number: '03',
    title: 'Assista, baixe e gerencie',
    description: 'A gravação fica disponível na sua biblioteca local, pronta para reproduzir, baixar ou excluir quando quiser.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-[var(--color-border)] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-semibold text-[var(--color-text)]">Como funciona</h2>
          <p className="mt-3 text-[var(--color-text-muted)]">
            Três passos, nenhuma instalação. O fluxo inteiro acontece na aba do seu navegador.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.number} className="relative">
              <span className="font-display text-5xl font-semibold text-[var(--color-surface-2)]">
                {step.number}
              </span>
              <h3 className="mt-3 text-lg font-medium text-[var(--color-text)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{step.description}</p>
              {index < STEPS.length - 1 && (
                <div className="absolute right-[-1rem] top-6 hidden h-px w-8 bg-[var(--color-border-strong)] sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
