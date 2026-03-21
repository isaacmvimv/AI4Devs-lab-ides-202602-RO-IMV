import type { NextFunction, Request, Response } from 'express';
import { createCandidate } from '../../application/services/candidateService';
import type { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';

export function postCandidate(repository: ICandidateRepository) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await createCandidate(
        { body: req.body as Record<string, unknown>, file: req.file },
        { repository }
      );
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };
}
