import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../lib/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

import { createApp } from '../app';
import { queryOne } from '../lib/db';
import { hashPassword } from '../lib/auth';

const app = createApp();
const mockedQueryOne = vi.mocked(queryOne);

beforeEach(() => {
  mockedQueryOne.mockReset();
});

describe('POST /api/auth/register', () => {
  it('cria uma conta e retorna um token', async () => {
    mockedQueryOne
      .mockResolvedValueOnce(null) // nenhum usuário existente com este e-mail
      .mockResolvedValueOnce({
        id: 'user-1',
        email: 'ana@example.com',
        password_hash: 'hash',
        name: 'Ana Clara',
      });

    const response = await request(app).post('/api/auth/register').send({
      email: 'ana@example.com',
      password: 'senhaSegura123',
      name: 'Ana Clara',
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toEqual({ id: 'user-1', email: 'ana@example.com', name: 'Ana Clara' });
  });

  it('rejeita e-mail já cadastrado com 409', async () => {
    mockedQueryOne.mockResolvedValueOnce({ id: 'user-1' });

    const response = await request(app).post('/api/auth/register').send({
      email: 'ana@example.com',
      password: 'senhaSegura123',
      name: 'Ana Clara',
    });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('CONFLICT');
  });

  it('rejeita payload inválido com 400', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'não-é-um-email',
      password: '123',
      name: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/login', () => {
  it('autentica com credenciais corretas', async () => {
    const passwordHash = await hashPassword('senhaSegura123');
    mockedQueryOne.mockResolvedValueOnce({
      id: 'user-1',
      email: 'ana@example.com',
      password_hash: passwordHash,
      name: 'Ana Clara',
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: 'senhaSegura123' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('rejeita senha incorreta com 401, sem revelar qual campo errou', async () => {
    const passwordHash = await hashPassword('senhaSegura123');
    mockedQueryOne.mockResolvedValueOnce({
      id: 'user-1',
      email: 'ana@example.com',
      password_hash: passwordHash,
      name: 'Ana Clara',
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: 'senhaErrada' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('E-mail ou senha incorretos.');
  });

  it('rejeita usuário inexistente com 401', async () => {
    mockedQueryOne.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ninguem@example.com', password: 'qualquer' });

    expect(response.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('exige autenticação', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });
});
