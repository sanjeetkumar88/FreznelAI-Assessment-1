import type { RequestHandler } from 'express';
import { firebaseAuth } from '../config/firebase.js';
import { AppError } from '../shared/errors/AppError.js';

export const requireAuth: RequestHandler = async (request, _response, next) => {
  try {
    const header = request.header('authorization');
    if (!firebaseAuth) {
      next(new AppError('Firebase Admin credentials are not configured', 503, 'AUTH_NOT_CONFIGURED'));
      return;
    }
    if (!header?.startsWith('Bearer ')) {
      next(new AppError('Bearer token is required', 401, 'UNAUTHORIZED'));
      return;
    }
    const token = await firebaseAuth.verifyIdToken(header.slice(7));
    request.user = { id: token.uid, email: token.email };
    next();
  } catch {
    next(new AppError('Invalid or expired authentication token', 401, 'UNAUTHORIZED'));
  }
};
