import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const ALLOWED_EXT = new Set(['.pdf', '.docx', '.doc']);

export function resolveUploadDir(): string {
  const raw = process.env.CV_UPLOAD_DIR;
  if (raw && path.isAbsolute(raw)) {
    return raw;
  }
  const rel = raw ?? path.join('uploads', 'cvs');
  return path.join(process.cwd(), rel);
}

export async function saveCvFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ relativePath: string; storedFileName: string }> {
  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error('INVALID_CV_EXTENSION');
  }
  const dir = resolveUploadDir();
  await mkdir(dir, { recursive: true });
  const storedFileName = `${randomUUID()}${ext}`;
  const absolutePath = path.join(dir, storedFileName);
  await writeFile(absolutePath, buffer);
  const relativePath = path.relative(process.cwd(), absolutePath);
  return { relativePath, storedFileName };
}
