import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

// ─── Constants (from game_config / adr_general) ─────────────────────────────

const TRAINING_CHARAC_COST = 3000;  // Gold per stat point = currentStat × this
const TRAINING_SKILL_COST = 1000;   // SP cost per skill level (not used — we use requiredSp from skills table)
const TRAINING_CHANGE_COST = 100;   // Gold to change class
const TEMPLE_HEAL_COST = 100;       // Gold per level to heal
const TEMPLE_RESURRECT_COST = 300;  // Gold per level to resurrect

const DEFAULT_BATTLE_LIMIT = 20;
const DEFAULT_SKILL_LIMIT = 30;
const DEFAULT_TRADING_LIMIT = 30;
const DEFAULT_THIEF_LIMIT = 10;
const LIMIT_REGEN_SECONDS = 86400;  // 24 hours

// Skill DB field mapping
const SKILL_FIELDS = {
  1: { level: 'skillMining', uses: 'skillMiningUses' },
  2: { level: 'skillStone', uses: 'skillStoneUses' },
  3: { level: 'skillForge', uses: 'skillForgeUses' },
  4: { level: 'skillEnchantment', uses: 'skillEnchantmentUses' },
  5: { level: 'skillTrading', uses: 'skillTradingUses' },
  6: { level: 'skillThief', uses: 'skillThiefUses' },
} as const;

// ─── Helper: Check and reset daily limits ───────────────────────────────────

function checkAndResetLimits(char: any): any {
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - (char.limitUpdate || 0);

  if (elapsed >= LIMIT_REGEN_SECONDS) {
    // Reset all limits
    const updates = {
      battleLimit: DEFAULT_BATTLE_LIMIT,
      skillLimit: DEFAULT_SKILL_LIMIT,
      tradingLimit: DEFAULT_TRADING_LIMIT,
      thiefLimit: DEFAULT_THIEF_LIMIT,
      limitUpdate: now,
    };

    db.update(schema.characters).set(updates)
      .where(eq(schema.characters.userId, char.userId)).run();

    return { ...char, ...updates };
  }

  return char;
}

// ─── Get Town Status ────────────────────────────────────────────────────────

