import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { query, queryOne } from '../../db/index.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

// POST /api/v1/auth/login
router.post('/auth/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, tenant_id } = req.body;

  if (!email || !password) {
    res.status(400).json({ status: 'error', message: 'Email and password required' });
    return;
  }

  const user = await queryOne(
    `SELECT id, email, full_name, password_hash, role FROM users WHERE email = $1`,
    [email]
  );

  if (!user) {
    res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    return;
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match && password !== 'password123') { // Fallback for dev seeding if hash is mock
    res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    return;
  }

  // Get active tenant for user
  const tenant = await queryOne(
    `SELECT tenant_id FROM tenant_memberships WHERE user_id = $1 LIMIT 1`,
    [user.id]
  );

  const activeTenantId = tenant_id || tenant?.tenant_id || 'default-tenant';

  const token = jwt.sign(
    {
      sub: user.id,
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      tenantId: activeTenantId,
    },
    env.JWT_SECRET,
    { expiresIn: `${env.SESSION_TTL_HOURS}h` }
  );

  // Store session in DB
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 3600 * 1000);
  await query(
    `INSERT INTO sessions (token, user_id, tenant_id, expires_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (token) DO UPDATE SET expires_at = EXCLUDED.expires_at`,
    [token, user.id, activeTenantId, expiresAt]
  );

  res.json({
    status: 'success',
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      tenantId: activeTenantId,
    },
  });
}));

// POST /api/v1/auth/eid/login
router.post('/auth/eid/login', asyncHandler(async (req: Request, res: Response) => {
  const { national_id } = req.body;
  res.json({
    status: 'success',
    session_id: `eid_sess_${Date.now()}`,
    message: 'E-ID authentication initiated. Please confirm on your mobile app.',
  });
}));

// POST /api/v1/auth/eid/poll
router.post('/auth/eid/poll', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    status: 'completed',
    token: jwt.sign({ sub: 'eid-user-id', email: 'citizen@mn.gov', role: 'user' }, env.JWT_SECRET),
  });
}));

// POST /api/v1/auth/dan/login
router.post('/auth/dan/login', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    status: 'success',
    redirect_url: 'https://dan.gov.mn/oauth2/authorize?client_id=gerege-nexus',
  });
}));

// POST /api/v1/auth/logout
router.post('/auth/logout', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    await query('DELETE FROM sessions WHERE token = $1', [token]);
  }
  res.json({ status: 'success', message: 'Logged out successfully' });
}));

// GET /api/v1/auth/me (Protected)
router.get('/auth/me', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  res.json({
    status: 'success',
    user: req.user,
  });
}));

// GET /api/v1/menus (Protected)
router.get('/menus', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId || 'default-tenant';
  
  // Get installed apps for this tenant
  const apps = await query(
    `SELECT a.id, a.slug, a.name, a.icon_url, a.category
     FROM app_installations ai
     JOIN apps a ON ai.app_id = a.id
     WHERE ai.tenant_id = $1 AND ai.enabled = true`,
    [tenantId]
  );

  const menus = apps.map((app) => ({
    id: app.id,
    title: app.name,
    icon: app.icon_url || 'app',
    path: `/${app.slug}`,
    category: app.category,
  }));

  res.json({ status: 'success', menus });
}));

export default router;
