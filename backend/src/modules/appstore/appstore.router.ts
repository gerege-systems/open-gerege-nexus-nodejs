import { Router, Request, Response } from 'express';
import { query, queryOne } from '../../db/index.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware, requireAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

// GET /api/v1/store/apps
router.get('/store/apps', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const apps = await query('SELECT * FROM apps ORDER BY name ASC');
  res.json({ status: 'success', data: apps });
}));

// GET /api/v1/store/apps/:slug
router.get('/store/apps/:slug', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const app = await queryOne('SELECT * FROM apps WHERE slug = $1 OR id = $1', [req.params.slug]);
  if (!app) {
    res.status(404).json({ status: 'error', message: 'App not found' });
    return;
  }
  res.json({ status: 'success', data: app });
}));

// GET /api/v1/installed-apps
router.get('/installed-apps', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId || 'default-tenant';
  const installed = await query(
    `SELECT ai.id as installation_id, ai.enabled, ai.installed_at, a.*
     FROM app_installations ai
     JOIN apps a ON ai.app_id = a.id
     WHERE ai.tenant_id = $1`,
    [tenantId]
  );
  res.json({ status: 'success', data: installed });
}));

// POST /api/v1/store/apps/:slug/install (Admin only)
router.post('/store/apps/:slug/install', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId || 'default-tenant';
  const app = await queryOne<{ id: string }>('SELECT id FROM apps WHERE slug = $1 OR id = $1', [req.params.slug]);

  if (!app) {
    res.status(404).json({ status: 'error', message: 'App not found in catalog' });
    return;
  }

  await query(
    `INSERT INTO app_installations (tenant_id, app_id, enabled)
     VALUES ($1, $2, true)
     ON CONFLICT (tenant_id, app_id) DO UPDATE SET enabled = true`,
    [tenantId, app.id]
  );

  res.json({ status: 'success', message: `App '${req.params.slug}' installed successfully.` });
}));

// POST /api/v1/store/apps/:slug/enable (Admin only)
router.post('/store/apps/:slug/enable', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId || 'default-tenant';
  const app = await queryOne<{ id: string }>('SELECT id FROM apps WHERE slug = $1 OR id = $1', [req.params.slug]);

  if (!app) {
    res.status(404).json({ status: 'error', message: 'App not found' });
    return;
  }

  await query('UPDATE app_installations SET enabled = true WHERE tenant_id = $1 AND app_id = $2', [tenantId, app.id]);
  res.json({ status: 'success', message: `App '${req.params.slug}' enabled.` });
}));

// POST /api/v1/store/apps/:slug/disable (Admin only)
router.post('/store/apps/:slug/disable', authMiddleware, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId || 'default-tenant';
  const app = await queryOne<{ id: string }>('SELECT id FROM apps WHERE slug = $1 OR id = $1', [req.params.slug]);

  if (!app) {
    res.status(404).json({ status: 'error', message: 'App not found' });
    return;
  }

  await query('UPDATE app_installations SET enabled = false WHERE tenant_id = $1 AND app_id = $2', [tenantId, app.id]);
  res.json({ status: 'success', message: `App '${req.params.slug}' disabled.` });
}));

export default router;
