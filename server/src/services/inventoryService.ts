import { eq, and, ne } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { ITEM_TYPE_TO_SLOT, type EquipmentSlot } from '@adr/shared';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  image: string;
  typeId: number;
  typeName: string;
  qualityId: number;
  qualityName: string;
  power: number;
  addPower: number;
  weight: number;
  duration: number;
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
  equipped: number;
  slot: EquipmentSlot | null;
}

// Slot key to character field mapping
const SLOT_TO_FIELD: Record<EquipmentSlot, string> = {
  weapon: 'equipWeapon',
  armor: 'equipArmor',
  shield: 'equipShield',
  helm: 'equipHelm',
  gloves: 'equipGloves',
  amulet: 'equipAmulet',
  ring: 'equipRing',
  magic_attack: 'equipMagicAttack',
  magic_defense: 'equipMagicDefense',
};

// ─── Get Inventory ──────────────────────────────────────────────────────────

export function getInventory(userId: number): InventoryItem[] {
  const items = db.select().from(schema.items)
    .where(and(
      eq(schema.items.ownerId, userId),
      eq(schema.items.shopId, 0),
      eq(schema.items.inWarehouse, 0),
    ))
    .all();

  // Get type and quality names
  const itemTypes = db.select().from(schema.itemTypes).all();
  const itemQualities = db.select().from(schema.itemQualities).all();

  const typeMap = new Map(itemTypes.map(t => [t.id, t.name]));
  const qualityMap = new Map(itemQualities.map(q => [q.id, q.name]));

  return items.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    image: item.image,
    typeId: item.typeId,
    typeName: typeMap.get(item.typeId) || 'Unknown',
    qualityId: item.qualityId,
    qualityName: qualityMap.get(item.qualityId) || 'Unknown',
    power: item.power,
    addPower: item.addPower,
    weight: item.weight,
    duration: item.duration,
    durationMax: item.durationMax,
    price: item.price,
    bonusMight: item.bonusMight,
    bonusDexterity: item.bonusDexterity,
    bonusConstitution: item.bonusConstitution,
    bonusIntelligence: item.bonusIntelligence,
    bonusWisdom: item.bonusWisdom,
    bonusCharisma: item.bonusCharisma,
    bonusHp: item.bonusHp,
    bonusMp: item.bonusMp,
    bonusAc: item.bonusAc,
    elementId: item.elementId,
    critHit: item.critHit,
    critHitMod: item.critHitMod,
    equipped: item.equipped,
    slot: ITEM_TYPE_TO_SLOT[item.typeId] || null,
  }));
}

// ─── Check Equip Restrictions ───────────────────────────────────────────────

function checkRestrictions(item: any, char: any): string | null {
  // Level restriction
  if (item.restrictLevel > 0 && char.level < item.restrictLevel) {
    return `Requires level ${item.restrictLevel} (you are level ${char.level})`;
  }

  // Stat restrictions
  if (item.restrictMight > 0 && char.might < item.restrictMight) {
    return `Requires ${item.restrictMight} Might (you have ${char.might})`;
  }
  if (item.restrictDexterity > 0 && char.dexterity < item.restrictDexterity) {
    return `Requires ${item.restrictDexterity} Dexterity (you have ${char.dexterity})`;
  }
  if (item.restrictConstitution > 0 && char.constitution < item.restrictConstitution) {
    return `Requires ${item.restrictConstitution} Constitution (you have ${char.constitution})`;
  }
  if (item.restrictIntelligence > 0 && char.intelligence < item.restrictIntelligence) {
    return `Requires ${item.restrictIntelligence} Intelligence (you have ${char.intelligence})`;
  }
  if (item.restrictWisdom > 0 && char.wisdom < item.restrictWisdom) {
    return `Requires ${item.restrictWisdom} Wisdom (you have ${char.wisdom})`;
  }
  if (item.restrictCharisma > 0 && char.charisma < item.restrictCharisma) {
    return `Requires ${item.restrictCharisma} Charisma (you have ${char.charisma})`;
  }

  // Class restriction
  if (item.restrictClassEnable) {
    const allowedClasses = item.restrictClass.split(',').filter(Boolean).map(Number);
    if (allowedClasses.length > 0 && !allowedClasses.includes(char.classId)) {
      return 'Your class cannot equip this item';
    }
  }

  // Race restriction
  if (item.restrictRaceEnable) {
    const allowedRaces = item.restrictRace.split(',').filter(Boolean).map(Number);
    if (allowedRaces.length > 0 && !allowedRaces.includes(char.raceId)) {
      return 'Your race cannot equip this item';
    }
  }

  // Element restriction
  if (item.restrictElementEnable) {
    const allowedElements = item.restrictElement.split(',').filter(Boolean).map(Number);
    if (allowedElements.length > 0 && !allowedElements.includes(char.elementId)) {
      return 'Your element cannot equip this item';
    }
  }

  // Alignment restriction
  if (item.restrictAlignEnable) {
    const allowedAligns = item.restrictAlign.split(',').filter(Boolean).map(Number);
    if (allowedAligns.length > 0 && !allowedAligns.includes(char.alignmentId)) {
      return 'Your alignment cannot equip this item';
    }
  }

  return null; // All checks passed
}

