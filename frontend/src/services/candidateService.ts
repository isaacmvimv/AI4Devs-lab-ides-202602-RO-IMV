import axios from 'axios';
import type { CandidateCreatedPublic, CreateCandidateApiResponse, LabStructuredErrorBody } from '../types/candidate';

export const API_BASE_URL = (
  process.env.REACT_APP_API_URL || 'http://localhost:3010'
).replace(/\/$/, '');

export type CreateCandidatePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educationSummary?: string;
  experienceSummary?: string;
};

export class CandidateServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = 'CandidateServiceError';
  }
}

function isLabStructuredError(data: unknown): data is LabStructuredErrorBody {
  if (typeof data !== 'object' || data === null) return false;
  const o = data as Record<string, unknown>;
  return (
    o.success === false &&
    typeof o.error === 'object' &&
    o.error !== null &&
    typeof (o.error as Record<string, unknown>).message === 'string' &&
    typeof (o.error as Record<string, unknown>).code === 'string'
  );
}

function isCreateSuccess(data: unknown): data is CreateCandidateApiResponse {
  if (typeof data !== 'object' || data === null) return false;
  const o = data as Record<string, unknown>;
  return o.success === true && typeof o.data === 'object' && o.data !== null;
}

function toServiceError(status: number, body: unknown): CandidateServiceError {
  if (isLabStructuredError(body)) {
    const { message, code, details } = body.error;
    return new CandidateServiceError(message, status, code, details);
  }
  return new CandidateServiceError('Unexpected response', status, 'UNKNOWN');
}

export async function createCandidate(
  payload: CreateCandidatePayload,
  cvFile: File | null
): Promise<CandidateCreatedPublic> {
  const form = new FormData();
  form.append('firstName', payload.firstName);
  form.append('lastName', payload.lastName);
  form.append('email', payload.email);
  if (payload.phone !== undefined && payload.phone !== '') {
    form.append('phone', payload.phone);
  }
  if (payload.address !== undefined && payload.address !== '') {
    form.append('address', payload.address);
  }
  if (payload.educationSummary !== undefined && payload.educationSummary !== '') {
    form.append('educationSummary', payload.educationSummary);
  }
  if (payload.experienceSummary !== undefined && payload.experienceSummary !== '') {
    form.append('experienceSummary', payload.experienceSummary);
  }
  if (cvFile) {
    form.append('cv', cvFile);
  }

  try {
    const response = await axios.post<unknown>(`${API_BASE_URL}/api/candidates`, form);
    if (response.status === 201 && isCreateSuccess(response.data)) {
      return response.data.data;
    }
    throw toServiceError(response.status, response.data);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response) {
        throw toServiceError(e.response.status, e.response.data);
      }
      console.error('Create candidate failed: no response from server');
      throw new CandidateServiceError('Network error', 0, 'NETWORK');
    }
    throw e;
  }
}
