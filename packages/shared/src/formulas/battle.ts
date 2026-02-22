// Battle formulas — faithfully ported from adr_functions_battle.php + adr_global.php

/**
 * Ability modifier — exact port from adr_modifier_calc() in adr_global.php
 * +1 for every 2 points above 11 (stat >= 12)
 * 12-13: +1, 14-15: +2, 16-17: +3, 18-19: +4, 20: +5
 */
export function modifierCalc(stat: number): number {
  if (stat > 11) {
    return Math.floor((stat - 12) / 2) + 1;
  }
  return 0;
}

/**
 * Physical attack — exact port from adr_battle_make_att($str, $con)
 * ATT = ceil((STR * 1.5) + CON_modifier)
 */
export function physicalAttack(might: number, constitution: number): number {
  return Math.ceil((might + might * 0.5) + modifierCalc(constitution));
}

/**
 * Magic attack stat — exact port from adr_battle_make_magic_att($int)
 * M_ATT = ceil(INT * 1.75)
 */
export function magicAttack(intelligence: number): number {
  return Math.ceil(intelligence + intelligence * 0.75);
}

/**
 * Physical defense — exact port from adr_battle_make_def($ac, $dex)
 * DEF = ceil((AC * 1.5) + DEX_modifier)
 */
export function physicalDefense(ac: number, dexterity: number): number {
  return Math.ceil((ac + ac * 0.5) + modifierCalc(dexterity));
}

/**
 * Magic defense stat — exact port from adr_battle_make_magic_def($wis)
 * M_DEF = ceil(WIS * 1.75)
 */
export function magicDefense(wisdom: number): number {
  return Math.ceil(wisdom + wisdom * 0.75);
}

/** Roll 1d20 */
export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/** Roll NdM dice */
export function rollDice(count: number, sides: number): number[] {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
}

/** Roll 4d6 drop lowest — D&D stat rolling */
export function rollStat(): number {
  const rolls = rollDice(4, 6);
  rolls.sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
}

/** Random integer between min and max inclusive */
export function randRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Get element damage multiplier
 * Exact port from adr_battle.php element comparison logic
 */
export function getElementMultiplier(
  attackerElement: number,
  defenderElement: number,
  elements: {
    opposeStrong: number;
    opposeStrongDmg: number;
    opposeSameDmg: number;
    opposeWeak: number;
    opposeWeakDmg: number;
  },
): number {
  if (attackerElement === 0 || defenderElement === 0) return 1.0;

  // Attacker is strong against defender's weak element
  if (attackerElement === elements.opposeWeak) {
    return elements.opposeStrongDmg / 100;
  }
  // Same element
  if (attackerElement === defenderElement) {
    return elements.opposeSameDmg / 100;
  }
  // Attacker is weak against defender's strong element
  if (attackerElement === elements.opposeStrong) {
    return elements.opposeWeakDmg / 100;
  }
  return 1.0;
}

/**
 * Player physical attack hit check — exact port from adr_battle.php
 * Roll: ATT + quality + 1d20 + level > DEF + level
 * Natural 1 = always miss, Natural 20 = always hit
 */
export function playerAttackRoll(
  att: number,
  quality: number,
  level: number,
  opponentDef: number,
  opponentLevel: number,
): { hit: boolean; roll: number } {
  const roll = rollD20();
  if (roll === 1) return { hit: false, roll };
  if (roll === 20) return { hit: true, roll };
  const hit = (att + quality + roll + level) > (opponentDef + opponentLevel);
  return { hit, roll };
}

/**
 * Critical hit check — exact port from adr_battle_make_crit_roll()
 * Threat on roll >= threatRange, then confirm with second roll
 * Confirmed crit = 2x damage multiplier
 */
export function critConfirm(
  att: number,
  quality: number,
  level: number,
  opponentDef: number,
  opponentLevel: number,
  threatRange: number,
): boolean {
  const confirmRoll = rollD20();
  if (confirmRoll === 1) return false;
  if (confirmRoll >= threatRange) return true;
  return (att + quality + confirmRoll + level) > (opponentDef + opponentLevel);
}

/**
 * Magic attack hit check — exact port from adr_battle.php
 * Roll: 1d20 + spellPower + INT_modifier >= 11 + defender_WIS_modifier
 * Natural 1 = miss, Natural 20 = hit
 */
export function magicAttackRoll(
  spellPower: number,
  attackerInt: number,
  defenderWis: number,
): { hit: boolean; roll: number } {
  const roll = rollD20();
  if (roll === 1) return { hit: false, roll };
  if (roll === 20) return { hit: true, roll };
  const magicCheck = Math.ceil(roll + spellPower + modifierCalc(attackerInt));
  const fortSave = 11 + modifierCalc(defenderWis);
  return { hit: magicCheck >= fortSave, roll };
}

/**
 * Monster physical attack hit check — exact port
 * Roll: monster_ATT + 1d20 >= player_DEF + DEX_modifier
 */
