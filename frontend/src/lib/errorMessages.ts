import type { AppErrorCode } from '@/types/recording';

export const ERROR_MESSAGES: Record<AppErrorCode, { title: string; description: string }> = {
  PERMISSION_DENIED_SCREEN: {
    title: 'Permissão de tela negada',
    description: 'Você precisa permitir o compartilhamento de tela para iniciar a gravação.',
  },
  PERMISSION_DENIED_MIC: {
    title: 'Microfone indisponível',
    description: 'A permissão de microfone foi negada. A gravação pode continuar sem áudio do microfone.',
  },
  PERMISSION_DENIED_CAMERA: {
    title: 'Câmera indisponível',
    description: 'A permissão de câmera foi negada. A gravação pode continuar sem webcam.',
  },
  SHARE_CANCELLED: {
    title: 'Compartilhamento cancelado',
    description: 'Você fechou a janela de seleção antes de escolher o que compartilhar.',
  },
  NO_SECURE_CONTEXT: {
    title: 'Conexão segura necessária',
    description: 'Para proteger sua privacidade, a gravação de tela só funciona em conexões seguras (HTTPS) ou em localhost.',
  },
  UNSUPPORTED_BROWSER: {
    title: 'Navegador não compatível',
    description: 'Este navegador não oferece suporte às APIs de gravação de tela. Tente Chrome, Edge ou Firefox atualizados.',
  },
  UNSUPPORTED_CODEC: {
    title: 'Formato de vídeo não suportado',
    description: 'Não encontramos um codec de vídeo compatível neste navegador.',
  },
  NO_CAMERA_DEVICE: {
    title: 'Nenhuma câmera encontrada',
    description: 'Não detectamos nenhuma webcam conectada a este dispositivo.',
  },
  NO_MIC_DEVICE: {
    title: 'Nenhum microfone encontrado',
    description: 'Não detectamos nenhum microfone conectado a este dispositivo.',
  },
  RECORDER_ERROR: {
    title: 'Erro na gravação',
    description: 'Algo deu errado durante a gravação. Tente novamente.',
  },
  STORAGE_ERROR: {
    title: 'Erro de armazenamento',
    description: 'Não foi possível acessar o armazenamento local do navegador.',
  },
  STORAGE_QUOTA_EXCEEDED: {
    title: 'Armazenamento cheio',
    description: 'O espaço disponível no seu navegador acabou. Exclua gravações antigas para liberar espaço.',
  },
  NETWORK_ERROR: {
    title: 'Falha de conexão',
    description: 'Não foi possível conectar ao servidor. Verifique sua internet.',
  },
  UPLOAD_ERROR: {
    title: 'Erro ao sincronizar',
    description: 'Não foi possível enviar os dados para o servidor.',
  },
  UNKNOWN: {
    title: 'Algo deu errado',
    description: 'Ocorreu um erro inesperado. Tente novamente.',
  },
};
