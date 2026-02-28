import {
  DEFAULT_CONFIG,
  ITEM_TYPES,
  QUALITY_TIERS,
  calculateInterest,
  calculateRewards,
  canStealFromShop,
  hpGainOnLevelUp,
  miningResult,
  miningSuccess,
  mpGainOnLevelUp,
  repairCost,
  rollStat,
  shouldLevelUp,
  startingHp,
  startingMp,
  stockPriceChange,
  stoneCuttingSuccess,
  tradingModifier,
} from '@adr/shared';

type BattleAction = 'attack' | 'defend' | 'flee';

type Race = {
  id: number;
  name: string;
  description: string;
  mightBonus: number;
  dexterityBonus: number;
  constitutionBonus: number;
  intelligenceBonus: number;
  wisdomBonus: number;
  charismaBonus: number;
  mightMalus: number;
  dexterityMalus: number;
  constitutionMalus: number;
  intelligenceMalus: number;
  wisdomMalus: number;
  charismaMalus: number;
};

type ClassDef = {
  id: number;
  name: string;
  description: string;
  selectable: number;
  baseHp: number;
  baseMp: number;
  baseAc: number;
  updateHp: number;
  updateMp: number;
  updateAc: number;
  mightReq: number;
  dexterityReq: number;
  constitutionReq: number;
  intelligenceReq: number;
  wisdomReq: number;
  charismaReq: number;
};

type Element = {
  id: number;
  name: string;
  description: string;
  color: string;
};

type Alignment = {
  id: number;
  name: string;
  description: string;
};

type User = {
  id: number;
  username: string;
  password: string;
  createdAt: string;
};

type Character = {
  id: number;
  userId: number;
  name: string;
  level: number;
  xp: number;
  sp: number;
  gold: number;
  might: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;
  ac: number;
  raceId: number;
  classId: number;
  elementId: number;
  alignmentId: number;
  victories: number;
  defeats: number;
  flees: number;
  victoriesPvp: number;
  defeatsPvp: number;
  isDead: number;
  isBattling: number;
  battleLimit: number;
  skillLimit: number;
  tradingLimit: number;
  thiefLimit: number;
  limitUpdate: number;
  skillMining: number;
  skillStone: number;
  skillForge: number;
  skillEnchantment: number;
  skillTrading: number;
  skillThief: number;
  skillMiningUses: number;
  skillStoneUses: number;
  skillForgeUses: number;
  skillEnchantmentUses: number;
  skillTradingUses: number;
  skillThiefUses: number;
  equipWeapon: number;
  equipArmor: number;
  equipShield: number;
  equipHelm: number;
  equipGloves: number;
  equipAmulet: number;
  equipRing: number;
  equipMagicAttack: number;
  equipMagicDefense: number;
};

type ItemTemplate = {
  id: number;
  name: string;
  description: string;
  typeId: number;
  qualityId: number;
  power: number;
  addPower: number;
  weight: number;
  durationMax: number;
  price: number;
  bonusMight: number;
  bonusDexterity: number;
  bonusConstitution: number;
  bonusIntelligence: number;
  bonusWisdom: number;
  bonusCharisma: number;
  bonusHp: number;
  bonusMp: number;
  bonusAc: number;
  elementId: number;
  critHit: number;
  critHitMod: number;
  sellBackPercentage: number;
  restrictLevel: number;
  image: string;
};

type ItemInstance = ItemTemplate & {
  id: number;
  ownerId: number;
  duration: number;
  equipped: number;
};

type Shop = {
  id: number;
  name: string;
  description: string;
  itemTemplateIds: number[];
};

type Monster = {
  id: number;
  name: string;
  image: string;
  level: number;
  hp: number;
  mp: number;
  attack: number;
  defense: number;
  sp: number;
  elementId: number;
  customSpell: string;
};

type ActiveBattle = {
  battleId: number;
  userId: number;
  turn: number;
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
    attack: number;
    defense: number;
    sp: number;
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
    hpRegen: number;
    mpRegen: number;
  };
};

type VaultAccount = {
  userId: number;
  balance: number;
  lastInterestTime: number;
  loanAmount: number;
  loanInterestTime: number;
};

type Stock = {
  id: number;
  name: string;
  currentPrice: number;
  previousPrice: number;
  minPrice: number;
  maxPrice: number;
};

type StockHolding = {
  id: number;
  userId: number;
  stockId: number;
  shares: number;
  purchasePrice: number;
};

type ChatMessage = {
  id: number;
  userId: number;
  username: string;
  message: string;
  createdAt: string;
};

type JailRecord = {
  id: number;
  userId: number;
  reason: string;
  jailedAt: string;
  releaseAt: string;
  bailCost: number;
  released: number;
  releasedAt: string;
  status: string;
};

type DemoState = {
  users: User[];
  currentUserId: number | null;
  characters: Character[];
  items: ItemInstance[];
  shops: Shop[];
  itemTemplates: ItemTemplate[];
  monsters: Monster[];
  activeBattles: ActiveBattle[];
  messages: ChatMessage[];
  jailRecords: JailRecord[];
  vaultAccounts: VaultAccount[];
  stocks: Stock[];
  stockHoldings: StockHolding[];
  stockLastUpdate: number;
  nextIds: {
    user: number;
    character: number;
    item: number;
    battle: number;
    chat: number;
    jail: number;
    holding: number;
  };
};

const KEY = 'adr-demo-state-v1';

const races: Race[] = [
  { id: 1, name: 'Human', description: 'Balanced and adaptable.', mightBonus: 1, dexterityBonus: 1, constitutionBonus: 1, intelligenceBonus: 1, wisdomBonus: 1, charismaBonus: 1, mightMalus: 0, dexterityMalus: 0, constitutionMalus: 0, intelligenceMalus: 0, wisdomMalus: 0, charismaMalus: 0 },
  { id: 2, name: 'Elf', description: 'Swift and wise.', mightBonus: 0, dexterityBonus: 2, constitutionBonus: 0, intelligenceBonus: 1, wisdomBonus: 1, charismaBonus: 0, mightMalus: 0, dexterityMalus: 0, constitutionMalus: 1, intelligenceMalus: 0, wisdomMalus: 0, charismaMalus: 0 },
  { id: 3, name: 'Dwarf', description: 'Tough and sturdy.', mightBonus: 1, dexterityBonus: 0, constitutionBonus: 2, intelligenceBonus: 0, wisdomBonus: 0, charismaBonus: 0, mightMalus: 0, dexterityMalus: 1, constitutionMalus: 0, intelligenceMalus: 0, wisdomMalus: 0, charismaMalus: 0 },
  { id: 4, name: 'Orc', description: 'Brutal frontliners.', mightBonus: 2, dexterityBonus: 0, constitutionBonus: 1, intelligenceBonus: 0, wisdomBonus: 0, charismaBonus: 0, mightMalus: 0, dexterityMalus: 0, constitutionMalus: 0, intelligenceMalus: 1, wisdomMalus: 0, charismaMalus: 1 },
];

const classes: ClassDef[] = [
  { id: 1, name: 'Warrior', description: 'Durable melee fighter.', selectable: 1, baseHp: 6, baseMp: 1, baseAc: 3, updateHp: 2, updateMp: 0, updateAc: 1, mightReq: 0, dexterityReq: 0, constitutionReq: 0, intelligenceReq: 0, wisdomReq: 0, charismaReq: 0 },
  { id: 2, name: 'Mage', description: 'Arcane specialist.', selectable: 1, baseHp: 1, baseMp: 6, baseAc: 1, updateHp: 0, updateMp: 2, updateAc: 0, mightReq: 0, dexterityReq: 0, constitutionReq: 0, intelligenceReq: 0, wisdomReq: 0, charismaReq: 0 },
  { id: 3, name: 'Rogue', description: 'Fast and precise.', selectable: 1, baseHp: 3, baseMp: 3, baseAc: 2, updateHp: 1, updateMp: 1, updateAc: 1, mightReq: 0, dexterityReq: 0, constitutionReq: 0, intelligenceReq: 0, wisdomReq: 0, charismaReq: 0 },
  { id: 4, name: 'Cleric', description: 'Holy and resilient.', selectable: 1, baseHp: 4, baseMp: 4, baseAc: 2, updateHp: 1, updateMp: 1, updateAc: 1, mightReq: 0, dexterityReq: 0, constitutionReq: 0, intelligenceReq: 0, wisdomReq: 0, charismaReq: 0 },
];

const elements: Element[] = [
  { id: 1, name: 'Water', description: 'Fluid and adaptive.', color: '#4aa3ff' },
  { id: 2, name: 'Earth', description: 'Stable and grounded.', color: '#88c070' },
  { id: 3, name: 'Holy', description: 'Pure and balanced.', color: '#ffd966' },
  { id: 4, name: 'Fire', description: 'Aggressive and volatile.', color: '#ff7f50' },
];

const alignments: Alignment[] = [
  { id: 1, name: 'Good', description: 'Compassionate and just.' },
  { id: 2, name: 'Neutral', description: 'Pragmatic and balanced.' },
  { id: 3, name: 'Evil', description: 'Ambitious and ruthless.' },
];

const itemTypes: Record<number, string> = {
  [ITEM_TYPES.RAW_MATERIAL]: 'Raw Material',
  [ITEM_TYPES.RARE_MATERIAL]: 'Rare Material',
  [ITEM_TYPES.PICKAXE]: 'Pickaxe',
  [ITEM_TYPES.MAGIC_TOME]: 'Magic Tome',
  [ITEM_TYPES.WEAPON]: 'Weapon',
  [ITEM_TYPES.ENCHANTED_WEAPON]: 'Enchanted Weapon',
  [ITEM_TYPES.ARMOR]: 'Armor',
  [ITEM_TYPES.SHIELD]: 'Shield',
  [ITEM_TYPES.HELM]: 'Helm',
  [ITEM_TYPES.GLOVES]: 'Gloves',
  [ITEM_TYPES.MAGIC_ATTACK]: 'Magic Attack',
  [ITEM_TYPES.MAGIC_DEFENSE]: 'Magic Defense',
  [ITEM_TYPES.AMULET]: 'Amulet',
  [ITEM_TYPES.RING]: 'Ring',
  [ITEM_TYPES.HEALTH_POTION]: 'Health Potion',
  [ITEM_TYPES.MANA_POTION]: 'Mana Potion',
  [ITEM_TYPES.SCROLL]: 'Scroll',
  [ITEM_TYPES.MISC]: 'Misc',
};

