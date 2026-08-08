/**
 * Gerege Nexus Backend — In-Memory Rate Limiter Middleware
 * Sliding window rate limiting without external dependencies
 */

function createRateLimiter(options = {}) {
  const {
    windowMs = 60000,
    max = 60,
    message = 'Too many requests, please slow down and try again later.',
  } = options;

  const requestsMap = new Map();

  // Periodically sweep expired entries to prevent memory growth
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestsMap.entries()) {
      if (now > record.resetTime) {
        requestsMap.delete(key);
      }
    }
  }, windowMs);

  cleanupTimer.unref();

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = requestsMap.get(ip);

    if (!record || now > record.resetTime) {
      requestsMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        status: 'error',
        message,
        retryAfter: retryAfterSeconds,
      });
    }

    record.count++;
    next();
  };
}

module.exports = { createRateLimiter };
