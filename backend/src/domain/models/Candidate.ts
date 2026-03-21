export interface Candidate {
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
}

export type CandidateCreateInput = Omit<
  Candidate,
  'id' | 'createdAt' | 'updatedAt'
>;
