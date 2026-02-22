import { eq, and, lte } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import {
  physicalAttack, physicalDefense, magicAttack, magicDefense,
  modifierCalc, rollD20, randRange,
  playerAttackRoll, critConfirm, monsterAttackRoll, magicAttackRoll,
  monsterDecision, monsterDamage, fleeCheck, initiativeRoll,
  monsterScaling, calculateRewards, getElementMultiplier,
} from '@adr/shared';
import { shouldLevelUp, xpForLevel, hpGainOnLevelUp, mpGainOnLevelUp } from '@adr/shared';
import { calculateEquipmentBonuses, decrementDurability } from './inventoryService.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BattleStartResult {
  battleId: number;
  monster: {
    id: number;
    name: string;
    image: string;
    level: number;
    hp: number;
    hpMax: number;
    mp: number;
    mpMax: number;
    elementId: number;
    customSpell: string;
  };
  player: {
    hp: number;
    hpMax: number;
    mp: number;
    mpMax: number;
    att: number;
    def: number;
    magicAtt: number;
    magicDef: number;
  };
  playerFirst: boolean;
  round: number;
}

export interface TurnResult {
  round: number;
  playerAction: string;
  messages: string[];
  playerHp: number;
  playerMp: number;
  playerHpMax: number;
  playerMpMax: number;
  monsterHp: number;
  monsterMp: number;
  monsterHpMax: number;
  monsterMpMax: number;
  battleOver: boolean;
  result: 'ongoing' | 'victory' | 'defeat' | 'fled';
  rewards?: { xp: number; gold: number; sp: number; leveledUp: boolean; newLevel?: number };
}

// ─── Start Battle ────────────────────────────────────────────────────────────

export function startBattle(userId: number): BattleStartResult {
  // Get character
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId))
    .get();

  if (!char) throw new Error('No character found');
  if (char.isDead) throw new Error('Your character is dead! Visit the temple to resurrect.');
  if (char.isBattling) throw new Error('Already in battle!');
  if (char.battleLimit < 1) throw new Error('No battles remaining today!');
  if (char.hp <= 0) throw new Error('You have no HP! Visit the temple to heal.');

  // Pick a random monster <= player level
  const monstersAvail = db.select().from(schema.monsters)
    .where(lte(schema.monsters.level, char.level))
    .all();

  if (monstersAvail.length === 0) throw new Error('No suitable monsters found');

  const monster = monstersAvail[Math.floor(Math.random() * monstersAvail.length)];

  // Scale monster stats if lower level
  const scaling = monsterScaling(char.level, monster.level, 150, 1);
  const scaledHp = Math.ceil(monster.hp * scaling);
  const scaledMp = Math.ceil(monster.mp * scaling);
  const scaledAtt = Math.ceil(monster.attack * scaling);
  const scaledDef = Math.ceil(monster.defense * scaling);
  const scaledMa = Math.ceil(monster.magicAttack * scaling);
  const scaledMd = Math.ceil(monster.magicResistance * scaling);
  const scaledSp = Math.ceil(monster.sp * scaling);

  // Calculate player combat stats with equipment bonuses
  const equip = calculateEquipmentBonuses(userId);

  const att = physicalAttack(char.might, char.constitution);
  const def = physicalDefense(char.ac, char.dexterity) + equip.defBonus;
  const mAtt = magicAttack(char.intelligence) + equip.magicAttBonus;
  const mDef = magicDefense(char.wisdom) + equip.magicDefBonus;

  // Initiative roll
  const init = initiativeRoll(char.dexterity, monster.level);

  // Decrement battle limit, set battling flag, and decrement equipment durability
  db.update(schema.characters).set({
    battleLimit: char.battleLimit - 1,
    isBattling: 1,
  }).where(eq(schema.characters.userId, userId)).run();

  decrementDurability(userId);

  // Insert battle record
  const result = db.insert(schema.battles).values({
    type: 0, // PvE
    turn: init.playerFirst ? 1 : 2,
    result: 0, // in progress
    log: '[]',
    startTime: Math.floor(Date.now() / 1000),
    challengerId: userId,
    challengerHp: equip.hpRegen, // HP regen per turn from amulet
    challengerMp: equip.mpRegen, // MP regen per turn from ring
    challengerAtt: att,
    challengerDef: def,
    challengerMagicAttack: mAtt,
    challengerMagicResistance: mDef,
    challengerElement: char.elementId,
    opponentId: monster.id,
    opponentHp: scaledHp,
    opponentHpMax: scaledHp,
    opponentMp: scaledMp,
    opponentMpMax: scaledMp,
    opponentAtt: scaledAtt,
    opponentDef: scaledDef,
    opponentMagicAttack: scaledMa,
    opponentMagicResistance: scaledMd,
    opponentElement: monster.elementId,
    opponentSp: scaledSp,
  }).run();

  const battleId = Number(result.lastInsertRowid);

  return {
    battleId,
    monster: {
      id: monster.id,
      name: monster.name,
      image: monster.image,
      level: monster.level,
      hp: scaledHp,
      hpMax: scaledHp,
      mp: scaledMp,
      mpMax: scaledMp,
      elementId: monster.elementId,
      customSpell: monster.customSpell,
    },
    player: {
      hp: char.hp,
      hpMax: char.hpMax,
      mp: char.mp,
      mpMax: char.mpMax,
      att,
      def,
      magicAtt: mAtt,
      magicDef: mDef,
    },
    playerFirst: init.playerFirst,
    round: 0,
  };
}

