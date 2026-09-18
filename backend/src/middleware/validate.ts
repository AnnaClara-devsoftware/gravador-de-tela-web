import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

/** Valida e substitui req.body pelo resultado tipado do schema (lança ZodError em caso de falha). */
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
}