// ─── Equip Item ─────────────────────────────────────────────────────────────

export function equipItem(userId: number, itemId: number): { success: boolean; message: string } {
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');
  if (char.isBattling) throw new Error('Cannot change equipment during battle');

  const item = db.select().from(schema.items)
    .where(and(eq(schema.items.id, itemId), eq(schema.items.ownerId, userId))).get();
  if (!item) throw new Error('Item not found in your inventory');
  if (item.equipped) throw new Error('Item is already equipped');
  if (item.duration <= 0) throw new Error('Item is broken and cannot be equipped');

  // Determine the slot
  const slot = ITEM_TYPE_TO_SLOT[item.typeId];
  if (!slot) throw new Error('This item cannot be equipped');

  // Check restrictions
  const restrictionError = checkRestrictions(item, char);
  if (restrictionError) throw new Error(restrictionError);

  // Get the column name for this slot
  const slotField = SLOT_TO_FIELD[slot];

  // Unequip current item in that slot (if any)
  const currentEquippedId = (char as any)[slotField];
  if (currentEquippedId && currentEquippedId > 0) {
    db.update(schema.items).set({ equipped: 0 })
      .where(eq(schema.items.id, currentEquippedId)).run();
  }

  // Equip the new item
  db.update(schema.items).set({ equipped: 1 })
    .where(eq(schema.items.id, itemId)).run();

  // Update character equipment slot
  const updateData: any = {};
  updateData[slotField] = itemId;
  db.update(schema.characters).set(updateData)
    .where(eq(schema.characters.userId, userId)).run();

  return { success: true, message: `Equipped ${item.name}` };
}

// ─── Unequip Item ───────────────────────────────────────────────────────────

export function unequipItem(userId: number, itemId: number): { success: boolean; message: string } {
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');
  if (char.isBattling) throw new Error('Cannot change equipment during battle');

  const item = db.select().from(schema.items)
    .where(and(eq(schema.items.id, itemId), eq(schema.items.ownerId, userId))).get();
  if (!item) throw new Error('Item not found in your inventory');
  if (!item.equipped) throw new Error('Item is not equipped');

  // Determine slot
  const slot = ITEM_TYPE_TO_SLOT[item.typeId];
  if (!slot) throw new Error('This item type has no slot');
  const slotField = SLOT_TO_FIELD[slot];

  // Unequip
  db.update(schema.items).set({ equipped: 0 })
    .where(eq(schema.items.id, itemId)).run();

  // Clear character equipment slot
  const updateData: any = {};
  updateData[slotField] = 0;
  db.update(schema.characters).set(updateData)
    .where(eq(schema.characters.userId, userId)).run();

  return { success: true, message: `Unequipped ${item.name}` };
}

// ─── Sell Item ──────────────────────────────────────────────────────────────

export function sellItem(userId: number, itemId: number): { gold: number; message: string } {
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');

  const item = db.select().from(schema.items)
    .where(and(eq(schema.items.id, itemId), eq(schema.items.ownerId, userId))).get();
  if (!item) throw new Error('Item not found in your inventory');
  if (item.equipped) throw new Error('Unequip the item first before selling');

  // Calculate sell price
  const sellPrice = Math.max(1, Math.ceil(item.price * (item.sellBackPercentage / 100)));

  // Award gold and remove item
  db.update(schema.characters).set({
    gold: char.gold + sellPrice,
  }).where(eq(schema.characters.userId, userId)).run();

  db.delete(schema.items).where(eq(schema.items.id, itemId)).run();

  return { gold: sellPrice, message: `Sold ${item.name} for ${sellPrice} gold` };
}

// ─── Drop (Delete) Item ─────────────────────────────────────────────────────

export function dropItem(userId: number, itemId: number): { message: string } {
  const item = db.select().from(schema.items)
    .where(and(eq(schema.items.id, itemId), eq(schema.items.ownerId, userId))).get();
  if (!item) throw new Error('Item not found in your inventory');
  if (item.equipped) throw new Error('Unequip the item first');

  db.delete(schema.items).where(eq(schema.items.id, itemId)).run();

  return { message: `Dropped ${item.name}` };
}

// ─── Give Item to Another Player ────────────────────────────────────────────

export function giveItem(userId: number, itemId: number, targetUserId: number): { message: string } {
  if (userId === targetUserId) throw new Error('You cannot give items to yourself');

  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');
  if (char.isBattling) throw new Error('Cannot give items during battle');

  const item = db.select().from(schema.items)
    .where(and(eq(schema.items.id, itemId), eq(schema.items.ownerId, userId))).get();
  if (!item) throw new Error('Item not found in your inventory');
  if (item.equipped) throw new Error('Unequip the item first');

  // Verify target exists and has a character
  const targetChar = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, targetUserId)).get();
  if (!targetChar) throw new Error('That player does not exist');

  // Transfer ownership
  db.update(schema.items).set({
    ownerId: targetUserId,
  }).where(eq(schema.items.id, itemId)).run();

  return { message: `Gave ${item.name} to ${targetChar.name}` };
}

