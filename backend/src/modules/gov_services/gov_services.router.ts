import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { appGateMiddleware } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use('/gov', authMiddleware, appGateMiddleware('io.example.gov_services'));

// GET /api/v1/gov/services
router.get('/gov/services', asyncHandler(async (req, res) => {
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
