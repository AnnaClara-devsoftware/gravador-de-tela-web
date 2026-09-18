import { Router } from 'express';
import { queryOne } from '../lib/db';
import { ApiError, asyncHandler } from '../middleware/errors';
import { getStorageAdapter } from '../storage';

const router = Router();

interface ShareRow {
  name: string;
  duration_ms: number;
  mime_type: string;
  storage_key: string | null;
  expires_at: Date;
}

/** Endpoint público (sem autenticação) para resolver um link de compartilhamento. */
router.get(
  '/:token',
  asyncHandler(async (req, res) => {
    const share = await queryOne<ShareRow>(
      `SELECT r.name, r.duration_ms, r.mime_type, r.storage_key, sl.expires_at
       FROM share_links sl
       JOIN recordings r ON r.id = sl.recording_id
       WHERE sl.token = $1`,
      [req.params.token],
    );

    if (!share || share.expires_at < new Date()) {
      throw ApiError.notFound('Este link de compartilhamento não existe ou expirou.');
    }
    if (!share.storage_key) {
      throw ApiError.notFound('O vídeo desta gravação não está mais disponível.');
    }

    const videoUrl = await getStorageAdapter().getUrl(share.storage_key);

    res.json({
      name: share.name,
      durationMs: share.duration_ms,
      mimeType: share.mime_type,
      videoUrl,
      expiresAt: share.expires_at.toISOString(),
    });
  }),
);

export default router;