// ─── Get Equipped Items (for battle stat calculation) ───────────────────────

export function getEquippedItems(userId: number) {
  return db.select().from(schema.items)
    .where(and(
      eq(schema.items.ownerId, userId),
      eq(schema.items.equipped, 1),
    ))
    .all();
}

// ─── Calculate Equipment Bonuses ────────────────────────────────────────────

export function calculateEquipmentBonuses(userId: number): {
  defBonus: number;      // From armor, shield, helm, gloves (power + addPower)
  weaponPower: number;   // From weapon (power + addPower)
  weaponCritRange: number; // Crit threat range from weapon
  weaponCritMod: number;   // Crit damage multiplier
  weaponElement: number;   // Weapon element for damage
  hpRegen: number;       // From amulet (power)
  mpRegen: number;       // From ring (power)
  magicAttBonus: number; // From magic attack item
  magicDefBonus: number; // From magic defense item
} {
  const equippedItems = getEquippedItems(userId);

  let defBonus = 0;
  let weaponPower = 0;
  let weaponCritRange = 20;
  let weaponCritMod = 2;
  let weaponElement = 0;
  let hpRegen = 0;
  let mpRegen = 0;
  let magicAttBonus = 0;
  let magicDefBonus = 0;

  for (const item of equippedItems) {
    const totalPower = item.power + item.addPower;
    const slot = ITEM_TYPE_TO_SLOT[item.typeId];

    switch (slot) {
      case 'weapon':
        weaponPower = totalPower;
        weaponCritRange = item.critHit;
        weaponCritMod = item.critHitMod;
        weaponElement = item.elementId;
        break;
      case 'armor':
      case 'shield':
      case 'helm':
      case 'gloves':
        defBonus += totalPower + item.bonusAc;
        break;
      case 'amulet':
        hpRegen = totalPower;
        break;
      case 'ring':
        mpRegen = totalPower;
        break;
      case 'magic_attack':
        magicAttBonus = totalPower;
        break;
      case 'magic_defense':
        magicDefBonus = totalPower;
        break;
    }
  }

  return {
    defBonus,
    weaponPower,
    weaponCritRange,
    weaponCritMod,
    weaponElement,
    hpRegen,
    mpRegen,
    magicAttBonus,
    magicDefBonus,
  };
}

// ─── Decrement Equipment Durability (called when entering battle) ───────────

export function decrementDurability(userId: number): void {
  const equippedItems = getEquippedItems(userId);
  for (const item of equippedItems) {
    if (item.duration > 0) {
      db.update(schema.items).set({
        duration: item.duration - 1,
      }).where(eq(schema.items.id, item.id)).run();
    }
  }
}

// ─── Grant Starter Items (called on character creation) ────────────────────

export function grantStarterItems(userId: number): void {
  const starterItems = [
    // Rusty Sword — basic weapon
    {
      name: 'Rusty Sword',
      description: 'A worn but serviceable blade. Better than bare fists.',
      typeId: 5, // Weapon
      qualityId: 2, // Poor
      power: 5,
      weight: 4,
      price: 30,
      duration: 80,
      durationMax: 80,
      bonusMight: 0,
      critHit: 20,
      critHitMod: 2,
    },
    // Padded Armor — basic armor
    {
      name: 'Padded Armor',
      description: 'Simple padded cloth that offers some protection.',
      typeId: 7, // Armor
      qualityId: 2, // Poor
      power: 0,
      weight: 8,
      price: 40,
      duration: 80,
      durationMax: 80,
      bonusAc: 2,
    },
    // Health Potion x2
    {
      name: 'Small Health Potion',
      description: 'Restores 10 HP',
      typeId: 15, // Health Potion
      qualityId: 2, // Poor
      power: 10,
      weight: 1,
      price: 20,
      duration: 1,
      durationMax: 1,
    },
    {
      name: 'Small Health Potion',
      description: 'Restores 10 HP',
      typeId: 15, // Health Potion
      qualityId: 2, // Poor
      power: 10,
      weight: 1,
      price: 20,
      duration: 1,
      durationMax: 1,
    },
  ];

  for (const item of starterItems) {
    db.insert(schema.items).values({
      name: item.name,
      description: item.description,
      typeId: item.typeId,
      qualityId: item.qualityId,
      power: item.power,
      weight: item.weight,
      price: item.price,
      duration: item.duration,
      durationMax: item.durationMax,
      bonusMight: item.bonusMight || 0,
      bonusDexterity: 0,
      bonusConstitution: 0,
      bonusIntelligence: 0,
      bonusWisdom: 0,
      bonusCharisma: 0,
      bonusHp: 0,
      bonusMp: 0,
      bonusAc: item.bonusAc || 0,
      critHit: item.critHit || 20,
      critHitMod: item.critHitMod || 2,
      ownerId: userId,
      shopId: 0,
      equipped: 0,
    }).run();
  }
}
