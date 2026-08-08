const { Router } = require('express');
const { query, queryOne } = require('../../db/index');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { appGateMiddleware } = require('../../middleware/rbac.middleware');

const router = Router();

router.use('/billing', authMiddleware, appGateMiddleware('io.example.billing'));

// GET /api/v1/billing/invoices
router.get('/billing/invoices', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const invoices = await query('SELECT * FROM invoices WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
  res.json({ status: 'success', data: invoices });
}));

// POST /api/v1/billing/invoices
router.post('/billing/invoices', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const { customer_name, amount, due_date, items } = req.body;

  if (!customer_name || !amount) {
    res.status(400).json({ status: 'error', message: 'Customer name and amount are required' });
    return;
  }

  const invoiceNumber = `INV-${Date.now()}`;
  const invoice = await queryOne(
    `INSERT INTO invoices (tenant_id, invoice_number, customer_name, amount, status, due_date, items)
     VALUES ($1, $2, $3, $4, 'pending', $5, $6)
     RETURNING *`,
    [tenantId, invoiceNumber, customer_name, amount, due_date || null, JSON.stringify(items || [])]
  );

  res.status(201).json({ status: 'success', data: invoice });
}));

// POST /api/v1/billing/invoices/:id/pay
router.post('/billing/invoices/:id/pay', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const invoice = await queryOne(
    `UPDATE invoices SET status = 'paid', paid_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND tenant_id = $2
     RETURNING *`,
    [req.params.id, tenantId]
  );

  if (!invoice) {
    res.status(404).json({ status: 'error', message: 'Invoice not found' });
    return;
  }

  res.json({ status: 'success', data: invoice });
}));

module.exports = router;
