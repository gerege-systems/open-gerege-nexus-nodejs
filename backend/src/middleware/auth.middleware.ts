import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { queryOne } from '../db/index.js';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  tenantId?: string;
  isSuperAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenantId?: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const tenantIdHeader = req.headers['x-tenant-id'] as string;

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies?.session_token) {
    token = req.cookies.session_token;
  }

  if (!token) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  try {
    // 1. Try JWT verification first
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
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
    // 2. Fallback to DB Session token lookup
    const session = await queryOne<{
      user_id: string;
      tenant_id: string;
      email: string;
      full_name: string;
      role: string;
      expires_at: Date;
    }>(
      `SELECT s.user_id, s.tenant_id, u.email, u.full_name, u.role, s.expires_at
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 AND s.expires_at > CURRENT_TIMESTAMP`,
      [token]
    );

    if (!session) {
      res.status(401).json({ status: 'error', message: 'Invalid or expired session token' });
      return;
    }

    req.user = {
      id: session.user_id,
      email: session.email,
      fullName: session.full_name,
      role: session.role,
      tenantId: session.tenant_id || tenantIdHeader,
      isSuperAdmin: session.role === 'admin',
    };
    req.tenantId = req.user.tenantId || tenantIdHeader;
    next();
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.isSuperAdmin) {
    res.status(403).json({ status: 'error', message: 'Administrator privileges required' });
    return;
  }
  next();
}
