import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

const DB_PATH = process.env.DB_PATH || './adr.db';

console.log(`Seeding database at ${DB_PATH}...`);

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');

// Create tables if they don't exist
const tableStatements = [
  `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS characters (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), name TEXT NOT NULL DEFAULT '', might INTEGER NOT NULL DEFAULT 10, dexterity INTEGER NOT NULL DEFAULT 10, constitution INTEGER NOT NULL DEFAULT 10, intelligence INTEGER NOT NULL DEFAULT 10, wisdom INTEGER NOT NULL DEFAULT 10, charisma INTEGER NOT NULL DEFAULT 10, hp INTEGER NOT NULL DEFAULT 20, hp_max INTEGER NOT NULL DEFAULT 20, mp INTEGER NOT NULL DEFAULT 10, mp_max INTEGER NOT NULL DEFAULT 10, sp INTEGER NOT NULL DEFAULT 0, ac INTEGER NOT NULL DEFAULT 0, magic_attack INTEGER NOT NULL DEFAULT 10, magic_resistance INTEGER NOT NULL DEFAULT 10, gold INTEGER NOT NULL DEFAULT 100, level INTEGER NOT NULL DEFAULT 1, xp INTEGER NOT NULL DEFAULT 0, race_id INTEGER NOT NULL DEFAULT 1, class_id INTEGER NOT NULL DEFAULT 1, element_id INTEGER NOT NULL DEFAULT 1, alignment_id INTEGER NOT NULL DEFAULT 1, equip_weapon INTEGER NOT NULL DEFAULT 0, equip_armor INTEGER NOT NULL DEFAULT 0, equip_shield INTEGER NOT NULL DEFAULT 0, equip_helm INTEGER NOT NULL DEFAULT 0, equip_gloves INTEGER NOT NULL DEFAULT 0, equip_amulet INTEGER NOT NULL DEFAULT 0, equip_ring INTEGER NOT NULL DEFAULT 0, equip_magic_attack INTEGER NOT NULL DEFAULT 0, equip_magic_defense INTEGER NOT NULL DEFAULT 0, skill_mining INTEGER NOT NULL DEFAULT 0, skill_stone INTEGER NOT NULL DEFAULT 0, skill_forge INTEGER NOT NULL DEFAULT 0, skill_enchantment INTEGER NOT NULL DEFAULT 0, skill_trading INTEGER NOT NULL DEFAULT 0, skill_thief INTEGER NOT NULL DEFAULT 0, skill_mining_uses INTEGER NOT NULL DEFAULT 0, skill_stone_uses INTEGER NOT NULL DEFAULT 0, skill_forge_uses INTEGER NOT NULL DEFAULT 0, skill_enchantment_uses INTEGER NOT NULL DEFAULT 0, skill_trading_uses INTEGER NOT NULL DEFAULT 0, skill_thief_uses INTEGER NOT NULL DEFAULT 0, battle_limit INTEGER NOT NULL DEFAULT 20, skill_limit INTEGER NOT NULL DEFAULT 30, trading_limit INTEGER NOT NULL DEFAULT 30, thief_limit INTEGER NOT NULL DEFAULT 10, limit_update INTEGER NOT NULL DEFAULT 1, victories INTEGER NOT NULL DEFAULT 0, defeats INTEGER NOT NULL DEFAULT 0, flees INTEGER NOT NULL DEFAULT 0, victories_pvp INTEGER NOT NULL DEFAULT 0, defeats_pvp INTEGER NOT NULL DEFAULT 0, flees_pvp INTEGER NOT NULL DEFAULT 0, double_ko INTEGER NOT NULL DEFAULT 0, warehouse INTEGER NOT NULL DEFAULT 0, warehouse_update INTEGER NOT NULL DEFAULT 0, shop_update INTEGER NOT NULL DEFAULT 0, pvp_allow INTEGER NOT NULL DEFAULT 1, is_battling INTEGER NOT NULL DEFAULT 0, is_dead INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS races (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', might_bonus INTEGER NOT NULL DEFAULT 0, dexterity_bonus INTEGER NOT NULL DEFAULT 0, constitution_bonus INTEGER NOT NULL DEFAULT 0, intelligence_bonus INTEGER NOT NULL DEFAULT 0, wisdom_bonus INTEGER NOT NULL DEFAULT 0, charisma_bonus INTEGER NOT NULL DEFAULT 0, might_malus INTEGER NOT NULL DEFAULT 0, dexterity_malus INTEGER NOT NULL DEFAULT 0, constitution_malus INTEGER NOT NULL DEFAULT 0, intelligence_malus INTEGER NOT NULL DEFAULT 0, wisdom_malus INTEGER NOT NULL DEFAULT 0, charisma_malus INTEGER NOT NULL DEFAULT 0, weight_capacity INTEGER NOT NULL DEFAULT 1000, weight_per_level INTEGER NOT NULL DEFAULT 5, skill_mining_bonus INTEGER NOT NULL DEFAULT 0, skill_stone_bonus INTEGER NOT NULL DEFAULT 0, skill_forge_bonus INTEGER NOT NULL DEFAULT 0, skill_enchantment_bonus INTEGER NOT NULL DEFAULT 0, skill_trading_bonus INTEGER NOT NULL DEFAULT 0, skill_thief_bonus INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS classes (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', selectable INTEGER NOT NULL DEFAULT 1, might_req INTEGER NOT NULL DEFAULT 0, dexterity_req INTEGER NOT NULL DEFAULT 0, constitution_req INTEGER NOT NULL DEFAULT 0, intelligence_req INTEGER NOT NULL DEFAULT 0, wisdom_req INTEGER NOT NULL DEFAULT 0, charisma_req INTEGER NOT NULL DEFAULT 0, base_hp INTEGER NOT NULL DEFAULT 0, base_mp INTEGER NOT NULL DEFAULT 0, base_ac INTEGER NOT NULL DEFAULT 0, update_hp INTEGER NOT NULL DEFAULT 0, update_mp INTEGER NOT NULL DEFAULT 0, update_ac INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS elements (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', level INTEGER NOT NULL DEFAULT 0, color TEXT NOT NULL DEFAULT '#ffffff', oppose_strong INTEGER NOT NULL DEFAULT 0, oppose_strong_dmg INTEGER NOT NULL DEFAULT 100, oppose_same_dmg INTEGER NOT NULL DEFAULT 100, oppose_weak INTEGER NOT NULL DEFAULT 0, oppose_weak_dmg INTEGER NOT NULL DEFAULT 100, skill_mining_bonus INTEGER NOT NULL DEFAULT 0, skill_stone_bonus INTEGER NOT NULL DEFAULT 0, skill_forge_bonus INTEGER NOT NULL DEFAULT 0, skill_enchantment_bonus INTEGER NOT NULL DEFAULT 0, skill_trading_bonus INTEGER NOT NULL DEFAULT 0, skill_thief_bonus INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS alignments (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS monsters (id INTEGER PRIMARY KEY, name TEXT NOT NULL, image TEXT NOT NULL DEFAULT '', level INTEGER NOT NULL DEFAULT 1, hp INTEGER NOT NULL DEFAULT 10, mp INTEGER NOT NULL DEFAULT 10, attack INTEGER NOT NULL DEFAULT 5, defense INTEGER NOT NULL DEFAULT 5, mp_power INTEGER NOT NULL DEFAULT 1, custom_spell TEXT NOT NULL DEFAULT 'a magical spell', magic_attack INTEGER NOT NULL DEFAULT 10, magic_resistance INTEGER NOT NULL DEFAULT 10, sp INTEGER NOT NULL DEFAULT 0, thief_skill INTEGER NOT NULL DEFAULT 0, element_id INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS battles (id INTEGER PRIMARY KEY AUTOINCREMENT, type INTEGER NOT NULL DEFAULT 0, turn INTEGER NOT NULL DEFAULT 0, result INTEGER NOT NULL DEFAULT 0, log TEXT NOT NULL DEFAULT '[]', start_time INTEGER NOT NULL DEFAULT 0, finish_time INTEGER NOT NULL DEFAULT 0, challenger_id INTEGER NOT NULL, challenger_hp INTEGER NOT NULL DEFAULT 0, challenger_mp INTEGER NOT NULL DEFAULT 0, challenger_att INTEGER NOT NULL DEFAULT 0, challenger_def INTEGER NOT NULL DEFAULT 0, challenger_magic_attack INTEGER NOT NULL DEFAULT 0, challenger_magic_resistance INTEGER NOT NULL DEFAULT 0, challenger_element INTEGER NOT NULL DEFAULT 0, opponent_id INTEGER NOT NULL, opponent_hp INTEGER NOT NULL DEFAULT 0, opponent_hp_max INTEGER NOT NULL DEFAULT 0, opponent_mp INTEGER NOT NULL DEFAULT 0, opponent_mp_max INTEGER NOT NULL DEFAULT 0, opponent_att INTEGER NOT NULL DEFAULT 0, opponent_def INTEGER NOT NULL DEFAULT 0, opponent_magic_attack INTEGER NOT NULL DEFAULT 0, opponent_magic_resistance INTEGER NOT NULL DEFAULT 0, opponent_element INTEGER NOT NULL DEFAULT 0, opponent_sp INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', type_id INTEGER NOT NULL DEFAULT 0, quality_id INTEGER NOT NULL DEFAULT 3, power INTEGER NOT NULL DEFAULT 0, add_power INTEGER NOT NULL DEFAULT 0, weight INTEGER NOT NULL DEFAULT 25, duration INTEGER NOT NULL DEFAULT 100, duration_max INTEGER NOT NULL DEFAULT 100, price INTEGER NOT NULL DEFAULT 0, bonus_might INTEGER NOT NULL DEFAULT 0, bonus_dexterity INTEGER NOT NULL DEFAULT 0, bonus_constitution INTEGER NOT NULL DEFAULT 0, bonus_intelligence INTEGER NOT NULL DEFAULT 0, bonus_wisdom INTEGER NOT NULL DEFAULT 0, bonus_charisma INTEGER NOT NULL DEFAULT 0, bonus_hp INTEGER NOT NULL DEFAULT 0, bonus_mp INTEGER NOT NULL DEFAULT 0, bonus_ac INTEGER NOT NULL DEFAULT 0, element_id INTEGER NOT NULL DEFAULT 0, element_strong_dmg INTEGER NOT NULL DEFAULT 100, element_same_dmg INTEGER NOT NULL DEFAULT 100, element_weak_dmg INTEGER NOT NULL DEFAULT 100, crit_hit INTEGER NOT NULL DEFAULT 20, crit_hit_mod INTEGER NOT NULL DEFAULT 2, sell_back_percentage INTEGER NOT NULL DEFAULT 50, restrict_level INTEGER NOT NULL DEFAULT 0, restrict_might INTEGER NOT NULL DEFAULT 0, restrict_dexterity INTEGER NOT NULL DEFAULT 0, restrict_constitution INTEGER NOT NULL DEFAULT 0, restrict_intelligence INTEGER NOT NULL DEFAULT 0, restrict_wisdom INTEGER NOT NULL DEFAULT 0, restrict_charisma INTEGER NOT NULL DEFAULT 0, restrict_class_enable INTEGER NOT NULL DEFAULT 0, restrict_class TEXT NOT NULL DEFAULT '', restrict_race_enable INTEGER NOT NULL DEFAULT 0, restrict_race TEXT NOT NULL DEFAULT '', restrict_align_enable INTEGER NOT NULL DEFAULT 0, restrict_align TEXT NOT NULL DEFAULT '', restrict_element_enable INTEGER NOT NULL DEFAULT 0, restrict_element TEXT NOT NULL DEFAULT '', owner_id INTEGER NOT NULL DEFAULT 0, shop_id INTEGER NOT NULL DEFAULT 0, equipped INTEGER NOT NULL DEFAULT 0, in_warehouse INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS item_types (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS item_qualities (id INTEGER PRIMARY KEY, name TEXT NOT NULL, modifier INTEGER NOT NULL DEFAULT 100)`,
  `CREATE TABLE IF NOT EXISTS shops (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id INTEGER NOT NULL DEFAULT 0, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS skills (id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', required_sp INTEGER NOT NULL DEFAULT 0, image TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS vault_accounts (user_id INTEGER PRIMARY KEY REFERENCES users(id), balance INTEGER NOT NULL DEFAULT 0, last_interest_time INTEGER NOT NULL DEFAULT 0, loan_amount INTEGER NOT NULL DEFAULT 0, loan_interest_time INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS stocks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, current_price INTEGER NOT NULL DEFAULT 100, previous_price INTEGER NOT NULL DEFAULT 100, min_price INTEGER NOT NULL DEFAULT 50, max_price INTEGER NOT NULL DEFAULT 300)`,
  `CREATE TABLE IF NOT EXISTS stock_holdings (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), stock_id INTEGER NOT NULL REFERENCES stocks(id), shares INTEGER NOT NULL DEFAULT 0, purchase_price INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS chat_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), username TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS game_config (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '0')`,
  `CREATE TABLE IF NOT EXISTS jail_records (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), reason TEXT NOT NULL DEFAULT '', jailed_at TEXT NOT NULL DEFAULT '', release_at TEXT NOT NULL DEFAULT '', bail_cost INTEGER NOT NULL DEFAULT 0, released INTEGER NOT NULL DEFAULT 0, released_at TEXT NOT NULL DEFAULT '')`,
];

