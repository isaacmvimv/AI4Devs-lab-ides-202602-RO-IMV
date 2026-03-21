import type { Candidate, CandidateCreateInput } from '../models/Candidate';

export interface ICandidateRepository {
  create(data: CandidateCreateInput): Promise<Candidate>;
}
