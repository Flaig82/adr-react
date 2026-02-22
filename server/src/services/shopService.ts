import { eq, and } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { tradingModifier, buyPrice } from '@adr/shared';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ShopItem {
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
  price: number;         // Base shop price
  adjustedPrice: number; // Price after trading modifier
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
  slot: string | null;
}

export interface ShopInfo {
  id: number;
  name: string;
  description: string;
}

// ─── Slot mapping (same as inventoryService) ───────────────────────────────

import { ITEM_TYPE_TO_SLOT } from '@adr/shared';

// ─── Get Shops ──────────────────────────────────────────────────────────────

export function getShops(): ShopInfo[] {
  return db.select().from(schema.shops).all().map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
  }));
}

// ─── Get Shop Items ─────────────────────────────────────────────────────────

export function getShopItems(shopId: number, userId: number): ShopItem[] {
  // Get character for trading modifier
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');

  // Calculate trading modifier
  const tradMod = tradingModifier(char.charisma, char.skillTrading);

  // Get items in this shop
  const items = db.select().from(schema.items)
    .where(and(
      eq(schema.items.shopId, shopId),
      eq(schema.items.ownerId, 0), // NPC shop items have ownerId 0
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
    adjustedPrice: buyPrice(item.price, tradMod),
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
    sellBackPercentage: item.sellBackPercentage,
    restrictLevel: item.restrictLevel,
    slot: ITEM_TYPE_TO_SLOT[item.typeId] || null,
  }));
}

// ─── Buy Item ───────────────────────────────────────────────────────────────

export function purchaseItem(
  userId: number,
  shopItemId: number,
): { message: string; gold: number; itemName: string } {
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');
  if (char.isBattling) throw new Error('Cannot shop during battle');

  // Get the shop item
  const shopItem = db.select().from(schema.items)
    .where(and(
      eq(schema.items.id, shopItemId),
      eq(schema.items.ownerId, 0), // Must be an NPC shop item
    )).get();

  if (!shopItem) throw new Error('Item not found in shop');
  if (shopItem.shopId === 0) throw new Error('Item is not in a shop');

  // Calculate price with trading modifier
  const tradMod = tradingModifier(char.charisma, char.skillTrading);
  const finalPrice = buyPrice(shopItem.price, tradMod);

  // Check gold
  if (char.gold < finalPrice) {
    throw new Error(`Not enough gold! Need ${finalPrice}g, have ${char.gold}g`);
  }

  // Check item restrictions
  const restrictError = checkPurchaseRestrictions(shopItem, char);
  if (restrictError) throw new Error(restrictError);

  // Create a copy of the item for the player (shop items stay in the shop)
  db.insert(schema.items).values({
    name: shopItem.name,
    description: shopItem.description,
    image: shopItem.image,
    typeId: shopItem.typeId,
    qualityId: shopItem.qualityId,
    power: shopItem.power,
    addPower: shopItem.addPower,
    weight: shopItem.weight,
    duration: shopItem.duration,
    durationMax: shopItem.durationMax,
    price: shopItem.price,
    bonusMight: shopItem.bonusMight,
    bonusDexterity: shopItem.bonusDexterity,
    bonusConstitution: shopItem.bonusConstitution,
    bonusIntelligence: shopItem.bonusIntelligence,
    bonusWisdom: shopItem.bonusWisdom,
    bonusCharisma: shopItem.bonusCharisma,
    bonusHp: shopItem.bonusHp,
    bonusMp: shopItem.bonusMp,
    bonusAc: shopItem.bonusAc,
    elementId: shopItem.elementId,
    elementStrongDmg: shopItem.elementStrongDmg,
    elementSameDmg: shopItem.elementSameDmg,
    elementWeakDmg: shopItem.elementWeakDmg,
    critHit: shopItem.critHit,
    critHitMod: shopItem.critHitMod,
    sellBackPercentage: shopItem.sellBackPercentage,
    restrictLevel: shopItem.restrictLevel,
    restrictMight: shopItem.restrictMight,
    restrictDexterity: shopItem.restrictDexterity,
    restrictConstitution: shopItem.restrictConstitution,
    restrictIntelligence: shopItem.restrictIntelligence,
    restrictWisdom: shopItem.restrictWisdom,
    restrictCharisma: shopItem.restrictCharisma,
    restrictClassEnable: shopItem.restrictClassEnable,
    restrictClass: shopItem.restrictClass,
    restrictRaceEnable: shopItem.restrictRaceEnable,
    restrictRace: shopItem.restrictRace,
    restrictAlignEnable: shopItem.restrictAlignEnable,
    restrictAlign: shopItem.restrictAlign,
    restrictElementEnable: shopItem.restrictElementEnable,
    restrictElement: shopItem.restrictElement,
    ownerId: userId,    // Player now owns this copy
    shopId: 0,          // Not in a shop
    equipped: 0,
    inWarehouse: 0,
  }).run();

  // Deduct gold
  db.update(schema.characters).set({
    gold: char.gold - finalPrice,
  }).where(eq(schema.characters.userId, userId)).run();

  return {
    message: `Bought ${shopItem.name} for ${finalPrice} gold`,
    gold: char.gold - finalPrice,
    itemName: shopItem.name,
  };
}

