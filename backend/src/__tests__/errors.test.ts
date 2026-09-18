import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiError, errorHandler } from '../middleware/errors';
import type { Request, Response } from 'express';

function mockResponse() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('ApiError factories', () => {
  it('cria erros com status e código corretos', () => {
    expect(ApiError.notFound().status).toBe(404);
    expect(ApiError.unauthorized().status).toBe(401);
    expect(ApiError.forbidden().status).toBe(403);
    expect(ApiError.conflict('x').status).toBe(409);
    expect(ApiError.payloadTooLarge('x').status).toBe(413);
  });
});

describe('errorHandler', () => {
  it('responde com o status e código de um ApiError', () => {
    const res = mockResponse();
    errorHandler(ApiError.notFound('Gravação não encontrada.'), {} as Request, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ code: 'NOT_FOUND', message: 'Gravação não encontrada.' });
  });

  it('responde 400 com detalhes de validação para ZodError', () => {
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: 'não-é-email' });
    const res = mockResponse();

    if (!result.success) {
      errorHandler(result.error, {} as Request, res, vi.fn());
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VALIDATION_ERROR' }),
    );
  });

  it('responde 500 para erros desconhecidos, sem vazar detalhes internos', () => {
    const res = mockResponse();
    errorHandler(new Error('detalhe interno sensível'), {} as Request, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' });
  });
});
