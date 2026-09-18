import { AppError } from '@/types/recording';

const API_BASE_URL = import.meta.env.VITE_API_URL as string | undefined;

/**
 * O backend é 100% opcional para o funcionamento do app: gravar, salvar,
 * reproduzir, baixar e excluir funcionam inteiramente no navegador via
 * IndexedDB. Se `VITE_API_URL` não estiver configurada, os recursos de
 * conta, sincronização e compartilhamento simplesmente ficam ocultos —
 * nunca quebram a experiência local.
 */
export function isBackendConfigured(): boolean {
  return !!API_BASE_URL;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new AppError('NETWORK_ERROR', 'Nenhum backend configurado (VITE_API_URL ausente).');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    throw new AppError('NETWORK_ERROR', 'Não foi possível conectar ao servidor.', err);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new AppError(
      response.status === 401 || response.status === 403 ? 'PERMISSION_DENIED_SCREEN' : 'UPLOAD_ERROR',
      payload?.message ?? `Erro do servidor (${response.status}).`,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string };
}

export const api = {
  register: (email: string, password: string, name: string) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: { email, password, name } }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password } }),

  me: (token: string) => request<AuthResponse['user']>('/api/auth/me', { token }),

  listRemoteRecordings: (token: string) =>
    request<Array<{ id: string; name: string; createdAt: string; durationMs: number; sizeBytes: number }>>(
      '/api/recordings',
      { token },
    ),

  syncRecordingMetadata: (
    token: string,
    meta: { id: string; name: string; durationMs: number; sizeBytes: number; mimeType: string },
  ) => request('/api/recordings', { method: 'POST', body: meta, token }),

  deleteRemoteRecording: (token: string, id: string) =>
    request(`/api/recordings/${id}`, { method: 'DELETE', token }),

  createShareLink: (token: string, recordingId: string) =>
    request<{ shareUrl: string; expiresAt: string }>(`/api/recordings/${recordingId}/share`, {
      method: 'POST',
      token,
    }),

  getStats: (token: string) =>
    request<{ totalRecordings: number; totalSizeBytes: number; totalDurationMs: number }>('/api/stats', {
      token,
    }),
};
