const { Router } = require('express');
const { query, queryOne } = require('../../db/index');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { appGateMiddleware } = require('../../middleware/rbac.middleware');

const router = Router();

router.use('/inventory', authMiddleware, appGateMiddleware('io.example.inventory'));

// GET /api/v1/inventory
router.get('/inventory', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const items = await query(
    `SELECT i.*, p.name as product_name, p.sku
     FROM inventory i
     LEFT JOIN products p ON i.product_id = p.id
     WHERE i.tenant_id = $1 ORDER BY i.updated_at DESC`,
    [tenantId]
  );
  res.json({ status: 'success', data: items });
}));

// POST /api/v1/inventory/adjust
router.post('/inventory/adjust', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const { product_id, quantity_delta } = req.body;

  if (!product_id || quantity_delta === undefined) {
    res.status(400).json({ status: 'error', message: 'Product ID and quantity_delta are required' });
    return;
  }

  const existing = await queryOne(
    `SELECT quantity FROM inventory WHERE product_id = $1 AND tenant_id = $2`,
    [product_id, tenantId]
  );

  const currentQty = existing ? existing.quantity : 0;
  const newQty = currentQty + Number(quantity_delta);

  if (newQty < 0) {
    res.status(400).json({ status: 'error', message: 'Inventory quantity cannot be negative' });
    return;
  }

  const updated = await queryOne(
    `INSERT INTO inventory (tenant_id, product_id, quantity, updated_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT (tenant_id, product_id)
     DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [tenantId, product_id, newQty]
  );

  res.json({ status: 'success', data: updated });
}));

module.exports = router;
