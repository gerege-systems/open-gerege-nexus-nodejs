import { Router } from 'express';
import { query, queryOne } from '../../db/index.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { appGateMiddleware } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use('/esign', authMiddleware, appGateMiddleware('io.example.esign'));

// GET /api/v1/esign/sessions
router.get('/esign/sessions', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const sessions = await query('SELECT * FROM esign_sign_sessions WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
  res.json({ status: 'success', data: sessions });
}));

// POST /api/v1/esign/start
router.post('/esign/start', asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const userId = req.user ? req.user.id : null;
  const { document_id, signer_national_id, signer_name } = req.body;

  if (!document_id || !signer_national_id) {
    res.status(400).json({ status: 'error', message: 'document_id and signer_national_id are required' });
    return;
  }

  const sessionToken = `esign_tok_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const session = await queryOne(
    `INSERT INTO esign_sessions (tenant_id, document_id, created_by, signer_national_id, signer_name, token, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')
     RETURNING *`,
    [tenantId, document_id, userId, signer_national_id, signer_name || '', sessionToken]
  );

  res.status(201).json({ status: 'success', data: session });
}));

export default router;