const slotByType: Record<number, string | null> = {
  [ITEM_TYPES.WEAPON]: 'weapon',
  [ITEM_TYPES.ENCHANTED_WEAPON]: 'weapon',
  [ITEM_TYPES.ARMOR]: 'armor',
  [ITEM_TYPES.SHIELD]: 'shield',
  [ITEM_TYPES.HELM]: 'helm',
  [ITEM_TYPES.GLOVES]: 'gloves',
  [ITEM_TYPES.AMULET]: 'amulet',
  [ITEM_TYPES.RING]: 'ring',
  [ITEM_TYPES.MAGIC_ATTACK]: 'magic_attack',
  [ITEM_TYPES.MAGIC_DEFENSE]: 'magic_defense',
};

const skillDefs = [
  { id: 1, name: 'Mining', description: 'Extract ore and gems.', requiredSp: 100, image: '' },
  { id: 2, name: 'Stonecutting', description: 'Refine raw materials.', requiredSp: 200, image: '' },
  { id: 3, name: 'Forge', description: 'Repair and improve gear.', requiredSp: 50, image: '' },
  { id: 4, name: 'Enchantment', description: 'Add magical power.', requiredSp: 300, image: '' },
  { id: 5, name: 'Trading', description: 'Get better shop prices.', requiredSp: 75, image: '' },
  { id: 6, name: 'Thief', description: 'Attempt to steal from shops.', requiredSp: 150, image: '' },
];

const equipmentTypeIds: number[] = [
  ITEM_TYPES.WEAPON,
  ITEM_TYPES.ENCHANTED_WEAPON,
  ITEM_TYPES.ARMOR,
  ITEM_TYPES.SHIELD,
  ITEM_TYPES.HELM,
  ITEM_TYPES.GLOVES,
  ITEM_TYPES.AMULET,
  ITEM_TYPES.RING,
  ITEM_TYPES.MAGIC_ATTACK,
  ITEM_TYPES.MAGIC_DEFENSE,
];

const rawMaterialTypeIds: number[] = [
  ITEM_TYPES.RAW_MATERIAL,
  ITEM_TYPES.RARE_MATERIAL,
];

function nowIso(): string {
  return new Date().toISOString();
}

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

function roll(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function makeItemTemplates(): ItemTemplate[] {
  return [
    {
      id: 1,
      name: 'Rusty Sword',
      description: 'A battered but usable blade.',
      typeId: ITEM_TYPES.WEAPON,
      qualityId: 2,
      power: 6,
      addPower: 0,
      weight: 25,
      durationMax: 100,
      price: 80,
      bonusMight: 0,
      bonusDexterity: 0,
      bonusConstitution: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusCharisma: 0,
      bonusHp: 0,
      bonusMp: 0,
      bonusAc: 0,
      elementId: 0,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 1,
      image: '',
    },
    {
      id: 2,
      name: 'Padded Armor',
      description: 'Simple stitched protection.',
      typeId: ITEM_TYPES.ARMOR,
      qualityId: 2,
      power: 3,
      addPower: 0,
      weight: 30,
      durationMax: 120,
      price: 90,
      bonusMight: 0,
      bonusDexterity: 0,
      bonusConstitution: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusCharisma: 0,
      bonusHp: 5,
      bonusMp: 0,
      bonusAc: 2,
      elementId: 0,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 1,
      image: '',
    },
    {
      id: 3,
      name: 'Small Health Potion',
      description: 'Restores vitality in a pinch.',
      typeId: ITEM_TYPES.HEALTH_POTION,
      qualityId: 3,
      power: 0,
      addPower: 0,
      weight: 2,
      durationMax: 1,
      price: 25,
      bonusMight: 0,
      bonusDexterity: 0,
      bonusConstitution: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusCharisma: 0,
      bonusHp: 0,
      bonusMp: 0,
      bonusAc: 0,
      elementId: 0,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 1,
      image: '',
    },
    {
      id: 4,
      name: 'Mining Pick',
      description: 'Used to gather ore and gems.',
      typeId: ITEM_TYPES.PICKAXE,
      qualityId: 3,
      power: 0,
      addPower: 0,
      weight: 20,
      durationMax: 80,
      price: 120,
      bonusMight: 0,
      bonusDexterity: 0,
      bonusConstitution: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusCharisma: 0,
      bonusHp: 0,
      bonusMp: 0,
      bonusAc: 0,
      elementId: 0,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 1,
      image: '',
    },
    {
      id: 5,
      name: 'Raw Ore',
      description: 'Unrefined mineral chunk.',
      typeId: ITEM_TYPES.RAW_MATERIAL,
      qualityId: 2,
      power: 0,
      addPower: 0,
      weight: 5,
      durationMax: 100,
      price: 20,
      bonusMight: 0,
      bonusDexterity: 0,
      bonusConstitution: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusCharisma: 0,
      bonusHp: 0,
      bonusMp: 0,
      bonusAc: 0,
      elementId: 0,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 1,
      image: '',
    },
    {
      id: 6,
      name: 'Rough Gem',
      description: 'A gem that can be refined.',
      typeId: ITEM_TYPES.RARE_MATERIAL,
      qualityId: 3,
      power: 0,
      addPower: 0,
      weight: 1,
      durationMax: 100,
      price: 60,
      bonusMight: 0,
      bonusDexterity: 0,
      bonusConstitution: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusCharisma: 0,
      bonusHp: 0,
      bonusMp: 0,
      bonusAc: 0,
      elementId: 0,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 1,
      image: '',
    },
    {
      id: 7,
      name: 'Iron Shield',
      description: 'Basic but sturdy shield.',
      typeId: ITEM_TYPES.SHIELD,
      qualityId: 3,
      power: 2,
      addPower: 0,
      weight: 18,
      durationMax: 110,
      price: 110,
      bonusMight: 0,
      bonusDexterity: 0,
      bonusConstitution: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusCharisma: 0,
      bonusHp: 0,
      bonusMp: 0,
      bonusAc: 2,
      elementId: 0,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 2,
      image: '',
    },
    {
      id: 8,
      name: 'Wizard Ring',
      description: 'Focuses magical power.',
      typeId: ITEM_TYPES.RING,
      qualityId: 4,
      power: 1,
      addPower: 0,
      weight: 1,
      durationMax: 140,
      price: 180,
      bonusMight: 0,
      bonusDexterity: 0,
      bonusConstitution: 0,
      bonusIntelligence: 1,
      bonusWisdom: 1,
      bonusCharisma: 0,
      bonusHp: 0,
      bonusMp: 8,
      bonusAc: 0,
      elementId: 3,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 3,
      image: '',
    },
    {
      id: 9,
      name: 'Arcane Charm',
      description: 'Boosts magical attack.',
      typeId: ITEM_TYPES.MAGIC_ATTACK,
      qualityId: 4,
      power: 2,
      addPower: 0,
      weight: 2,
      durationMax: 130,
      price: 170,
      bonusMight: 0,
      bonusDexterity: 0,
      bonusConstitution: 0,
      bonusIntelligence: 1,
      bonusWisdom: 0,
      bonusCharisma: 0,
      bonusHp: 0,
      bonusMp: 5,
      bonusAc: 0,
      elementId: 4,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 3,
      image: '',
    },
    {
      id: 10,
      name: 'Sage Talisman',
      description: 'Boosts magical defense.',
      typeId: ITEM_TYPES.MAGIC_DEFENSE,
      qualityId: 4,
      power: 2,
      addPower: 0,
      weight: 2,
      durationMax: 130,
      price: 170,
      bonusMight: 0,
      bonusDexterity: 0,
      bonusConstitution: 0,
      bonusIntelligence: 0,
      bonusWisdom: 1,
      bonusCharisma: 0,
      bonusHp: 0,
      bonusMp: 5,
      bonusAc: 1,
      elementId: 1,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 3,
      image: '',
    },
    {
      id: 11,
      name: 'Leather Gloves',
      description: 'Improves grip and dexterity.',
      typeId: ITEM_TYPES.GLOVES,
      qualityId: 3,
      power: 1,
      addPower: 0,
      weight: 4,
      durationMax: 100,
      price: 70,
      bonusMight: 0,
      bonusDexterity: 1,
      bonusConstitution: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusCharisma: 0,
      bonusHp: 0,
      bonusMp: 0,
      bonusAc: 1,
      elementId: 0,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 1,
      image: '',
    },
    {
      id: 12,
      name: 'Bronze Helm',
      description: 'Basic head protection.',
      typeId: ITEM_TYPES.HELM,
      qualityId: 3,
      power: 1,
      addPower: 0,
      weight: 8,
      durationMax: 110,
      price: 85,
      bonusMight: 0,
      bonusDexterity: 0,
      bonusConstitution: 1,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusCharisma: 0,
      bonusHp: 4,
      bonusMp: 0,
      bonusAc: 1,
      elementId: 0,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 1,
      image: '',
    },
    {
      id: 13,
      name: 'Blessed Amulet',
      description: 'A warm talisman of protection.',
      typeId: ITEM_TYPES.AMULET,
      qualityId: 4,
      power: 1,
      addPower: 0,
      weight: 1,
      durationMax: 150,
      price: 140,
      bonusMight: 0,
      bonusDexterity: 0,
      bonusConstitution: 1,
      bonusIntelligence: 0,
      bonusWisdom: 1,
      bonusCharisma: 1,
      bonusHp: 6,
      bonusMp: 4,
      bonusAc: 1,
      elementId: 3,
      critHit: 20,
      critHitMod: 2,
      sellBackPercentage: 50,
      restrictLevel: 2,
      image: '',
    },
  ];
}

function makeShops(): Shop[] {
  return [
    { id: 1, name: 'General Store', description: 'Basic adventuring gear and supplies.', itemTemplateIds: [1, 2, 3, 4, 11, 12] },
    { id: 2, name: 'Armory', description: 'Weapons and heavy protection.', itemTemplateIds: [1, 2, 7, 12, 13] },
    { id: 3, name: 'Arcane Emporium', description: 'Rare magical tools and charms.', itemTemplateIds: [6, 8, 9, 10, 13] },
  ];
}

function makeMonsters(): Monster[] {
  return [
    { id: 1, name: 'Cave Rat', image: '', level: 1, hp: 16, mp: 0, attack: 5, defense: 3, sp: 1, elementId: 2, customSpell: 'Nibble' },
    { id: 2, name: 'Forest Wolf', image: '', level: 2, hp: 24, mp: 0, attack: 7, defense: 4, sp: 2, elementId: 2, customSpell: 'Howl' },
    { id: 3, name: 'Goblin Scout', image: '', level: 3, hp: 30, mp: 6, attack: 8, defense: 5, sp: 3, elementId: 4, customSpell: 'Fire Spark' },
    { id: 4, name: 'Skeleton Guard', image: '', level: 4, hp: 36, mp: 8, attack: 9, defense: 7, sp: 4, elementId: 3, customSpell: 'Bone Curse' },
    { id: 5, name: 'Young Wyrm', image: '', level: 5, hp: 48, mp: 12, attack: 12, defense: 8, sp: 6, elementId: 4, customSpell: 'Flame Breath' },
  ];
}

function qualityName(id: number): string {
  const q = QUALITY_TIERS.find((t) => t.id === id);
  return q ? q.name : 'Unknown';
}

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

function createInitialState(): DemoState {
  const itemTemplates = makeItemTemplates();
  return {
    users: [],
    currentUserId: null,
    characters: [],
    items: [],
    shops: makeShops(),
    itemTemplates,
    monsters: makeMonsters(),
    activeBattles: [],
    messages: [],
    jailRecords: [],
    vaultAccounts: [],
    stocks: [
      { id: 1, name: 'Ironforge Mining Co.', currentPrice: 120, previousPrice: 120, minPrice: 50, maxPrice: 500 },
      { id: 2, name: 'Arcane Holdings', currentPrice: 220, previousPrice: 220, minPrice: 80, maxPrice: 900 },
      { id: 3, name: 'Royal Trade Guild', currentPrice: 90, previousPrice: 90, minPrice: 30, maxPrice: 400 },
    ],
    stockHoldings: [],
    stockLastUpdate: nowSec(),
    nextIds: {
      user: 1,
      character: 1,
      item: itemTemplates.length + 1,
      battle: 1,
      chat: 1,
      jail: 1,
      holding: 1,
    },
  };
}

function loadState(): DemoState {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const created = createInitialState();
    saveState(created);
    return created;
  }
  try {
    const parsed = JSON.parse(raw) as DemoState;
    if (!parsed.itemTemplates || !parsed.shops || !parsed.monsters) {
      const reset = createInitialState();
      saveState(reset);
      return reset;
    }
    return parsed;
  } catch {
    const reset = createInitialState();
    saveState(reset);
    return reset;
  }
}

