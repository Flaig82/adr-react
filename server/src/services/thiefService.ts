import { eq, and } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { rollD20 } from '@adr/shared';
import * as jailService from './jailService.js';

// ─── Constants ──────────────────────────────────────────────────────────────

const MIN_STEAL_LEVEL = 5;        // Minimum character level to attempt stealing
const FAILURE_GOLD_PENALTY = 2000; // Gold fine on failure
const USES_PER_LEVEL = 10;         // Skill uses per level up

// Steal DC descriptions for UI
const DC_LABELS: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Average',
  4: 'Tough',
  5: 'Challenging',
  6: 'Formidable',
  7: 'Heroic',
  8: 'Near Impossible',
};

// DC to actual difficulty number (from PHP)
const DC_VALUES: Record<number, number> = {
  1: 7,
  2: 12,
  3: 20,
  4: 30,
  5: 45,
  6: 75,
  7: 100,
  8: 150,
};

// ─── Get Stealable Items ────────────────────────────────────────────────────

export function getStealableItems(userId: number, shopId: number) {
  // Check jail status first
  const jailStatus = jailService.getJailStatus(userId);
  if (jailStatus.isJailed) {
    return {
      canSteal: false,
      reason: `You are in jail! ${jailStatus.remainingFormatted} remaining. Bail: ${jailStatus.bailCost}g.`,
      items: [],
      thiefLevel: 0,
      thiefLimit: 0,
      characterLevel: 0,
      minLevel: MIN_STEAL_LEVEL,
    };
  }

  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');

  // Check requirements
  if (char.skillThief < 1) {
    return {
      canSteal: false,
      reason: 'You haven\'t learned the Thief skill. Visit the Town to learn it.',
      items: [],
      thiefLevel: 0,
      thiefLimit: char.thiefLimit,
      characterLevel: char.level,
      minLevel: MIN_STEAL_LEVEL,
    };
  }

  if (char.level < MIN_STEAL_LEVEL) {
    return {
      canSteal: false,
      reason: `Must be at least level ${MIN_STEAL_LEVEL} to steal (you are level ${char.level}).`,
      items: [],
      thiefLevel: char.skillThief,
      thiefLimit: char.thiefLimit,
      characterLevel: char.level,
      minLevel: MIN_STEAL_LEVEL,
    };
  }

  if (char.thiefLimit < 1) {
    return {
      canSteal: false,
      reason: 'No steal attempts remaining today.',
      items: [],
      thiefLevel: char.skillThief,
      thiefLimit: 0,
      characterLevel: char.level,
      minLevel: MIN_STEAL_LEVEL,
    };
  }

  // Get shop items
  const items = db.select().from(schema.items)
    .where(and(
      eq(schema.items.shopId, shopId),
      eq(schema.items.ownerId, 0),
    ))
    .all();

  // Get type and quality names
  const itemTypes = db.select().from(schema.itemTypes).all();
  const itemQualities = db.select().from(schema.itemQualities).all();
  const typeMap = new Map(itemTypes.map(t => [t.id, t.name]));
  const qualityMap = new Map(itemQualities.map(q => [q.id, q.name]));

  // All items are stealable — assign DC based on price
  const stealableItems = items.map(item => {
    // Calculate DC based on item price
    const dc = getDcForItem(item.price);
    const dcValue = DC_VALUES[dc] || 20;
    const dcLabel = DC_LABELS[dc] || 'Unknown';

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      typeId: item.typeId,
      typeName: typeMap.get(item.typeId) || 'Unknown',
      qualityId: item.qualityId,
      qualityName: qualityMap.get(item.qualityId) || 'Unknown',
      power: item.power,
      price: item.price,
      dc,
      dcValue,
      dcLabel,
    };
  });

  return {
    canSteal: true,
    reason: null,
    items: stealableItems,
    thiefLevel: char.skillThief,
    thiefLimit: char.thiefLimit,
    characterLevel: char.level,
    minLevel: MIN_STEAL_LEVEL,
  };
}

// ─── Attempt Steal ──────────────────────────────────────────────────────────

export function attemptSteal(userId: number, itemId: number) {
  // Check jail status
  const jailStatus = jailService.getJailStatus(userId);
  if (jailStatus.isJailed) throw new Error('You are in jail and cannot steal!');

  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');

  // Validate requirements
  if (char.skillThief < 1) throw new Error('You haven\'t learned the Thief skill.');
  if (char.level < MIN_STEAL_LEVEL) throw new Error(`Must be at least level ${MIN_STEAL_LEVEL} to steal.`);
  if (char.thiefLimit < 1) throw new Error('No steal attempts remaining today.');

  // Get the item
  const item = db.select().from(schema.items)
    .where(and(
      eq(schema.items.id, itemId),
      eq(schema.items.ownerId, 0), // Must be a shop item
    )).get();

  if (!item) throw new Error('Item not found in shop');
  if (item.shopId === 0) throw new Error('Item is not in a shop');

  // Calculate DC and perform check
  const dc = getDcForItem(item.price);
  const dcValue = DC_VALUES[dc] || 20;

  // Thief check: roll d20 + skill modifier vs DC
  const roll = rollD20();
  const skillMod = Math.floor(char.skillThief * 1.5); // Skill adds to roll
  const dexMod = Math.max(0, Math.floor((char.dexterity - 10) / 2));
  const total = roll + skillMod + dexMod;

  // Natural 1 = auto fail, Natural 20 = auto success
  const success = roll === 20 || (roll !== 1 && total >= dcValue);

  // Decrement thief limit
  db.update(schema.characters).set({
    thiefLimit: char.thiefLimit - 1,
  }).where(eq(schema.characters.userId, userId)).run();

  if (success) {
    return handleStealSuccess(userId, char, item, roll, total, dcValue);
  } else {
    return handleStealFailure(userId, char, item, roll, total, dcValue);
  }
}

