import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be 3-30 characters' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    // Check if username exists
    const existing = db.select().from(schema.users)
      .where(eq(schema.users.username, username))
      .get();

    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.insert(schema.users).values({
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    }).run();

    const userId = Number(result.lastInsertRowid);

    // Auto-login after registration
    req.session.userId = userId;
    req.session.username = username;

    res.status(201).json({
      id: userId,
      username,
      message: 'Account created successfully',
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = db.select().from(schema.users)
      .where(eq(schema.users.username, username))
      .get();

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;

    // Check if user has a character
    const character = db.select().from(schema.characters)
      .where(eq(schema.characters.userId, user.id))
      .get();

    res.json({
      id: user.id,
      username: user.username,
      hasCharacter: !!character,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const character = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, req.session.userId))
    .get();

  res.json({
    id: req.session.userId,
    username: req.session.username,
    hasCharacter: !!character,
  });
});

export default router;