console.log('Creating tables...');
for (const stmt of tableStatements) {
  sqlite.exec(stmt);
}
console.log('Tables created.');

const db = drizzle(sqlite, { schema });

// ─── Races (from 20_adr_inserts.sql) ────────────────────────────────────────
const racesData = [
  { id: 1, name: 'Human', description: 'Versatile and adaptable, humans are the most common race.', image: 'human.gif', mightBonus: 0, dexterityBonus: 0, constitutionBonus: 0, intelligenceBonus: 0, wisdomBonus: 0, charismaBonus: 0, mightMalus: 0, dexterityMalus: 0, constitutionMalus: 0, intelligenceMalus: 0, wisdomMalus: 0, charismaMalus: 0, weightCapacity: 1000, weightPerLevel: 5 },
  { id: 2, name: 'Half-elf', description: 'Born of human and elven parentage, combining traits of both.', image: 'halfelf.gif', mightBonus: 0, dexterityBonus: 1, constitutionBonus: 0, intelligenceBonus: 1, wisdomBonus: 0, charismaBonus: 0, mightMalus: 0, dexterityMalus: 0, constitutionMalus: 1, intelligenceMalus: 0, wisdomMalus: 0, charismaMalus: 0, weightCapacity: 900, weightPerLevel: 5 },
  { id: 3, name: 'Half-orc', description: 'Strong and fierce, with orcish blood running through their veins.', image: 'halforc.gif', mightBonus: 2, dexterityBonus: 0, constitutionBonus: 1, intelligenceBonus: 0, wisdomBonus: 0, charismaBonus: 0, mightMalus: 0, dexterityMalus: 0, constitutionMalus: 0, intelligenceMalus: 1, wisdomMalus: 1, charismaMalus: 1, weightCapacity: 1200, weightPerLevel: 6 },
  { id: 4, name: 'Elf', description: 'Graceful and long-lived, with an affinity for magic and nature.', image: 'elf.gif', mightBonus: 0, dexterityBonus: 2, constitutionBonus: 0, intelligenceBonus: 1, wisdomBonus: 1, charismaBonus: 0, mightMalus: 1, dexterityMalus: 0, constitutionMalus: 2, intelligenceMalus: 0, wisdomMalus: 0, charismaMalus: 0, weightCapacity: 800, weightPerLevel: 4 },
  { id: 5, name: 'Gnome', description: 'Small and clever, gnomes excel at tinkering and illusion magic.', image: 'gnome.gif', mightBonus: 0, dexterityBonus: 1, constitutionBonus: 0, intelligenceBonus: 2, wisdomBonus: 0, charismaBonus: 0, mightMalus: 2, dexterityMalus: 0, constitutionMalus: 0, intelligenceMalus: 0, wisdomMalus: 0, charismaMalus: 1, weightCapacity: 700, weightPerLevel: 3 },
  { id: 6, name: 'Halfling', description: 'Small and nimble, halflings are lucky and courageous.', image: 'halfling.gif', mightBonus: 0, dexterityBonus: 2, constitutionBonus: 0, intelligenceBonus: 0, wisdomBonus: 0, charismaBonus: 1, mightMalus: 2, dexterityMalus: 0, constitutionMalus: 0, intelligenceMalus: 0, wisdomMalus: 1, charismaMalus: 0, weightCapacity: 600, weightPerLevel: 3 },
  { id: 7, name: 'Dwarf', description: 'Stout and hardy, dwarves are master craftsmen and fierce warriors.', image: 'dwarf.gif', mightBonus: 1, dexterityBonus: 0, constitutionBonus: 2, intelligenceBonus: 0, wisdomBonus: 0, charismaBonus: 0, mightMalus: 0, dexterityMalus: 1, constitutionMalus: 0, intelligenceMalus: 0, wisdomMalus: 0, charismaMalus: 2, weightCapacity: 1100, weightPerLevel: 6 },
];

