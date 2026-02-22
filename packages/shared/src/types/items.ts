// Item-related types — mirrors phpbb_adr_shops_items, items_type, items_quality

export interface Item {
  id: number;
  name: string;
  description: string;
  image: string;
  typeId: number;
  qualityId: number;
  power: number; // Base power value
  weight: number;
  duration: number; // Current durability
  durationMax: number; // Max durability
  price: number;

  // Equipment bonuses
  bonusMight: number;
  bonusDexterity: number;
  bonusConstitution: number;
  bonusIntelligence: number;
  bonusWisdom: number;
  bonusCharisma: number;
  bonusHp: number;
  bonusMp: number;
  bonusAc: number;

  // Restrictions
  restrictLevel: number;
  restrictClassEnable: boolean;
  restrictClass: string; // Comma-separated class IDs
  restrictRaceEnable: boolean;
  restrictRace: string; // Comma-separated race IDs
  restrictAlignEnable: boolean;
  restrictAlign: string;
  restrictElementEnable: boolean;
  restrictElement: string;
  restrictStr: number;
  restrictDex: number;
  restrictCon: number;
  restrictInt: number;
  restrictWis: number;
  restrictCha: number;

  // Ownership
  ownerId: number; // 0 = NPC/shop, user_id = player-owned
  inShopId: number; // Which shop it's in (0 = inventory)
  equipped: boolean;
}

export interface ItemType {
  id: number;
  name: string;
  image: string;
  description: string;
}

export interface ItemQuality {
  id: number;
  name: string;
  modifier: number; // Percentage modifier (e.g., 100 = 100%, 300 = 300%)
  color: string; // Display color
}

// Equipment slot mapping
export type EquipmentSlot =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'helm'
  | 'gloves'
  | 'amulet'
  | 'ring'
  | 'magic_attack'
  | 'magic_defense';

// Item type IDs that map to equipment slots
export const ITEM_TYPE_TO_SLOT: Record<number, EquipmentSlot> = {
  5: 'weapon',        // Weapons
  6: 'weapon',        // Enchanted weapons
  7: 'armor',         // Armor
  8: 'shield',        // Buckler
  9: 'helm',          // Helm
  10: 'gloves',       // Gloves
  11: 'magic_attack', // Magic attack
  12: 'magic_defense',// Magic defense
  13: 'amulet',       // Amulets
  14: 'ring',         // Rings
};

// Item type IDs for consumables
export const CONSUMABLE_TYPES = {
  HEALTH_POTION: 15,
  MANA_POTION: 16,
};

// Item type IDs for materials
export const MATERIAL_TYPES = {
  RAW: 1,
  RARE: 2,
  PICKAXE: 3,
  MAGIC_TOME: 4,
};
