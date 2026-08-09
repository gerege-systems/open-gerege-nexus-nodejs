import { Router } from 'express';
import { query, queryOne } from '../../db/index.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { appGateMiddleware } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use('/billing', authMiddleware, appGateMiddleware('io.example.billing'));

// GET /api/v1/billing/invoices
router.get('/billing/invoices', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const invoices = await query('SELECT * FROM billing_invoices WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
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
    `INSERT INTO billing_invoices (tenant_id, invoice_number, contact_name, amount, status)
     VALUES ($1, $2, $3, $4, 'PENDING')
     RETURNING *`,
    [tenantId, invoiceNumber, customer_name, amount]
  );

  res.status(201).json({ status: 'success', data: invoice });
}));

// POST /api/v1/billing/invoices/:id/pay
router.post('/billing/invoices/:id/pay', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const invoice = await queryOne(
    `UPDATE billing_invoices SET status = 'PAID'
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

export default router;
