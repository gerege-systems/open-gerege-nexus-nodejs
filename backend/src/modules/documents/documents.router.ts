import { Router, Request, Response } from 'express';
import { query, queryOne } from '../../db/index.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { appGateMiddleware } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(appGateMiddleware('io.example.documents'));

// GET /api/v1/documents
router.get('/documents', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId;
  const docs = await query('SELECT * FROM documents WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
  res.json({ status: 'success', data: docs });
}));

// GET /api/v1/documents/:id
router.get('/documents/:id', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId;
  const doc = await queryOne('SELECT * FROM documents WHERE id = $1 AND tenant_id = $2', [req.params.id, tenantId]);
  if (!doc) {
    res.status(404).json({ status: 'error', message: 'Document not found' });
    return;
  }
  res.json({ status: 'success', data: doc });
}));

// POST /api/v1/documents
router.post('/documents', asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId;
  const userId = req.user?.id;
  const { title, content, type } = req.body;

  if (!title) {
    res.status(400).json({ status: 'error', message: 'Document title is required' });
    return;
  }

  const doc = await queryOne(
    `INSERT INTO documents (tenant_id, created_by, title, content, type, status)
     VALUES ($1, $2, $3, $4, $5, 'draft')
     RETURNING *`,
    [tenantId, userId, title, content || '', type || 'general']
  );

  res.status(201).json({ status: 'success', data: doc });
}));

export default router;
