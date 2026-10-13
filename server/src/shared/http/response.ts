import type { Response } from 'express';

export const sendSuccess = <T>(
  response: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>,
) => response.status(statusCode).json({ success: true, data, ...(meta ? { meta } : {}) });

export const sendError = (
  response: Response,
  message: string,
  statusCode: number,
  code: string,
  details?: unknown,
) =>
  response.status(statusCode).json({
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  });
