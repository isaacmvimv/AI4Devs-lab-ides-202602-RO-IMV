import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import candidateRoutes from './routes/candidateRoutes';

const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';

export function createApp(): express.Application {
  const app = express();

  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    })
  );

  app.get('/', (req, res) => {
    res.send('Hola LTI!');
  });

  app.use('/api/candidates', candidateRoutes);

  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: { message: 'CV file is too large', code: 'CV_TOO_LARGE' },
      });
    }
    console.error(err);
    res.type('text/plain');
    res.status(500).send('Something broke!');
  });

  return app;
}
