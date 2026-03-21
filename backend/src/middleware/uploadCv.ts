import type { RequestHandler } from 'express';
import multer from 'multer';

const defaultMax = 10 * 1024 * 1024;

function maxFileBytes(): number {
  const raw = process.env.MAX_CV_BYTES;
  if (!raw) {
    return defaultMax;
  }
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : defaultMax;
}

/** Reads MAX_CV_BYTES on each request so tests can override the limit safely. */
export const uploadCvMiddleware: RequestHandler = (req, res, next) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileBytes() },
  }).single('cv');
  upload(req, res, next);
};
