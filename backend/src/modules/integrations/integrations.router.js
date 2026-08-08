const { Router } = require('express');
const { query, queryOne } = require('../../db/index');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authMiddleware, requireAdmin } = require('../../middleware/auth.middleware');

const router = Router();

router.use(['/integrations', '/xyp'], authMiddleware);

// GET /api/v1/integrations
router.get('/integrations', requireAdmin, asyncHandler(async (req, res) => {
  const tenantId = req.tenantId || 'default-tenant';
  const integrations = await query('SELECT * FROM integrations WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
  res.json({ status: 'success', data: integrations });
}));

// GET /api/v1/integrations/providers
router.get('/integrations/providers', asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    providers: [
      { id: 'webhook', name: 'HTTP Webhook', category: 'developer' },
      { id: 'government', name: 'State Services (XYP/DAN)', category: 'gov' },
      { id: 'payment', name: 'QPay / SocialPay', category: 'finance' },
      { id: 'google_drive', name: 'Google Drive', category: 'storage' },
    ],
  });
}));

// POST /api/v1/integrations
router.post('/integrations', requireAdmin, asyncHandler(async (req, res) => {
  const tenantId = req.tenantId || 'default-tenant';
  const { name, provider, target_url, config } = req.body;

  if (!name || !provider) {
    res.status(400).json({ status: 'error', message: 'Name and provider required' });
    return;
  }

  const created = await queryOne(
    `INSERT INTO integrations (tenant_id, name, provider, target_url, config, status, connected)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE', false)
     RETURNING *`,
    [tenantId, name, provider, target_url || '', JSON.stringify(config || {})]
  );

  res.status(201).json({ status: 'success', data: created });
}));

// POST /api/v1/xyp/citizen
router.post('/xyp/citizen', asyncHandler(async (req, res) => {
  const { reg_num } = req.body;
  if (!reg_num) {
    res.status(400).json({ status: 'error', message: 'Registration number required' });
    return;
  }

  res.json({
    status: 'success',
    citizen: {
      reg_num,
      firstname: 'Баяр',
      lastname: 'Болд',
      gender: 'MALE',
      birth_date: '1995-04-12',
      address: 'Улаанбаатар хот, Сүхбаатар дүүрэг',
    },
  });
}));

// POST /api/v1/xyp/company
router.post('/xyp/company', asyncHandler(async (req, res) => {
  const { state_reg_num } = req.body;
  if (!state_reg_num) {
    res.status(400).json({ status: 'error', message: 'State registration number required' });
    return;
  }

  res.json({
    status: 'success',
    company: {
      state_reg_num,
      name: 'Гэрэгэ Системс ХХК',
      ceo_name: 'Эрдэнэбат',
      status: 'ACTIVE',
    },
  });
}));

module.exports = router;