// ─── Classes (from 20_adr_inserts.sql) ───────────────────────────────────────
const classesData = [
  { id: 1, name: 'Fighter', description: 'Masters of martial combat, skilled with weapons and armor.', image: 'fighter.gif', selectable: 1, baseHp: 10, baseMp: 0, baseAc: 2, updateHp: 3, updateMp: 0, updateAc: 1 },
  { id: 2, name: 'Barbarian', description: 'Fierce warriors who channel their rage into devastating attacks.', image: 'barbarian.gif', selectable: 1, baseHp: 12, baseMp: 0, baseAc: 0, updateHp: 4, updateMp: 0, updateAc: 0 },
  { id: 3, name: 'Druid', description: 'Guardians of nature who wield elemental and healing magic.', image: 'druid.gif', selectable: 1, baseHp: 6, baseMp: 8, baseAc: 0, updateHp: 2, updateMp: 3, updateAc: 0 },
  { id: 4, name: 'Bard', description: 'Versatile performers whose music carries magical power.', image: 'bard.gif', selectable: 1, baseHp: 6, baseMp: 6, baseAc: 0, updateHp: 2, updateMp: 2, updateAc: 0 },
  { id: 5, name: 'Magician', description: 'Scholarly spellcasters who command arcane forces.', image: 'magician.gif', selectable: 1, baseHp: 4, baseMp: 12, baseAc: 0, updateHp: 1, updateMp: 4, updateAc: 0 },
  { id: 6, name: 'Monk', description: 'Disciplined warriors who combine martial arts with spiritual power.', image: 'monk.gif', selectable: 1, baseHp: 8, baseMp: 4, baseAc: 1, updateHp: 3, updateMp: 1, updateAc: 1 },
  { id: 7, name: 'Paladin', description: 'Holy warriors who combine combat prowess with divine magic.', image: 'paladin.gif', selectable: 1, baseHp: 8, baseMp: 4, baseAc: 2, updateHp: 3, updateMp: 1, updateAc: 1 },
  { id: 8, name: 'Priest', description: 'Devoted healers and protectors empowered by divine faith.', image: 'priest.gif', selectable: 1, baseHp: 6, baseMp: 10, baseAc: 0, updateHp: 2, updateMp: 4, updateAc: 0 },
  { id: 9, name: 'Sorcerer', description: 'Innate spellcasters with raw magical power flowing through their blood.', image: 'sorcerer.gif', selectable: 0, baseHp: 4, baseMp: 14, baseAc: 0, updateHp: 1, updateMp: 5, updateAc: 0 },
  { id: 10, name: 'Thief', description: 'Cunning rogues who rely on stealth, agility, and guile.', image: 'thief.gif', selectable: 1, baseHp: 6, baseMp: 2, baseAc: 1, updateHp: 2, updateMp: 1, updateAc: 0 },
];

