import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as townService from '../services/townService.js';

const router = Router();

// GET /api/town — get full town status (stats, skills, temple, limits, classes)
router.get('/', requireAuth, (req: Request, res: Response) => {
  try {
    const status = townService.getTownStatus(req.session.userId!);
    res.json(status);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/town/train — train a stat (+1 for gold)
router.post('/train', requireAuth, (req: Request, res: Response) => {
  try {
    const { stat } = req.body;
    if (!stat) return res.status(400).json({ error: 'stat is required' });

    const result = townService.trainStat(req.session.userId!, stat);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/town/learn-skill — learn a new skill (costs SP)
router.post('/learn-skill', requireAuth, (req: Request, res: Response) => {
  try {
    const { skillId } = req.body;
    if (!skillId) return res.status(400).json({ error: 'skillId is required' });

    const result = townService.learnSkill(req.session.userId!, skillId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/town/change-class — change to a different class (costs gold)
router.post('/change-class', requireAuth, (req: Request, res: Response) => {
  try {
    const { classId } = req.body;
    if (!classId) return res.status(400).json({ error: 'classId is required' });

    const result = townService.changeClass(req.session.userId!, classId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/town/heal — temple heal to full HP/MP
router.post('/heal', requireAuth, (req: Request, res: Response) => {
  try {
    const result = townService.templeHeal(req.session.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/town/resurrect — temple resurrect from death
router.post('/resurrect', requireAuth, (req: Request, res: Response) => {
  try {
    const result = townService.templeResurrect(req.session.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
