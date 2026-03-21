import type { CreateCandidatePayload } from '../services/candidateService';
import { MAX_CV_BYTES } from '../constants/uploads';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_CV_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);

export type FieldErrors = Partial<
  Record<'firstName' | 'lastName' | 'email' | 'phone' | 'address' | 'cv' | string, string>
>;

export type CandidateFormValues = CreateCandidatePayload;

export function validateCandidateForm(
  values: CandidateFormValues,
  cvFile: File | null,
  maxCvBytes: number = MAX_CV_BYTES
): { ok: true } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};

  const firstName = values.firstName?.trim() ?? '';
  if (!firstName) {
    errors.firstName = 'El nombre es obligatorio.';
  } else if (firstName.length > 100) {
    errors.firstName = 'El nombre no puede superar 100 caracteres.';
  }

  const lastName = values.lastName?.trim() ?? '';
  if (!lastName) {
    errors.lastName = 'El apellido es obligatorio.';
  } else if (lastName.length > 100) {
    errors.lastName = 'El apellido no puede superar 100 caracteres.';
  }

  const email = values.email?.trim() ?? '';
  if (!email) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Introduce un correo electrónico válido.';
  }

  const phone = values.phone?.trim() ?? '';
  if (phone.length > 15) {
    errors.phone = 'El teléfono no puede superar 15 caracteres.';
  }

  const address = values.address?.trim() ?? '';
  if (address.length > 100) {
    errors.address = 'La dirección no puede superar 100 caracteres.';
  }

  if (cvFile) {
    const ext = cvFile.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_CV_EXTENSIONS.has(ext)) {
      errors.cv = 'El CV debe ser PDF, DOC o DOCX.';
    } else if (cvFile.size > maxCvBytes) {
      errors.cv = `El archivo supera el tamaño máximo permitido (${Math.round(
        maxCvBytes / (1024 * 1024)
      )} MB).`;
    }
  }

  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, errors };
}