export function monsterAttackRoll(
  monsterAtt: number,
  playerDef: number,
  playerDex: number,
): { hit: boolean; roll: number } {
  const roll = rollD20();
  if (roll === 1) return { hit: false, roll };
  if (roll === 20) return { hit: true, roll };
  const hit = (monsterAtt + roll) >= (playerDef + modifierCalc(playerDex));
  return { hit, roll };
}

/**
 * Monster AI decision — exact port
 * 20% magic (roll > 16) if has MP >= mpPower
 */
export function monsterDecision(monsterMp: number, monsterMpPower: number): 'physical' | 'magic' {
  if (monsterMp <= 0 || monsterMp < monsterMpPower) return 'physical';
  const roll = rollD20();
  return roll > 16 ? 'magic' : 'physical';
}

/**
 * Flee check — exact port from adr_battle.php
 * Player 1d20 vs monster 1d20
 * Natural 1 = fail, Natural 20 = success, otherwise higher wins
 */
export function fleeCheck(): { success: boolean; playerRoll: number; monsterRoll: number } {
  const playerRoll = rollD20();
  const monsterRoll = rollD20();

  if (playerRoll === 20) return { success: true, playerRoll, monsterRoll };
  if (playerRoll === 1) return { success: false, playerRoll, monsterRoll };

  return { success: playerRoll > monsterRoll, playerRoll, monsterRoll };
}

/**
 * Monster level scaling — exact port (battle_calc_type == 1, Xanathis method)
 * modifier = ((battleMonsterStatsModifier - 100) / 100) * (playerLevel - monsterLevel) + 1
 * Default battleMonsterStatsModifier = 150
 */
export function monsterScaling(
  playerLevel: number,
  monsterLevel: number,
  statsModifier: number = 150,
  calcType: number = 1,
): number {
  if (monsterLevel >= playerLevel) return 1;

  if (calcType === 1) {
    // Xanathis method (default)
    return ((statsModifier - 100) / 100) * (playerLevel - monsterLevel) + 1;
  } else {
    // Original method
    return (statsModifier / 100) * (playerLevel - monsterLevel);
  }
}

/**
 * Calculate battle rewards — exact port from adr_battle.php victory section
 * XP: rand(10,40) normally; (levelDiff * 120/100) if monster 2+ levels higher
 * Gold: same formula
 * SP: from monster record
 */
export function calculateRewards(
  monsterLevel: number,
  playerLevel: number,
  monsterSp: number,
  config: {
    baseExpMin: number;
    baseExpMax: number;
    baseExpModifier: number;
    baseRewardMin: number;
    baseRewardMax: number;
    baseRewardModifier: number;
  },
): { xp: number; gold: number; sp: number } {
  const levelDiff = monsterLevel - playerLevel;

  let xp: number;
  if (levelDiff > 1) {
    xp = Math.floor((levelDiff * config.baseExpModifier) / 100);
  } else {
    xp = randRange(config.baseExpMin, config.baseExpMax);
  }

  let gold: number;
  if (levelDiff > 1) {
    gold = Math.floor((levelDiff * config.baseRewardModifier) / 100);
  } else {
    gold = randRange(config.baseRewardMin, config.baseRewardMax);
  }

  return { xp: Math.max(1, xp), gold: Math.max(1, gold), sp: monsterSp };
}

/**
 * Monster damage calculation — exact port
 * Base: monsterLevel * rand(1,3)
 * If defending: halved
 * Physical: (base/2) + STR_modifier
 * Magic: base + mpPower_modifier
 */
export function monsterDamage(
  monsterLevel: number,
  isDefending: boolean,
  attackType: 'physical' | 'magic',
  monsterStr: number,
  mpPower: number,
): number {
  let basePower = monsterLevel * randRange(1, 3);
  if (isDefending) {
    basePower = Math.floor(basePower / 2);
  }

  let damage: number;
  if (attackType === 'physical') {
    damage = Math.ceil(basePower / 2) + modifierCalc(monsterStr);
  } else {
    damage = Math.ceil(basePower) + modifierCalc(mpPower);
  }

  return Math.max(damage < 1 ? randRange(1, 3) : damage, 1);
}

/**
 * Initiative roll — exact port
 * Player: 1d20 + DEX_modifier
 * Monster: 1d20 + monster_DEX_modifier (temp = 10 + rand(1, monster_level) * 2)
 */
export function initiativeRoll(
  playerDex: number,
  monsterLevel: number,
): { playerFirst: boolean; playerRoll: number; monsterRoll: number } {
  const monsterDex = 10 + randRange(1, monsterLevel) * 2;
  const playerRoll = rollD20() + modifierCalc(playerDex);
  const monsterRoll = rollD20() + modifierCalc(monsterDex);
  return {
    playerFirst: playerRoll >= monsterRoll,
    playerRoll,
    monsterRoll,
  };
}
