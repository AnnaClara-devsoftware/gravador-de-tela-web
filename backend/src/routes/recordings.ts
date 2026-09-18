import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { query, queryOne } from '../lib/db';
import { env } from '../env';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { ApiError, asyncHandler } from '../middleware/errors';
import { getStorageAdapter } from '../storage';

const router = Router();
router.use(requireAuth);

interface RecordingRow {
  id: string;
  user_id: string;
  name: string;
  duration_ms: number;
  size_bytes: string; // bigint chega como string via node-postgres
  mime_type: string;
  storage_key: string | null;
  created_at: Date;
  updated_at: Date;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    // Nunca confiamos no MIME type declarado pelo cliente sem checagem —
    // aqui validamos contra uma lista explícita de formatos de vídeo aceitos.
    const allowed = ['video/webm', 'video/mp4'];
    if (!allowed.some((type) => file.mimetype.startsWith(type))) {
      cb(new Error('Tipo de arquivo não permitido. Envie um vídeo WebM ou MP4.'));
      return;
    }
    cb(null, true);
  },
});

function serializeRecording(recording: RecordingRow) {
  return {
    id: recording.id,
    name: recording.name,
    durationMs: recording.duration_ms,
    sizeBytes: Number(recording.size_bytes),
    mimeType: recording.mime_type,
    hasCloudBackup: !!recording.storage_key,
    createdAt: recording.created_at.toISOString(),
    updatedAt: recording.updated_at.toISOString(),
  };
}

router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const recordings = await query<RecordingRow>(
      'SELECT * FROM recordings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId],
    );
    res.json(recordings.map(serializeRecording));
  }),
);

const syncMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(255),
  durationMs: z.number().int().nonnegative(),
  sizeBytes: z.number().int().nonnegative(),
  mimeType: z.string().min(1).max(100),
});

router.post(
  '/',
  validateBody(syncMetadataSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const data = req.body as z.infer<typeof syncMetadataSchema>;

    const existing = await queryOne<RecordingRow>('SELECT user_id FROM recordings WHERE id = $1', [data.id]);
    if (existing && existing.user_id !== req.userId) {
      throw ApiError.forbidden();
    }

    const recording = await queryOne<RecordingRow>(
      `INSERT INTO recordings (id, user_id, name, duration_ms, size_bytes, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         duration_ms = EXCLUDED.duration_ms,
         size_bytes = EXCLUDED.size_bytes,
         updated_at = now()
       RETURNING *`,
      [data.id, req.userId, data.name, data.durationMs, data.sizeBytes, data.mimeType],
    );
    if (!recording) throw ApiError.internal('Não foi possível salvar os metadados da gravação.');

    res.status(201).json(serializeRecording(recording));
  }),
);

/** Upload opcional do binário do vídeo — só acontece se o usuário ativar backup em nuvem. */
router.post(
  '/:id/upload',
  upload.single('video'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const recording = await queryOne<RecordingRow>('SELECT * FROM recordings WHERE id = $1', [req.params.id]);
    if (!recording || recording.user_id !== req.userId) throw ApiError.notFound('Gravação não encontrada.');
    if (!req.file) throw ApiError.badRequest('Nenhum arquivo de vídeo enviado.');

    const storage = getStorageAdapter();
    const extension = req.file.mimetype.includes('mp4') ? 'mp4' : 'webm';
    const key = `${req.userId}/${recording.id}.${extension}`;

    await storage.save(key, req.file.buffer, req.file.mimetype);
    const updated = await queryOne<RecordingRow>(
      'UPDATE recordings SET storage_key = $1, updated_at = now() WHERE id = $2 RETURNING *',
      [key, recording.id],
    );
    if (!updated) throw ApiError.internal('Não foi possível atualizar a gravação.');

    res.json(serializeRecording(updated));
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const recording = await queryOne<RecordingRow>('SELECT * FROM recordings WHERE id = $1', [req.params.id]);
    if (!recording || recording.user_id !== req.userId) throw ApiError.notFound('Gravação não encontrada.');

    if (recording.storage_key) {
      await getStorageAdapter().delete(recording.storage_key);
    }
    await query('DELETE FROM recordings WHERE id = $1', [recording.id]);

    res.status(204).send();
  }),
);

router.post(
  '/:id/share',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const recording = await queryOne<RecordingRow>('SELECT * FROM recordings WHERE id = $1', [req.params.id]);
    if (!recording || recording.user_id !== req.userId) throw ApiError.notFound('Gravação não encontrada.');
    if (!recording.storage_key) {
      throw ApiError.badRequest('Esta gravação precisa ter backup em nuvem ativado para ser compartilhada.');
    }

    const expiresAt = new Date(Date.now() + env.SHARE_LINK_TTL_HOURS * 60 * 60 * 1000);
    const token = randomUUID();
    await query('INSERT INTO share_links (token, recording_id, expires_at) VALUES ($1, $2, $3)', [
      token,
      recording.id,
      expiresAt,
    ]);

    res.status(201).json({
      shareUrl: `${env.CORS_ORIGIN}/compartilhado/${token}`,
      expiresAt: expiresAt.toISOString(),
    });
  }),
);

export default router;
