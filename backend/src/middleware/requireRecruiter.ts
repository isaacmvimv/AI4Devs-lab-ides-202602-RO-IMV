import type { NextFunction, Request, Response } from 'express';

/**
 * Placeholder for future authentication. Candidate create is public for the MVP;
 * protect this route with a real recruiter/session check in a follow-up ticket.
 */
export function requireRecruiter(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  next();
}