// ─── Elements (from 20_adr_inserts.sql) ──────────────────────────────────────
const elementsData = [
  { id: 1, name: 'Water', description: 'The element of fluidity and adaptability.', image: 'water.gif', level: 0, color: '#4488ff', opposeStrong: 4, opposeStrongDmg: 125, opposeSameDmg: 100, opposeWeak: 2, opposeWeakDmg: 75 },
  { id: 2, name: 'Earth', description: 'The element of stability and endurance.', image: 'earth.gif', level: 0, color: '#88cc44', opposeStrong: 1, opposeStrongDmg: 125, opposeSameDmg: 100, opposeWeak: 4, opposeWeakDmg: 75 },
  { id: 3, name: 'Holy', description: 'The element of divine light and purity.', image: 'holy.gif', level: 2, color: '#ffcc44', opposeStrong: 0, opposeStrongDmg: 100, opposeSameDmg: 100, opposeWeak: 0, opposeWeakDmg: 100 },
  { id: 4, name: 'Fire', description: 'The element of destruction and rebirth.', image: 'fire.gif', level: 0, color: '#ff4444', opposeStrong: 2, opposeStrongDmg: 125, opposeSameDmg: 100, opposeWeak: 1, opposeWeakDmg: 75 },
];

// ─── Alignments ──────────────────────────────────────────────────────────────
const alignmentsData = [
  { id: 1, name: 'Neutral', description: 'Balanced between good and evil.', image: 'neutral.gif' },
  { id: 2, name: 'Evil', description: 'Drawn to darkness and self-interest.', image: 'evil.gif' },
  { id: 3, name: 'Good', description: 'Virtuous and selfless in nature.', image: 'good.gif' },
];

