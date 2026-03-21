import { Router } from 'express';
import { PrismaCandidateRepository } from '../infrastructure/repositories/candidateRepository';
import { prisma } from '../infrastructure/prismaClient';
import { uploadCvMiddleware } from '../middleware/uploadCv';
import { postCandidate } from '../presentation/controllers/candidateController';

const router = Router();
const repository = new PrismaCandidateRepository(prisma);

router.post('/', uploadCvMiddleware, postCandidate(repository));

export default router;