// ─── Process Turn ────────────────────────────────────────────────────────────

export function processTurn(
  userId: number,
  battleId: number,
  action: 'attack' | 'defend' | 'flee',
): TurnResult {
  // Get battle state
  const battle = db.select().from(schema.battles)
    .where(and(eq(schema.battles.id, battleId), eq(schema.battles.challengerId, userId)))
    .get();

  if (!battle) throw new Error('Battle not found');
  if (battle.result !== 0) throw new Error('Battle is already over');

  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId))
    .get();

  if (!char) throw new Error('Character not found');

  const monster = db.select().from(schema.monsters)
    .where(eq(schema.monsters.id, battle.opponentId))
    .get();

  if (!monster) throw new Error('Monster not found');

  // Get element data for damage calculations
  const monsterElement = db.select().from(schema.elements)
    .where(eq(schema.elements.id, battle.opponentElement))
    .get();

  const playerElement = db.select().from(schema.elements)
    .where(eq(schema.elements.id, battle.challengerElement))
    .get();

  const messages: string[] = [];
  let currentMonsterHp = battle.opponentHp;
  let currentMonsterMp = battle.opponentMp;
  let currentPlayerHp = char.hp;
  let currentPlayerMp = char.mp;
  let isDefending = false;
  let round = battle.turn === 1 ? (battle as any).turn : battle.turn; // current state

  // ─── PLAYER ACTION ───────────────────────────────────────────────

  if (action === 'flee') {
    const flee = fleeCheck();
    if (flee.success) {
      // End battle — fled
      db.update(schema.battles).set({
        result: 3,
        finishTime: Math.floor(Date.now() / 1000),
      }).where(eq(schema.battles.id, battleId)).run();

      db.update(schema.characters).set({
        flees: char.flees + 1,
        isBattling: 0,
      }).where(eq(schema.characters.userId, userId)).run();

      messages.push(`${char.name} successfully fled from ${monster.name}!`);

      return {
        round: battle.turn,
        playerAction: 'flee',
        messages,
        playerHp: currentPlayerHp,
        playerMp: currentPlayerMp,
        playerHpMax: char.hpMax,
        playerMpMax: char.mpMax,
        monsterHp: currentMonsterHp,
        monsterMp: currentMonsterMp,
        monsterHpMax: battle.opponentHpMax,
        monsterMpMax: battle.opponentMpMax,
        battleOver: true,
        result: 'fled',
      };
    } else {
      messages.push(`${char.name} tried to flee but failed!`);
      // Monster gets a free turn (fall through to monster section)
    }
  }

  if (action === 'attack') {
    // Get weapon stats from equipped items
    const equip = calculateEquipmentBonuses(char.userId);
    const weaponPower = equip.weaponPower > 0
      ? equip.weaponPower // Use weapon power if equipped
      : Math.max(1, Math.floor(battle.challengerAtt / 2)); // Unarmed: ATT/2
    const critRange = equip.weaponPower > 0 ? equip.weaponCritRange : 20;
    const critMod = equip.weaponPower > 0 ? equip.weaponCritMod : 2;

    const { hit, roll } = playerAttackRoll(
      battle.challengerAtt, 0, char.level, battle.opponentDef, monster.level,
    );

    if (hit) {
      let isCrit = false;
      let damage = randRange(1, weaponPower);

      // Check for crit (roll >= threat range)
      if (roll >= critRange) {
        isCrit = critConfirm(
          battle.challengerAtt, 0, char.level, battle.opponentDef, monster.level, critRange,
        );
      }

      // Element multiplier (use weapon element if available, else character element)
      const attackElement = equip.weaponElement > 0 ? equip.weaponElement : char.elementId;
      if (monsterElement) {
        const mult = getElementMultiplier(
          attackElement, battle.opponentElement,
          {
            opposeStrong: monsterElement.opposeStrong,
            opposeStrongDmg: monsterElement.opposeStrongDmg,
            opposeSameDmg: monsterElement.opposeSameDmg,
            opposeWeak: monsterElement.opposeWeak,
            opposeWeakDmg: monsterElement.opposeWeakDmg,
          },
        );
        damage = Math.ceil(damage * mult);
      }

      if (isCrit) damage *= critMod;
      damage = Math.max(1, damage < 1 ? randRange(1, 3) : damage);
      damage = Math.min(damage, currentMonsterHp);

      currentMonsterHp -= damage;

      if (isCrit) messages.push('CRITICAL HIT!');
      messages.push(`${char.name} attacks ${monster.name} for ${damage} damage!`);
    } else {
      messages.push(`${char.name} attacks ${monster.name} but misses!`);
    }
  }

  if (action === 'defend') {
    isDefending = true;
    messages.push(`${char.name} takes a defensive stance against ${monster.name}.`);
  }

  // ─── CHECK: Monster dead? ────────────────────────────────────────

  if (currentMonsterHp <= 0) {
    return handleVictory(userId, battleId, char, monster, battle, currentPlayerHp, currentPlayerMp, messages);
  }

  // ─── MONSTER TURN ────────────────────────────────────────────────

  const monsterStr = 10 + randRange(1, monster.level) * 2;
  const monsterInt = 10 + randRange(1, monster.level) * 2;
  const aiDecision = monsterDecision(currentMonsterMp, monster.mpPower);

  if (aiDecision === 'magic') {
    // Monster magic attack
    const { hit, roll: mRoll } = magicAttackRoll(monster.mpPower, monsterInt, char.wisdom);
    currentMonsterMp -= monster.mpPower;

    if (hit) {
      let damage = monsterDamage(monster.level, isDefending, 'magic', monsterStr, monster.mpPower);

      // Element multiplier (monster vs player)
      if (monsterElement && playerElement) {
        const mult = getElementMultiplier(
          battle.opponentElement, char.elementId,
          {
            opposeStrong: playerElement.opposeStrong,
            opposeStrongDmg: playerElement.opposeStrongDmg,
            opposeSameDmg: playerElement.opposeSameDmg,
            opposeWeak: playerElement.opposeWeak,
            opposeWeakDmg: playerElement.opposeWeakDmg,
          },
        );
        damage = Math.ceil(damage * mult);
      }

      if (mRoll >= 20) {
        damage *= 2;
        messages.push(`CRITICAL! ${monster.name} casts ${monster.customSpell}!`);
      } else {
        messages.push(`${monster.name} casts ${monster.customSpell}!`);
      }

      // First round protection
      if (battle.turn === 0 && (currentPlayerHp - damage) < 1) {
        damage = currentPlayerHp - 1;
      }

      damage = Math.min(Math.max(1, damage), currentPlayerHp);
      currentPlayerHp -= damage;
      messages.push(`${monster.name} deals ${damage} magic damage to ${char.name}!`);
    } else {
      messages.push(`${monster.name} tries to cast ${monster.customSpell} but fails!`);
    }
  } else {
    // Monster physical attack
    const { hit, roll: mRoll } = monsterAttackRoll(
      battle.opponentAtt, battle.challengerDef, char.dexterity,
    );

    if (hit) {
      let damage = monsterDamage(monster.level, isDefending, 'physical', monsterStr, monster.mpPower);

      if (mRoll >= 20) {
        damage *= 2;
        messages.push(`CRITICAL! ${monster.name} strikes ${char.name}!`);
      } else {
        messages.push(`${monster.name} attacks ${char.name}!`);
      }

      // First round protection
      if (battle.turn === 0 && (currentPlayerHp - damage) < 1) {
        damage = currentPlayerHp - 1;
      }

      damage = Math.min(Math.max(1, damage), currentPlayerHp);
      currentPlayerHp -= damage;
      messages.push(`${monster.name} deals ${damage} damage to ${char.name}!`);
    } else {
      messages.push(`${monster.name} attacks ${char.name} but misses!`);
    }
  }

  // ─── Update character HP/MP ──────────────────────────────────────

  db.update(schema.characters).set({
    hp: Math.max(0, currentPlayerHp),
    mp: Math.max(0, currentPlayerMp),
  }).where(eq(schema.characters.userId, userId)).run();

  // ─── CHECK: Player dead? ─────────────────────────────────────────

  if (currentPlayerHp <= 0) {
    return handleDefeat(userId, battleId, char, monster, battle, currentMonsterHp, currentMonsterMp, messages);
  }

  // ─── Update battle state ─────────────────────────────────────────

  db.update(schema.battles).set({
    turn: battle.turn + 1,
    opponentHp: currentMonsterHp,
    opponentMp: currentMonsterMp,
  }).where(eq(schema.battles.id, battleId)).run();

  return {
    round: battle.turn + 1,
    playerAction: action,
    messages,
    playerHp: currentPlayerHp,
    playerMp: currentPlayerMp,
    playerHpMax: char.hpMax,
    playerMpMax: char.mpMax,
    monsterHp: currentMonsterHp,
    monsterMp: currentMonsterMp,
    monsterHpMax: battle.opponentHpMax,
    monsterMpMax: battle.opponentMpMax,
    battleOver: false,
    result: 'ongoing',
  };
}

