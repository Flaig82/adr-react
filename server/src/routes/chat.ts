import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as chatService from '../services/chatService.js';

const router = Router();

// GET /api/chat — get recent messages
router.get('/', requireAuth, (req: Request, res: Response) => {
  try {
    const messages = chatService.getMessages();
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/poll?after=ID — get new messages since a given ID (for polling)
router.get('/poll', requireAuth, (req: Request, res: Response) => {
  try {
    const afterId = parseInt(req.query.after as string, 10) || 0;
    const messages = chatService.getMessagesSince(afterId);
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat — send a message
router.post('/', requireAuth, (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const result = chatService.sendMessage(req.session.userId!, message);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
