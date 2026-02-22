import { eq, and } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import {
  ITEM_TYPES,
  miningSuccess, miningResult,
  stoneCuttingSuccess,
  forgingResult, forgeQuality,
  enchantSuccess,
  repairCost,
} from '@adr/shared';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ForgeStatus {
  skillMining: number;
  skillStone: number;
  skillForge: number;
  skillEnchantment: number;
  skillMiningUses: number;
  skillStoneUses: number;
  skillForgeUses: number;
  skillEnchantmentUses: number;
  skillLimit: number;
  // Items available for each action
  pickaxes: ForgeItem[];
  rawMaterials: ForgeItem[];
  equipment: ForgeItem[];
  magicItems: ForgeItem[];
}

export interface ForgeItem {
  id: number;
  name: string;
  typeId: number;
  typeName: string;
  qualityId: number;
  qualityName: string;
  power: number;
  addPower: number;
  duration: number;
  durationMax: number;
  weight: number;
  price: number;
  slot: string | null;
}

interface ForgeActionResult {
  success: boolean;
  message: string;
  criticalFailure?: boolean;
  item?: ForgeItem;
  skillLevel?: number;
  skillUses?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const ITEM_TYPE_TO_SLOT: Record<number, string> = {
  5: 'weapon', 6: 'weapon', 7: 'armor', 8: 'shield', 9: 'helm',
  10: 'gloves', 11: 'magic_attack', 12: 'magic_defense', 13: 'amulet', 14: 'ring',
};

// Equipment type IDs (items that can be repaired/enchanted)
const EQUIPMENT_TYPE_IDS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
// Magic item type IDs (for enchanting)
const MAGIC_TYPE_IDS = [11, 12];

// Skill level up thresholds: uses needed to reach next level
// Original PHP: every 10 uses = +1 skill level
const USES_PER_LEVEL = 10;

function getSkillLevel(uses: number): number {
  return Math.floor(uses / USES_PER_LEVEL);
}

function getItemTypeName(typeId: number): string {
  const names: Record<number, string> = {
    1: 'Raw Material', 2: 'Rare Material', 3: 'Pickaxe', 4: 'Magic Tome',
    5: 'Weapon', 6: 'Enchanted Weapon', 7: 'Armor', 8: 'Shield',
    9: 'Helm', 10: 'Gloves', 11: 'Magic Attack', 12: 'Magic Defense',
    13: 'Amulet', 14: 'Ring', 15: 'Health Potion', 16: 'Mana Potion',
    17: 'Scroll', 18: 'Miscellaneous',
  };
  return names[typeId] || 'Unknown';
}

function getQualityName(qualityId: number): string {
  const names: Record<number, string> = {
    0: "Don't care", 1: 'Very Poor', 2: 'Poor', 3: 'Medium',
    4: 'Good', 5: 'Very Good', 6: 'Excellent',
  };
  return names[qualityId] || 'Unknown';
}

function mapToForgeItem(item: any): ForgeItem {
  return {
    id: item.id,
    name: item.name,
    typeId: item.typeId,
    typeName: getItemTypeName(item.typeId),
    qualityId: item.qualityId,
    qualityName: getQualityName(item.qualityId),
    power: item.power,
    addPower: item.addPower,
    duration: item.duration,
    durationMax: item.durationMax,
    weight: item.weight,
    price: item.price,
    slot: ITEM_TYPE_TO_SLOT[item.typeId] || null,
  };
}

function getCharacter(userId: number) {
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');
  if (char.isBattling) throw new Error('Cannot use the forge during battle');
  return char;
}

function getPlayerItems(userId: number, typeIds: number[]) {
  return db.select().from(schema.items)
    .where(and(
      eq(schema.items.ownerId, userId),
      eq(schema.items.shopId, 0),
      eq(schema.items.equipped, 0),
      eq(schema.items.inWarehouse, 0),
    ))
    .all()
    .filter(i => typeIds.includes(i.typeId));
}

function checkSkillLimit(char: any): void {
  if (char.skillLimit <= 0) {
    throw new Error('You have reached your daily skill limit. Come back tomorrow!');
  }
}

function decrementSkillLimit(userId: number, currentLimit: number): void {
  db.update(schema.characters).set({
    skillLimit: currentLimit - 1,
  }).where(eq(schema.characters.userId, userId)).run();
}

// ─── Get Forge Status ───────────────────────────────────────────────────────

export function getForgeStatus(userId: number): ForgeStatus {
  const char = getCharacter(userId);

  // Get unequipped inventory items for each category
  const allItems = db.select().from(schema.items)
    .where(and(
      eq(schema.items.ownerId, userId),
      eq(schema.items.shopId, 0),
      eq(schema.items.equipped, 0),
      eq(schema.items.inWarehouse, 0),
    ))
    .all();

  const pickaxes = allItems.filter(i => i.typeId === ITEM_TYPES.PICKAXE);
  const rawMaterials = allItems.filter(i => [ITEM_TYPES.RAW_MATERIAL, ITEM_TYPES.RARE_MATERIAL].includes(i.typeId));
  const equipment = allItems.filter(i => EQUIPMENT_TYPE_IDS.includes(i.typeId) && i.duration < i.durationMax);
  const magicItems = allItems.filter(i => EQUIPMENT_TYPE_IDS.includes(i.typeId));

  return {
    skillMining: char.skillMining,
    skillStone: char.skillStone,
    skillForge: char.skillForge,
    skillEnchantment: char.skillEnchantment,
    skillMiningUses: char.skillMiningUses,
    skillStoneUses: char.skillStoneUses,
    skillForgeUses: char.skillForgeUses,
    skillEnchantmentUses: char.skillEnchantmentUses,
    skillLimit: char.skillLimit,
    pickaxes: pickaxes.map(mapToForgeItem),
    rawMaterials: rawMaterials.map(mapToForgeItem),
    equipment: equipment.map(mapToForgeItem),
    magicItems: magicItems.map(mapToForgeItem),
  };
}

// ─── Mining ─────────────────────────────────────────────────────────────────
// Requires: Mining skill learned (skillMining >= 1), a pickaxe in inventory
// Produces: Raw ore or gems, decrements pickaxe durability

export function mine(userId: number, pickaxeId: number): ForgeActionResult {
  const char = getCharacter(userId);

  // Check skill learned
  if (char.skillMining < 1) {
    throw new Error('You need to learn the Mining skill first! Visit the Town to learn skills.');
  }

  checkSkillLimit(char);

  // Get the pickaxe
  const pickaxe = db.select().from(schema.items)
    .where(and(
      eq(schema.items.id, pickaxeId),
      eq(schema.items.ownerId, userId),
      eq(schema.items.typeId, ITEM_TYPES.PICKAXE),
      eq(schema.items.equipped, 0),
    )).get();

  if (!pickaxe) throw new Error('Pickaxe not found in your inventory');
  if (pickaxe.duration <= 0) throw new Error('Your pickaxe is broken! Get a new one or repair it.');

  // Decrement pickaxe durability
  db.update(schema.items).set({
    duration: pickaxe.duration - 1,
  }).where(eq(schema.items.id, pickaxeId)).run();

  // Decrement skill limit
  decrementSkillLimit(userId, char.skillLimit);

  // Increment mining uses
  const newUses = char.skillMiningUses + 1;
  const newLevel = getSkillLevel(newUses);
  const leveledUp = newLevel > char.skillMining;

  db.update(schema.characters).set({
    skillMiningUses: newUses,
    skillMining: Math.max(char.skillMining, newLevel),
  }).where(eq(schema.characters.userId, userId)).run();

  // Check mining success
  if (!miningSuccess(char.skillMining)) {
    let msg = 'You swing your pickaxe but find nothing useful.';
    if (leveledUp) msg += ` Mining skill increased to level ${newLevel}!`;
    return {
      success: false,
      message: msg,
      skillLevel: Math.max(char.skillMining, newLevel),
      skillUses: newUses,
    };
  }

  // Determine what was mined
  const result = miningResult(char.skillMining);

  let itemName: string;
  let itemTypeId: number;
  let itemQualityId: number;
  let itemPower: number;
  let itemPrice: number;
  let itemWeight: number;

  switch (result) {
    case 'rare':
      itemName = 'Rare Diamond';
      itemTypeId = ITEM_TYPES.RARE_MATERIAL;
      itemQualityId = 5; // Very Good
      itemPower = 0;
      itemPrice = 150;
      itemWeight = 1;
      break;
    case 'gem':
      itemName = 'Rough Gem';
      itemTypeId = ITEM_TYPES.RARE_MATERIAL;
      itemQualityId = 3; // Medium
      itemPower = 0;
      itemPrice = 80;
      itemWeight = 1;
      break;
    default: // 'ore'
      itemName = 'Iron Ore';
      itemTypeId = ITEM_TYPES.RAW_MATERIAL;
      itemQualityId = 2; // Poor
      itemPower = 0;
      itemPrice = 30;
      itemWeight = 3;
      break;
  }

  // Create the mined item
  const inserted = db.insert(schema.items).values({
    name: itemName,
    description: `Mined material (mining skill level ${char.skillMining})`,
    image: '',
    typeId: itemTypeId,
    qualityId: itemQualityId,
    power: itemPower,
    addPower: 0,
    weight: itemWeight,
    duration: 100,
    durationMax: 100,
    price: itemPrice,
    ownerId: userId,
    shopId: 0,
    equipped: 0,
    inWarehouse: 0,
  }).run();

  const newItem = db.select().from(schema.items)
    .where(eq(schema.items.id, Number(inserted.lastInsertRowid))).get();

  let msg = `You mined ${itemName}!`;
  if (pickaxe.duration - 1 <= 0) msg += ' Your pickaxe broke!';
  else if (pickaxe.duration - 1 <= 5) msg += ` Your pickaxe is getting worn (${pickaxe.duration - 1} durability left).`;
  if (leveledUp) msg += ` Mining skill increased to level ${newLevel}!`;

  return {
    success: true,
    message: msg,
    item: newItem ? mapToForgeItem(newItem) : undefined,
    skillLevel: Math.max(char.skillMining, newLevel),
    skillUses: newUses,
  };
}

// ─── Stone Cutting ──────────────────────────────────────────────────────────
// Requires: Stonecutting skill, a raw/rare material in inventory
// Improves quality of the material (up to quality 5)
// 5% critical failure — destroys the material

export function cutStone(userId: number, materialId: number): ForgeActionResult {
  const char = getCharacter(userId);

  if (char.skillStone < 1) {
    throw new Error('You need to learn the Stonecutting skill first! Visit the Town to learn skills.');
  }

  checkSkillLimit(char);

  // Get the material
  const material = db.select().from(schema.items)
    .where(and(
      eq(schema.items.id, materialId),
      eq(schema.items.ownerId, userId),
      eq(schema.items.equipped, 0),
    )).get();

  if (!material) throw new Error('Material not found in your inventory');
  if (![ITEM_TYPES.RAW_MATERIAL, ITEM_TYPES.RARE_MATERIAL].includes(material.typeId)) {
    throw new Error('You can only cut raw or rare materials');
  }
  if (material.qualityId >= 5) {
    throw new Error('This material is already at maximum quality for cutting');
  }

  // Decrement skill limit
  decrementSkillLimit(userId, char.skillLimit);

  // Increment stone uses
  const newUses = char.skillStoneUses + 1;
  const newLevel = getSkillLevel(newUses);
  const leveledUp = newLevel > char.skillStone;

  db.update(schema.characters).set({
    skillStoneUses: newUses,
    skillStone: Math.max(char.skillStone, newLevel),
  }).where(eq(schema.characters.userId, userId)).run();

  // 5% critical failure — destroy the material
  const critRoll = Math.random() * 100;
  if (critRoll < 5) {
    db.delete(schema.items).where(eq(schema.items.id, materialId)).run();
    let msg = `Critical failure! The ${material.name} shattered during cutting and was destroyed!`;
    if (leveledUp) msg += ` Stonecutting skill increased to level ${newLevel}!`;
    return {
      success: false,
      criticalFailure: true,
      message: msg,
      skillLevel: Math.max(char.skillStone, newLevel),
      skillUses: newUses,
    };
  }

  // Check success
  if (!stoneCuttingSuccess(char.skillStone)) {
    let msg = 'Your cutting attempt failed. The material is undamaged, try again.';
    if (leveledUp) msg += ` Stonecutting skill increased to level ${newLevel}!`;
    return {
      success: false,
      message: msg,
      skillLevel: Math.max(char.skillStone, newLevel),
      skillUses: newUses,
    };
  }

  // Success — improve quality by 1
  const newQuality = material.qualityId + 1;
  const newPrice = Math.ceil(material.price * 1.5);

  db.update(schema.items).set({
    qualityId: newQuality,
    price: newPrice,
    name: newQuality >= 4 ? 'Polished ' + material.name.replace('Polished ', '') : material.name,
  }).where(eq(schema.items.id, materialId)).run();

  const updatedItem = db.select().from(schema.items)
    .where(eq(schema.items.id, materialId)).get();

  let msg = `Successfully improved ${material.name} to ${getQualityName(newQuality)} quality!`;
  if (leveledUp) msg += ` Stonecutting skill increased to level ${newLevel}!`;

  return {
    success: true,
    message: msg,
    item: updatedItem ? mapToForgeItem(updatedItem) : undefined,
    skillLevel: Math.max(char.skillStone, newLevel),
    skillUses: newUses,
  };
}

// ─── Repair ─────────────────────────────────────────────────────────────────
// Requires: Forge skill, an equipment item with durability < max
// Restores durability but decreases durationMax by 1 each repair
// 5% critical failure — destroys the item
// Costs gold based on item price and damage

export function repair(userId: number, itemId: number): ForgeActionResult {
  const char = getCharacter(userId);

  if (char.skillForge < 1) {
    throw new Error('You need to learn the Forge skill first! Visit the Town to learn skills.');
  }

  checkSkillLimit(char);

  // Get the item
  const item = db.select().from(schema.items)
    .where(and(
      eq(schema.items.id, itemId),
      eq(schema.items.ownerId, userId),
      eq(schema.items.equipped, 0),
    )).get();

  if (!item) throw new Error('Item not found in your inventory');
  if (!EQUIPMENT_TYPE_IDS.includes(item.typeId)) {
    throw new Error('You can only repair equipment items');
  }
  if (item.duration >= item.durationMax) {
    throw new Error('This item is already at full durability');
  }
  if (item.durationMax <= 1) {
    throw new Error('This item is too worn to repair any further');
  }

  // Calculate repair cost
  const cost = repairCost(item.price, item.duration, item.durationMax);
  if (char.gold < cost) {
    throw new Error(`Not enough gold! Repair costs ${cost}g, you have ${char.gold}g`);
  }

  // Deduct gold and decrement skill limit
  db.update(schema.characters).set({
    gold: char.gold - cost,
    skillLimit: char.skillLimit - 1,
  }).where(eq(schema.characters.userId, userId)).run();

  // Increment forge uses
  const newUses = char.skillForgeUses + 1;
  const newLevel = getSkillLevel(newUses);
  const leveledUp = newLevel > char.skillForge;

  db.update(schema.characters).set({
    skillForgeUses: newUses,
    skillForge: Math.max(char.skillForge, newLevel),
  }).where(eq(schema.characters.userId, userId)).run();

  // 5% critical failure — destroy the item
  const critRoll = Math.random() * 100;
  if (critRoll < 5) {
    db.delete(schema.items).where(eq(schema.items.id, itemId)).run();
    let msg = `Critical failure! The ${item.name} was destroyed during repair! (${cost}g lost)`;
    if (leveledUp) msg += ` Forge skill increased to level ${newLevel}!`;
    return {
      success: false,
      criticalFailure: true,
      message: msg,
      skillLevel: Math.max(char.skillForge, newLevel),
      skillUses: newUses,
    };
  }

  // Check forging result
  const result = forgingResult(char.skillForge);

  if (result === 'critical_failure') {
    // Already handled above with the 5% roll
    // This is a secondary failure path from the forging formula
    db.delete(schema.items).where(eq(schema.items.id, itemId)).run();
    let msg = `Catastrophic failure! The ${item.name} crumbled during repair! (${cost}g lost)`;
    if (leveledUp) msg += ` Forge skill increased to level ${newLevel}!`;
    return {
      success: false,
      criticalFailure: true,
      message: msg,
      skillLevel: Math.max(char.skillForge, newLevel),
      skillUses: newUses,
    };
  }

  if (result === 'failure') {
    let msg = `Repair attempt on ${item.name} failed. No damage done, but the gold was spent (${cost}g).`;
    if (leveledUp) msg += ` Forge skill increased to level ${newLevel}!`;
    return {
      success: false,
      message: msg,
      skillLevel: Math.max(char.skillForge, newLevel),
      skillUses: newUses,
    };
  }

  // Success — restore durability, but decrease max by 1
  const newDurationMax = item.durationMax - 1;
  const newDuration = newDurationMax; // Fully repair to new max

  db.update(schema.items).set({
    duration: newDuration,
    durationMax: newDurationMax,
  }).where(eq(schema.items.id, itemId)).run();

  const updatedItem = db.select().from(schema.items)
    .where(eq(schema.items.id, itemId)).get();

  let msg = `Successfully repaired ${item.name}! Durability: ${newDuration}/${newDurationMax} (cost: ${cost}g)`;
  if (leveledUp) msg += ` Forge skill increased to level ${newLevel}!`;

  return {
    success: true,
    message: msg,
    item: updatedItem ? mapToForgeItem(updatedItem) : undefined,
    skillLevel: Math.max(char.skillForge, newLevel),
    skillUses: newUses,
  };
}

// ─── Enchant ────────────────────────────────────────────────────────────────
// Requires: Enchantment skill, an equipment item
// Adds +1 addPower to the item
// 5% critical failure — resets addPower to 0
// Costs gold based on item price

export function enchant(userId: number, itemId: number): ForgeActionResult {
  const char = getCharacter(userId);

  if (char.skillEnchantment < 1) {
    throw new Error('You need to learn the Enchantment skill first! Visit the Town to learn skills.');
  }

  checkSkillLimit(char);

  // Get the item
  const item = db.select().from(schema.items)
    .where(and(
      eq(schema.items.id, itemId),
      eq(schema.items.ownerId, userId),
      eq(schema.items.equipped, 0),
    )).get();

  if (!item) throw new Error('Item not found in your inventory');
  if (!EQUIPMENT_TYPE_IDS.includes(item.typeId)) {
    throw new Error('You can only enchant equipment items');
  }

  // Enchanting cost: 50g base + 20g per existing addPower
  const cost = 50 + item.addPower * 20;
  if (char.gold < cost) {
    throw new Error(`Not enough gold! Enchanting costs ${cost}g, you have ${char.gold}g`);
  }

  // Deduct gold and decrement skill limit
  db.update(schema.characters).set({
    gold: char.gold - cost,
    skillLimit: char.skillLimit - 1,
  }).where(eq(schema.characters.userId, userId)).run();

  // Increment enchantment uses
  const newUses = char.skillEnchantmentUses + 1;
  const newLevel = getSkillLevel(newUses);
  const leveledUp = newLevel > char.skillEnchantment;

  db.update(schema.characters).set({
    skillEnchantmentUses: newUses,
    skillEnchantment: Math.max(char.skillEnchantment, newLevel),
  }).where(eq(schema.characters.userId, userId)).run();

  // 5% critical failure — reset addPower to 0
  const critRoll = Math.random() * 100;
  if (critRoll < 5) {
    db.update(schema.items).set({ addPower: 0 }).where(eq(schema.items.id, itemId)).run();
    const updatedItem = db.select().from(schema.items)
      .where(eq(schema.items.id, itemId)).get();

    let msg = `Critical failure! The enchantment on ${item.name} destabilized — all bonus power was lost! (${cost}g spent)`;
    if (leveledUp) msg += ` Enchantment skill increased to level ${newLevel}!`;
    return {
      success: false,
      criticalFailure: true,
      message: msg,
      item: updatedItem ? mapToForgeItem(updatedItem) : undefined,
      skillLevel: Math.max(char.skillEnchantment, newLevel),
      skillUses: newUses,
    };
  }

  // Check enchant success
  if (!enchantSuccess(char.skillEnchantment)) {
    let msg = `Enchantment of ${item.name} fizzled. No effect, but the gold was spent (${cost}g).`;
    if (leveledUp) msg += ` Enchantment skill increased to level ${newLevel}!`;
    return {
      success: false,
      message: msg,
      skillLevel: Math.max(char.skillEnchantment, newLevel),
      skillUses: newUses,
    };
  }

  // Success — add +1 addPower
  const newAddPower = item.addPower + 1;

  // If this is a regular weapon (typeId 5) and now has addPower, promote to enchanted weapon (typeId 6)
  const newTypeId = item.typeId === ITEM_TYPES.WEAPON && newAddPower > 0 ? ITEM_TYPES.ENCHANTED_WEAPON : item.typeId;

  db.update(schema.items).set({
    addPower: newAddPower,
    typeId: newTypeId,
  }).where(eq(schema.items.id, itemId)).run();

  const updatedItem = db.select().from(schema.items)
    .where(eq(schema.items.id, itemId)).get();

  let msg = `Successfully enchanted ${item.name}! Bonus power: +${newAddPower} (cost: ${cost}g)`;
  if (newTypeId !== item.typeId) msg += ' The weapon now glows with magical energy!';
  if (leveledUp) msg += ` Enchantment skill increased to level ${newLevel}!`;

  return {
    success: true,
    message: msg,
    item: updatedItem ? mapToForgeItem(updatedItem) : undefined,
    skillLevel: Math.max(char.skillEnchantment, newLevel),
    skillUses: newUses,
  };
}
