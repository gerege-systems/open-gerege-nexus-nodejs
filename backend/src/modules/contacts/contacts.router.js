const { Router } = require('express');
const { query, queryOne } = require('../../db/index');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { appGateMiddleware } = require('../../middleware/rbac.middleware');

const router = Router();

router.use(authMiddleware);
router.use(appGateMiddleware('io.example.contacts'));

// GET /api/v1/contacts
router.get('/contacts', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const contacts = await query('SELECT * FROM contacts WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
  res.json({ status: 'success', data: contacts });
}));

// GET /api/v1/contacts/:id
router.get('/contacts/:id', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const contact = await queryOne('SELECT * FROM contacts WHERE id = $1 AND tenant_id = $2', [req.params.id, tenantId]);
  if (!contact) {
    res.status(404).json({ status: 'error', message: 'Contact not found' });
    return;
  }
  res.json({ status: 'success', data: contact });
}));

// POST /api/v1/contacts
router.post('/contacts', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const { name, email, phone, company, address } = req.body;

  if (!name) {
    res.status(400).json({ status: 'error', message: 'Name is required' });
    return;
  }

  const created = await queryOne(
    `INSERT INTO contacts (tenant_id, name, email, phone, company, address)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [tenantId, name, email || null, phone || null, company || null, address || null]
  );

  res.status(201).json({ status: 'success', data: created });
}));

// PUT /api/v1/contacts/:id
router.put('/contacts/:id', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const { name, email, phone, company, address } = req.body;

  const updated = await queryOne(
    `UPDATE contacts
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         phone = COALESCE($3, phone),
         company = COALESCE($4, company),
         address = COALESCE($5, address),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6 AND tenant_id = $7
     RETURNING *`,
    [name, email, phone, company, address, req.params.id, tenantId]
  );

  if (!updated) {
    res.status(404).json({ status: 'error', message: 'Contact not found' });
    return;
  }

  res.json({ status: 'success', data: updated });
}));

// DELETE /api/v1/contacts/:id
router.delete('/contacts/:id', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  await query('DELETE FROM contacts WHERE id = $1 AND tenant_id = $2', [req.params.id, tenantId]);
  res.json({ status: 'success', message: 'Contact deleted successfully' });
}));

module.exports = router;
