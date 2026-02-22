// Game constants — ported from ADR PHP

// Quality tiers (from phpbb_adr_shops_items_quality)
export const QUALITY_TIERS = [
  { id: 0, name: "Don't care", modifier: 0, color: '#888888' },
  { id: 1, name: 'Very Poor', modifier: 20, color: '#cc4444' },
  { id: 2, name: 'Poor', modifier: 50, color: '#cc8844' },
  { id: 3, name: 'Medium', modifier: 100, color: '#cccc44' },
  { id: 4, name: 'Good', modifier: 140, color: '#44cc44' },
  { id: 5, name: 'Very Good', modifier: 200, color: '#4488cc' },
  { id: 6, name: 'Excellent', modifier: 300, color: '#cc44cc' },
] as const;

// Item type categories (from phpbb_adr_shops_items_type)
export const ITEM_TYPES = {
  RAW_MATERIAL: 1,
  RARE_MATERIAL: 2,
  PICKAXE: 3,
  MAGIC_TOME: 4,
  WEAPON: 5,
  ENCHANTED_WEAPON: 6,
  ARMOR: 7,
  SHIELD: 8,
  HELM: 9,
  GLOVES: 10,
  MAGIC_ATTACK: 11,
  MAGIC_DEFENSE: 12,
  AMULET: 13,
  RING: 14,
  HEALTH_POTION: 15,
  MANA_POTION: 16,
  SCROLL: 17,
  MISC: 18,
} as const;

// Elements (from phpbb_adr_elements)
export const ELEMENTS = {
  WATER: 1,
  EARTH: 2,
  HOLY: 3,
  FIRE: 4,
} as const;

// Element advantage matrix
// element[attacker] vs element[defender] = damage multiplier
export const ELEMENT_ADVANTAGE: Record<number, Record<number, number>> = {
  [ELEMENTS.WATER]: { [ELEMENTS.FIRE]: 1.25, [ELEMENTS.EARTH]: 0.75, [ELEMENTS.HOLY]: 1.0, [ELEMENTS.WATER]: 1.0 },
  [ELEMENTS.EARTH]: { [ELEMENTS.WATER]: 1.25, [ELEMENTS.FIRE]: 0.75, [ELEMENTS.HOLY]: 1.0, [ELEMENTS.EARTH]: 1.0 },
  [ELEMENTS.FIRE]:  { [ELEMENTS.EARTH]: 1.25, [ELEMENTS.WATER]: 0.75, [ELEMENTS.HOLY]: 1.0, [ELEMENTS.FIRE]: 1.0 },
  [ELEMENTS.HOLY]:  { [ELEMENTS.WATER]: 1.0, [ELEMENTS.EARTH]: 1.0, [ELEMENTS.FIRE]: 1.0, [ELEMENTS.HOLY]: 1.0 },
};

// Stat ranges
export const STAT_MIN = 3;
export const STAT_MAX = 20;

// Equipment slot names
export const EQUIPMENT_SLOTS = [
  { key: 'weapon', label: 'Weapon', typeIds: [5, 6] },
  { key: 'armor', label: 'Armor', typeIds: [7] },
  { key: 'shield', label: 'Shield', typeIds: [8] },
  { key: 'helm', label: 'Helm', typeIds: [9] },
  { key: 'gloves', label: 'Gloves', typeIds: [10] },
  { key: 'amulet', label: 'Amulet', typeIds: [13] },
  { key: 'ring', label: 'Ring', typeIds: [14] },
  { key: 'magic_attack', label: 'Magic Attack', typeIds: [11] },
  { key: 'magic_defense', label: 'Magic Defense', typeIds: [12] },
] as const;

// Default game config values (from adr_general inserts)
export const DEFAULT_CONFIG = {
  maxCharacteristic: 20,
  minCharacteristic: 3,
  allowReroll: true,
  allowCharacterDelete: true,
  battleLimit: 20,
  skillLimit: 30,
  tradingLimit: 30,
  thiefLimit: 10,
  battleEnable: true,
  monsterStatsModifier: 150,
  baseExpMin: 10,
  baseExpMax: 40,
  baseExpModifier: 120,
  baseRewardMin: 10,
  baseRewardMax: 40,
  baseRewardModifier: 120,
  baseSpModifier: 120,
  battleCalcType: 1,
  pvpEnable: true,
  pvpDefiesMax: 5,
  itemModifierPower: 100,
  skillTradingPower: 2,
  trainingSkillCost: 1000,
  trainingCharacCost: 3000,
  trainingUpgradeCost: 10000,
  trainingChangeCost: 100,
  newShopPrice: 500,
  warehouseTax: 10,
  shopTax: 10,
  thiefFailureDamage: 2000,
  thiefFailurePunishment: true,
  thiefFailureTime: 21600,
  shopStealMinLevel: 5,
  vaultEnable: true,
  loanEnable: true,
  interestRate: 4,
  interestTime: 86400,
  loanInterest: 15,
  loanInterestTime: 864000,
  loanMaxSum: 5000,
  stockMaxChange: 10,
  stockMinChange: 0,
  templeHealCost: 100,
  templeResurrectCost: 300,
  nextLevelPenalty: 10,
} as const;