export function getTownStatus(userId: number) {
  const rawChar = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!rawChar) throw new Error('No character found');

  // Check and reset daily limits
  const char = checkAndResetLimits(rawChar);

  // Get all skills (definitions)
  const allSkills = db.select().from(schema.skills).all();

  // Get available classes for class change
  const allClasses = db.select().from(schema.classes)
    .where(eq(schema.classes.selectable, 1)).all();

  // Current class
  const currentClass = db.select().from(schema.classes)
    .where(eq(schema.classes.id, char.classId)).get();

  // Character skill data
  const characterSkills = allSkills.map(skill => {
    const fieldMap = SKILL_FIELDS[skill.id as keyof typeof SKILL_FIELDS];
    const level = fieldMap ? (char as any)[fieldMap.level] as number : 0;
    const uses = fieldMap ? (char as any)[fieldMap.uses] as number : 0;

    return {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      requiredSp: skill.requiredSp,
      image: skill.image,
      learned: level > 0,
      level,
      uses,
    };
  });

  // Temple costs
  const healCost = TEMPLE_HEAL_COST * char.level;
  const resurrectCost = TEMPLE_RESURRECT_COST * char.level;

  // Stat training costs (cost = currentStat × multiplier)
  const stats = [
    { key: 'might', label: 'Might', value: char.might, cost: char.might * TRAINING_CHARAC_COST },
    { key: 'dexterity', label: 'Dexterity', value: char.dexterity, cost: char.dexterity * TRAINING_CHARAC_COST },
    { key: 'constitution', label: 'Constitution', value: char.constitution, cost: char.constitution * TRAINING_CHARAC_COST },
    { key: 'intelligence', label: 'Intelligence', value: char.intelligence, cost: char.intelligence * TRAINING_CHARAC_COST },
    { key: 'wisdom', label: 'Wisdom', value: char.wisdom, cost: char.wisdom * TRAINING_CHARAC_COST },
    { key: 'charisma', label: 'Charisma', value: char.charisma, cost: char.charisma * TRAINING_CHARAC_COST },
  ];

  // Calculate next limit reset time
  const nextReset = (char.limitUpdate || 0) + LIMIT_REGEN_SECONDS;

  return {
    character: {
      name: char.name,
      level: char.level,
      gold: char.gold,
      sp: char.sp,
      hp: char.hp,
      hpMax: char.hpMax,
      mp: char.mp,
      mpMax: char.mpMax,
      isDead: char.isDead === 1,
      classId: char.classId,
      className: currentClass?.name || 'Unknown',
    },
    stats,
    skills: characterSkills,
    temple: {
      healCost,
      resurrectCost,
      canHeal: !char.isDead && char.hp < char.hpMax && char.gold >= healCost,
      canResurrect: (char.isDead === 1 || char.hp <= 0) && char.gold >= resurrectCost,
      needsHeal: char.hp < char.hpMax,
      needsResurrect: char.isDead === 1 || char.hp <= 0,
    },
    limits: {
      battle: char.battleLimit,
      battleMax: DEFAULT_BATTLE_LIMIT,
      skill: char.skillLimit,
      skillMax: DEFAULT_SKILL_LIMIT,
      trading: char.tradingLimit,
      tradingMax: DEFAULT_TRADING_LIMIT,
      thief: char.thiefLimit,
      thiefMax: DEFAULT_THIEF_LIMIT,
      nextReset,
    },
    classes: allClasses.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      image: c.image,
      mightReq: c.mightReq,
      dexterityReq: c.dexterityReq,
      constitutionReq: c.constitutionReq,
      intelligenceReq: c.intelligenceReq,
      wisdomReq: c.wisdomReq,
      charismaReq: c.charismaReq,
      baseHp: c.baseHp,
      baseMp: c.baseMp,
      baseAc: c.baseAc,
      updateHp: c.updateHp,
      updateMp: c.updateMp,
      updateAc: c.updateAc,
      isCurrent: c.id === char.classId,
      meetsRequirements:
        char.might >= c.mightReq &&
        char.dexterity >= c.dexterityReq &&
        char.constitution >= c.constitutionReq &&
        char.intelligence >= c.intelligenceReq &&
        char.wisdom >= c.wisdomReq &&
        char.charisma >= c.charismaReq,
    })),
    classChangeCost: TRAINING_CHANGE_COST,
  };
}

// ─── Train Stat ─────────────────────────────────────────────────────────────

