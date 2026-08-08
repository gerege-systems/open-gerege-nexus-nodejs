import { Router, Request, Response } from 'express';
import { env } from '../../config/env.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { createRateLimiter } from '../../middleware/rateLimit.js';

const router = Router();
const aiLimiter = createRateLimiter({ windowMs: 60000, max: 20 });

router.use(authMiddleware);
router.use(aiLimiter);

// POST /api/v1/ai/copilot
router.post('/ai/copilot', asyncHandler(async (req: Request, res: Response) => {
  const { prompt, context } = req.body;

  if (!env.GEMINI_API_KEY) {
    res.json({
      status: 'success',
      reply: `[Mock AI Copilot] Received prompt: "${prompt}". Configure GEMINI_API_KEY for live responses.`,
    });
    return;
  }

  // Live Gemini API integration via native fetch
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
    const data: any = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    res.json({ status: 'success', reply: replyText });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}));

// POST /api/v1/ai/translate
router.post('/api/v1/ai/translate', asyncHandler(async (req: Request, res: Response) => {
  const { text, targetLang } = req.body;
  res.json({
    status: 'success',
    translatedText: text,
    targetLang: targetLang || 'mn',
  });
}));

// GET /api/v1/ai/stock-forecast
router.get('/ai/stock-forecast', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    status: 'success',
    forecast: [
      { month: '2026-09', predicted_demand: 120 },
      { month: '2026-10', predicted_demand: 150 },
    ],
  });
}));

export default router;
