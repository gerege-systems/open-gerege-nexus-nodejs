import { Router } from 'express';
import { env } from '../../config/env.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { createRateLimiter } from '../../middleware/rateLimit.js';

const router = Router();
const aiLimiter = createRateLimiter({ windowMs: 60000, max: 20 });

router.use('/ai', authMiddleware);
router.use(aiLimiter);

// POST /api/v1/ai/copilot
router.post('/ai/copilot', asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!env.GEMINI_API_KEY) {
    res.json({
      status: 'success',
      reply: `[Mock AI Copilot] Received prompt: "${prompt}". Configure GEMINI_API_KEY for live responses.`,
    });
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    res.json({ status: 'success', reply: replyText });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}));

// POST /api/v1/ai/translate
router.post('/ai/translate', asyncHandler(async (req, res) => {
  const { text, targetLang } = req.body;
  res.json({
    status: 'success',
    translatedText: text,
    targetLang: targetLang || 'mn',
  });
}));

// GET /api/v1/ai/stock-forecast
router.get('/ai/stock-forecast', asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    forecast: [
      { month: '2026-09', predicted_demand: 120 },
      { month: '2026-10', predicted_demand: 150 },
    ],
  });
}));

export default router;
