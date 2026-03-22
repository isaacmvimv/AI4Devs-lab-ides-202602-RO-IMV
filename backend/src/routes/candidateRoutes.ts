import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../prismaClient';

const MAX_CV_BYTES = Number(process.env.MAX_CV_BYTES || 5 * 1024 * 1024);
const CV_UPLOAD_DIR = process.env.CV_UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'cv');

const ALLOWED_CV_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CV_BYTES },
});

const router = express.Router();

function emptyToNull(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', upload.single('cv'), async (req, res) => {
  const firstName = emptyToNull(req.body?.firstName);
  const lastName = emptyToNull(req.body?.lastName);
  const email = emptyToNull(req.body?.email);
  const phone = emptyToNull(req.body?.phone);
  const address = emptyToNull(req.body?.address);
  const educationSummary = emptyToNull(req.body?.educationSummary);
  const experienceSummary = emptyToNull(req.body?.experienceSummary);

  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'firstName, lastName and email are required',
        code: 'VALIDATION_ERROR',
        details: [
          ...(!firstName ? [{ field: 'firstName', message: 'Required' }] : []),
          ...(!lastName ? [{ field: 'lastName', message: 'Required' }] : []),
          ...(!email ? [{ field: 'email', message: 'Required' }] : []),
        ],
      },
    });
  }

  if (!emailRe.test(email)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid email',
        code: 'VALIDATION_ERROR',
        details: [{ field: 'email', message: 'Invalid format' }],
      },
    });
  }

  const file = req.file;
  if (file && !ALLOWED_CV_MIMES.has(file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'CV must be PDF, DOC, or DOCX',
        code: 'INVALID_CV_TYPE',
      },
    });
  }

  let cvFileName: string | null = null;
  let cvStoragePath: string | null = null;
  let cvMimeType: string | null = null;

  try {
    if (file) {
      await fs.promises.mkdir(CV_UPLOAD_DIR, { recursive: true });
      const ext = path.extname(file.originalname || '') || '.bin';
      const safeExt = ext.length > 16 ? '.bin' : ext;
      const storedName = `${randomUUID()}${safeExt}`;
      const fullPath = path.join(CV_UPLOAD_DIR, storedName);
      await fs.promises.writeFile(fullPath, new Uint8Array(file.buffer));
      cvFileName = file.originalname || storedName;
      cvStoragePath = path.relative(process.cwd(), fullPath);
      cvMimeType = file.mimetype;
    }

    const candidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        educationSummary,
        experienceSummary,
        cvFileName,
        cvStoragePath,
        cvMimeType,
      },
    });

    const body = {
      success: true as const,
      data: {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        address: candidate.address,
        educationSummary: candidate.educationSummary,
        experienceSummary: candidate.experienceSummary,
        cvUploaded: Boolean(candidate.cvStoragePath),
        cvFileName: candidate.cvFileName,
        cvMimeType: candidate.cvMimeType,
        createdAt: candidate.createdAt.toISOString(),
        updatedAt: candidate.updatedAt.toISOString(),
      },
    };

    return res.status(201).json(body);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'A candidate with this email already exists',
          code: 'DUPLICATE_EMAIL',
        },
      });
    }
    console.error(e);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL' },
    });
  }
});

export default router;
