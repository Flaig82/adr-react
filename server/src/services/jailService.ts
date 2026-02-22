import { eq, and } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

// ─── Constants ──────────────────────────────────────────────────────────────

// Jail durations by item price tier (in seconds)
const JAIL_DURATIONS: { maxPrice: number; seconds: number; label: string }[] = [
  { maxPrice: 100, seconds: 300, label: '5 minutes' },       // cheap items
  { maxPrice: 300, seconds: 900, label: '15 minutes' },      // mid items
  { maxPrice: 500, seconds: 1800, label: '30 minutes' },     // expensive items
  { maxPrice: 1000, seconds: 3600, label: '1 hour' },        // very expensive
  { maxPrice: Infinity, seconds: 7200, label: '2 hours' },   // top tier
];

// Bail cost multiplier (multiplied by item price)
const BAIL_MULTIPLIER = 3;

// Chance to be jailed on failed steal (percentage)
const JAIL_CHANCE_ON_FAIL = 40;

// ─── Check if User is Jailed ──────────────────────────────────────────────────

export function getJailStatus(userId: number) {
  const record = db.select().from(schema.jailRecords)
    .where(and(
      eq(schema.jailRecords.userId, userId),
      eq(schema.jailRecords.released, 0),
    ))
    .get();

  if (!record) {
    return { isJailed: false };
  }

  const now = new Date();
  const releaseAt = new Date(record.releaseAt);

  // Auto-release if time served
  if (now >= releaseAt) {
    db.update(schema.jailRecords).set({
      released: 1,
      releasedAt: now.toISOString(),
    }).where(eq(schema.jailRecords.id, record.id)).run();

    return { isJailed: false };
  }

  const remainingMs = releaseAt.getTime() - now.getTime();
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return {
    isJailed: true,
    recordId: record.id,
    reason: record.reason,
    jailedAt: record.jailedAt,
    releaseAt: record.releaseAt,
    bailCost: record.bailCost,
    remainingSeconds,
    remainingFormatted: formatDuration(remainingSeconds),
  };
}

// ─── Jail a Player (called from thief service on bad failure) ───────────────

export function jailPlayer(userId: number, itemName: string, itemPrice: number): {
  jailed: boolean;
  duration?: string;
  bailCost?: number;
} {
  // Roll for jail chance
  const roll = Math.random() * 100;
  if (roll > JAIL_CHANCE_ON_FAIL) {
    return { jailed: false };
  }

  // Calculate duration based on item price
  const tier = JAIL_DURATIONS.find(t => itemPrice <= t.maxPrice) || JAIL_DURATIONS[JAIL_DURATIONS.length - 1];
  const durationSeconds = tier.seconds;

  // Calculate bail cost
  const bailCost = Math.max(500, itemPrice * BAIL_MULTIPLIER);

  const now = new Date();
  const releaseAt = new Date(now.getTime() + durationSeconds * 1000);

  db.insert(schema.jailRecords).values({
    userId,
    reason: `Caught stealing ${itemName}`,
    jailedAt: now.toISOString(),
    releaseAt: releaseAt.toISOString(),
    bailCost,
    released: 0,
    releasedAt: '',
  }).run();

  return {
    jailed: true,
    duration: tier.label,
    bailCost,
  };
}

// ─── Pay Bail ───────────────────────────────────────────────────────────────

export function payBail(userId: number) {
  const status = getJailStatus(userId);
  if (!status.isJailed) throw new Error('You are not in jail');

  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');

  if (char.gold < status.bailCost!) {
    throw new Error(`Not enough gold! Bail costs ${status.bailCost}g (you have ${char.gold}g)`);
  }

  // Deduct gold
  db.update(schema.characters).set({
    gold: char.gold - status.bailCost!,
  }).where(eq(schema.characters.userId, userId)).run();

  // Release
  db.update(schema.jailRecords).set({
    released: 2,
    releasedAt: new Date().toISOString(),
  }).where(eq(schema.jailRecords.id, status.recordId!)).run();

  return {
    message: `Paid ${status.bailCost}g bail. You are free!`,
    goldSpent: status.bailCost!,
  };
}

// ─── Get Jail History ───────────────────────────────────────────────────────

export function getJailHistory(userId: number) {
  return db.select().from(schema.jailRecords)
    .where(eq(schema.jailRecords.userId, userId))
    .all()
    .map(r => ({
      id: r.id,
      reason: r.reason,
      jailedAt: r.jailedAt,
      releaseAt: r.releaseAt,
      bailCost: r.bailCost,
      released: r.released,
      releasedAt: r.releasedAt,
      status: r.released === 0 ? 'Serving' : r.released === 1 ? 'Time Served' : 'Bailed Out',
    }));
}

// ─── Helper: Format Duration ────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
}
