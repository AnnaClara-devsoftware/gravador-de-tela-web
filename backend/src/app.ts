import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'node:path';
import { env } from './env';
import authRoutes from './routes/auth';
import recordingsRoutes from './routes/recordings';
import shareRoutes from './routes/share';
import statsRoutes from './routes/stats';
import { errorHandler, notFoundHandler } from './middleware/errors';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  // Arquivos de disco local só existem quando nenhum provedor S3 está
  // configurado (ver src/storage). Servidos estaticamente para permitir
  // reprodução/download em desenvolvimento sem infraestrutura extra.
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/recordings', recordingsRoutes);
  app.use('/api/share', shareRoutes);
  app.use('/api/stats', statsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
