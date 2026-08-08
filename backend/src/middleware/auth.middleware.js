/**
 * Gerege Nexus Backend — Authentication & Session Authorization Middleware
 */

const jwt = require('jsonwebtoken');
const { createHash } = require('node:crypto');
const { env } = require('../config/env');
const { queryOne } = require('../db/index');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const tenantIdHeader = req.headers['x-tenant-id'];

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.session_token) {
    token = req.cookies.session_token;
  }

  if (!token) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: decoded.sub || decoded.userId,
      email: decoded.email,
      fullName: decoded.fullName || decoded.email,
      role: decoded.role || 'user',
      tenantId: decoded.tenantId || tenantIdHeader,
      isSuperAdmin: decoded.role === 'admin' || decoded.isSuperAdmin === true,
    };
    req.tenantId = req.user.tenantId || tenantIdHeader;
    return next();
  } catch (jwtErr) {
    // Database Session Lookup Fallback
    const session = await queryOne(
      `SELECT s.user_id, s.tenant_id, u.email, u.name, u.is_admin, s.expires_at
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token_hash = $1 AND s.expires_at > CURRENT_TIMESTAMP AND s.revoked_at IS NULL`,
      [createHash('sha256').update(token).digest('hex')]
    );

    if (!session) {
      res.status(401).json({ status: 'error', message: 'Invalid or expired session token' });
      return;
    }

    req.user = {
      id: session.user_id,
      email: session.email,
      fullName: session.name,
      role: session.is_admin ? 'admin' : 'user',
      tenantId: session.tenant_id || tenantIdHeader,
      isSuperAdmin: session.is_admin === true,
    };
    req.tenantId = req.user.tenantId || tenantIdHeader;
    next();
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isSuperAdmin) {
    res.status(403).json({ status: 'error', message: 'Administrator privileges required' });
    return;
  }
  next();
}

module.exports = {
  authMiddleware,
  requireAdmin,
};
