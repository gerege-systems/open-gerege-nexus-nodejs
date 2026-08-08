import { Router, Request, Response } from 'express';
import { query } from '../../db/index.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { appGateMiddleware } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(appGateMiddleware('io.example.gov_services'));

// GET /api/v1/gov/services
router.get('/gov/services', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: [
      { id: 'gov-001', name: 'Иргэний бүртгэлийн тодорхойлолт', provider: 'ХУР / XYP' },
      { id: 'gov-002', name: 'Аж ахуйн нэгжийн гэрчилгээний шүүлт', provider: 'ХУР / XYP' },
      { id: 'gov-003', name: 'Авто тээврийн хэрэгслийн түүх', provider: 'Gerege Systems' },
    ],
  });
}));

export default router;
