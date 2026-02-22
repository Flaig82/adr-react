import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

import authRoutes from './routes/auth.js';
import characterRoutes from './routes/character.js';
import battleRoutes from './routes/battle.js';
import inventoryRoutes from './routes/inventory.js';
import shopRoutes from './routes/shop.js';
import forgeRoutes from './routes/forge.js';
import vaultRoutes from './routes/vault.js';
import townRoutes from './routes/town.js';
import chatRoutes from './routes/chat.js';
import charactersRoutes from './routes/characters.js';
import jailRoutes from './routes/jail.js';

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || './adr.db';

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'adr-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
  },
}));

// ─── Auto-setup: create tables and seed if DB doesn't exist ──────────────────
if (!existsSync(DB_PATH)) {
  console.log('No database found. Running seed to create tables and insert game data...');
  const cwd = new URL('..', import.meta.url).pathname;
  execSync('npx tsx src/db/seed.ts', { stdio: 'inherit', cwd });
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/battle', battleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/forge', forgeRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/town', townRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/characters', charactersRoutes);
app.use('/api/jail', jailRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n⚔️  ADR Server running at http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/health`);
});