function saveState(state: DemoState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function mustAuth(state: DemoState): User {
  const user = state.users.find((u) => u.id === state.currentUserId);
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user;
}

function getCharByUser(state: DemoState, userId: number): Character {
  const char = state.characters.find((c) => c.userId === userId);
  if (!char) {
    throw new Error('No character found');
  }
  return char;
}

function raceById(id: number): Race {
  return races.find((r) => r.id === id) || races[0];
}

function classById(id: number): ClassDef {
  return classes.find((c) => c.id === id) || classes[0];
}

function elementById(id: number): Element {
  return elements.find((e) => e.id === id) || elements[0];
}

function alignmentById(id: number): Alignment {
  return alignments.find((a) => a.id === id) || alignments[0];
}

function withCharacterDecorators(char: Character) {
  const race = raceById(char.raceId);
  const cls = classById(char.classId);
  const elem = elementById(char.elementId);
  const align = alignmentById(char.alignmentId);
  return {
    ...char,
    raceName: race.name,
    className: cls.name,
    elementName: elem.name,
    elementColor: elem.color,
    alignmentName: align.name,
  };
}

function ensureLimits(char: Character): Character {
  const elapsed = nowSec() - char.limitUpdate;
  if (elapsed < 86400) return char;
  return {
    ...char,
    battleLimit: DEFAULT_CONFIG.battleLimit,
    skillLimit: DEFAULT_CONFIG.skillLimit,
    tradingLimit: DEFAULT_CONFIG.tradingLimit,
    thiefLimit: DEFAULT_CONFIG.thiefLimit,
    limitUpdate: nowSec(),
  };
}

function upsertChar(state: DemoState, char: Character): void {
  const idx = state.characters.findIndex((c) => c.id === char.id);
  if (idx >= 0) state.characters[idx] = char;
}

function itemTemplateById(state: DemoState, templateId: number): ItemTemplate {
  const found = state.itemTemplates.find((i) => i.id === templateId);
  if (!found) {
    throw new Error('Item template missing');
  }
  return found;
}

function createItemInstance(state: DemoState, ownerId: number, templateId: number): ItemInstance {
  const template = itemTemplateById(state, templateId);
  const created: ItemInstance = {
    ...clone(template),
    id: state.nextIds.item++,
    ownerId,
    duration: template.durationMax,
    equipped: 0,
  };
  state.items.push(created);
  return created;
}

function itemForUser(state: DemoState, userId: number, itemId: number): ItemInstance {
  const found = state.items.find((it) => it.id === itemId && it.ownerId === userId);
  if (!found) {
    throw new Error('Item not found in your inventory');
  }
  return found;
}

function mapInventoryItem(item: ItemInstance) {
  return {
    ...item,
    typeName: itemTypes[item.typeId] || 'Unknown',
    qualityName: qualityName(item.qualityId),
    slot: slotByType[item.typeId] || null,
  };
}

function equippedBySlot(items: ItemInstance[]): Record<string, ItemInstance | undefined> {
  const by: Record<string, ItemInstance | undefined> = {};
  for (const item of items) {
    if (item.equipped !== 1) continue;
    const slot = slotByType[item.typeId];
    if (slot) by[slot] = item;
  }
  return by;
}

function computeCombatStats(char: Character, equipped: ItemInstance[]) {
  const sum = equipped.reduce((acc, it) => {
    acc.bonusMight += it.bonusMight;
    acc.bonusDexterity += it.bonusDexterity;
    acc.bonusConstitution += it.bonusConstitution;
    acc.bonusIntelligence += it.bonusIntelligence;
    acc.bonusWisdom += it.bonusWisdom;
    acc.bonusAc += it.bonusAc;
    acc.bonusHp += it.bonusHp;
    acc.bonusMp += it.bonusMp;
    return acc;
  }, {
    bonusMight: 0,
    bonusDexterity: 0,
    bonusConstitution: 0,
    bonusIntelligence: 0,
    bonusWisdom: 0,
    bonusAc: 0,
    bonusHp: 0,
    bonusMp: 0,
  });

  const might = char.might + sum.bonusMight;
  const dex = char.dexterity + sum.bonusDexterity;
  const intg = char.intelligence + sum.bonusIntelligence;
  const wis = char.wisdom + sum.bonusWisdom;
  const con = char.constitution + sum.bonusConstitution;
  const hpMax = char.hpMax + sum.bonusHp;
  const mpMax = char.mpMax + sum.bonusMp;

  return {
    hpMax,
    mpMax,
    att: Math.max(1, Math.floor(might * 1.6 + con * 0.25)),
    def: Math.max(1, Math.floor((char.ac + sum.bonusAc) * 1.5 + dex * 0.35)),
    magicAtt: Math.max(1, Math.floor(intg * 1.75)),
    magicDef: Math.max(1, Math.floor(wis * 1.75)),
    hpRegen: equipped.some((i) => i.typeId === ITEM_TYPES.AMULET) ? 1 : 0,
    mpRegen: equipped.some((i) => i.typeId === ITEM_TYPES.RING) ? 1 : 0,
  };
}

function shopAdjustedPrice(char: Character, basePrice: number): number {
  const mod = tradingModifier(char.charisma, char.skillTrading);
  return Math.max(1, Math.floor(basePrice * (1 - mod / 100)));
}

function updateStocks(state: DemoState): void {
  const elapsed = nowSec() - state.stockLastUpdate;
  if (elapsed < 86400) return;
  const periods = Math.floor(elapsed / 86400);
  for (const stock of state.stocks) {
    let price = stock.currentPrice;
    for (let i = 0; i < periods; i++) {
      price = stockPriceChange(price, 0, 10, stock.minPrice, stock.maxPrice);
    }
    stock.previousPrice = stock.currentPrice;
    stock.currentPrice = price;
  }
  state.stockLastUpdate = nowSec();
}

function getOrCreateVault(state: DemoState, userId: number): VaultAccount {
  let account = state.vaultAccounts.find((a) => a.userId === userId);
  if (!account) {
    account = { userId, balance: 0, lastInterestTime: nowSec(), loanAmount: 0, loanInterestTime: 0 };
    state.vaultAccounts.push(account);
  }
  return account;
}

function applyInterest(state: DemoState, userId: number): number {
  const account = getOrCreateVault(state, userId);
  if (account.balance <= 0) return 0;
  const elapsed = nowSec() - account.lastInterestTime;
  const interest = calculateInterest(account.balance, 4, elapsed, 86400);
  if (interest > 0) {
    account.balance += interest;
    account.lastInterestTime = nowSec();
  }
  return interest;
}

function userFromName(state: DemoState, username: string): User | undefined {
  return state.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

function checkJail(state: DemoState, userId: number): JailRecord | null {
  const current = state.jailRecords.find((r) => r.userId === userId && r.released === 0);
  if (!current) return null;
  if (new Date(current.releaseAt).getTime() <= Date.now()) {
    current.released = 1;
    current.releasedAt = nowIso();
    current.status = 'Released';
    return null;
  }
  return current;
}

function normalizeMessage(username: string, msg: string): string {
  if (msg.startsWith('/me ')) {
    return `*${username} ${msg.slice(4).trim()}*`;
  }
  return msg;
}

function error(message: string): never {
  throw new Error(message);
}

function currentCharacterOrThrow(state: DemoState): Character {
  const user = mustAuth(state);
  return getCharByUser(state, user.id);
}

export const demoApi = {
  register(username: string, password: string): Promise<{ id: number; username: string }> {
    const state = loadState();
    const cleanUser = username.trim();
    if (!cleanUser || !password) error('Username and password are required');
    if (cleanUser.length < 3 || cleanUser.length > 30) error('Username must be 3-30 characters');
    if (password.length < 4) error('Password must be at least 4 characters');
    if (userFromName(state, cleanUser)) error('Username already taken');

    const user: User = {
      id: state.nextIds.user++,
      username: cleanUser,
      password,
      createdAt: nowIso(),
    };
    state.users.push(user);
    state.currentUserId = user.id;
    saveState(state);
    return Promise.resolve({ id: user.id, username: user.username });
  },

  login(username: string, password: string): Promise<{ id: number; username: string; hasCharacter: boolean }> {
    const state = loadState();
    const user = userFromName(state, username.trim());
    if (!user || user.password !== password) error('Invalid username or password');
    state.currentUserId = user.id;
    saveState(state);
    return Promise.resolve({ id: user.id, username: user.username, hasCharacter: state.characters.some((c) => c.userId === user.id) });
  },

  logout(): Promise<{ message: string }> {
    const state = loadState();
    state.currentUserId = null;
    saveState(state);
    return Promise.resolve({ message: 'Logged out successfully' });
  },

  me(): Promise<{ id: number; username: string; hasCharacter: boolean }> {
    const state = loadState();
    const user = mustAuth(state);
    return Promise.resolve({ id: user.id, username: user.username, hasCharacter: state.characters.some((c) => c.userId === user.id) });
  },

  getCreationData(): Promise<{ races: Race[]; classes: ClassDef[]; elements: Element[]; alignments: Alignment[] }> {
    return Promise.resolve({ races: clone(races), classes: clone(classes.filter((c) => c.selectable === 1)), elements: clone(elements), alignments: clone(alignments) });
  },

  rollStats(): Promise<{ might: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number }> {
    return Promise.resolve({
      might: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    });
  },

  createCharacter(data: {
    name: string;
    raceId: number;
    classId: number;
    elementId: number;
    alignmentId: number;
    stats: { might: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number };
  }): Promise<any> {
    const state = loadState();
    const user = mustAuth(state);
    if (state.characters.some((c) => c.userId === user.id)) error('You already have a character');
    if (!data.name || data.name.trim().length < 2 || data.name.trim().length > 30) error('Character name must be 2-30 characters');

    const race = raceById(data.raceId);
    const cls = classById(data.classId);
    const elem = elementById(data.elementId);
    const align = alignmentById(data.alignmentId);

    const statKeys = ['might', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
    for (const key of statKeys) {
      const value = data.stats[key];
      if (value < 3 || value > 20) error(`${key} must be between 3 and 20`);
    }

    const might = Math.min(20, Math.max(3, data.stats.might + race.mightBonus - race.mightMalus));
    const dexterity = Math.min(20, Math.max(3, data.stats.dexterity + race.dexterityBonus - race.dexterityMalus));
    const constitution = Math.min(20, Math.max(3, data.stats.constitution + race.constitutionBonus - race.constitutionMalus));
    const intelligence = Math.min(20, Math.max(3, data.stats.intelligence + race.intelligenceBonus - race.intelligenceMalus));
    const wisdom = Math.min(20, Math.max(3, data.stats.wisdom + race.wisdomBonus - race.wisdomMalus));
    const charisma = Math.min(20, Math.max(3, data.stats.charisma + race.charismaBonus - race.charismaMalus));

    const hp = startingHp(constitution, 0, cls.baseHp);
    const mp = startingMp(intelligence, 0, cls.baseMp);

    const char: Character = {
      id: state.nextIds.character++,
      userId: user.id,
      name: data.name.trim(),
      level: 1,
      xp: 0,
      sp: 0,
      gold: 300,
      might,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
      hp,
      hpMax: hp,
      mp,
      mpMax: mp,
      ac: cls.baseAc,
      raceId: race.id,
      classId: cls.id,
      elementId: elem.id,
      alignmentId: align.id,
      victories: 0,
      defeats: 0,
      flees: 0,
      victoriesPvp: 0,
      defeatsPvp: 0,
      isDead: 0,
      isBattling: 0,
      battleLimit: DEFAULT_CONFIG.battleLimit,
      skillLimit: DEFAULT_CONFIG.skillLimit,
      tradingLimit: DEFAULT_CONFIG.tradingLimit,
      thiefLimit: DEFAULT_CONFIG.thiefLimit,
      limitUpdate: nowSec(),
      skillMining: 0,
      skillStone: 0,
      skillForge: 0,
      skillEnchantment: 0,
      skillTrading: 0,
      skillThief: 0,
      skillMiningUses: 0,
      skillStoneUses: 0,
      skillForgeUses: 0,
      skillEnchantmentUses: 0,
      skillTradingUses: 0,
      skillThiefUses: 0,
      equipWeapon: 0,
      equipArmor: 0,
      equipShield: 0,
      equipHelm: 0,
      equipGloves: 0,
      equipAmulet: 0,
      equipRing: 0,
      equipMagicAttack: 0,
      equipMagicDefense: 0,
    };

    state.characters.push(char);

    createItemInstance(state, user.id, 1);
    createItemInstance(state, user.id, 2);
    createItemInstance(state, user.id, 3);
    createItemInstance(state, user.id, 3);

    saveState(state);
    return Promise.resolve(withCharacterDecorators(char));
  },

  getCharacter(): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    const normalized = ensureLimits(char);
    upsertChar(state, normalized);
    saveState(state);
    return Promise.resolve(withCharacterDecorators(normalized));
  },

  getBattle(): Promise<{ battle: any | null }> {
    const state = loadState();
    const user = mustAuth(state);
    const active = state.activeBattles.find((b) => b.userId === user.id);
    if (!active) return Promise.resolve({ battle: null });
    return Promise.resolve({
      battle: {
        battleId: active.battleId,
        monster: {
          id: active.monster.id,
          name: active.monster.name,
          image: active.monster.image,
          level: active.monster.level,
          hp: active.monster.hp,
          hpMax: active.monster.hpMax,
          mp: active.monster.mp,
          mpMax: active.monster.mpMax,
          elementId: active.monster.elementId,
          customSpell: active.monster.customSpell,
        },
        player: {
          hp: active.player.hp,
          hpMax: active.player.hpMax,
          mp: active.player.mp,
          mpMax: active.player.mpMax,
          att: active.player.att,
          def: active.player.def,
          magicAtt: active.player.magicAtt,
          magicDef: active.player.magicDef,
        },
        round: active.turn,
      },
    });
  },

  startBattle(): Promise<any> {
    const state = loadState();
    const user = mustAuth(state);
    let char = getCharByUser(state, user.id);
    char = ensureLimits(char);

    if (char.isDead) error('Your character is dead! Visit the temple to resurrect.');
    if (char.isBattling) error('Already in battle!');
    if (char.battleLimit < 1) error('No battles remaining today!');
    if (checkJail(state, user.id)) error('You are in jail and cannot battle.');

    const pool = state.monsters.filter((m) => m.level <= Math.max(char.level, 1));
    const monster = clone(pool.length > 0 ? pool[roll(0, pool.length - 1)] : state.monsters[0]);

    const equipped = state.items.filter((it) => it.ownerId === user.id && it.equipped === 1);
    const stats = computeCombatStats(char, equipped);
    const scale = Math.max(1, 1 + (char.level - monster.level) * 0.1);

    const active: ActiveBattle = {
      battleId: state.nextIds.battle++,
      userId: user.id,
      turn: 0,
      monster: {
        ...monster,
        hp: Math.max(8, Math.floor(monster.hp * scale)),
        hpMax: Math.max(8, Math.floor(monster.hp * scale)),
        mp: Math.max(0, Math.floor(monster.mp * scale)),
        mpMax: Math.max(0, Math.floor(monster.mp * scale)),
        attack: Math.max(1, Math.floor(monster.attack * scale)),
        defense: Math.max(1, Math.floor(monster.defense * scale)),
        sp: Math.max(1, Math.floor(monster.sp * scale)),
      },
      player: {
        hp: char.hp,
        hpMax: stats.hpMax,
        mp: char.mp,
        mpMax: stats.mpMax,
        att: stats.att,
        def: stats.def,
        magicAtt: stats.magicAtt,
        magicDef: stats.magicDef,
        hpRegen: stats.hpRegen,
        mpRegen: stats.mpRegen,
      },
    };

    char.isBattling = 1;
    char.battleLimit -= 1;
    upsertChar(state, char);
    state.activeBattles.push(active);

    const playerFirst = roll(1, 20) + Math.floor(char.dexterity / 2) >= roll(1, 20) + monster.level;
    saveState(state);

    return Promise.resolve({
      battleId: active.battleId,
      monster: {
        id: active.monster.id,
        name: active.monster.name,
        image: active.monster.image,
        level: active.monster.level,
        hp: active.monster.hp,
        hpMax: active.monster.hpMax,
        mp: active.monster.mp,
        mpMax: active.monster.mpMax,
        elementId: active.monster.elementId,
        customSpell: active.monster.customSpell,
      },
      player: {
        hp: active.player.hp,
        hpMax: active.player.hpMax,
        mp: active.player.mp,
        mpMax: active.player.mpMax,
        att: active.player.att,
        def: active.player.def,
        magicAtt: active.player.magicAtt,
        magicDef: active.player.magicDef,
      },
      playerFirst,
      round: 0,
    });
  },

  battleAction(battleId: number, action: BattleAction): Promise<any> {
    const state = loadState();
    const user = mustAuth(state);
    const char = getCharByUser(state, user.id);
    const active = state.activeBattles.find((b) => b.battleId === battleId && b.userId === user.id);
    if (!active) error('Battle not found');

    const messages: string[] = [];
    const battle = active;

    const playerAttack = () => {
      if (action === 'flee') {
        const success = roll(1, 20) + Math.floor(char.dexterity / 2) > roll(1, 20) + Math.floor(battle.monster.level / 2);
        if (success) {
          messages.push(`${char.name} successfully fled from ${battle.monster.name}!`);
          char.flees += 1;
          char.isBattling = 0;
          state.activeBattles = state.activeBattles.filter((b) => b.battleId !== battle.battleId);
          upsertChar(state, char);
          saveState(state);
          return {
            round: battle.turn,
            playerAction: 'flee',
            messages,
            playerHp: battle.player.hp,
            playerMp: battle.player.mp,
            playerHpMax: battle.player.hpMax,
            playerMpMax: battle.player.mpMax,
            monsterHp: battle.monster.hp,
            monsterMp: battle.monster.mp,
            monsterHpMax: battle.monster.hpMax,
            monsterMpMax: battle.monster.mpMax,
            battleOver: true,
            result: 'fled',
          };
        }
        messages.push(`${char.name} tried to flee but failed!`);
        return null;
      }

      if (action === 'defend') {
        messages.push(`${char.name} takes a defensive stance against ${battle.monster.name}.`);
        return null;
      }

      const hitRoll = roll(1, 20) + Math.floor(battle.player.att / 5);
      const target = 10 + Math.floor(battle.monster.defense / 2);
      if (hitRoll >= target) {
        let damage = Math.max(1, roll(1, Math.max(2, Math.floor(battle.player.att / 3))));
        if (hitRoll >= 28) {
          damage *= 2;
          messages.push('CRITICAL HIT!');
        }
        damage = Math.min(damage, battle.monster.hp);
        battle.monster.hp -= damage;
        messages.push(`${char.name} attacks ${battle.monster.name} for ${damage} damage!`);
      } else {
        messages.push(`${char.name} attacks ${battle.monster.name} but misses!`);
      }
      return null;
    };

    const fleeResult = playerAttack();
    if (fleeResult) return Promise.resolve(fleeResult);

    if (battle.monster.hp <= 0) {
      const rewards = calculateRewards(battle.monster.level, char.level, battle.monster.sp, {
        baseExpMin: 10,
        baseExpMax: 40,
        baseExpModifier: 120,
        baseRewardMin: 10,
        baseRewardMax: 40,
        baseRewardModifier: 120,
      });

      char.xp += rewards.xp;
      char.gold += rewards.gold;
      char.sp += rewards.sp;
      char.victories += 1;
      char.isBattling = 0;

      let leveledUp = false;
      let newLevel: number | undefined;
      if (shouldLevelUp(char.level, char.xp, 10)) {
        const cls = classById(char.classId);
        const hpGain = hpGainOnLevelUp(char.constitution, cls.updateHp);
        const mpGain = mpGainOnLevelUp(char.intelligence, cls.updateMp);
        char.level += 1;
        char.hpMax += hpGain;
        char.mpMax += mpGain;
        char.hp = char.hpMax;
        char.mp = char.mpMax;
        leveledUp = true;
        newLevel = char.level;
      }

      messages.push(`${char.name} defeated ${battle.monster.name}!`);
      messages.push(`Earned ${rewards.xp} XP, ${rewards.gold} gold, ${rewards.sp} SP!`);
      if (leveledUp && newLevel) messages.push(`LEVEL UP! You are now level ${newLevel}!`);

      state.activeBattles = state.activeBattles.filter((b) => b.battleId !== battle.battleId);
      upsertChar(state, char);
      saveState(state);

      return Promise.resolve({
        round: battle.turn + 1,
        playerAction: action,
        messages,
        playerHp: char.hp,
        playerMp: char.mp,
        playerHpMax: char.hpMax,
        playerMpMax: char.mpMax,
        monsterHp: 0,
        monsterMp: 0,
        monsterHpMax: battle.monster.hpMax,
        monsterMpMax: battle.monster.mpMax,
        battleOver: true,
        result: 'victory',
        rewards: { ...rewards, leveledUp, newLevel },
      });
    }

    const defendMul = action === 'defend' ? 0.6 : 1;
    const enemyHit = roll(1, 20) + Math.floor(battle.monster.attack / 5);
    const playerDefTarget = 10 + Math.floor(battle.player.def / 2);
    if (enemyHit >= playerDefTarget) {
      let damage = Math.max(1, Math.floor(roll(1, Math.max(2, Math.floor(battle.monster.attack / 3))) * defendMul));
      if (enemyHit >= 28) {
        damage *= 2;
        messages.push(`CRITICAL! ${battle.monster.name} strikes ${char.name}!`);
      } else {
        messages.push(`${battle.monster.name} attacks ${char.name}!`);
      }
      damage = Math.min(damage, battle.player.hp);
      battle.player.hp -= damage;
      messages.push(`${battle.monster.name} deals ${damage} damage to ${char.name}!`);
    } else {
      messages.push(`${battle.monster.name} attacks ${char.name} but misses!`);
    }

    battle.player.hp = Math.min(battle.player.hpMax, battle.player.hp + battle.player.hpRegen);
    battle.player.mp = Math.min(battle.player.mpMax, battle.player.mp + battle.player.mpRegen);

    char.hp = battle.player.hp;
    char.mp = battle.player.mp;

    if (battle.player.hp <= 0) {
      char.hp = 0;
      char.isDead = 1;
      char.defeats += 1;
      char.isBattling = 0;
      messages.push(`${char.name} was defeated by ${battle.monster.name}!`);
      messages.push('Visit the temple to resurrect.');
      state.activeBattles = state.activeBattles.filter((b) => b.battleId !== battle.battleId);
      upsertChar(state, char);
      saveState(state);

      return Promise.resolve({
        round: battle.turn + 1,
        playerAction: action,
        messages,
        playerHp: 0,
        playerMp: char.mp,
        playerHpMax: char.hpMax,
        playerMpMax: char.mpMax,
        monsterHp: battle.monster.hp,
        monsterMp: battle.monster.mp,
        monsterHpMax: battle.monster.hpMax,
        monsterMpMax: battle.monster.mpMax,
        battleOver: true,
        result: 'defeat',
      });
    }

    battle.turn += 1;
    upsertChar(state, char);
    saveState(state);

    return Promise.resolve({
      round: battle.turn,
      playerAction: action,
      messages,
      playerHp: battle.player.hp,
      playerMp: battle.player.mp,
      playerHpMax: battle.player.hpMax,
      playerMpMax: battle.player.mpMax,
      monsterHp: battle.monster.hp,
      monsterMp: battle.monster.mp,
      monsterHpMax: battle.monster.hpMax,
      monsterMpMax: battle.monster.mpMax,
      battleOver: false,
      result: 'ongoing',
    });
  },

  templeHeal(): Promise<{ hp: number; hpMax: number; cost: number; gold: number }> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    const cost = 100;
    if (char.hp >= char.hpMax && char.mp >= char.mpMax) error('Already at full health and mana!');
    if (char.gold < cost) error(`Not enough gold! Need ${cost}g, have ${char.gold}g`);
    char.hp = char.hpMax;
    char.mp = char.mpMax;
    char.gold -= cost;
    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ hp: char.hp, hpMax: char.hpMax, cost, gold: char.gold });
  },

  templeResurrect(): Promise<{ hp: number; cost: number; gold: number }> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (!char.isDead && char.hp > 0) error('Your character is alive');
    const cost = 300;
    if (char.gold < cost) error(`Not enough gold! Need ${cost}g, have ${char.gold}g`);
    char.hp = Math.ceil(char.hpMax / 2);
    char.mp = Math.ceil(char.mpMax / 2);
    char.isDead = 0;
    char.gold -= cost;
    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ hp: char.hp, cost, gold: char.gold });
  },

  getInventory(): Promise<{ items: any[] }> {
    const state = loadState();
    const user = mustAuth(state);
    const items = state.items.filter((it) => it.ownerId === user.id).map(mapInventoryItem);
    return Promise.resolve({ items });
  },

  equipItem(itemId: number): Promise<{ success: boolean; message: string }> {
    const state = loadState();
    const user = mustAuth(state);
    const char = getCharByUser(state, user.id);
    if (char.isBattling) error('Cannot change equipment during battle');
    const item = itemForUser(state, user.id, itemId);
    if (item.equipped) error('Item is already equipped');
    if (item.duration <= 0) error('Item is broken and cannot be equipped');

    const slot = slotByType[item.typeId];
    if (!slot) error('This item cannot be equipped');
    if (item.restrictLevel > char.level) error(`Requires level ${item.restrictLevel} (you are level ${char.level})`);

    const current = state.items.find((i) => i.ownerId === user.id && i.equipped === 1 && slotByType[i.typeId] === slot);
    if (current) current.equipped = 0;
    item.equipped = 1;

    if (slot === 'weapon') char.equipWeapon = item.id;
    if (slot === 'armor') char.equipArmor = item.id;
    if (slot === 'shield') char.equipShield = item.id;
    if (slot === 'helm') char.equipHelm = item.id;
    if (slot === 'gloves') char.equipGloves = item.id;
    if (slot === 'amulet') char.equipAmulet = item.id;
    if (slot === 'ring') char.equipRing = item.id;
    if (slot === 'magic_attack') char.equipMagicAttack = item.id;
    if (slot === 'magic_defense') char.equipMagicDefense = item.id;

    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ success: true, message: `Equipped ${item.name}` });
  },

  unequipItem(itemId: number): Promise<{ success: boolean; message: string }> {
    const state = loadState();
    const user = mustAuth(state);
    const char = getCharByUser(state, user.id);
    if (char.isBattling) error('Cannot change equipment during battle');

    const item = itemForUser(state, user.id, itemId);
    if (!item.equipped) error('Item is not equipped');
    const slot = slotByType[item.typeId];
    if (!slot) error('This item type has no slot');
    item.equipped = 0;

    if (slot === 'weapon') char.equipWeapon = 0;
    if (slot === 'armor') char.equipArmor = 0;
    if (slot === 'shield') char.equipShield = 0;
    if (slot === 'helm') char.equipHelm = 0;
    if (slot === 'gloves') char.equipGloves = 0;
    if (slot === 'amulet') char.equipAmulet = 0;
    if (slot === 'ring') char.equipRing = 0;
    if (slot === 'magic_attack') char.equipMagicAttack = 0;
    if (slot === 'magic_defense') char.equipMagicDefense = 0;

    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ success: true, message: `Unequipped ${item.name}` });
  },

  sellItem(itemId: number): Promise<{ gold: number; message: string }> {
    const state = loadState();
    const user = mustAuth(state);
    const char = getCharByUser(state, user.id);
    const item = itemForUser(state, user.id, itemId);
    if (item.equipped) error('Unequip the item first before selling');
    const value = Math.max(1, Math.ceil(item.price * (item.sellBackPercentage / 100)));
    char.gold += value;
    state.items = state.items.filter((it) => it.id !== item.id);
    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ gold: value, message: `Sold ${item.name} for ${value} gold` });
  },

  dropItem(itemId: number): Promise<{ message: string }> {
    const state = loadState();
    const user = mustAuth(state);
    const item = itemForUser(state, user.id, itemId);
    if (item.equipped) error('Unequip the item first');
    state.items = state.items.filter((it) => it.id !== item.id);
    saveState(state);
    return Promise.resolve({ message: `Dropped ${item.name}` });
  },

  giveItem(itemId: number, targetUserId: number): Promise<{ message: string }> {
    const state = loadState();
    const user = mustAuth(state);
    if (user.id === targetUserId) error('You cannot give items to yourself');
    const target = state.characters.find((c) => c.userId === targetUserId);
    if (!target) error('That player does not exist');
    const item = itemForUser(state, user.id, itemId);
    if (item.equipped) error('Unequip the item first');
    item.ownerId = targetUserId;
    saveState(state);
    return Promise.resolve({ message: `Gave ${item.name} to ${target.name}` });
  },

  getShops(): Promise<{ shops: { id: number; name: string; description: string }[] }> {
    const state = loadState();
    mustAuth(state);
    return Promise.resolve({ shops: state.shops.map((s) => ({ id: s.id, name: s.name, description: s.description })) });
  },

  getShopItems(shopId: number): Promise<{ items: any[] }> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    const shop = state.shops.find((s) => s.id === shopId);
    if (!shop) error('Shop not found');

    const items = shop.itemTemplateIds.map((tid) => {
      const base = itemTemplateById(state, tid);
      const adjustedPrice = shopAdjustedPrice(char, base.price);
      return {
        ...base,
        typeName: itemTypes[base.typeId] || 'Unknown',
        qualityName: qualityName(base.qualityId),
        adjustedPrice,
        slot: slotByType[base.typeId] || null,
      };
    });

    return Promise.resolve({ items });
  },

  buyItem(itemId: number): Promise<{ message: string; gold: number; itemName: string }> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    const template = itemTemplateById(state, itemId);
    const price = shopAdjustedPrice(char, template.price);
    if (char.gold < price) error(`Not enough gold! Need ${price}g, have ${char.gold}g`);
    if (char.tradingLimit <= 0) error('No trading actions remaining today');

    char.gold -= price;
    char.tradingLimit -= 1;
    if (char.skillTrading > 0) {
      char.skillTradingUses += 1;
      if (char.skillTradingUses % 10 === 0) char.skillTrading += 1;
    }

    createItemInstance(state, char.userId, template.id);
    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ message: `Bought ${template.name} for ${price}g`, gold: char.gold, itemName: template.name });
  },

  getStealableItems(shopId: number): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    const shop = state.shops.find((s) => s.id === shopId);
    if (!shop) error('Shop not found');

    const minLevel = DEFAULT_CONFIG.shopStealMinLevel;
    if (!canStealFromShop(char.level, minLevel)) {
      return Promise.resolve({ items: [], canSteal: false, reason: `You must be level ${minLevel}+ to steal from shops`, thiefLevel: char.skillThief, thiefLimit: char.thiefLimit, characterLevel: char.level, minLevel });
    }

    if (!char.skillThief) {
      return Promise.resolve({ items: [], canSteal: false, reason: 'You must learn Thief skill in Town first', thiefLevel: 0, thiefLimit: char.thiefLimit, characterLevel: char.level, minLevel });
    }

    const items = shop.itemTemplateIds.map((tid) => {
      const t = itemTemplateById(state, tid);
      const dcValue = Math.max(7, Math.min(150, Math.floor(t.price / 8) + 10));
      return {
        id: t.id,
        name: t.name,
        typeName: itemTypes[t.typeId] || 'Unknown',
        qualityName: qualityName(t.qualityId),
        price: t.price,
        dc: `DC ${dcValue}`,
        dcValue,
      };
    });

    return Promise.resolve({ items, canSteal: char.thiefLimit > 0, reason: char.thiefLimit <= 0 ? 'No thief attempts remaining today' : undefined, thiefLevel: char.skillThief, thiefLimit: char.thiefLimit, characterLevel: char.level, minLevel });
  },

  attemptSteal(itemId: number): Promise<{ message: string }> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);

    if (char.thiefLimit <= 0) error('No thief attempts remaining today');
    if (!char.skillThief) error('You must learn the Thief skill first');

    char.thiefLimit -= 1;

    const template = itemTemplateById(state, itemId);
    const dc = Math.max(7, Math.min(150, Math.floor(template.price / 8) + 10));
    const rollTotal = roll(1, 20) + Math.floor(char.dexterity / 2) + char.skillThief * 3;

    if (rollTotal >= Math.floor(dc / 7.5)) {
      createItemInstance(state, char.userId, template.id);
      char.skillThiefUses += 1;
      if (char.skillThiefUses % 10 === 0) char.skillThief += 1;
      upsertChar(state, char);
      saveState(state);
      return Promise.resolve({ message: `You successfully stole ${template.name}!` });
    }

    // failure penalties
    const goldLoss = Math.min(char.gold, 50 + roll(0, 150));
    char.gold -= goldLoss;
    const jailed = Math.random() < 0.35;
    if (jailed) {
      const jailSeconds = 60 * 10;
      const record: JailRecord = {
        id: state.nextIds.jail++,
        userId: char.userId,
        reason: `Caught stealing ${template.name}`,
        jailedAt: nowIso(),
        releaseAt: new Date(Date.now() + jailSeconds * 1000).toISOString(),
        bailCost: 150 + char.level * 50,
        released: 0,
        releasedAt: '',
        status: 'Serving',
      };
      state.jailRecords.push(record);
      saveState(state);
      error(`Steal failed! You lost ${goldLoss}g and were thrown in jail.`);
    }

    upsertChar(state, char);
    saveState(state);
    error(`Steal failed! You lost ${goldLoss}g.`);
  },

  getTownStatus(): Promise<any> {
    const state = loadState();
    let char = currentCharacterOrThrow(state);
    char = ensureLimits(char);
    upsertChar(state, char);
    saveState(state);

    const currentClass = classById(char.classId);
    const healCost = 100 * char.level;
    const resurrectCost = 300 * char.level;

    return Promise.resolve({
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
        className: currentClass.name,
      },
      stats: [
        { key: 'might', label: 'Might', value: char.might, cost: char.might * 3000 },
        { key: 'dexterity', label: 'Dexterity', value: char.dexterity, cost: char.dexterity * 3000 },
        { key: 'constitution', label: 'Constitution', value: char.constitution, cost: char.constitution * 3000 },
        { key: 'intelligence', label: 'Intelligence', value: char.intelligence, cost: char.intelligence * 3000 },
        { key: 'wisdom', label: 'Wisdom', value: char.wisdom, cost: char.wisdom * 3000 },
        { key: 'charisma', label: 'Charisma', value: char.charisma, cost: char.charisma * 3000 },
      ],
      skills: skillDefs.map((s) => {
        const field = s.id === 1 ? 'skillMining' : s.id === 2 ? 'skillStone' : s.id === 3 ? 'skillForge' : s.id === 4 ? 'skillEnchantment' : s.id === 5 ? 'skillTrading' : 'skillThief';
        const usesField = s.id === 1 ? 'skillMiningUses' : s.id === 2 ? 'skillStoneUses' : s.id === 3 ? 'skillForgeUses' : s.id === 4 ? 'skillEnchantmentUses' : s.id === 5 ? 'skillTradingUses' : 'skillThiefUses';
        const level = char[field as keyof Character] as number;
        const uses = char[usesField as keyof Character] as number;
        return { ...s, learned: level > 0, level, uses };
      }),
      temple: {
        healCost,
        resurrectCost,
        canHeal: !char.isDead && (char.hp < char.hpMax || char.mp < char.mpMax) && char.gold >= healCost,
        canResurrect: (char.isDead === 1 || char.hp <= 0) && char.gold >= resurrectCost,
        needsHeal: char.hp < char.hpMax || char.mp < char.mpMax,
        needsResurrect: char.isDead === 1 || char.hp <= 0,
      },
      limits: {
        battle: char.battleLimit,
        battleMax: DEFAULT_CONFIG.battleLimit,
        skill: char.skillLimit,
        skillMax: DEFAULT_CONFIG.skillLimit,
        trading: char.tradingLimit,
        tradingMax: DEFAULT_CONFIG.tradingLimit,
        thief: char.thiefLimit,
        thiefMax: DEFAULT_CONFIG.thiefLimit,
        nextReset: char.limitUpdate + 86400,
      },
      classes: classes.filter((c) => c.selectable === 1).map((c) => ({
        ...c,
        isCurrent: c.id === char.classId,
        meetsRequirements:
          char.might >= c.mightReq &&
          char.dexterity >= c.dexterityReq &&
          char.constitution >= c.constitutionReq &&
          char.intelligence >= c.intelligenceReq &&
          char.wisdom >= c.wisdomReq &&
          char.charisma >= c.charismaReq,
      })),
      classChangeCost: 100,
    });
  },

  trainStat(stat: string): Promise<any> {
    const allowed = ['might', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    if (!allowed.includes(stat)) error(`Invalid stat: ${stat}. Must be one of: ${allowed.join(', ')}`);
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    const current = char[stat as keyof Character] as number;
    const cost = current * 3000;
    if (char.gold < cost) error(`Not enough gold! Need ${cost}g, have ${char.gold}g`);
    if (current >= 99) error(`${stat} is already at maximum (99)`);
    char.gold -= cost;
    (char as any)[stat] = current + 1;
    if (stat === 'constitution') {
      char.hpMax += 1;
      char.hp += 1;
    }
    if (stat === 'intelligence') {
      char.mpMax += 1;
      char.mp += 1;
    }
    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({
      stat,
      oldValue: current,
      newValue: current + 1,
      cost,
      gold: char.gold,
      hpMax: char.hpMax,
      mpMax: char.mpMax,
      message: `Trained ${stat} from ${current} to ${current + 1} for ${cost}g!`,
    });
  },

  learnSkill(skillId: number): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    const skill = skillDefs.find((s) => s.id === skillId);
    if (!skill) error('Skill not found');
    const field = skillId === 1 ? 'skillMining' : skillId === 2 ? 'skillStone' : skillId === 3 ? 'skillForge' : skillId === 4 ? 'skillEnchantment' : skillId === 5 ? 'skillTrading' : 'skillThief';
    const usesField = skillId === 1 ? 'skillMiningUses' : skillId === 2 ? 'skillStoneUses' : skillId === 3 ? 'skillForgeUses' : skillId === 4 ? 'skillEnchantmentUses' : skillId === 5 ? 'skillTradingUses' : 'skillThiefUses';

    if ((char[field as keyof Character] as number) > 0) error(`You already know ${skill.name}!`);
    if (char.sp < skill.requiredSp) error(`Not enough SP! Need ${skill.requiredSp} SP, have ${char.sp} SP`);

    char.sp -= skill.requiredSp;
    (char as any)[field] = 1;
    (char as any)[usesField] = 0;
    upsertChar(state, char);
    saveState(state);

    return Promise.resolve({ skillId, skillName: skill.name, spCost: skill.requiredSp, sp: char.sp, message: `Learned ${skill.name} for ${skill.requiredSp} SP!` });
  },

  changeClass(classId: number): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (char.classId === classId) error('You are already that class!');
    const newClass = classById(classId);
    if (newClass.selectable !== 1) error('That class is not available');
    if (char.gold < 100) error('Not enough gold! Need 100g');

    if (char.might < newClass.mightReq) error(`Requires ${newClass.mightReq} Might (you have ${char.might})`);
    if (char.dexterity < newClass.dexterityReq) error(`Requires ${newClass.dexterityReq} Dexterity (you have ${char.dexterity})`);
    if (char.constitution < newClass.constitutionReq) error(`Requires ${newClass.constitutionReq} Constitution (you have ${char.constitution})`);
    if (char.intelligence < newClass.intelligenceReq) error(`Requires ${newClass.intelligenceReq} Intelligence (you have ${char.intelligence})`);
    if (char.wisdom < newClass.wisdomReq) error(`Requires ${newClass.wisdomReq} Wisdom (you have ${char.wisdom})`);
    if (char.charisma < newClass.charismaReq) error(`Requires ${newClass.charismaReq} Charisma (you have ${char.charisma})`);

    const old = classById(char.classId);
    const hpDiff = (newClass.baseHp + newClass.updateHp * Math.max(0, char.level - 1)) - (old.baseHp + old.updateHp * Math.max(0, char.level - 1));
    const mpDiff = (newClass.baseMp + newClass.updateMp * Math.max(0, char.level - 1)) - (old.baseMp + old.updateMp * Math.max(0, char.level - 1));
    const acDiff = (newClass.baseAc + newClass.updateAc * Math.max(0, char.level - 1)) - (old.baseAc + old.updateAc * Math.max(0, char.level - 1));

    char.classId = classId;
    char.gold -= 100;
    char.hpMax = Math.max(1, char.hpMax + hpDiff);
    char.mpMax = Math.max(0, char.mpMax + mpDiff);
    char.ac = Math.max(0, char.ac + acDiff);
    char.hp = Math.min(char.hp, char.hpMax);
    char.mp = Math.min(char.mp, char.mpMax);

    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({
      oldClass: old.name,
      newClass: newClass.name,
      cost: 100,
      gold: char.gold,
      hpMax: char.hpMax,
      mpMax: char.mpMax,
      ac: char.ac,
      message: `Changed class from ${old.name} to ${newClass.name} for 100g!`,
    });
  },

  townHeal(): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (char.isDead === 1 || char.hp <= 0) error('Your character is dead! You need to resurrect first.');
    if (char.hp >= char.hpMax && char.mp >= char.mpMax) error('Already at full health and mana!');
    const cost = 100 * char.level;
    if (char.gold < cost) error(`Not enough gold! Need ${cost}g, have ${char.gold}g`);
    char.hp = char.hpMax;
    char.mp = char.mpMax;
    char.gold -= cost;
    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ hp: char.hp, hpMax: char.hpMax, mp: char.mp, mpMax: char.mpMax, cost, gold: char.gold, message: `Healed to full health for ${cost}g!` });
  },

  townResurrect(): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (char.isDead !== 1 && char.hp > 0) error('Your character is alive!');
    const cost = 300 * char.level;
    if (char.gold < cost) error(`Not enough gold! Need ${cost}g, have ${char.gold}g`);
    char.hp = Math.ceil(char.hpMax / 2);
    char.mp = Math.ceil(char.mpMax / 2);
    char.isDead = 0;
    char.gold -= cost;
    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ hp: char.hp, hpMax: char.hpMax, mp: char.mp, mpMax: char.mpMax, cost, gold: char.gold, message: `Resurrected for ${cost}g!` });
  },

  getForgeStatus(): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    const inv = state.items.filter((i) => i.ownerId === char.userId);

    const pickaxes = inv.filter((i) => i.typeId === ITEM_TYPES.PICKAXE).map(mapInventoryItem);
    const rawMaterials = inv.filter((i) => i.typeId === ITEM_TYPES.RAW_MATERIAL || i.typeId === ITEM_TYPES.RARE_MATERIAL).map(mapInventoryItem);
    const equipment = inv
      .filter((i) => equipmentTypeIds.includes(i.typeId) && i.duration < i.durationMax)
      .map(mapInventoryItem);
    const magicItems = inv
      .filter((i) => i.equipped === 0 && equipmentTypeIds.includes(i.typeId))
      .map(mapInventoryItem);

    return Promise.resolve({
      skillMining: char.skillMining,
      skillStone: char.skillStone,
      skillForge: char.skillForge,
      skillEnchantment: char.skillEnchantment,
      skillMiningUses: char.skillMiningUses,
      skillStoneUses: char.skillStoneUses,
      skillForgeUses: char.skillForgeUses,
      skillEnchantmentUses: char.skillEnchantmentUses,
      skillLimit: char.skillLimit,
      pickaxes,
      rawMaterials,
      equipment,
      magicItems,
    });
  },

  mine(pickaxeId: number): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (char.skillMining < 1) error('You must learn Mining first');
    if (char.skillLimit <= 0) error('No skill actions remaining today');
    const pick = itemForUser(state, char.userId, pickaxeId);
    if (pick.typeId !== ITEM_TYPES.PICKAXE) error('Invalid pickaxe');
    if (pick.duration <= 0) error('Pickaxe is broken and needs repair');

    char.skillLimit -= 1;
    pick.duration = Math.max(0, pick.duration - 1);

    if (!miningSuccess(char.skillMining)) {
      char.skillMiningUses += 1;
      if (char.skillMiningUses % 10 === 0) char.skillMining += 1;
      upsertChar(state, char);
      saveState(state);
      return Promise.resolve({ success: false, message: 'You swing the pickaxe but find nothing this time.' });
    }

    const kind = miningResult(char.skillMining);
    const templateId = kind === 'rare' ? 6 : 5;
    const created = createItemInstance(state, char.userId, templateId);
    if (kind === 'rare') created.qualityId = Math.min(5, 2 + Math.floor(char.skillMining / 3));

    char.skillMiningUses += 1;
    if (char.skillMiningUses % 10 === 0) char.skillMining += 1;

    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ success: true, item: mapInventoryItem(created), message: `Mining success! You found ${created.name}.` });
  },

  cutStone(materialId: number): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (char.skillStone < 1) error('You must learn Stonecutting first');
    if (char.skillLimit <= 0) error('No skill actions remaining today');

    const mat = itemForUser(state, char.userId, materialId);
    if (!rawMaterialTypeIds.includes(mat.typeId)) error('That item cannot be cut');
    if (mat.qualityId >= 5) error('This material is already at max quality');

    char.skillLimit -= 1;
    char.skillStoneUses += 1;
    if (char.skillStoneUses % 10 === 0) char.skillStone += 1;

    const criticalFail = Math.random() < 0.05;
    if (criticalFail) {
      state.items = state.items.filter((i) => i.id !== mat.id);
      upsertChar(state, char);
      saveState(state);
      return Promise.resolve({ success: false, critical: true, message: `${mat.name} shattered during cutting!` });
    }

    if (stoneCuttingSuccess(char.skillStone)) {
      mat.qualityId = Math.min(5, mat.qualityId + 1);
      mat.price = Math.max(1, Math.floor(mat.price * 1.2));
      upsertChar(state, char);
      saveState(state);
      return Promise.resolve({ success: true, item: mapInventoryItem(mat), message: `${mat.name} was refined to ${qualityName(mat.qualityId)} quality.` });
    }

    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ success: false, message: `You failed to improve ${mat.name}.` });
  },

  repairItem(itemId: number): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (char.skillForge < 1) error('You must learn Forge first');
    if (char.skillLimit <= 0) error('No skill actions remaining today');

    const item = itemForUser(state, char.userId, itemId);
    const cost = repairCost(item.price, item.duration, item.durationMax);
    if (cost <= 0) error('This item does not need repair');
    if (item.durationMax <= 1) error('This item is too worn to repair');
    if (char.gold < cost) error(`Not enough gold! Need ${cost}g, have ${char.gold}g`);

    char.gold -= cost;
    char.skillLimit -= 1;
    char.skillForgeUses += 1;
    if (char.skillForgeUses % 10 === 0) char.skillForge += 1;

    const criticalFail = Math.random() < 0.05;
    if (criticalFail) {
      item.durationMax = Math.max(1, item.durationMax - 8);
      item.duration = Math.min(item.duration, item.durationMax);
      upsertChar(state, char);
      saveState(state);
      return Promise.resolve({ success: false, critical: true, message: `Repair failed critically. ${item.name} was damaged.` });
    }

    item.duration = item.durationMax;
    item.durationMax = Math.max(1, item.durationMax - 1);

    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ success: true, item: mapInventoryItem(item), message: `${item.name} repaired successfully.` });
  },

  enchantItem(itemId: number): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (char.skillEnchantment < 1) error('You must learn Enchantment first');
    if (char.skillLimit <= 0) error('No skill actions remaining today');

    const item = itemForUser(state, char.userId, itemId);
    if (item.equipped) error('Unequip the item before enchanting');
    if (!equipmentTypeIds.includes(item.typeId)) {
      error('This item type cannot be enchanted');
    }

    const cost = 50 + item.addPower * 20;
    if (char.gold < cost) error(`Not enough gold! Need ${cost}g, have ${char.gold}g`);

    char.gold -= cost;
    char.skillLimit -= 1;
    char.skillEnchantmentUses += 1;
    if (char.skillEnchantmentUses % 10 === 0) char.skillEnchantment += 1;

    const criticalFail = Math.random() < 0.05;
    if (criticalFail) {
      item.addPower = 0;
      upsertChar(state, char);
      saveState(state);
      return Promise.resolve({ success: false, critical: true, message: `Enchantment backfired! ${item.name} lost all bonus power.` });
    }

    const successChance = Math.min(80, 25 + char.skillEnchantment * 5);
    if (Math.random() * 100 <= successChance) {
      item.addPower += 1;
      item.price = Math.floor(item.price * 1.1);
      upsertChar(state, char);
      saveState(state);
      return Promise.resolve({ success: true, item: mapInventoryItem(item), message: `${item.name} enchantment succeeded (+1 bonus power).` });
    }

    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ success: false, message: `${item.name} resisted the enchantment.` });
  },

  getVaultStatus(): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    updateStocks(state);
    applyInterest(state, char.userId);
    const account = getOrCreateVault(state, char.userId);

    const pendingInterest = calculateInterest(account.balance, 4, nowSec() - account.lastInterestTime, 86400);
    const nextInterestIn = account.balance > 0 ? Math.max(0, 86400 - (nowSec() - account.lastInterestTime)) : 0;

    let loanPayoff = 0;
    let loanOverdue = false;
    let loanDueIn = 0;
    if (account.loanAmount > 0) {
      loanPayoff = Math.ceil(account.loanAmount * 1.15);
      if (account.loanInterestTime > 0) {
        const elapsed = nowSec() - account.loanInterestTime;
        loanOverdue = elapsed > 864000;
        loanDueIn = loanOverdue ? 0 : 864000 - elapsed;
      }
    }

    const nextStockUpdateIn = Math.max(0, 86400 - (nowSec() - state.stockLastUpdate));

    const holdings = state.stockHoldings
      .filter((h) => h.userId === char.userId && h.shares > 0)
      .map((h) => {
        const stock = state.stocks.find((s) => s.id === h.stockId);
        const currentPrice = stock ? stock.currentPrice : 0;
        const value = currentPrice * h.shares;
        return {
          stockId: h.stockId,
          stockName: stock ? stock.name : 'Unknown',
          shares: h.shares,
          purchasePrice: h.purchasePrice,
          currentPrice,
          value,
          pnl: value - h.purchasePrice * h.shares,
        };
      });

    saveState(state);

    return Promise.resolve({
      hasAccount: true,
      balance: account.balance,
      pendingInterest,
      nextInterestIn,
      loanAmount: account.loanAmount,
      loanPayoff,
      loanOverdue,
      loanDueIn,
      gold: char.gold,
      stocks: state.stocks.map((s) => ({
        id: s.id,
        name: s.name,
        currentPrice: s.currentPrice,
        previousPrice: s.previousPrice,
        change: s.currentPrice - s.previousPrice,
        changePercent: s.previousPrice > 0 ? Math.round(((s.currentPrice - s.previousPrice) / s.previousPrice) * 10000) / 100 : 0,
      })),
      holdings,
      nextStockUpdateIn,
    });
  },

  vaultDeposit(amount: number): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (amount <= 0) error('Amount must be positive');
    if (char.gold < amount) error(`Not enough gold! You have ${char.gold}g`);
    applyInterest(state, char.userId);
    const account = getOrCreateVault(state, char.userId);
    char.gold -= amount;
    account.balance += amount;
    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ balance: account.balance, gold: char.gold, message: `Deposited ${amount}g. New balance: ${account.balance}g` });
  },

  vaultWithdraw(amount: number): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (amount <= 0) error('Amount must be positive');
    applyInterest(state, char.userId);
    const account = getOrCreateVault(state, char.userId);
    if (account.balance < amount) error(`Insufficient balance! You have ${account.balance}g in the vault`);
    account.balance -= amount;
    char.gold += amount;
    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ balance: account.balance, gold: char.gold, message: `Withdrew ${amount}g. New balance: ${account.balance}g` });
  },

  takeLoan(amount: number): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (amount <= 0) error('Amount must be positive');
    if (amount > 5000) error('Maximum loan amount is 5000g');
    const account = getOrCreateVault(state, char.userId);
    if (account.loanAmount > 0) error('You already have an active loan. Repay it first!');

    account.loanAmount = amount;
    account.loanInterestTime = nowSec();
    char.gold += amount;
    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ loanAmount: amount, gold: char.gold, message: `Borrowed ${amount}g. You must repay ${Math.ceil(amount * 1.15)}g (15% interest).` });
  },

  repayLoan(): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    const account = getOrCreateVault(state, char.userId);
    if (account.loanAmount <= 0) error('You have no active loan');
    const payoff = Math.ceil(account.loanAmount * 1.15);
    if (char.gold < payoff) error(`Not enough gold to repay! You need ${payoff}g, you have ${char.gold}g`);
    char.gold -= payoff;
    account.loanAmount = 0;
    account.loanInterestTime = 0;
    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ gold: char.gold, message: `Loan repaid! Paid ${payoff}g.` });
  },

  buyStock(stockId: number, shares: number): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (shares <= 0) error('Must buy at least 1 share');
    if (shares > 50) error('Maximum 50 shares per transaction');
    updateStocks(state);

    const stock = state.stocks.find((s) => s.id === stockId);
    if (!stock) error('Stock not found');
    const totalCost = stock.currentPrice * shares;
    if (char.gold < totalCost) error(`Not enough gold! ${shares} shares × ${stock.currentPrice}g = ${totalCost}g, you have ${char.gold}g`);

    char.gold -= totalCost;
    let holding = state.stockHoldings.find((h) => h.userId === char.userId && h.stockId === stockId);
    if (!holding) {
      holding = { id: state.nextIds.holding++, userId: char.userId, stockId, shares: 0, purchasePrice: stock.currentPrice };
      state.stockHoldings.push(holding);
    }

    const totalShares = holding.shares + shares;
    const avg = Math.floor((holding.shares * holding.purchasePrice + shares * stock.currentPrice) / totalShares);
    holding.shares = totalShares;
    holding.purchasePrice = avg;

    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ gold: char.gold, shares: holding.shares, totalCost, message: `Bought ${shares} shares of ${stock.name} at ${stock.currentPrice}g each (total: ${totalCost}g)` });
  },

  sellStock(stockId: number, shares: number): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    if (shares <= 0) error('Must sell at least 1 share');
    if (shares > 50) error('Maximum 50 shares per transaction');
    updateStocks(state);

    const stock = state.stocks.find((s) => s.id === stockId);
    if (!stock) error('Stock not found');
    const holding = state.stockHoldings.find((h) => h.userId === char.userId && h.stockId === stockId);
    if (!holding || holding.shares < shares) error(`You don't own enough shares. You have ${holding ? holding.shares : 0}`);

    const totalValue = shares * stock.currentPrice;
    char.gold += totalValue;
    holding.shares -= shares;
    if (holding.shares <= 0) {
      state.stockHoldings = state.stockHoldings.filter((h) => h.id !== holding.id);
    }

    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ gold: char.gold, shares: Math.max(0, holding.shares), totalValue, message: `Sold ${shares} shares of ${stock.name} at ${stock.currentPrice}g each (total: ${totalValue}g)` });
  },

  getMessages(): Promise<{ messages: ChatMessage[] }> {
    const state = loadState();
    mustAuth(state);
    return Promise.resolve({ messages: clone(state.messages.slice(-100)) });
  },

  pollMessages(afterId: number): Promise<{ messages: ChatMessage[] }> {
    const state = loadState();
    mustAuth(state);
    return Promise.resolve({ messages: clone(state.messages.filter((m) => m.id > afterId).slice(-100)) });
  },

  sendMessage(message: string): Promise<any> {
    const state = loadState();
    const user = mustAuth(state);
    const body = message.trim();
    if (!body) error('Message cannot be empty');
    if (body.length > 250) error('Message too long');

    const created: ChatMessage = {
      id: state.nextIds.chat++,
      userId: user.id,
      username: user.username,
      message: normalizeMessage(user.username, body),
      createdAt: nowIso(),
    };
    state.messages.push(created);
    if (state.messages.length > 200) state.messages = state.messages.slice(-200);
    saveState(state);
    return Promise.resolve(created);
  },

  getCharacterList(): Promise<{ characters: any[] }> {
    const state = loadState();
    mustAuth(state);
    const characters = state.characters.map((char) => {
      const user = state.users.find((u) => u.id === char.userId);
      const race = raceById(char.raceId);
      const cls = classById(char.classId);
      const elem = elementById(char.elementId);
      const align = alignmentById(char.alignmentId);
      return {
        id: char.id,
        userId: char.userId,
        username: user ? user.username : 'unknown',
        name: char.name,
        level: char.level,
        className: cls.name,
        raceName: race.name,
        elementName: elem.name,
        elementColor: elem.color,
        alignmentName: align.name,
        victories: char.victories,
        defeats: char.defeats,
        victoriesPvp: char.victoriesPvp,
        defeatsPvp: char.defeatsPvp,
        isDead: char.isDead === 1,
      };
    });
    return Promise.resolve({ characters });
  },

  getCharacterProfile(userId: number): Promise<any> {
    const state = loadState();
    mustAuth(state);
    const char = state.characters.find((c) => c.userId === userId);
    if (!char) error('Character not found');
    const user = state.users.find((u) => u.id === userId);
    const decorated = withCharacterDecorators(char);
    return Promise.resolve({
      name: decorated.name,
      username: user ? user.username : 'unknown',
      level: decorated.level,
      xp: decorated.xp,
      className: decorated.className,
      raceName: decorated.raceName,
      elementName: decorated.elementName,
      elementColor: decorated.elementColor,
      alignmentName: decorated.alignmentName,
      might: decorated.might,
      dexterity: decorated.dexterity,
      constitution: decorated.constitution,
      intelligence: decorated.intelligence,
      wisdom: decorated.wisdom,
      charisma: decorated.charisma,
      hp: decorated.hp,
      hpMax: decorated.hpMax,
      mp: decorated.mp,
      mpMax: decorated.mpMax,
      ac: decorated.ac,
      victories: decorated.victories,
      defeats: decorated.defeats,
      flees: decorated.flees,
      victoriesPvp: decorated.victoriesPvp,
      defeatsPvp: decorated.defeatsPvp,
      isDead: decorated.isDead === 1,
    });
  },

  getJailStatus(): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    const record = checkJail(state, char.userId);
    saveState(state);
    if (!record) {
      return Promise.resolve({ isJailed: false });
    }

    const remainingSeconds = Math.max(0, Math.floor((new Date(record.releaseAt).getTime() - Date.now()) / 1000));
    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;
    const remainingFormatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    return Promise.resolve({
      isJailed: true,
      recordId: record.id,
      reason: record.reason,
      jailedAt: record.jailedAt,
      releaseAt: record.releaseAt,
      bailCost: record.bailCost,
      remainingSeconds,
      remainingFormatted,
    });
  },

  payBail(): Promise<any> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    const record = checkJail(state, char.userId);
    if (!record) error('You are not jailed');
    if (char.gold < record.bailCost) error(`Not enough gold! Need ${record.bailCost}g, have ${char.gold}g`);

    char.gold -= record.bailCost;
    record.released = 1;
    record.releasedAt = nowIso();
    record.status = 'Bailed Out';

    upsertChar(state, char);
    saveState(state);
    return Promise.resolve({ message: `You paid ${record.bailCost}g bail and were released.` });
  },

  getJailHistory(): Promise<{ records: any[] }> {
    const state = loadState();
    const char = currentCharacterOrThrow(state);
    const records = state.jailRecords
      .filter((r) => r.userId === char.userId)
      .map((r) => ({
        id: r.id,
        reason: r.reason,
        jailedAt: r.jailedAt,
        releaseAt: r.releaseAt,
        bailCost: r.bailCost,
        released: r.released,
        releasedAt: r.releasedAt,
        status: r.status,
      }));
    return Promise.resolve({ records });
  },
};
