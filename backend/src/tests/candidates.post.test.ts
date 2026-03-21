import path from 'path';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../infrastructure/prismaClient';

const minimalPdf = Buffer.from(
  '%PDF-1.1\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n'
);

function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;
}

describe('POST /api/candidates', () => {
  const prevUploadDir = process.env.CV_UPLOAD_DIR;
  const prevMaxCv = process.env.MAX_CV_BYTES;

  beforeAll(() => {
    process.env.CV_UPLOAD_DIR = path.join('uploads', 'test-cvs');
  });

  afterAll(async () => {
    process.env.CV_UPLOAD_DIR = prevUploadDir;
    process.env.MAX_CV_BYTES = prevMaxCv;
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    process.env.MAX_CV_BYTES = prevMaxCv;
    await prisma.candidate.deleteMany();
  });

  it('returns 201 without CV', async () => {
    const email = uniqueEmail('no-cv');
    const res = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Ada')
      .field('lastName', 'Lovelace')
      .field('email', email);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email,
      cvUploaded: false,
    });
    expect(res.body.data).not.toHaveProperty('cvStoragePath');

    const row = await prisma.candidate.findUnique({ where: { email } });
    expect(row).not.toBeNull();
  });

  it('returns 201 with valid PDF', async () => {
    const email = uniqueEmail('pdf');
    const res = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Alan')
      .field('lastName', 'Turing')
      .field('email', email)
      .attach('cv', minimalPdf, { filename: 'resume.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(201);
    expect(res.body.data.cvUploaded).toBe(true);
    expect(res.body.data.cvFileName).toBe('resume.pdf');
    expect(res.body.data.cvMimeType).toBe('application/pdf');
  });

  it('returns 201 with DOCX mime and extension', async () => {
    const email = uniqueEmail('docx');
    const fakeDocx = Buffer.from('PK\x03\x04fake-docx-bytes');
    const res = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Grace')
      .field('lastName', 'Hopper')
      .field('email', email)
      .attach('cv', fakeDocx, {
        filename: 'cv.docx',
        contentType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.cvUploaded).toBe(true);
  });

  it('returns 400 when required field missing', async () => {
    const res = await request(app)
      .post('/api/candidates')
      .field('firstName', 'X')
      .field('email', uniqueEmail('bad'));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/candidates')
      .field('firstName', 'X')
      .field('lastName', 'Y')
      .field('email', 'not-an-email');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for disallowed CV MIME type', async () => {
    const res = await request(app)
      .post('/api/candidates')
      .field('firstName', 'A')
      .field('lastName', 'B')
      .field('email', uniqueEmail('bad-mime'))
      .attach('cv', Buffer.from('hello'), {
        filename: 'x.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
  });

  it('returns 400 for allowed MIME but wrong extension', async () => {
    const res = await request(app)
      .post('/api/candidates')
      .field('firstName', 'A')
      .field('lastName', 'B')
      .field('email', uniqueEmail('bad-ext'))
      .attach('cv', minimalPdf, {
        filename: 'trick.txt',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
  });

  it('returns 409 for duplicate email', async () => {
    const email = uniqueEmail('dup');
    await request(app)
      .post('/api/candidates')
      .field('firstName', 'One')
      .field('lastName', 'Two')
      .field('email', email);

    const res = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Other')
      .field('lastName', 'Person')
      .field('email', email);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  it('returns 413 when file exceeds MAX_CV_BYTES', async () => {
    process.env.MAX_CV_BYTES = '100';
    const email = uniqueEmail('big');
    const big = Buffer.alloc(500, 7);

    const res = await request(app)
      .post('/api/candidates')
      .field('firstName', 'Big')
      .field('lastName', 'File')
      .field('email', email)
      .attach('cv', big, { filename: 'huge.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('includes Access-Control-Allow-Origin for allowed Origin', async () => {
    const origin =
      process.env.FRONTEND_URL ??
      process.env.CORS_ORIGIN ??
      'http://localhost:5173';
    const res = await request(app)
      .post('/api/candidates')
      .set('Origin', origin)
      .field('firstName', 'Cors')
      .field('lastName', 'Test')
      .field('email', uniqueEmail('cors'));

    expect(res.status).toBe(201);
    expect(res.headers['access-control-allow-origin']).toBe(origin);
  });
});
