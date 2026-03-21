import { z } from 'zod/v3';
import { AppError } from '../../domain/errors/AppError';

const emptyToUndef = (v: unknown) => (v === '' || v === undefined || v === null ? undefined : v);

const optionalTrimmed = (max: number) =>
  z.preprocess(
    emptyToUndef,
    z
      .string()
      .trim()
      .max(max)
      .optional()
  );

const CreateCandidateBodySchema = z.object({
  firstName: z.string().trim().min(1, 'Required').max(100),
  lastName: z.string().trim().min(1, 'Required').max(100),
  email: z.string().trim().email('Invalid email format').max(255),
  phone: optionalTrimmed(15),
  address: optionalTrimmed(100),
  educationSummary: z.preprocess(
    emptyToUndef,
    z.string().trim().max(8000).optional()
  ),
  experienceSummary: z.preprocess(
    emptyToUndef,
    z.string().trim().max(8000).optional()
  ),
});

export type CreateCandidateDto = z.infer<typeof CreateCandidateBodySchema>;

export function validateCreateCandidateBody(
  body: Record<string, unknown>
): CreateCandidateDto {
  const parsed = CreateCandidateBodySchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.errors.map((e) => ({
      field: e.path.length ? e.path.join('.') : 'body',
      message: e.message,
    }));
    throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', details);
  }
  return parsed.data;
}
