const STACK = [
  { name: 'React', role: 'Interface' },
  { name: 'TypeScript', role: 'Tipagem em todo o projeto' },
  { name: 'Vite', role: 'Build e dev server' },
  { name: 'Tailwind CSS', role: 'Estilização' },
  { name: 'MediaRecorder API', role: 'Gravação de mídia' },
  { name: 'Screen Capture API', role: 'Captura de tela' },
  { name: 'Web Audio API', role: 'Mixagem de áudio' },
  { name: 'IndexedDB + Dexie', role: 'Armazenamento local' },
  { name: 'Node.js + Express', role: 'API do backend' },
  { name: 'PostgreSQL', role: 'Persistência de metadados' },
];

export function TechStack() {
  return (
    <section className="border-t border-[var(--color-border)] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-semibold text-[var(--color-text)]">Tecnologias</h2>
          <p className="mt-3 text-[var(--color-text-muted)]">
            Apenas o que é realmente usado no projeto — nada de lista de tecnologias para inglês ver.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {STACK.map((tech) => (
            <div
              key={tech.name}
              className="rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-3"
            >
              <p className="font-mono text-sm text-[var(--color-text)]">{tech.name}</p>
              <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">{tech.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
