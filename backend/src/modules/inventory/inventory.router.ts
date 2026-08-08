import { Router, Request, Response } from 'express';
import { query, queryOne } from '../../db/index.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { appGateMiddleware } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(appGateMiddleware('io.example.inventory'));

// GET /api/v1/inventory
router.get('/inventory', asyncHandler(async (req: Request, res: Response) => {
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
router.post('/inventory/adjust', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId;
  const { product_id, quantity_delta, reason } = req.body;

  if (!product_id || quantity_delta === undefined) {
    res.status(400).json({ status: 'error', message: 'Product ID and quantity_delta are required' });
    return;
  }

  const existing = await queryOne<{ quantity: number }>(
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

export default router;
