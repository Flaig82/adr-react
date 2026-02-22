import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as inventoryService from '../services/inventoryService.js';

const router = Router();

// GET /api/inventory — get player's inventory
router.get('/', requireAuth, (req: Request, res: Response) => {
  try {
    const items = inventoryService.getInventory(req.session.userId!);
    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory/equip — equip an item
router.post('/equip', requireAuth, (req: Request, res: Response) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });

    const result = inventoryService.equipItem(req.session.userId!, itemId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/inventory/unequip — unequip an item
router.post('/unequip', requireAuth, (req: Request, res: Response) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });

    const result = inventoryService.unequipItem(req.session.userId!, itemId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/inventory/sell — sell an item for gold
router.post('/sell', requireAuth, (req: Request, res: Response) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });

    const result = inventoryService.sellItem(req.session.userId!, itemId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/inventory/drop — destroy an item
router.post('/drop', requireAuth, (req: Request, res: Response) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });

    const result = inventoryService.dropItem(req.session.userId!, itemId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/inventory/give — give an item to another player
router.post('/give', requireAuth, (req: Request, res: Response) => {
  try {
    const { itemId, targetUserId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });
    if (!targetUserId) return res.status(400).json({ error: 'targetUserId is required' });

    const result = inventoryService.giveItem(req.session.userId!, itemId, targetUserId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
