import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/auth';
import { ApiError } from './errors';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/** Exige um JWT válido no header Authorization: Bearer <token>. */
export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Envie um token de autenticação válido.');
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch {
    throw ApiError.unauthorized('Token inválido ou expirado.');
  }
}