// ─── Check Purchase Restrictions ────────────────────────────────────────────

function checkPurchaseRestrictions(item: any, char: any): string | null {
  // Level restriction
  if (item.restrictLevel > 0 && char.level < item.restrictLevel) {
    return `Requires level ${item.restrictLevel} (you are level ${char.level})`;
  }

  // Stat restrictions
  if (item.restrictMight > 0 && char.might < item.restrictMight) {
    return `Requires ${item.restrictMight} Might`;
  }
  if (item.restrictDexterity > 0 && char.dexterity < item.restrictDexterity) {
    return `Requires ${item.restrictDexterity} Dexterity`;
  }
  if (item.restrictConstitution > 0 && char.constitution < item.restrictConstitution) {
    return `Requires ${item.restrictConstitution} Constitution`;
  }
  if (item.restrictIntelligence > 0 && char.intelligence < item.restrictIntelligence) {
    return `Requires ${item.restrictIntelligence} Intelligence`;
  }
  if (item.restrictWisdom > 0 && char.wisdom < item.restrictWisdom) {
    return `Requires ${item.restrictWisdom} Wisdom`;
  }
  if (item.restrictCharisma > 0 && char.charisma < item.restrictCharisma) {
    return `Requires ${item.restrictCharisma} Charisma`;
  }

  // Class restriction
  if (item.restrictClassEnable) {
    const allowedClasses = item.restrictClass.split(',').filter(Boolean).map(Number);
    if (allowedClasses.length > 0 && !allowedClasses.includes(char.classId)) {
      return 'Your class cannot purchase this item';
    }
  }

  // Race restriction
  if (item.restrictRaceEnable) {
    const allowedRaces = item.restrictRace.split(',').filter(Boolean).map(Number);
    if (allowedRaces.length > 0 && !allowedRaces.includes(char.raceId)) {
      return 'Your race cannot purchase this item';
    }
  }

  // Element restriction
  if (item.restrictElementEnable) {
    const allowedElements = item.restrictElement.split(',').filter(Boolean).map(Number);
    if (allowedElements.length > 0 && !allowedElements.includes(char.elementId)) {
      return 'Your element cannot purchase this item';
    }
  }

  // Alignment restriction
  if (item.restrictAlignEnable) {
    const allowedAligns = item.restrictAlign.split(',').filter(Boolean).map(Number);
    if (allowedAligns.length > 0 && !allowedAligns.includes(char.alignmentId)) {
      return 'Your alignment cannot purchase this item';
    }
  }

  return null;
}
