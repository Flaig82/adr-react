// Character-related types — mirrors phpbb_adr_characters, races, classes, elements, alignments

export interface Character {
  id: number;
  userId: number;
  name: string;

  // Core attributes (D&D-style, 3-20 range)
  might: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;

  // Derived stats
  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;
  sp: number; // Skill points
  ac: number; // Armor class (from equipment)

  // Progression
  level: number;
  xp: number;

  // Classification
  raceId: number;
  classId: number;
  elementId: number;
  alignmentId: number;

  // Economy
  gold: number;

  // Equipment slot item IDs (0 = empty)
  equipWeapon: number;
  equipArmor: number;
  equipShield: number;
  equipHelm: number;
  equipGloves: number;
  equipAmulet: number;
  equipRing: number;
  equipMagicAttack: number;
  equipMagicDefense: number;

  // Skills (0 = not learned, 1+ = skill level)
  skillMining: number;
  skillStonecutting: number;
  skillForge: number;
  skillEnchantment: number;
  skillTrading: number;
  skillThief: number;

  // Daily counters (reset each day)
  battleCount: number;
  skillCount: number;
  tradingCount: number;
  thiefCount: number;

  // Status
  isBattling: boolean;
  isDead: boolean;
  createdAt: string;
}

export interface Race {
  id: number;
  name: string;
  image: string;
  mightBonus: number;
  dexterityBonus: number;
  constitutionBonus: number;
  intelligenceBonus: number;
  wisdomBonus: number;
  charismaBonus: number;
  hpBonus: number;
  mpBonus: number;
}

export interface CharacterClass {
  id: number;
  name: string;
  image: string;
  description: string;
  mightBonus: number;
  dexterityBonus: number;
  constitutionBonus: number;
  intelligenceBonus: number;
  wisdomBonus: number;
  charismaBonus: number;
  hpBonus: number;
  mpBonus: number;
  selectable: boolean; // Some classes (e.g. Sorcerer) are non-selectable
}

export interface Element {
  id: number;
  name: string;
  image: string;
  level: number; // 0 = base, 2 = strongest (Holy)
}

export interface Alignment {
  id: number;
  name: string;
  image: string;
}

export interface StatRoll {
  might: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CharacterCreateRequest {
  name: string;
  raceId: number;
  classId: number;
  elementId: number;
  alignmentId: number;
  stats: StatRoll;
}
