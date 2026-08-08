import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface HttpError extends Error {
  statusCode?: number;
}

export function errorMiddleware(err: HttpError, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`HTTP ${statusCode} - ${req.method} ${req.originalUrl}`, {
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