// ─── Victory Handler ─────────────────────────────────────────────────────────

function handleVictory(
  userId: number, battleId: number,
  char: any, monster: any, battle: any,
  playerHp: number, playerMp: number,
  messages: string[],
): TurnResult {
  // Calculate rewards
  const rewards = calculateRewards(
    monster.level, char.level, battle.opponentSp,
    {
      baseExpMin: 10, baseExpMax: 40, baseExpModifier: 120,
      baseRewardMin: 10, baseRewardMax: 40, baseRewardModifier: 120,
    },
  );

  // Both dead = player wins with 1 HP
  const finalHp = playerHp <= 0 ? 1 : playerHp;

  // Check for level up
  const newXp = char.xp + rewards.xp;
  let leveledUp = false;
  let newLevel = char.level;
  let hpBonus = 0;
  let mpBonus = 0;

  // Get class for level up bonuses
  const charClass = db.select().from(schema.classes)
    .where(eq(schema.classes.id, char.classId)).get();

  if (shouldLevelUp(char.level, newXp, 10)) {
    leveledUp = true;
    newLevel = char.level + 1;
    hpBonus = hpGainOnLevelUp(char.constitution, charClass?.updateHp || 0);
    mpBonus = mpGainOnLevelUp(char.intelligence, charClass?.updateMp || 0);
  }

  // End battle
  db.update(schema.battles).set({
    result: 1,
    opponentHp: 0,
    finishTime: Math.floor(Date.now() / 1000),
  }).where(eq(schema.battles.id, battleId)).run();

  // Update character (including gold reward)
  const updateData: any = {
    hp: finalHp,
    mp: playerMp,
    xp: newXp,
    sp: char.sp + rewards.sp,
    gold: char.gold + rewards.gold,
    victories: char.victories + 1,
    isBattling: 0,
  };

  if (leveledUp) {
    updateData.level = newLevel;
    updateData.hpMax = char.hpMax + hpBonus;
    updateData.hp = char.hpMax + hpBonus; // Full heal on level up
    updateData.mpMax = char.mpMax + mpBonus;
    updateData.mp = char.mpMax + mpBonus;
  }

  db.update(schema.characters).set(updateData)
    .where(eq(schema.characters.userId, userId)).run();

  messages.push(`${char.name} defeated ${monster.name}!`);
  messages.push(`Earned ${rewards.xp} XP, ${rewards.gold} gold, ${rewards.sp} SP!`);
  if (leveledUp) {
    messages.push(`LEVEL UP! You are now level ${newLevel}! (+${hpBonus} HP, +${mpBonus} MP)`);
  }

  return {
    round: battle.turn + 1,
    playerAction: 'attack',
    messages,
    playerHp: leveledUp ? char.hpMax + hpBonus : finalHp,
    playerMp: leveledUp ? char.mpMax + mpBonus : playerMp,
    playerHpMax: leveledUp ? char.hpMax + hpBonus : char.hpMax,
    playerMpMax: leveledUp ? char.mpMax + mpBonus : char.mpMax,
    monsterHp: 0,
    monsterMp: 0,
    monsterHpMax: battle.opponentHpMax,
    monsterMpMax: battle.opponentMpMax,
    battleOver: true,
    result: 'victory',
    rewards: { ...rewards, leveledUp, newLevel: leveledUp ? newLevel : undefined },
  };
}

