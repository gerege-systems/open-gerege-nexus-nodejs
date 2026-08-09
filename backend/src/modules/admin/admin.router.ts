import { Router } from 'express';
import { query, queryOne } from '../../db/index.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware, requireAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

router.use('/admin', authMiddleware, requireAdmin);

// GET /api/v1/admin/access/overview
router.get('/admin/access/overview', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId || 'default-tenant';

  const roles = await query('SELECT * FROM roles WHERE tenant_id = $1 OR is_system = true', [tenantId]);
  const permissions = await query('SELECT * FROM permissions ORDER BY code');
  const memberships = await query(
    `SELECT tm.*, u.email, u.name AS full_name
     FROM memberships tm
     JOIN users u ON tm.user_id = u.id
     WHERE tm.tenant_id = $1`,
    [tenantId]
  );

  res.json({
    status: 'success',
    roles,
    permissions,
    memberships,
  });
}));

// POST /api/v1/admin/access/roles
router.post('/admin/access/roles', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId || 'default-tenant';
  const { code, name, description } = req.body;

  const role = await queryOne(
    `INSERT INTO roles (tenant_id, code, name, description, is_system)
     VALUES ($1, $2, $3, $4, false)
     RETURNING *`,
    [tenantId, code, name, description || '']
  );

  res.status(201).json({ status: 'success', id: role ? role.id : null, role });
}));

// PUT /api/v1/admin/access/roles/:id
router.put('/admin/access/roles/:id', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId || 'default-tenant';
  const { name, description } = req.body;

  const role = await queryOne(
    `UPDATE roles SET name = COALESCE($1, name), description = COALESCE($2, description)
     WHERE id = $3 AND (tenant_id = $4 OR is_system = false)
     RETURNING *`,
    [name, description, req.params.id, tenantId]
  );

  res.json({ status: 'success', role });
}));

// DELETE /api/v1/admin/access/roles/:id
router.delete('/admin/access/roles/:id', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId || 'default-tenant';
  await query('DELETE FROM roles WHERE id = $1 AND tenant_id = $2 AND is_system = false', [req.params.id, tenantId]);
  res.json({ status: 'success', message: 'Role deleted' });
}));

// PUT /api/v1/admin/access/roles/:id/permissions
router.put('/admin/access/roles/:id/permissions', asyncHandler(async (req, res) => {
  const { permissions } = req.body;
  const roleId = req.params.id;

  await query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
  if (Array.isArray(permissions)) {
    for (const perm of permissions) {
      await query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, id FROM permissions WHERE id = $2 OR code = $2
         ON CONFLICT DO NOTHING`,
        [roleId, perm]
      );
    }
  }

  res.json({ status: 'success', message: 'Permissions updated' });
}));

// GET /api/v1/admin/email-verification/overview
router.get('/admin/email-verification/overview', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId || 'default-tenant';
  const clients = await query('SELECT id, name, key_prefix, status, hourly_limit, created_at FROM email_verification_clients WHERE tenant_id = $1', [tenantId]);
  res.json({ status: 'success', clients });
}));

// GET /api/v1/admin/email-verification/clients
router.get('/admin/email-verification/clients', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId || 'default-tenant';
  const clients = await query('SELECT * FROM email_verification_clients WHERE tenant_id = $1', [tenantId]);
  res.json({ status: 'success', clients });
}));

export default router;