export function trainStat(userId: number, stat: string) {
  const validStats = ['might', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  if (!validStats.includes(stat)) {
    throw new Error(`Invalid stat: ${stat}. Must be one of: ${validStats.join(', ')}`);
  }

  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');

  const currentValue = (char as any)[stat] as number;
  const cost = currentValue * TRAINING_CHARAC_COST;

  if (char.gold < cost) {
    throw new Error(`Not enough gold! Need ${cost}g, have ${char.gold}g`);
  }

  // No upper limit in the original PHP — but we'll cap at a reasonable max
  const MAX_STAT = 99;
  if (currentValue >= MAX_STAT) {
    throw new Error(`${stat} is already at maximum (${MAX_STAT})`);
  }

  // Update stat and deduct gold
  const updates: any = {
    gold: char.gold - cost,
    [stat]: currentValue + 1,
  };

  // If constitution increases, recalculate HP
  if (stat === 'constitution') {
    const hpBonus = 1; // +1 HP per constitution point
    updates.hpMax = char.hpMax + hpBonus;
    updates.hp = char.hp + hpBonus;
  }

  // If intelligence increases, recalculate MP
  if (stat === 'intelligence') {
    const mpBonus = 1; // +1 MP per intelligence point
    updates.mpMax = char.mpMax + mpBonus;
    updates.mp = char.mp + mpBonus;
  }

  db.update(schema.characters).set(updates)
    .where(eq(schema.characters.userId, userId)).run();

  return {
    stat,
    oldValue: currentValue,
    newValue: currentValue + 1,
    cost,
    gold: char.gold - cost,
    hpMax: updates.hpMax || char.hpMax,
    mpMax: updates.mpMax || char.mpMax,
    message: `Trained ${stat} from ${currentValue} to ${currentValue + 1} for ${cost}g!`,
  };
}

// ─── Learn Skill ────────────────────────────────────────────────────────────

export function learnSkill(userId: number, skillId: number) {
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');

  // Validate skill exists
  const skill = db.select().from(schema.skills)
    .where(eq(schema.skills.id, skillId)).get();
  if (!skill) throw new Error('Skill not found');

  // Check if already learned
  const fieldMap = SKILL_FIELDS[skillId as keyof typeof SKILL_FIELDS];
  if (!fieldMap) throw new Error('Invalid skill');

  const currentLevel = (char as any)[fieldMap.level] as number;
  if (currentLevel > 0) {
    throw new Error(`You already know ${skill.name}!`);
  }

  // Check SP requirement
  if (char.sp < skill.requiredSp) {
    throw new Error(`Not enough SP! Need ${skill.requiredSp} SP, have ${char.sp} SP`);
  }

  // Learn the skill (set level to 1, deduct SP)
  const updates: any = {
    sp: char.sp - skill.requiredSp,
    [fieldMap.level]: 1,
    [fieldMap.uses]: 0,
  };

  db.update(schema.characters).set(updates)
    .where(eq(schema.characters.userId, userId)).run();

  return {
    skillId,
    skillName: skill.name,
    spCost: skill.requiredSp,
    sp: char.sp - skill.requiredSp,
    message: `Learned ${skill.name} for ${skill.requiredSp} SP!`,
  };
}

// ─── Change Class ───────────────────────────────────────────────────────────

export function changeClass(userId: number, classId: number) {
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');

  if (char.classId === classId) {
    throw new Error('You are already that class!');
  }

  // Validate class exists and is selectable
  const newClass = db.select().from(schema.classes)
    .where(eq(schema.classes.id, classId)).get();
  if (!newClass) throw new Error('Class not found');
  if (newClass.selectable !== 1) throw new Error('That class is not available');

  // Check stat requirements
  if (char.might < newClass.mightReq) throw new Error(`Requires ${newClass.mightReq} Might (you have ${char.might})`);
  if (char.dexterity < newClass.dexterityReq) throw new Error(`Requires ${newClass.dexterityReq} Dexterity (you have ${char.dexterity})`);
  if (char.constitution < newClass.constitutionReq) throw new Error(`Requires ${newClass.constitutionReq} Constitution (you have ${char.constitution})`);
  if (char.intelligence < newClass.intelligenceReq) throw new Error(`Requires ${newClass.intelligenceReq} Intelligence (you have ${char.intelligence})`);
  if (char.wisdom < newClass.wisdomReq) throw new Error(`Requires ${newClass.wisdomReq} Wisdom (you have ${char.wisdom})`);
  if (char.charisma < newClass.charismaReq) throw new Error(`Requires ${newClass.charismaReq} Charisma (you have ${char.charisma})`);

  // Check gold
  if (char.gold < TRAINING_CHANGE_COST) {
    throw new Error(`Not enough gold! Need ${TRAINING_CHANGE_COST}g, have ${char.gold}g`);
  }

  // Get old class for HP/MP/AC recalculation
  const oldClass = db.select().from(schema.classes)
    .where(eq(schema.classes.id, char.classId)).get();

  // Recalculate HP and MP based on new class
  // Remove old class contributions and add new ones
  const oldHpContrib = (oldClass?.baseHp || 0) + (oldClass?.updateHp || 0) * (char.level - 1);
  const newHpContrib = newClass.baseHp + newClass.updateHp * (char.level - 1);
  const hpDiff = newHpContrib - oldHpContrib;

  const oldMpContrib = (oldClass?.baseMp || 0) + (oldClass?.updateMp || 0) * (char.level - 1);
  const newMpContrib = newClass.baseMp + newClass.updateMp * (char.level - 1);
  const mpDiff = newMpContrib - oldMpContrib;

  const oldAcContrib = (oldClass?.baseAc || 0) + (oldClass?.updateAc || 0) * (char.level - 1);
  const newAcContrib = newClass.baseAc + newClass.updateAc * (char.level - 1);
  const acDiff = newAcContrib - oldAcContrib;

  const newHpMax = Math.max(1, char.hpMax + hpDiff);
  const newMpMax = Math.max(0, char.mpMax + mpDiff);
  const newAc = Math.max(0, char.ac + acDiff);

  db.update(schema.characters).set({
    classId,
    gold: char.gold - TRAINING_CHANGE_COST,
    hpMax: newHpMax,
    hp: Math.min(char.hp, newHpMax),
    mpMax: newMpMax,
    mp: Math.min(char.mp, newMpMax),
    ac: newAc,
  }).where(eq(schema.characters.userId, userId)).run();

  return {
    oldClass: oldClass?.name || 'Unknown',
    newClass: newClass.name,
    cost: TRAINING_CHANGE_COST,
    gold: char.gold - TRAINING_CHANGE_COST,
    hpMax: newHpMax,
    mpMax: newMpMax,
    ac: newAc,
    message: `Changed class from ${oldClass?.name || 'Unknown'} to ${newClass.name} for ${TRAINING_CHANGE_COST}g!`,
  };
}

// ─── Temple Heal ────────────────────────────────────────────────────────────

export function templeHeal(userId: number) {
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');

  if (char.isDead === 1 || char.hp <= 0) {
    throw new Error('Your character is dead! You need to resurrect first.');
  }

  if (char.hp >= char.hpMax && char.mp >= char.mpMax) {
    throw new Error('Already at full health and mana!');
  }

  const cost = TEMPLE_HEAL_COST * char.level;
  if (char.gold < cost) {
    throw new Error(`Not enough gold! Need ${cost}g, have ${char.gold}g`);
  }

  db.update(schema.characters).set({
    hp: char.hpMax,
    mp: char.mpMax,
    gold: char.gold - cost,
  }).where(eq(schema.characters.userId, userId)).run();

  return {
    hp: char.hpMax,
    hpMax: char.hpMax,
    mp: char.mpMax,
    mpMax: char.mpMax,
    cost,
    gold: char.gold - cost,
    message: `Healed to full health for ${cost}g! HP: ${char.hpMax}/${char.hpMax}, MP: ${char.mpMax}/${char.mpMax}`,
  };
}

// ─── Temple Resurrect ───────────────────────────────────────────────────────

export function templeResurrect(userId: number) {
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');

  if (char.isDead !== 1 && char.hp > 0) {
    throw new Error('Your character is alive!');
  }

  const cost = TEMPLE_RESURRECT_COST * char.level;
  if (char.gold < cost) {
    throw new Error(`Not enough gold! Need ${cost}g, have ${char.gold}g`);
  }

  const restoredHp = Math.ceil(char.hpMax / 2);
  const restoredMp = Math.ceil(char.mpMax / 2);

  db.update(schema.characters).set({
    hp: restoredHp,
    mp: restoredMp,
    isDead: 0,
    gold: char.gold - cost,
  }).where(eq(schema.characters.userId, userId)).run();

  return {
    hp: restoredHp,
    hpMax: char.hpMax,
    mp: restoredMp,
    mpMax: char.mpMax,
    cost,
    gold: char.gold - cost,
    message: `Resurrected for ${cost}g! HP: ${restoredHp}/${char.hpMax}, MP: ${restoredMp}/${char.mpMax}`,
  };
}