// ─── Defeat Handler ──────────────────────────────────────────────────────────

function handleDefeat(
  userId: number, battleId: number,
  char: any, monster: any, battle: any,
  monsterHp: number, monsterMp: number,
  messages: string[],
): TurnResult {
  // End battle
  db.update(schema.battles).set({
    result: 2,
    finishTime: Math.floor(Date.now() / 1000),
  }).where(eq(schema.battles.id, battleId)).run();

  // Set character as dead
  db.update(schema.characters).set({
    hp: 0,
    isDead: 1,
    defeats: char.defeats + 1,
    isBattling: 0,
  }).where(eq(schema.characters.userId, userId)).run();

  messages.push(`${char.name} was defeated by ${monster.name}!`);
  messages.push('Visit the temple to resurrect.');

  return {
    round: battle.turn + 1,
    playerAction: 'attack',
    messages,
    playerHp: 0,
    playerMp: char.mp,
    playerHpMax: char.hpMax,
    playerMpMax: char.mpMax,
    monsterHp,
    monsterMp,
    monsterHpMax: battle.opponentHpMax,
    monsterMpMax: battle.opponentMpMax,
    battleOver: true,
    result: 'defeat',
  };
}

// ─── Get Current Battle ──────────────────────────────────────────────────────

export function getCurrentBattle(userId: number) {
  const battle = db.select().from(schema.battles)
    .where(and(
      eq(schema.battles.challengerId, userId),
      eq(schema.battles.result, 0),
      eq(schema.battles.type, 0),
    )).get();

  if (!battle) return null;

  const monster = db.select().from(schema.monsters)
    .where(eq(schema.monsters.id, battle.opponentId)).get();

  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();

  if (!monster || !char) return null;

  return {
    battleId: battle.id,
    monster: {
      id: monster.id,
      name: monster.name,
      image: monster.image,
      level: monster.level,
      hp: battle.opponentHp,
      hpMax: battle.opponentHpMax,
      mp: battle.opponentMp,
      mpMax: battle.opponentMpMax,
      elementId: monster.elementId,
      customSpell: monster.customSpell,
    },
    player: {
      hp: char.hp,
      hpMax: char.hpMax,
      mp: char.mp,
      mpMax: char.mpMax,
      att: battle.challengerAtt,
      def: battle.challengerDef,
      magicAtt: battle.challengerMagicAttack,
      magicDef: battle.challengerMagicResistance,
    },
    round: battle.turn,
  };
}

