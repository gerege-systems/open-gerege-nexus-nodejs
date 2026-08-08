/**
 * Gerege Nexus Backend — Async Handler Wrapper
 * Catches unhandled Promise rejections and forwards to Express error middleware
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