// ─── Monsters (from 20_adr_inserts.sql) ──────────────────────────────────────
const monstersData = [
  { id: 1, name: 'Globuz', image: 'globuz.gif', level: 1, hp: 15, mp: 5, attack: 6, defense: 3, mpPower: 1, magicAttack: 5, magicResistance: 4, sp: 5, thiefSkill: 0, elementId: 1, customSpell: 'a water splash' },
  { id: 2, name: 'Kargh', image: 'kargh.gif', level: 2, hp: 25, mp: 8, attack: 10, defense: 5, mpPower: 2, magicAttack: 8, magicResistance: 6, sp: 8, thiefSkill: 0, elementId: 4, customSpell: 'a fireball' },
  { id: 3, name: 'Bouglou', image: 'bouglou.gif', level: 1, hp: 12, mp: 10, attack: 4, defense: 4, mpPower: 3, magicAttack: 10, magicResistance: 8, sp: 6, thiefSkill: 0, elementId: 1, customSpell: 'an ice shard' },
  { id: 4, name: 'Dretg', image: 'dretg.gif', level: 1, hp: 18, mp: 3, attack: 8, defense: 2, mpPower: 1, magicAttack: 4, magicResistance: 3, sp: 4, thiefSkill: 0, elementId: 2, customSpell: 'a rock throw' },
  { id: 5, name: 'Greyiok', image: 'greyiok.gif', level: 1, hp: 14, mp: 6, attack: 5, defense: 6, mpPower: 1, magicAttack: 7, magicResistance: 5, sp: 5, thiefSkill: 0, elementId: 2, customSpell: 'an earth spike' },
  { id: 6, name: 'Itchy', image: 'itchy.gif', level: 2, hp: 22, mp: 12, attack: 8, defense: 4, mpPower: 2, magicAttack: 12, magicResistance: 7, sp: 10, thiefSkill: 0, elementId: 4, customSpell: 'a flame burst' },
  { id: 7, name: 'Globber', image: 'globber.gif', level: 3, hp: 35, mp: 15, attack: 14, defense: 8, mpPower: 3, magicAttack: 14, magicResistance: 10, sp: 15, thiefSkill: 5, elementId: 1, customSpell: 'a tidal wave' },
  { id: 8, name: 'Scratchy', image: 'scratchy.gif', level: 4, hp: 50, mp: 20, attack: 18, defense: 12, mpPower: 4, magicAttack: 16, magicResistance: 12, sp: 20, thiefSkill: 10, elementId: 4, customSpell: 'an inferno blast' },
];

