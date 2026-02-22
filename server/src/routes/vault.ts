import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as vaultService from '../services/vaultService.js';

const router = Router();

// GET /api/vault — get vault status (bank, loans, stocks, holdings)
router.get('/', requireAuth, (req: Request, res: Response) => {
  try {
    const status = vaultService.getVaultStatus(req.session.userId!);
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vault/deposit — deposit gold into bank
router.post('/deposit', requireAuth, (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount is required' });

    const result = vaultService.deposit(req.session.userId!, Math.floor(amount));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/vault/withdraw — withdraw gold from bank
router.post('/withdraw', requireAuth, (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount is required' });

    const result = vaultService.withdraw(req.session.userId!, Math.floor(amount));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/vault/loan — take out a loan
router.post('/loan', requireAuth, (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount is required' });

    const result = vaultService.takeLoan(req.session.userId!, Math.floor(amount));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/vault/repay — repay active loan
router.post('/repay', requireAuth, (req: Request, res: Response) => {
  try {
    const result = vaultService.repayLoan(req.session.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/vault/stock/buy — buy shares
router.post('/stock/buy', requireAuth, (req: Request, res: Response) => {
  try {
    const { stockId, shares } = req.body;
    if (!stockId || !shares) return res.status(400).json({ error: 'stockId and shares are required' });

    const result = vaultService.buyStock(req.session.userId!, stockId, Math.floor(shares));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/vault/stock/sell — sell shares
router.post('/stock/sell', requireAuth, (req: Request, res: Response) => {
  try {
    const { stockId, shares } = req.body;
    if (!stockId || !shares) return res.status(400).json({ error: 'stockId and shares are required' });

    const result = vaultService.sellStock(req.session.userId!, stockId, Math.floor(shares));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
