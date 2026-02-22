import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as shopService from '../services/shopService.js';
import * as thiefService from '../services/thiefService.js';

const router = Router();

// GET /api/shop — list all shops
router.get('/', requireAuth, (_req: Request, res: Response) => {
  try {
    const shops = shopService.getShops();
    res.json({ shops });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shop/:shopId/items — get items in a specific shop
router.get('/:shopId/items', requireAuth, (req: Request, res: Response) => {
  try {
    const shopId = parseInt(req.params.shopId as string, 10);
    if (isNaN(shopId)) return res.status(400).json({ error: 'Invalid shop ID' });

    const items = shopService.getShopItems(shopId, req.session.userId!);
    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shop/buy — buy an item from a shop
router.post('/buy', requireAuth, (req: Request, res: Response) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });

    const result = shopService.purchaseItem(req.session.userId!, itemId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/shop/:shopId/steal — get stealable items in a shop
router.get('/:shopId/steal', requireAuth, (req: Request, res: Response) => {
  try {
    const shopId = parseInt(req.params.shopId as string, 10);
    if (isNaN(shopId)) return res.status(400).json({ error: 'Invalid shop ID' });

    const result = thiefService.getStealableItems(req.session.userId!, shopId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/shop/steal — attempt to steal an item
router.post('/steal', requireAuth, (req: Request, res: Response) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });

    const result = thiefService.attemptSteal(req.session.userId!, itemId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
