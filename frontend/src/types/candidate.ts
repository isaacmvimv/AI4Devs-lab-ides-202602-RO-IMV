export type CandidateCreatedPublic = {
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

export type CreateCandidateApiResponse = {
  success: true;
  data: CandidateCreatedPublic;
};

export type LabStructuredErrorBody = {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Array<{ field?: string; message: string }>;
  };
};
