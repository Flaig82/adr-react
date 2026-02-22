import { Router, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { rollStat, startingHp, startingMp } from '@adr/shared';
import { grantStarterItems } from '../services/inventoryService.js';

const router = Router();

// GET /api/character — get current user's character
router.get('/', requireAuth, (req: Request, res: Response) => {
  const character = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, req.session.userId!))
    .get();

  if (!character) {
    return res.status(404).json({ error: 'No character found', needsCreation: true });
  }

  // Fetch race, class, element, alignment names
  const race = db.select().from(schema.races).where(eq(schema.races.id, character.raceId)).get();
  const charClass = db.select().from(schema.classes).where(eq(schema.classes.id, character.classId)).get();
  const element = db.select().from(schema.elements).where(eq(schema.elements.id, character.elementId)).get();
  const alignment = db.select().from(schema.alignments).where(eq(schema.alignments.id, character.alignmentId)).get();

  res.json({
    ...character,
    raceName: race?.name || 'Unknown',
    className: charClass?.name || 'Unknown',
    elementName: element?.name || 'Unknown',
    elementColor: element?.color || '#ffffff',
    alignmentName: alignment?.name || 'Unknown',
  });
});

// GET /api/character/creation-data — get races, classes, elements, alignments for character creation
router.get('/creation-data', requireAuth, (req: Request, res: Response) => {
  const races = db.select().from(schema.races).all();
  const classes = db.select().from(schema.classes).where(eq(schema.classes.selectable, 1)).all();
  const elements = db.select().from(schema.elements).all();
  const alignments = db.select().from(schema.alignments).all();

  res.json({ races, classes, elements, alignments });
});

// POST /api/character/roll — roll stats (4d6 drop lowest)
router.post('/roll', requireAuth, (_req: Request, res: Response) => {
  const stats = {
    might: rollStat(),
    dexterity: rollStat(),
    constitution: rollStat(),
    intelligence: rollStat(),
    wisdom: rollStat(),
    charisma: rollStat(),
  };

  res.json(stats);
});

// POST /api/character — create character
router.post('/', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;

    // Check if already has character
    const existing = db.select().from(schema.characters)
      .where(eq(schema.characters.userId, userId))
      .get();

    if (existing) {
      return res.status(409).json({ error: 'You already have a character' });
    }

    const { name, raceId, classId, elementId, alignmentId, stats } = req.body;

    // Validate inputs
    if (!name || name.length < 2 || name.length > 30) {
      return res.status(400).json({ error: 'Character name must be 2-30 characters' });
    }

    // Verify race, class, element, alignment exist
    const race = db.select().from(schema.races).where(eq(schema.races.id, raceId)).get();
    const charClass = db.select().from(schema.classes).where(eq(schema.classes.id, classId)).get();
    const element = db.select().from(schema.elements).where(eq(schema.elements.id, elementId)).get();
    const alignment = db.select().from(schema.alignments).where(eq(schema.alignments.id, alignmentId)).get();

    if (!race || !charClass || !element || !alignment) {
      return res.status(400).json({ error: 'Invalid race, class, element, or alignment' });
    }

    if (charClass.selectable !== 1) {
      return res.status(400).json({ error: 'That class is not selectable' });
    }

    // Validate stats (must be within 3-20 range)
    const { might, dexterity, constitution, intelligence, wisdom, charisma } = stats;
    for (const [statName, value] of Object.entries({ might, dexterity, constitution, intelligence, wisdom, charisma })) {
      const v = value as number;
      if (!v || v < 3 || v > 20) {
        return res.status(400).json({ error: `${statName} must be between 3 and 20` });
      }
    }

    // Apply race bonuses/maluses
    const finalMight = Math.min(20, Math.max(3, might + race.mightBonus - race.mightMalus));
    const finalDex = Math.min(20, Math.max(3, dexterity + race.dexterityBonus - race.dexterityMalus));
    const finalCon = Math.min(20, Math.max(3, constitution + race.constitutionBonus - race.constitutionMalus));
    const finalInt = Math.min(20, Math.max(3, intelligence + race.intelligenceBonus - race.intelligenceMalus));
    const finalWis = Math.min(20, Math.max(3, wisdom + race.wisdomBonus - race.wisdomMalus));
    const finalCha = Math.min(20, Math.max(3, charisma + race.charismaBonus - race.charismaMalus));

    // Calculate starting HP and MP
    const hp = startingHp(finalCon, 0, charClass.baseHp);
    const mp = startingMp(finalInt, 0, charClass.baseMp);

    const result = db.insert(schema.characters).values({
      userId,
      name,
      might: finalMight,
      dexterity: finalDex,
      constitution: finalCon,
      intelligence: finalInt,
      wisdom: finalWis,
      charisma: finalCha,
      hp,
      hpMax: hp,
      mp,
      mpMax: mp,
      ac: charClass.baseAc,
      raceId,
      classId,
      elementId,
      alignmentId,
      level: 1,
      xp: 0,
      sp: 0,
      createdAt: new Date().toISOString(),
    }).run();

    const characterId = Number(result.lastInsertRowid);

    // Grant starter items (Rusty Sword, Padded Armor, 2x Small Health Potion)
    grantStarterItems(userId);

    const character = db.select().from(schema.characters)
      .where(eq(schema.characters.id, characterId))
      .get();

    res.status(201).json({
      ...character,
      raceName: race.name,
      className: charClass.name,
      elementName: element.name,
      elementColor: element.color,
      alignmentName: alignment.name,
    });
  } catch (err) {
    console.error('Create character error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
