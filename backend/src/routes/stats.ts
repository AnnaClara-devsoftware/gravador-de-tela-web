import { Router } from 'express';
import { queryOne } from '../lib/db';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errors';

const router = Router();

interface StatsRow {
  total_recordings: string;
  total_size_bytes: string | null;
  total_duration_ms: string | null;
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const row = await queryOne<StatsRow>(
      `SELECT
         COUNT(*)::text AS total_recordings,
         COALESCE(SUM(size_bytes), 0)::text AS total_size_bytes,
         COALESCE(SUM(duration_ms), 0)::text AS total_duration_ms
       FROM recordings WHERE user_id = $1`,
      [req.userId],
    );

    res.json({
      totalRecordings: Number(row?.total_recordings ?? 0),
      totalSizeBytes: Number(row?.total_size_bytes ?? 0),
      totalDurationMs: Number(row?.total_duration_ms ?? 0),
    });
  }),
);

export default router;
