// Forge/crafting formulas — ported from ADR PHP

import { rollD20 } from './battle.js';

/**
 * Mining success check
 * Original PHP: success = skill_level * skill_chance
 * Higher mining skill = better chance to find materials
 */
export function miningSuccess(miningSkillLevel: number): boolean {
  const baseChance = 30 + miningSkillLevel * 5; // 30% base + 5% per level
  const roll = Math.random() * 100;
  return roll < Math.min(90, baseChance); // Cap at 90%
}

/**
 * Determine what was mined
 * Higher skill = chance for rarer materials
 */
export function miningResult(miningSkillLevel: number): 'ore' | 'gem' | 'rare' {
  const roll = Math.random() * 100;
  const rareThreshold = Math.min(15, miningSkillLevel * 2); // Up to 15% rare chance
  const gemThreshold = rareThreshold + Math.min(25, 10 + miningSkillLevel * 3);

  if (roll < rareThreshold) return 'rare';
  if (roll < gemThreshold) return 'gem';
  return 'ore';
}

/**
 * Stone cutting success check
 */
export function stoneCuttingSuccess(stoneSkillLevel: number): boolean {
  const baseChance = 25 + stoneSkillLevel * 5;
  const roll = Math.random() * 100;
  return roll < Math.min(85, baseChance);
}

/**
 * Forging success check
 * Original PHP: 5% critical failure chance
 */
export function forgingResult(forgeSkillLevel: number): 'success' | 'failure' | 'critical_failure' {
  const roll = Math.random() * 100;

  // 5% critical failure — destroys materials
  if (roll < 5) return 'critical_failure';

  const successChance = 20 + forgeSkillLevel * 6; // 20% base + 6% per level
  if (roll < 5 + Math.min(85, successChance)) return 'success';

  return 'failure';
}

/**
 * Determine quality of forged item
 * Higher skill = better quality range
 */
export function forgeQuality(forgeSkillLevel: number): number {
  const roll = Math.random() * 100;

  // Quality distribution based on skill level
  if (forgeSkillLevel >= 10 && roll < 5) return 6;  // Excellent
  if (forgeSkillLevel >= 7 && roll < 15) return 5;   // Very Good
  if (forgeSkillLevel >= 5 && roll < 30) return 4;   // Good
  if (forgeSkillLevel >= 3 && roll < 50) return 3;   // Medium
  if (roll < 70) return 2;                             // Poor
  return 1;                                             // Very Poor
}

/**
 * Enchanting success check
 * Enchanting is harder than forging
 */
export function enchantSuccess(enchantSkillLevel: number): boolean {
  const baseChance = 15 + enchantSkillLevel * 4; // 15% base + 4% per level
  const roll = Math.random() * 100;
  return roll < Math.min(75, baseChance); // Cap at 75%
}

/**
 * Repair cost calculation
 * Cost scales with item quality and damage
 */
export function repairCost(
  itemPrice: number,
  currentDuration: number,
  maxDuration: number,
): number {
  if (currentDuration >= maxDuration) return 0;
  const damagePercent = 1 - (currentDuration / maxDuration);
  return Math.max(1, Math.floor(itemPrice * 0.3 * damagePercent));
}
