import { Router, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/characters — list all characters
router.get('/', requireAuth, (_req: Request, res: Response) => {
  try {
    const characters = db.select().from(schema.characters).all();
    const classes = db.select().from(schema.classes).all();
    const races = db.select().from(schema.races).all();
    const elements = db.select().from(schema.elements).all();
    const alignments = db.select().from(schema.alignments).all();

    const classMap = new Map(classes.map(c => [c.id, c.name]));
    const raceMap = new Map(races.map(r => [r.id, r.name]));
    const elementMap = new Map(elements.map(e => [e.id, { name: e.name, color: e.color }]));
    const alignmentMap = new Map(alignments.map(a => [a.id, a.name]));

    // Get usernames
    const users = db.select().from(schema.users).all();
    const userMap = new Map(users.map(u => [u.id, u.username]));

    const list = characters.map(c => ({
      id: c.id,
      userId: c.userId,
      username: userMap.get(c.userId) || 'Unknown',
      name: c.name,
      level: c.level,
      className: classMap.get(c.classId) || 'Unknown',
      raceName: raceMap.get(c.raceId) || 'Unknown',
      elementName: elementMap.get(c.elementId)?.name || 'Unknown',
      elementColor: elementMap.get(c.elementId)?.color || '#ffffff',
      alignmentName: alignmentMap.get(c.alignmentId) || 'Unknown',
      victories: c.victories,
      defeats: c.defeats,
      victoriesPvp: c.victoriesPvp,
      defeatsPvp: c.defeatsPvp,
      isDead: c.isDead === 1,
    }));

    // Sort by level desc, then victories desc
    list.sort((a, b) => b.level - a.level || b.victories - a.victories);

    res.json({ characters: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/characters/:userId — view a specific character's profile
router.get('/:userId', requireAuth, (req: Request, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.userId as string, 10);
    if (isNaN(targetUserId)) return res.status(400).json({ error: 'Invalid user ID' });

    const char = db.select().from(schema.characters)
      .where(eq(schema.characters.userId, targetUserId)).get();
    if (!char) return res.status(404).json({ error: 'Character not found' });

    const race = db.select().from(schema.races).where(eq(schema.races.id, char.raceId)).get();
    const charClass = db.select().from(schema.classes).where(eq(schema.classes.id, char.classId)).get();
    const element = db.select().from(schema.elements).where(eq(schema.elements.id, char.elementId)).get();
    const alignment = db.select().from(schema.alignments).where(eq(schema.alignments.id, char.alignmentId)).get();
    const user = db.select().from(schema.users).where(eq(schema.users.id, targetUserId)).get();

    res.json({
      name: char.name,
      username: user?.username || 'Unknown',
      level: char.level,
      xp: char.xp,
      className: charClass?.name || 'Unknown',
      raceName: race?.name || 'Unknown',
      elementName: element?.name || 'Unknown',
      elementColor: element?.color || '#ffffff',
      alignmentName: alignment?.name || 'Unknown',
      might: char.might,
      dexterity: char.dexterity,
      constitution: char.constitution,
      intelligence: char.intelligence,
      wisdom: char.wisdom,
      charisma: char.charisma,
      hp: char.hp,
      hpMax: char.hpMax,
      mp: char.mp,
      mpMax: char.mpMax,
      ac: char.ac,
      victories: char.victories,
      defeats: char.defeats,
      flees: char.flees,
      victoriesPvp: char.victoriesPvp,
      defeatsPvp: char.defeatsPvp,
      isDead: char.isDead === 1,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
