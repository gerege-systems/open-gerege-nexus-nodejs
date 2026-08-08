function createRateLimiter(options) {
  const { windowMs, max, message = 'Too many requests, please try again later.' } = options;
  const requestsMap = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestsMap.entries()) {
      if (now > record.resetTime) {
        requestsMap.delete(key);
      }
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = requestsMap.get(ip);

    if (!record || now > record.resetTime) {
      requestsMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({ status: 'error', message });
      return;
    }

    record.count++;
    next();
  };
}

module.exports = { createRateLimiter };
