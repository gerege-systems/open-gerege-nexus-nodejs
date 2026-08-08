const { Router } = require('express');
const { query, queryOne } = require('../../db/index');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { appGateMiddleware } = require('../../middleware/rbac.middleware');

const router = Router();

router.use('/products', authMiddleware, appGateMiddleware('io.example.products'));

// GET /api/v1/products
router.get('/products', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const products = await query('SELECT * FROM products WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
  res.json({ status: 'success', data: products });
}));

// GET /api/v1/products/:id
router.get('/products/:id', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const product = await queryOne('SELECT * FROM products WHERE id = $1 AND tenant_id = $2', [req.params.id, tenantId]);
  if (!product) {
    res.status(404).json({ status: 'error', message: 'Product not found' });
    return;
  }
  res.json({ status: 'success', data: product });
}));

// POST /api/v1/products
router.post('/products', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const { name, sku, price, category, description } = req.body;

  if (!name || price === undefined) {
    res.status(400).json({ status: 'error', message: 'Name and price are required' });
    return;
  }

  const created = await queryOne(
    `INSERT INTO products (tenant_id, name, sku, price, category, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [tenantId, name, sku || null, price, category || 'General', description || null]
  );

  res.status(201).json({ status: 'success', data: created });
}));

// PUT /api/v1/products/:id
router.put('/products/:id', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const { name, sku, price, category, description } = req.body;

  const updated = await queryOne(
    `UPDATE products
     SET name = COALESCE($1, name),
         sku = COALESCE($2, sku),
         price = COALESCE($3, price),
         category = COALESCE($4, category),
         description = COALESCE($5, description),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6 AND tenant_id = $7
     RETURNING *`,
    [name, sku, price, category, description, req.params.id, tenantId]
  );

  if (!updated) {
    res.status(404).json({ status: 'error', message: 'Product not found' });
    return;
  }

  res.json({ status: 'success', data: updated });
}));

// DELETE /api/v1/products/:id
router.delete('/products/:id', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  await query('DELETE FROM products WHERE id = $1 AND tenant_id = $2', [req.params.id, tenantId]);
  res.json({ status: 'success', message: 'Product deleted successfully' });
}));

module.exports = router;
