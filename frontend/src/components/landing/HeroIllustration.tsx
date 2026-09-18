/**
 * Composição visual original do hero: um "console" de gravação desenhado
 * inteiramente em SVG/CSS (sem banco de imagens, sem geração externa).
 * Representa a própria interface do produto — janela capturada, waveform
 * de áudio, timeline e a luz de "tally" (REC) — para que a primeira coisa
 * que a pessoa vê já seja o objeto do produto, não uma metáfora genérica.
 */
export function HeroIllustration() {
  const waveBars = Array.from({ length: 28 }, (_, i) => i);

  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div
        className="absolute -inset-10 -z-10 opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, var(--color-accent-muted), transparent)',
        }}
        aria-hidden="true"
      />

      <svg
        viewBox="0 0 560 420"
        className="w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
        role="img"
        aria-labelledby="hero-illustration-title"
      >
        <title id="hero-illustration-title">
          Interface do Gravador de Tela mostrando uma gravação em andamento, com waveform de áudio, bolha de webcam e timeline.
        </title>

        <defs>
          <linearGradient id="screenGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1c212b" />
            <stop offset="100%" stopColor="#12151b" />
          </linearGradient>
          <linearGradient id="contentGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a3140" />
            <stop offset="100%" stopColor="#1a1e27" />
          </linearGradient>
          <clipPath id="windowClip">
            <rect x="0" y="28" width="560" height="332" rx="14" />
          </clipPath>
        </defs>

        {/* Janela do app */}
        <g>
          <rect x="0" y="0" width="560" height="360" rx="18" fill="var(--color-surface)" stroke="var(--color-border-strong)" />
          {/* Barra de título */}
          <rect x="0" y="0" width="560" height="28" rx="18" fill="var(--color-bg-raised)" />
          <rect x="0" y="14" width="560" height="14" fill="var(--color-bg-raised)" />
          <circle cx="20" cy="14" r="5" fill="var(--color-rec)" />
          <circle cx="38" cy="14" r="5" fill="var(--color-warn)" />
          <circle cx="56" cy="14" r="5" fill="var(--color-success)" />
          <text x="280" y="18" textAnchor="middle" fontSize="11" fill="var(--color-text-faint)" fontFamily="var(--font-mono)">
            gravador-de-tela · gravando
          </text>

          <g clipPath="url(#windowClip)">
            <rect x="0" y="28" width="560" height="332" fill="url(#screenGradient)" />

            {/* "conteúdo" abstrato representando a tela sendo capturada */}
            <rect x="28" y="56" width="220" height="130" rx="10" fill="url(#contentGradient)" />
            <rect x="264" y="56" width="268" height="60" rx="10" fill="url(#contentGradient)" />
            <rect x="264" y="126" width="130" height="60" rx="10" fill="url(#contentGradient)" />
            <rect x="402" y="126" width="130" height="60" rx="10" fill="url(#contentGradient)" />
            <rect x="28" y="200" width="504" height="70" rx="10" fill="url(#contentGradient)" />

            <g opacity="0.65">
              <rect x="46" y="74" width="120" height="8" rx="4" fill="var(--color-text-faint)" />
              <rect x="46" y="90" width="160" height="8" rx="4" fill="var(--color-text-faint)" />
              <rect x="46" y="106" width="90" height="8" rx="4" fill="var(--color-text-faint)" />
            </g>

            {/* cursor do mouse */}
            <path d="M 372 148 L 372 178 L 380 170 L 386 182 L 391 179 L 385 168 L 396 168 Z" fill="var(--color-text)" opacity="0.85" />

            {/* bolha de webcam */}
            <g>
              <circle cx="486" cy="308" r="46" fill="var(--color-bg-raised)" stroke="var(--color-accent)" strokeWidth="2.5" />
              <circle cx="486" cy="296" r="14" fill="var(--color-border-strong)" />
              <path d="M 462 330 Q 486 306 510 330 L 510 336 Q 486 320 462 336 Z" fill="var(--color-border-strong)" />
            </g>

            {/* Tally light REC */}
            <g transform="translate(44, 292)">
              <circle cx="0" cy="0" r="7" fill="var(--color-rec)" className="origin-center" style={{ animation: 'pulse-rec 1.6s ease-in-out infinite' }} />
              <text x="16" y="4" fontSize="13" fontWeight="600" fill="var(--color-text)" fontFamily="var(--font-mono)">
                REC
              </text>
              <text x="62" y="4" fontSize="13" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">
                00:12:41
              </text>
            </g>

            {/* Waveform */}
            <g transform="translate(220, 296)">
              {waveBars.map((i) => {
                const height = 6 + Math.abs(Math.sin(i * 0.7)) * 22;
                return (
                  <rect
                    key={i}
                    x={i * 8}
                    y={-height / 2}
                    width="4"
                    height={height}
                    rx="2"
                    fill="var(--color-accent)"
                    opacity={0.35 + (i % 5) * 0.13}
                  />
                );
              })}
            </g>
          </g>
        </g>

        {/* Timeline / barra de controles fora da janela */}
        <g transform="translate(0, 376)">
          <rect x="0" y="0" width="560" height="44" rx="14" fill="var(--color-surface-2)" stroke="var(--color-border)" />
          <circle cx="28" cy="22" r="10" fill="var(--color-rec)" />
          <rect x="10" y="18" width="8" height="8" rx="1.5" fill="var(--color-surface-2)" transform="translate(18,0)" />
          <rect x="52" y="18" width="4" height="8" rx="1" fill="var(--color-text)" />
          <rect x="60" y="18" width="4" height="8" rx="1" fill="var(--color-text)" />

          <rect x="90" y="20" width="380" height="4" rx="2" fill="var(--color-border-strong)" />
          <rect x="90" y="20" width="150" height="4" rx="2" fill="var(--color-accent)" />
          <circle cx="240" cy="22" r="5.5" fill="var(--color-accent)" />

          <text x="536" y="26" textAnchor="end" fontSize="11" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">
            1080p
          </text>
        </g>
      </svg>
    </div>
  );
}
