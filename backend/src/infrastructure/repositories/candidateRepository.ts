import type { PrismaClient } from '@prisma/client';
import type { Candidate, CandidateCreateInput } from '../../domain/models/Candidate';
import type { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';

function mapRow(row: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  educationSummary: string | null;
  experienceSummary: string | null;
  cvFileName: string | null;
  cvStoragePath: string | null;
  cvMimeType: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Candidate {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    address: row.address,
    educationSummary: row.educationSummary,
    experienceSummary: row.experienceSummary,
    cvFileName: row.cvFileName,
    cvStoragePath: row.cvStoragePath,
    cvMimeType: row.cvMimeType,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaCandidateRepository implements ICandidateRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: CandidateCreateInput): Promise<Candidate> {
    const row = await this.db.candidate.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        educationSummary: data.educationSummary,
        experienceSummary: data.experienceSummary,
        cvFileName: data.cvFileName,
        cvStoragePath: data.cvStoragePath,
        cvMimeType: data.cvMimeType,
      },
    });
    return mapRow(row);
  }
}
