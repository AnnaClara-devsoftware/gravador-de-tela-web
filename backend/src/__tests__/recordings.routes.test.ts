import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../lib/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

vi.mock('../storage', () => ({
  getStorageAdapter: vi.fn(() => ({
    save: vi.fn().mockResolvedValue('fake-key'),
    getUrl: vi.fn().mockResolvedValue('http://localhost/fake-key'),
    delete: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { createApp } from '../app';
import { query, queryOne } from '../lib/db';
import { signToken } from '../lib/auth';

const app = createApp();
const mockedQuery = vi.mocked(query);
const mockedQueryOne = vi.mocked(queryOne);

const token = signToken({ sub: 'user-1', email: 'ana@example.com' });
const authHeader = { Authorization: `Bearer ${token}` };

const fakeRow = {
  id: 'rec-1',
  user_id: 'user-1',
  name: 'Aula de React',
  duration_ms: 60_000,
  size_bytes: '1024',
  mime_type: 'video/webm',
  storage_key: null,
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-01'),
};

beforeEach(() => {
  mockedQuery.mockReset();
  mockedQueryOne.mockReset();
});

describe('autenticação nas rotas de gravações', () => {
  it('rejeita requisições sem token', async () => {
    const response = await request(app).get('/api/recordings');
    expect(response.status).toBe(401);
  });

  it('rejeita token inválido', async () => {
    const response = await request(app).get('/api/recordings').set('Authorization', 'Bearer token-invalido');
    expect(response.status).toBe(401);
  });
});

describe('GET /api/recordings', () => {
  it('lista as gravações do usuário autenticado, serializadas', async () => {
    mockedQuery.mockResolvedValueOnce([fakeRow]);

    const response = await request(app).get('/api/recordings').set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 'rec-1',
        name: 'Aula de React',
        durationMs: 60_000,
        sizeBytes: 1024,
        mimeType: 'video/webm',
        hasCloudBackup: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
  });
});

describe('POST /api/recordings', () => {
  it('rejeita payload inválido', async () => {
    const response = await request(app).post('/api/recordings').set(authHeader).send({ name: '' });
    expect(response.status).toBe(400);
  });

  it('faz upsert dos metadados e retorna 201', async () => {
    mockedQueryOne.mockResolvedValueOnce(null); // sem dono anterior
    mockedQueryOne.mockResolvedValueOnce(fakeRow); // resultado do INSERT ... RETURNING

    const response = await request(app)
      .post('/api/recordings')
      .set(authHeader)
      .send({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Aula de React',
        durationMs: 60_000,
        sizeBytes: 1024,
        mimeType: 'video/webm',
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Aula de React');
  });
});

describe('DELETE /api/recordings/:id', () => {
  it('retorna 404 ao tentar excluir gravação de outro usuário', async () => {
    mockedQueryOne.mockResolvedValueOnce({ ...fakeRow, user_id: 'outro-usuario' });

    const response = await request(app).delete('/api/recordings/rec-1').set(authHeader);

    expect(response.status).toBe(404);
  });

  it('exclui a gravação do próprio usuário', async () => {
    mockedQueryOne.mockResolvedValueOnce(fakeRow);
    mockedQuery.mockResolvedValueOnce([]);

    const response = await request(app).delete('/api/recordings/rec-1').set(authHeader);

    expect(response.status).toBe(204);
  });
});

describe('POST /api/recordings/:id/share', () => {
  it('recusa compartilhar gravação sem backup em nuvem', async () => {
    mockedQueryOne.mockResolvedValueOnce({ ...fakeRow, storage_key: null });

    const response = await request(app).post('/api/recordings/rec-1/share').set(authHeader);

    expect(response.status).toBe(400);
  });
});