// ─── Item Types (from 20_adr_inserts.sql) ────────────────────────────────────
const itemTypesData = [
  { id: 1, name: 'Raw Material', description: 'Basic crafting material' },
  { id: 2, name: 'Rare Material', description: 'Rare crafting material' },
  { id: 3, name: 'Pickaxe', description: 'Mining tool' },
  { id: 4, name: 'Magic Tome', description: 'Magical reference book' },
  { id: 5, name: 'Weapon', description: 'Melee or ranged weapon' },
  { id: 6, name: 'Enchanted Weapon', description: 'Magically enhanced weapon' },
  { id: 7, name: 'Armor', description: 'Body armor' },
  { id: 8, name: 'Shield', description: 'Defensive shield' },
  { id: 9, name: 'Helm', description: 'Head protection' },
  { id: 10, name: 'Gloves', description: 'Hand protection' },
  { id: 11, name: 'Magic Attack', description: 'Magic offense item' },
  { id: 12, name: 'Magic Defense', description: 'Magic defense item' },
  { id: 13, name: 'Amulet', description: 'Magical necklace' },
  { id: 14, name: 'Ring', description: 'Magical ring' },
  { id: 15, name: 'Health Potion', description: 'Restores hit points' },
  { id: 16, name: 'Mana Potion', description: 'Restores magic points' },
  { id: 17, name: 'Scroll', description: 'Single-use spell scroll' },
  { id: 18, name: 'Miscellaneous', description: 'General item' },
];

// ─── Item Qualities (from 20_adr_inserts.sql) ────────────────────────────────
const itemQualitiesData = [
  { id: 0, name: "Don't care", modifier: 0 },
  { id: 1, name: 'Very Poor', modifier: 20 },
  { id: 2, name: 'Poor', modifier: 50 },
  { id: 3, name: 'Medium', modifier: 100 },
  { id: 4, name: 'Good', modifier: 140 },
  { id: 5, name: 'Very Good', modifier: 200 },
  { id: 6, name: 'Excellent', modifier: 300 },
];

// ─── Skills ──────────────────────────────────────────────────────────────────
const skillsData = [
  { id: 1, name: 'Mining', description: 'Extract ore and gems from the earth.', requiredSp: 100, image: 'mining.gif' },
  { id: 2, name: 'Stonecutting', description: 'Cut and polish raw materials.', requiredSp: 200, image: 'stone.gif' },
  { id: 3, name: 'Forge', description: 'Create weapons and armor from materials.', requiredSp: 50, image: 'forge.gif' },
  { id: 4, name: 'Enchantment', description: 'Imbue items with magical properties.', requiredSp: 300, image: 'enchant.gif' },
  { id: 5, name: 'Trading', description: 'Get better prices at shops.', requiredSp: 80, image: 'trading.gif' },
  { id: 6, name: 'Thief', description: 'Steal items from shops... if you dare.', requiredSp: 70, image: 'thief.gif' },
];

// ─── Shops ───────────────────────────────────────────────────────────────────
const shopsData = [
  { id: 1, ownerId: 0, name: 'General Store', description: 'Sells basic adventuring supplies.' },
  { id: 2, ownerId: 0, name: 'Armory', description: 'Weapons and armor for the brave.' },
];

