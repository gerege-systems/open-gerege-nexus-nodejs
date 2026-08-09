/**
 * Gerege Nexus Backend — Global Error Middleware
 */

import { logger } from '../utils/logger.js';

function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[HTTP ${statusCode}] ${req.method} ${req.originalUrl}`, {
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export { errorMiddleware };
