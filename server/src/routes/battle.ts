import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as battleService from '../services/battleService.js';

const router = Router();

// GET /api/battle — get current battle state (or null)
router.get('/', requireAuth, (req: Request, res: Response) => {
  try {
    const battle = battleService.getCurrentBattle(req.session.userId!);
    res.json({ battle });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/battle/start — start a new battle
router.post('/start', requireAuth, (req: Request, res: Response) => {
  try {
    const result = battleService.startBattle(req.session.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/battle/action — perform a turn action
router.post('/action', requireAuth, (req: Request, res: Response) => {
  try {
    const { battleId, action } = req.body;

    if (!battleId || !action) {
      return res.status(400).json({ error: 'battleId and action are required' });
    }

    if (!['attack', 'defend', 'flee'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be: attack, defend, or flee' });
    }

    const result = battleService.processTurn(req.session.userId!, battleId, action);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/battle/heal — temple heal
router.post('/heal', requireAuth, (req: Request, res: Response) => {
  try {
    const result = battleService.templeHeal(req.session.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/battle/resurrect — temple resurrect
router.post('/resurrect', requireAuth, (req: Request, res: Response) => {
  try {
    const result = battleService.templeResurrect(req.session.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
