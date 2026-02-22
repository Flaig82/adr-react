import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as jailService from '../services/jailService.js';

const router = Router();

// GET /api/jail — get current jail status
router.get('/', requireAuth, (req: Request, res: Response) => {
  try {
    const status = jailService.getJailStatus(req.session.userId!);
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jail/bail — pay bail to get out
router.post('/bail', requireAuth, (req: Request, res: Response) => {
  try {
    const result = jailService.payBail(req.session.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/jail/history — get jail history
router.get('/history', requireAuth, (req: Request, res: Response) => {
  try {
    const history = jailService.getJailHistory(req.session.userId!);
    res.json({ records: history });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
