import { describe, expect, it } from 'vitest';

describe('env', () => {
  it('carrega com valores padrão sensatos quando o mínimo necessário está presente', async () => {
    const { env } = await import('../env');
    expect(env.PORT).toBeGreaterThan(0);
    expect(env.JWT_EXPIRES_IN).toBe('7d');
    expect(env.MAX_UPLOAD_BYTES).toBeGreaterThan(0);
  });

  it('isS3Configured é falso quando nenhuma variável S3_* está definida', async () => {
    const { isS3Configured } = await import('../env');
    expect(isS3Configured).toBe(false);
  });
});
