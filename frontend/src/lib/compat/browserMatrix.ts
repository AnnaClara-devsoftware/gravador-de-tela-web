/**
 * Matriz estática de compatibilidade entre navegadores.
 *
 * Estes dados descrevem o comportamento conhecido e documentado das APIs
 * utilizadas (Screen Capture API, MediaRecorder, getUserMedia) em suas
 * versões desktop mais recentes. Não substituem a detecção em tempo real
 * (`detectCapabilities`), que reflete o navegador do usuário; servem para
 * dar transparência sobre o ecossistema como um todo antes mesmo de abrir
 * o app em outro navegador.
 *
 * Fontes: documentação MDN das respectivas APIs e notas de compatibilidade
 * dos fornecedores (Chromium, WebKit, Gecko). Revisar ao atualizar.
 */

export type MatrixSupport = 'yes' | 'partial' | 'no';

export interface MatrixRow {
  feature: string;
  notes?: string;
  chrome: MatrixSupport;
  edge: MatrixSupport;
  firefox: MatrixSupport;
  safari: MatrixSupport;
}

export const BROWSER_COMPAT_MATRIX: MatrixRow[] = [
  {
    feature: 'Gravação de tela (getDisplayMedia)',
    chrome: 'yes',
    edge: 'yes',
    firefox: 'yes',
    safari: 'yes',
    notes: 'Suportado em todos, mas exige HTTPS ou localhost.',
  },
  {
    feature: 'Escolher aba do navegador especificamente',
    chrome: 'yes',
    edge: 'yes',
    firefox: 'partial',
    safari: 'no',
    notes: 'O seletor de aba é uma opção do diálogo nativo, não controlável pela aplicação.',
  },
  {
    feature: 'Áudio do sistema/aba na gravação',
    chrome: 'partial',
    edge: 'partial',
    firefox: 'partial',
    safari: 'no',
    notes: 'Depende do SO. No Windows/Linux funciona ao compartilhar aba ou tela; no macOS costuma exigir extensão do sistema.',
  },
  {
    feature: 'Microfone (getUserMedia áudio)',
    chrome: 'yes',
    edge: 'yes',
    firefox: 'yes',
    safari: 'yes',
  },
  {
    feature: 'Webcam (getUserMedia vídeo)',
    chrome: 'yes',
    edge: 'yes',
    firefox: 'yes',
    safari: 'yes',
  },
  {
    feature: 'MediaRecorder (gravação em si)',
    chrome: 'yes',
    edge: 'yes',
    firefox: 'yes',
    safari: 'yes',
    notes: 'Disponível desde Safari 14.1, com suporte a codecs mais limitado.',
  },
  {
    feature: 'Codec WebM/VP9',
    chrome: 'yes',
    edge: 'yes',
    firefox: 'yes',
    safari: 'no',
  },
  {
    feature: 'Codec MP4/H.264 no MediaRecorder',
    chrome: 'partial',
    edge: 'partial',
    firefox: 'no',
    safari: 'yes',
    notes: 'Safari grava nativamente em MP4; Chrome/Edge têm suporte mais recente e variável por versão/SO.',
  },
  {
    feature: 'Pausar e retomar gravação',
    chrome: 'yes',
    edge: 'yes',
    firefox: 'yes',
    safari: 'partial',
    notes: 'Suporte a pause()/resume() chegou mais tarde no WebKit; confira a versão do Safari.',
  },
];
