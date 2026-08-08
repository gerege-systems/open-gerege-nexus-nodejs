import { Request, Response, NextFunction } from 'express';
import { queryOne } from '../db/index.js';

// Check if tenant has installed/enabled a specific application module
export function appGateMiddleware(appSlugOrId: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      res.status(400).json({ status: 'error', message: 'Missing X-Tenant-ID header' });
      return;
    }

    const installation = await queryOne(
      `SELECT ai.enabled
       FROM app_installations ai
       JOIN apps a ON ai.app_id = a.id
       WHERE ai.tenant_id = $1 AND (a.id = $2 OR a.slug = $2) AND ai.enabled = true`,
      [tenantId, appSlugOrId]
    );

    if (!installation) {
      res.status(403).json({
        status: 'error',
        message: `App module '${appSlugOrId}' is not installed or enabled for this tenant`,
      });
      return;
    }

    next();
  };
}

// Require RBAC permission
export function requirePermission(permissionCode: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.isSuperAdmin) {
      return next();
    }

    const userId = req.user?.id;
    const tenantId = req.tenantId;

    if (!userId || !tenantId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const hasPermission = await queryOne(
      `SELECT 1
       FROM user_roles ur
       JOIN role_permissions rp ON ur.role_id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE ur.user_id = $1 AND ur.tenant_id = $2 AND p.code = $3`,
      [userId, tenantId, permissionCode]
    );

    if (!hasPermission) {
      res.status(403).json({ status: 'error', message: `Permission '${permissionCode}' denied` });
      return;
    }

    next();
  };
}
