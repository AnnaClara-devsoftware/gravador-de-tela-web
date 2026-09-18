import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { queryOne } from '../lib/db';
import { hashPassword, signToken, verifyPassword } from '../lib/auth';
import { validateBody } from '../middleware/validate';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { ApiError, asyncHandler } from '../middleware/errors';

const router = Router();

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
}

// Limita tentativas de login/registro para mitigar força bruta. Dados do
// frontend nunca são confiados sem essa camada — mesmo com validação de
// schema, um endpoint de autenticação sem rate limit é um convite a abuso.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'RATE_LIMITED', message: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.').max(128),
  name: z.string().trim().min(1, 'Informe seu nome.').max(120),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

function toPublicUser(user: UserRow) {
  return { id: user.id, email: user.email, name: user.name };
}

router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body as z.infer<typeof registerSchema>;

    const existing = await queryOne<UserRow>('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
      throw ApiError.conflict('Já existe uma conta com este e-mail.');
    }

    const passwordHash = await hashPassword(password);
    const user = await queryOne<UserRow>(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)
       RETURNING id, email, password_hash, name`,
      [email, passwordHash, name],
    );
    if (!user) throw ApiError.internal('Não foi possível criar a conta.');

    const token = signToken({ sub: user.id, email: user.email });
    res.status(201).json({ token, user: toPublicUser(user) });
  }),
);

router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    const user = await queryOne<UserRow>(
      'SELECT id, email, password_hash, name FROM users WHERE email = $1',
      [email],
    );
    if (!user) throw ApiError.unauthorized('E-mail ou senha incorretos.');

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) throw ApiError.unauthorized('E-mail ou senha incorretos.');

    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token, user: toPublicUser(user) });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await queryOne<UserRow>('SELECT id, email, password_hash, name FROM users WHERE id = $1', [
      req.userId,
    ]);
    if (!user) throw ApiError.notFound('Usuário não encontrado.');
    res.json(toPublicUser(user));
  }),
);

export default router;
