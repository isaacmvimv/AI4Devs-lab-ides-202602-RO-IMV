import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import candidateRoutes from './routes/candidateRoutes';

export function createApp(): express.Application {
  const app = express();

  const corsOrigin = process.env.FRONTEND_URL ?? process.env.CORS_ORIGIN;
  app.use(
    cors({
      origin: corsOrigin || true,
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_req, res) => {
    res.send('Hola LTI!');
  });

  app.use('/api/candidates', candidateRoutes);

  app.use(errorHandler);

  return app;
}
