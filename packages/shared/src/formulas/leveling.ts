// Leveling formulas — ported from ADR PHP

/**
 * Calculate XP required for a given level
 * Original PHP: next_level_penalty = 10% per level
 * Formula: base * (1 + penalty)^(level-1)
 */
export function xpForLevel(level: number, penaltyPercent: number = 10): number {
  const penalty = penaltyPercent / 100;
  return Math.floor(100 * Math.pow(1 + penalty, level - 1));
}

/**
 * Calculate XP needed to reach the next level from current
 */
export function xpToNextLevel(currentLevel: number, currentXp: number, penaltyPercent: number = 10): number {
  const required = xpForLevel(currentLevel + 1, penaltyPercent);
  return Math.max(0, required - currentXp);
}

/**
 * Check if player should level up
 */
export function shouldLevelUp(currentLevel: number, currentXp: number, penaltyPercent: number = 10): boolean {
  return currentXp >= xpForLevel(currentLevel + 1, penaltyPercent);
}

/**
 * Calculate HP gain on level up
 * Base HP from constitution modifier + class bonus
 */
export function hpGainOnLevelUp(constitution: number, classHpBonus: number = 0): number {
  const conMod = Math.max(1, Math.floor((constitution - 10) / 2));
  return Math.max(1, conMod + classHpBonus + Math.floor(Math.random() * 4) + 1);
}

/**
 * Calculate MP gain on level up
 * Base MP from intelligence modifier + class bonus
 */
export function mpGainOnLevelUp(intelligence: number, classMpBonus: number = 0): number {
  const intMod = Math.max(0, Math.floor((intelligence - 10) / 2));
  return Math.max(0, intMod + classMpBonus + Math.floor(Math.random() * 3));
}

/**
 * Calculate starting HP for a new character
 */
export function startingHp(constitution: number, raceHpBonus: number, classHpBonus: number): number {
  return Math.max(10, 10 + Math.floor(constitution / 2) + raceHpBonus + classHpBonus);
}

/**
 * Calculate starting MP for a new character
 */
export function startingMp(intelligence: number, raceMpBonus: number, classMpBonus: number): number {
  return Math.max(5, 5 + Math.floor(intelligence / 3) + raceMpBonus + classMpBonus);
}
