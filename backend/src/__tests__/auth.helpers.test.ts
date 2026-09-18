import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../lib/auth';

describe('hashPassword / verifyPassword', () => {
  it('gera um hash diferente da senha original', async () => {
    const hash = await hashPassword('minhaSenhaSegura123');
    expect(hash).not.toBe('minhaSenhaSegura123');
  });

  it('valida a senha correta', async () => {
    const hash = await hashPassword('minhaSenhaSegura123');
    await expect(verifyPassword('minhaSenhaSegura123', hash)).resolves.toBe(true);
  });

  it('rejeita a senha incorreta', async () => {
    const hash = await hashPassword('minhaSenhaSegura123');
    await expect(verifyPassword('senhaErrada', hash)).resolves.toBe(false);
  });
});

describe('signToken / verifyToken', () => {
  it('gera um token que pode ser verificado de volta ao mesmo payload', () => {
    const token = signToken({ sub: 'user-1', email: 'ana@example.com' });
    const payload = verifyToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.email).toBe('ana@example.com');
  });

  it('rejeita um token adulterado', () => {
    const token = signToken({ sub: 'user-1', email: 'ana@example.com' });
    const tampered = token.slice(0, -2) + 'xx';
    expect(() => verifyToken(tampered)).toThrow();
  });
});
