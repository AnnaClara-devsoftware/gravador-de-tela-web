import { LiveCompatibilityPanel } from '@/components/compatibility/LiveCompatibilityPanel';
import { BrowserMatrixTable } from '@/components/compatibility/BrowserMatrixTable';

export function CompatibilityPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-[var(--color-text)]">Compatibilidade do navegador</h1>
      <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
        A gravação de tela depende de APIs nativas do navegador — não de um plugin ou aplicativo instalado.
        O suporte varia conforme o navegador, a versão e o sistema operacional. Aqui está exatamente o que
        esperar, sem promessas que a tecnologia não pode cumprir.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-[var(--color-text)]">Antes de começar</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
          Algumas funcionalidades dependem do navegador e do sistema operacional que você está usando agora.
          De modo geral: Chrome e Edge no Windows ou Linux oferecem a experiência mais completa, incluindo
          áudio do sistema. Firefox grava tela e áudio do microfone normalmente, mas o áudio do sistema é
          mais limitado. Safari grava tela, microfone e webcam, porém não captura áudio do sistema.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-[var(--color-text)]">Seu navegador agora</h2>
        <div className="mt-4">
          <LiveCompatibilityPanel />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-[var(--color-text)]">Comparativo entre navegadores</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Baseado no suporte documentado das APIs Screen Capture, MediaRecorder e getUserMedia nas versões
          desktop mais recentes de cada navegador.
        </p>
        <div className="mt-4">
          <BrowserMatrixTable />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-[var(--color-text)]">Limitações conhecidas</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--color-text-muted)]">
          <li>A gravação de tela requer HTTPS ou localhost — é uma exigência de segurança do próprio navegador.</li>
          <li>O suporte à captura de áudio do sistema depende do navegador e do sistema operacional, e pode não estar disponível.</li>
          <li>Não é possível escolher programaticamente "aba" em vez de "tela"; essa escolha acontece na janela nativa do navegador.</li>
          <li>O formato final do vídeo (WebM ou MP4) varia conforme os codecs disponíveis no navegador.</li>
          <li>A capacidade de armazenamento local depende do navegador e do espaço livre no dispositivo.</li>
        </ul>
      </section>
    </div>
  );
}
