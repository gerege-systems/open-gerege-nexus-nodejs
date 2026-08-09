import { Router } from 'express';
import { query, queryOne } from '../../db/index.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { appGateMiddleware } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use('/inventory', authMiddleware, appGateMiddleware('io.example.inventory'));

// GET /api/v1/inventory
router.get('/inventory', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const items = await query(
    `SELECT sl.*, p.name AS product_name, p.sku, w.name AS warehouse_name
     FROM stock_levels sl
     JOIN warehouses w ON w.id = sl.warehouse_id
     LEFT JOIN products p ON sl.product_id = p.id
     WHERE sl.tenant_id = $1 ORDER BY sl.updated_at DESC`,
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
    `SELECT quantity FROM stock_levels WHERE product_id = $1 AND tenant_id = $2 LIMIT 1`,
    [product_id, tenantId]
  );

  const currentQty = existing ? existing.quantity : 0;
  const newQty = currentQty + Number(quantity_delta);

  if (newQty < 0) {
    res.status(400).json({ status: 'error', message: 'Inventory quantity cannot be negative' });
    return;
  }

  const updated = await queryOne(
    `INSERT INTO stock_levels (tenant_id, warehouse_id, product_id, quantity, updated_at)
     SELECT $1, w.id, $2, $3, CURRENT_TIMESTAMP
     FROM warehouses w WHERE w.tenant_id = $1 ORDER BY w.created_at ASC LIMIT 1
     ON CONFLICT (tenant_id, warehouse_id, product_id)
     DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [tenantId, product_id, newQty]
  );

  res.json({ status: 'success', data: updated });
}));

export default router;
