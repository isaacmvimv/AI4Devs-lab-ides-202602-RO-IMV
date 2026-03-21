import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../domain/errors/AppError';

function asAppError(err: unknown): AppError | null {
  if (err instanceof AppError) {
    return err;
  }
  const o = err as unknown;
  if (
    o &&
    typeof o === 'object' &&
    'statusCode' in o &&
    'code' in o &&
    'message' in o &&
    typeof (o as { statusCode: unknown }).statusCode === 'number' &&
    typeof (o as { code: unknown }).code === 'string' &&
    typeof (o as { message: unknown }).message === 'string'
  ) {
    return o as AppError;
  }
  return null;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const appErr = asAppError(err);
  if (appErr) {
    res.status(appErr.statusCode).json({
      success: false,
      error: {
        message: appErr.message,
        code: appErr.code,
        ...(appErr.details && appErr.details.length > 0
          ? { details: appErr.details }
          : {}),
      },
    });
    return;
  }

  if (
    err &&
    typeof err === 'object' &&
    'code' in err &&
    (err as { code: string }).code === 'LIMIT_FILE_SIZE'
  ) {
    res.status(413).json({
      success: false,
      error: {
        message: 'File exceeds maximum allowed size',
        code: 'PAYLOAD_TOO_LARGE',
      },
    });
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  } else {
    // eslint-disable-next-line no-console
    console.error(err instanceof Error ? err.message : 'Internal error');
  }

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
}
