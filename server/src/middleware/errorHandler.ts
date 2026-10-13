import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../shared/errors/AppError.js';
import { sendError } from '../shared/http/response.js';

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new AppError(`Route not found: ${request.method} ${request.originalUrl}`, 404, 'NOT_FOUND'));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    sendError(response, 'Request validation failed', 400, 'VALIDATION_ERROR', error.flatten());
    return;
  }
  if (error instanceof AppError) {
    sendError(response, error.message, error.statusCode, error.code, error.details);
    return;
  }
  console.error(error);
  sendError(response, 'An unexpected error occurred', 500, 'INTERNAL_ERROR');
};