// ─── Temple: Heal & Resurrect ────────────────────────────────────────────────

export function templeHeal(userId: number): { hp: number; hpMax: number; cost: number; gold: number } {
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character');

  const cost = 100; // temple_heal_cost
  if (char.hp >= char.hpMax) throw new Error('Already at full health');
  if (char.gold < cost) throw new Error(`Not enough gold! Need ${cost}g, have ${char.gold}g`);

  db.update(schema.characters).set({
    hp: char.hpMax,
    mp: char.mpMax,
    gold: char.gold - cost,
  }).where(eq(schema.characters.userId, userId)).run();

  return { hp: char.hpMax, hpMax: char.hpMax, cost, gold: char.gold - cost };
}

export function templeResurrect(userId: number): { hp: number; cost: number; gold: number } {
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character');
  if (!char.isDead && char.hp > 0) throw new Error('Your character is alive');

  const cost = 300; // temple_resurrect_cost
  if (char.gold < cost) throw new Error(`Not enough gold! Need ${cost}g, have ${char.gold}g`);

  db.update(schema.characters).set({
    hp: Math.ceil(char.hpMax / 2),
    mp: Math.ceil(char.mpMax / 2),
    isDead: 0,
    gold: char.gold - cost,
  }).where(eq(schema.characters.userId, userId)).run();

  return { hp: Math.ceil(char.hpMax / 2), cost, gold: char.gold - cost };
}