// ─── Steal Success ──────────────────────────────────────────────────────────

function handleStealSuccess(userId: number, char: any, item: any, roll: number, total: number, dc: number) {
  // Create a copy of the stolen item for the player
  db.insert(schema.items).values({
    name: item.name,
    description: item.description,
    image: item.image,
    typeId: item.typeId,
    qualityId: item.qualityId,
    power: item.power,
    addPower: item.addPower,
    weight: item.weight,
    duration: item.duration,
    durationMax: item.durationMax,
    price: item.price,
    bonusMight: item.bonusMight,
    bonusDexterity: item.bonusDexterity,
    bonusConstitution: item.bonusConstitution,
    bonusIntelligence: item.bonusIntelligence,
    bonusWisdom: item.bonusWisdom,
    bonusCharisma: item.bonusCharisma,
    bonusHp: item.bonusHp,
    bonusMp: item.bonusMp,
    bonusAc: item.bonusAc,
    elementId: item.elementId,
    elementStrongDmg: item.elementStrongDmg,
    elementSameDmg: item.elementSameDmg,
    elementWeakDmg: item.elementWeakDmg,
    critHit: item.critHit,
    critHitMod: item.critHitMod,
    sellBackPercentage: item.sellBackPercentage,
    restrictLevel: item.restrictLevel,
    restrictMight: item.restrictMight,
    restrictDexterity: item.restrictDexterity,
    restrictConstitution: item.restrictConstitution,
    restrictIntelligence: item.restrictIntelligence,
    restrictWisdom: item.restrictWisdom,
    restrictCharisma: item.restrictCharisma,
    restrictClassEnable: item.restrictClassEnable,
    restrictClass: item.restrictClass,
    restrictRaceEnable: item.restrictRaceEnable,
    restrictRace: item.restrictRace,
    restrictAlignEnable: item.restrictAlignEnable,
    restrictAlign: item.restrictAlign,
    restrictElementEnable: item.restrictElementEnable,
    restrictElement: item.restrictElement,
    ownerId: userId,
    shopId: 0,
    equipped: 0,
    inWarehouse: 0,
  }).run();

  // Increment thief skill uses and check for level up
  const newUses = char.skillThiefUses + 1;
  const leveledUp = newUses >= USES_PER_LEVEL;
  const updates: any = {
    skillThiefUses: leveledUp ? 0 : newUses,
  };
  if (leveledUp) {
    updates.skillThief = char.skillThief + 1;
  }

  db.update(schema.characters).set(updates)
    .where(eq(schema.characters.userId, userId)).run();

  const nat20 = roll === 20;
  return {
    success: true,
    itemName: item.name,
    roll,
    total,
    dc,
    natural20: nat20,
    leveledUp,
    newLevel: leveledUp ? char.skillThief + 1 : char.skillThief,
    goldLost: 0,
    thiefLimit: char.thiefLimit - 1,
    message: nat20
      ? `NATURAL 20! You masterfully steal ${item.name}!`
      : `You successfully steal ${item.name}! (Roll: ${total} vs DC ${dc})`,
  };
}

// ─── Steal Failure ──────────────────────────────────────────────────────────

function handleStealFailure(userId: number, char: any, item: any, roll: number, total: number, dc: number) {
  // Fine: max of item price or base penalty
  const fine = Math.max(item.price, FAILURE_GOLD_PENALTY);
  const actualFine = Math.min(fine, char.gold); // Can't lose more than you have

  // Deduct gold
  db.update(schema.characters).set({
    gold: char.gold - actualFine,
  }).where(eq(schema.characters.userId, userId)).run();

  // Roll for jail (nat 1 always jails, otherwise random chance)
  const nat1 = roll === 1;
  const jailResult = nat1
    ? jailService.jailPlayer(userId, item.name, item.price) // nat1 forces jail check
    : jailService.jailPlayer(userId, item.name, item.price);

  let message = nat1
    ? `NATURAL 1! You are caught red-handed trying to steal ${item.name}! Fined ${actualFine}g!`
    : `You fail to steal ${item.name} and are caught! Fined ${actualFine}g! (Roll: ${total} vs DC ${dc})`;

  if (jailResult.jailed) {
    message += ` You have been thrown in jail for ${jailResult.duration}! Bail: ${jailResult.bailCost}g.`;
  }

  return {
    success: false,
    itemName: item.name,
    roll,
    total,
    dc,
    natural1: nat1,
    leveledUp: false,
    newLevel: char.skillThief,
    goldLost: actualFine,
    thiefLimit: char.thiefLimit - 1,
    jailed: jailResult.jailed,
    jailDuration: jailResult.duration || null,
    bailCost: jailResult.bailCost || null,
    message,
  };
}

// ─── Helper: DC from item price ─────────────────────────────────────────────

function getDcForItem(price: number): number {
  if (price <= 50) return 1;       // Very Easy
  if (price <= 100) return 2;      // Easy
  if (price <= 200) return 3;      // Average
  if (price <= 350) return 4;      // Tough
  if (price <= 500) return 5;      // Challenging
  if (price <= 800) return 6;      // Formidable
  if (price <= 1500) return 7;     // Heroic
  return 8;                         // Near Impossible
}
