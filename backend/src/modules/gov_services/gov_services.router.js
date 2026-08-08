const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { appGateMiddleware } = require('../../middleware/rbac.middleware');

const router = Router();

router.use(authMiddleware);
router.use(appGateMiddleware('io.example.gov_services'));

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

module.exports = router;
