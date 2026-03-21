import type { Express } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../../domain/errors/AppError';
import type { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { saveCvFile } from '../../infrastructure/storage/cvStorage';
import { validateCreateCandidateBody } from '../validators/candidateCreateValidator';

const ALLOWED_CV_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

export type CandidatePublicDto = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  educationSummary: string | null;
  experienceSummary: string | null;
  cvUploaded: boolean;
  cvFileName: string | null;
  cvMimeType: string | null;
  createdAt: string;
  updatedAt: string;
};

function toPublicDto(candidate: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  educationSummary: string | null;
  experienceSummary: string | null;
  cvFileName: string | null;
  cvMimeType: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CandidatePublicDto {
  return {
    id: candidate.id,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    address: candidate.address,
    educationSummary: candidate.educationSummary,
    experienceSummary: candidate.experienceSummary,
    cvUploaded: Boolean(candidate.cvFileName),
    cvFileName: candidate.cvFileName,
    cvMimeType: candidate.cvMimeType,
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
  };
}

function assertValidCvFile(file: Express.Multer.File): void {
  if (!ALLOWED_CV_MIMES.has(file.mimetype)) {
    throw new AppError(
      400,
      'INVALID_FILE_TYPE',
      'CV must be a PDF or Word document (PDF, DOCX, or DOC)'
    );
  }
}

export async function createCandidate(
  input: {
    body: Record<string, unknown>;
    file?: Express.Multer.File;
  },
  deps: { repository: ICandidateRepository }
): Promise<CandidatePublicDto> {
  const dto = validateCreateCandidateBody(input.body);

  let cvFileName: string | null = null;
  let cvStoragePath: string | null = null;
  let cvMimeType: string | null = null;

  if (input.file) {
    assertValidCvFile(input.file);
    try {
      const saved = await saveCvFile(
        input.file.buffer,
        input.file.originalname,
        input.file.mimetype
      );
      cvFileName = input.file.originalname;
      cvStoragePath = saved.relativePath;
      cvMimeType = input.file.mimetype;
    } catch (e) {
      if (e instanceof Error && e.message === 'INVALID_CV_EXTENSION') {
        throw new AppError(
          400,
          'INVALID_FILE_TYPE',
          'CV must use a .pdf, .docx, or .doc extension'
        );
      }
      throw e;
    }
  }

  try {
    const created = await deps.repository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      educationSummary: dto.educationSummary ?? null,
      experienceSummary: dto.experienceSummary ?? null,
      cvFileName,
      cvStoragePath,
      cvMimeType,
    });
    return toPublicDto(created);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      throw new AppError(
        409,
        'DUPLICATE_EMAIL',
        'A candidate with this email already exists'
      );
    }
    throw e;
  }
}
