import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as forgeService from '../services/forgeService.js';

const router = Router();

// GET /api/forge — get forge status (skills, items available)
router.get('/', requireAuth, (req: Request, res: Response) => {
  try {
    const status = forgeService.getForgeStatus(req.session.userId!);
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/forge/mine — mine for materials
router.post('/mine', requireAuth, (req: Request, res: Response) => {
  try {
    const { pickaxeId } = req.body;
    if (!pickaxeId) return res.status(400).json({ error: 'pickaxeId is required' });

    const result = forgeService.mine(req.session.userId!, pickaxeId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/forge/cut — cut/polish a material
router.post('/cut', requireAuth, (req: Request, res: Response) => {
  try {
    const { materialId } = req.body;
    if (!materialId) return res.status(400).json({ error: 'materialId is required' });

    const result = forgeService.cutStone(req.session.userId!, materialId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/forge/repair — repair an equipment item
router.post('/repair', requireAuth, (req: Request, res: Response) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });

    const result = forgeService.repair(req.session.userId!, itemId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/forge/enchant — enchant an equipment item
router.post('/enchant', requireAuth, (req: Request, res: Response) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });

    const result = forgeService.enchant(req.session.userId!, itemId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