// ─── Shop Items (seeded in stores) ───────────────────────────────────────────
const shopItemsData = [
  // General Store
  { name: 'Health Potion', description: 'Restores 20 HP', image: 'potion1.gif', typeId: 15, qualityId: 3, power: 20, weight: 1, price: 50, shopId: 1 },
  { name: 'Mana Potion', description: 'Restores 15 MP', image: 'potion2.gif', typeId: 16, qualityId: 3, power: 15, weight: 1, price: 75, shopId: 1 },
  { name: 'Mining Pick', description: 'Required for mining ore', image: 'miner.gif', typeId: 3, qualityId: 3, power: 0, weight: 5, price: 200, shopId: 1 },
  { name: 'Magic Tome', description: 'Increases magical knowledge', image: 'tome.gif', typeId: 4, qualityId: 3, power: 5, weight: 3, price: 300, shopId: 1 },

  // Armory
  { name: 'Short Sword', description: 'A basic but reliable blade', image: 'sword.gif', typeId: 5, qualityId: 3, power: 8, weight: 4, price: 100, bonusMight: 1, shopId: 2 },
  { name: 'Long Bow', description: 'A finely crafted bow', image: 'bow.gif', typeId: 5, qualityId: 3, power: 10, weight: 3, price: 150, bonusDexterity: 1, shopId: 2 },
  { name: 'Iron Flail', description: 'A heavy crushing weapon', image: 'flail.gif', typeId: 5, qualityId: 4, power: 14, weight: 8, price: 250, bonusMight: 2, shopId: 2 },
  { name: 'Leather Armor', description: 'Light but protective', image: 'plate.gif', typeId: 7, qualityId: 3, power: 0, weight: 10, price: 120, bonusAc: 3, shopId: 2 },
  { name: 'Chain Mail', description: 'Interlocking metal rings', image: 'plate.gif', typeId: 7, qualityId: 4, power: 0, weight: 20, price: 300, bonusAc: 6, shopId: 2 },
  { name: 'Wooden Shield', description: 'Basic defensive shield', image: 'shield.gif', typeId: 8, qualityId: 3, power: 0, weight: 6, price: 80, bonusAc: 2, shopId: 2 },
  { name: 'Iron Helm', description: 'Protects the head', image: 'helm.gif', typeId: 9, qualityId: 3, power: 0, weight: 5, price: 90, bonusAc: 1, shopId: 2 },
  { name: 'Leather Gloves', description: 'Light hand protection', image: 'gloves.gif', typeId: 10, qualityId: 3, power: 0, weight: 2, price: 60, bonusAc: 1, shopId: 2 },
  { name: 'Bronze Amulet', description: 'A simple protective charm', image: 'amulet1.gif', typeId: 13, qualityId: 3, power: 0, weight: 1, price: 150, bonusWisdom: 1, shopId: 2 },
  { name: 'Silver Ring', description: 'A ring that enhances magic', image: 'ring1.gif', typeId: 14, qualityId: 3, power: 0, weight: 1, price: 200, bonusIntelligence: 1, shopId: 2 },
];

// ─── Stocks ──────────────────────────────────────────────────────────────────
const stocksData = [
  { id: 1, name: 'Dwarven Mining Co.', currentPrice: 113, previousPrice: 110, minPrice: 80, maxPrice: 200 },
  { id: 2, name: 'Elven Enchantments', currentPrice: 177, previousPrice: 180, minPrice: 100, maxPrice: 300 },
  { id: 3, name: 'Dragon Fire Arms', currentPrice: 280, previousPrice: 275, minPrice: 150, maxPrice: 500 },
];

// ─── Game Config (from adr_general inserts) ──────────────────────────────────
const configData = [
  { key: 'max_characteristic', value: '20' },
  { key: 'min_characteristic', value: '3' },
  { key: 'allow_reroll', value: '1' },
  { key: 'allow_character_delete', value: '1' },
  { key: 'battle_enable', value: '1' },
  { key: 'battle_limit', value: '20' },
  { key: 'skill_limit', value: '30' },
  { key: 'trading_limit', value: '30' },
  { key: 'thief_limit', value: '10' },
  { key: 'battle_monster_stats_modifier', value: '150' },
  { key: 'battle_base_exp_min', value: '10' },
  { key: 'battle_base_exp_max', value: '40' },
  { key: 'battle_base_exp_modifier', value: '120' },
  { key: 'battle_base_reward_min', value: '10' },
  { key: 'battle_base_reward_max', value: '40' },
  { key: 'battle_base_reward_modifier', value: '120' },
  { key: 'battle_base_sp_modifier', value: '120' },
  { key: 'battle_calc_type', value: '1' },
  { key: 'pvp_enable', value: '1' },
  { key: 'pvp_defies_max', value: '5' },
  { key: 'vault_enable', value: '1' },
  { key: 'vault_loan_enable', value: '1' },
  { key: 'interest_rate', value: '4' },
  { key: 'interest_time', value: '86400' },
  { key: 'loan_interest', value: '15' },
  { key: 'loan_interest_time', value: '864000' },
  { key: 'loan_max_sum', value: '5000' },
  { key: 'stock_max_change', value: '10' },
  { key: 'stock_min_change', value: '0' },
  { key: 'temple_heal_cost', value: '100' },
  { key: 'temple_resurrect_cost', value: '300' },
  { key: 'training_skill_cost', value: '1000' },
  { key: 'training_charac_cost', value: '3000' },
  { key: 'training_upgrade_cost', value: '10000' },
  { key: 'training_change_cost', value: '100' },
  { key: 'new_shop_price', value: '500' },
  { key: 'warehouse_tax', value: '10' },
  { key: 'shop_tax', value: '10' },
  { key: 'thief_failure_damage', value: '2000' },
  { key: 'thief_failure_time', value: '21600' },
  { key: 'shop_steal_min_level', value: '5' },
  { key: 'next_level_penalty', value: '10' },
  { key: 'item_modifier_power', value: '100' },
  { key: 'skill_trading_power', value: '2' },
];

