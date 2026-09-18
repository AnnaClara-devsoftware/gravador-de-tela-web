import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }

  static badRequest(message: string, code = 'BAD_REQUEST') {
    return new ApiError(400, code, message);
  }
  static unauthorized(message = 'Não autenticado.') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }
  static forbidden(message = 'Você não tem permissão para acessar este recurso.') {
    return new ApiError(403, 'FORBIDDEN', message);
  }
  static notFound(message = 'Recurso não encontrado.') {
    return new ApiError(404, 'NOT_FOUND', message);
  }
  static conflict(message: string) {
    return new ApiError(409, 'CONFLICT', message);
  }
  static payloadTooLarge(message: string) {
    return new ApiError(413, 'PAYLOAD_TOO_LARGE', message);
  }
  static internal(message = 'Erro interno do servidor.') {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }
}

/** Evita repetir try/catch em cada handler async de rota. */
export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(fn: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Dados inválidos.',
      issues: err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    });
    return;
  }

  // Erros do multer (limite de tamanho de upload)
  if (err instanceof Error && err.name === 'MulterError') {
    res.status(413).json({ code: 'PAYLOAD_TOO_LARGE', message: 'Arquivo excede o tamanho máximo permitido.' });
    return;
  }

  console.error('Erro não tratado:', err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ code: 'NOT_FOUND', message: `Rota não encontrada: ${req.method} ${req.path}` });
}
