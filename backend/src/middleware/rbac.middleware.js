const { queryOne } = require('../db/index');

function appGateMiddleware(appSlugOrId) {
  return async (req, res, next) => {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
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

function requirePermission(permissionCode) {
  return async (req, res, next) => {
    if (req.user && req.user.isSuperAdmin) {
      return next();
    }

    const userId = req.user ? req.user.id : null;
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

module.exports = {
  appGateMiddleware,
  requirePermission,
};