// ─── Run seed ────────────────────────────────────────────────────────────────
function seed() {
  // Clear existing data
  sqlite.exec('DELETE FROM game_config');
  sqlite.exec('DELETE FROM stock_holdings');
  sqlite.exec('DELETE FROM stocks');
  sqlite.exec('DELETE FROM vault_accounts');
  sqlite.exec('DELETE FROM chat_messages');
  sqlite.exec('DELETE FROM items');
  sqlite.exec('DELETE FROM item_qualities');
  sqlite.exec('DELETE FROM item_types');
  sqlite.exec('DELETE FROM skills');
  sqlite.exec('DELETE FROM shops');
  sqlite.exec('DELETE FROM battles');
  sqlite.exec('DELETE FROM monsters');
  sqlite.exec('DELETE FROM characters');
  sqlite.exec('DELETE FROM alignments');
  sqlite.exec('DELETE FROM elements');
  sqlite.exec('DELETE FROM classes');
  sqlite.exec('DELETE FROM races');

  // Insert seed data
  for (const race of racesData) {
    db.insert(schema.races).values(race).run();
  }
  console.log(`  ✓ ${racesData.length} races`);

  for (const cls of classesData) {
    db.insert(schema.classes).values(cls).run();
  }
  console.log(`  ✓ ${classesData.length} classes`);

  for (const elem of elementsData) {
    db.insert(schema.elements).values(elem).run();
  }
  console.log(`  ✓ ${elementsData.length} elements`);

  for (const align of alignmentsData) {
    db.insert(schema.alignments).values(align).run();
  }
  console.log(`  ✓ ${alignmentsData.length} alignments`);

  for (const monster of monstersData) {
    db.insert(schema.monsters).values(monster).run();
  }
  console.log(`  ✓ ${monstersData.length} monsters`);

  for (const it of itemTypesData) {
    db.insert(schema.itemTypes).values(it).run();
  }
  console.log(`  ✓ ${itemTypesData.length} item types`);

  for (const iq of itemQualitiesData) {
    db.insert(schema.itemQualities).values(iq).run();
  }
  console.log(`  ✓ ${itemQualitiesData.length} item qualities`);

  for (const skill of skillsData) {
    db.insert(schema.skills).values(skill).run();
  }
  console.log(`  ✓ ${skillsData.length} skills`);

  for (const shop of shopsData) {
    db.insert(schema.shops).values(shop).run();
  }
  console.log(`  ✓ ${shopsData.length} shops`);

  for (const item of shopItemsData) {
    db.insert(schema.items).values({
      name: item.name,
      description: item.description,
      image: item.image,
      typeId: item.typeId,
      qualityId: item.qualityId,
      power: item.power,
      weight: item.weight,
      price: item.price,
      shopId: item.shopId,
      duration: 100,
      durationMax: 100,
      bonusMight: (item as any).bonusMight || 0,
      bonusDexterity: (item as any).bonusDexterity || 0,
      bonusConstitution: (item as any).bonusConstitution || 0,
      bonusIntelligence: (item as any).bonusIntelligence || 0,
      bonusWisdom: (item as any).bonusWisdom || 0,
      bonusCharisma: (item as any).bonusCharisma || 0,
      bonusHp: 0,
      bonusMp: 0,
      bonusAc: (item as any).bonusAc || 0,
    }).run();
  }
  console.log(`  ✓ ${shopItemsData.length} shop items`);

  for (const stock of stocksData) {
    db.insert(schema.stocks).values(stock).run();
  }
  console.log(`  ✓ ${stocksData.length} stocks`);

  for (const cfg of configData) {
    db.insert(schema.gameConfig).values(cfg).run();
  }
  console.log(`  ✓ ${configData.length} config entries`);

  console.log('\nDatabase seeded successfully!');
}

seed();
sqlite.close();
