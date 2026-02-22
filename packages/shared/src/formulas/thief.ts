// Thief skill formulas — ported from ADR PHP

import { rollD20 } from './battle.js';

/**
 * Thief steal check
 * Original PHP: DC-based difficulty 7-150
 * Roll d20 + modifiers vs DC
 *
 * @param thiefSkillLevel - Player's thief skill level
 * @param dexterity - Player's dexterity stat
 * @param itemDifficulty - DC of the item (7-150, higher = harder)
 * @returns success boolean
 */
export function stealCheck(
  thiefSkillLevel: number,
  dexterity: number,
  itemDifficulty: number,
): boolean {
  const roll = rollD20();
  const dexMod = Math.max(0, Math.floor((dexterity - 10) / 2));
  const skillBonus = thiefSkillLevel * 3;
  const total = roll + dexMod + skillBonus;

  // DC scaling: easy items (DC 7) → very hard items (DC 150)
  // Normalize DC to a d20 scale
  const normalizedDC = Math.min(20, Math.floor(itemDifficulty / 7.5));

  return total >= normalizedDC;
}

/**
 * Calculate thief failure penalty
 * Original PHP: skill_thief_failure_damage = 2000, skill_thief_failure_time = 6 hours
 */
export function thiefPenalty(config: {
  failureDamage: number;
  failureTime: number;
  failurePunishment: boolean;
}): { goldLost: number; jailTimeSeconds: number } {
  return {
    goldLost: config.failureDamage,
    jailTimeSeconds: config.failurePunishment ? config.failureTime : 0,
  };
}

/**
 * Check if player meets minimum level for shop stealing
 */
export function canStealFromShop(playerLevel: number, minLevel: number = 5): boolean {
  return playerLevel >= minLevel;
}
