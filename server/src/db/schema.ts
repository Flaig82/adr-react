import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull().default(''),
});

// ─── Characters ──────────────────────────────────────────────────────────────
export const characters = sqliteTable('characters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull().default(''),

  // Core stats
  might: integer('might').notNull().default(10),
  dexterity: integer('dexterity').notNull().default(10),
  constitution: integer('constitution').notNull().default(10),
  intelligence: integer('intelligence').notNull().default(10),
  wisdom: integer('wisdom').notNull().default(10),
  charisma: integer('charisma').notNull().default(10),

  // Derived stats
  hp: integer('hp').notNull().default(20),
  hpMax: integer('hp_max').notNull().default(20),
  mp: integer('mp').notNull().default(10),
  mpMax: integer('mp_max').notNull().default(10),
  sp: integer('sp').notNull().default(0),
  ac: integer('ac').notNull().default(0),
  magicAttack: integer('magic_attack').notNull().default(10),
  magicResistance: integer('magic_resistance').notNull().default(10),
  gold: integer('gold').notNull().default(100), // Starting gold

  // Progression
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),

  // Classification
  raceId: integer('race_id').notNull().default(1),
  classId: integer('class_id').notNull().default(1),
  elementId: integer('element_id').notNull().default(1),
  alignmentId: integer('alignment_id').notNull().default(1),

  // Equipment slots (item IDs, 0 = empty)
  equipWeapon: integer('equip_weapon').notNull().default(0),
  equipArmor: integer('equip_armor').notNull().default(0),
  equipShield: integer('equip_shield').notNull().default(0),
  equipHelm: integer('equip_helm').notNull().default(0),
  equipGloves: integer('equip_gloves').notNull().default(0),
  equipAmulet: integer('equip_amulet').notNull().default(0),
  equipRing: integer('equip_ring').notNull().default(0),
  equipMagicAttack: integer('equip_magic_attack').notNull().default(0),
  equipMagicDefense: integer('equip_magic_defense').notNull().default(0),

  // Skills (0 = not learned)
  skillMining: integer('skill_mining').notNull().default(0),
  skillStone: integer('skill_stone').notNull().default(0),
  skillForge: integer('skill_forge').notNull().default(0),
  skillEnchantment: integer('skill_enchantment').notNull().default(0),
  skillTrading: integer('skill_trading').notNull().default(0),
  skillThief: integer('skill_thief').notNull().default(0),

  // Skill use counters
  skillMiningUses: integer('skill_mining_uses').notNull().default(0),
  skillStoneUses: integer('skill_stone_uses').notNull().default(0),
  skillForgeUses: integer('skill_forge_uses').notNull().default(0),
  skillEnchantmentUses: integer('skill_enchantment_uses').notNull().default(0),
  skillTradingUses: integer('skill_trading_uses').notNull().default(0),
  skillThiefUses: integer('skill_thief_uses').notNull().default(0),

  // Daily limits
  battleLimit: integer('battle_limit').notNull().default(20),
  skillLimit: integer('skill_limit').notNull().default(30),
  tradingLimit: integer('trading_limit').notNull().default(30),
  thiefLimit: integer('thief_limit').notNull().default(10),
  limitUpdate: integer('limit_update').notNull().default(1),

  // Battle record
  victories: integer('victories').notNull().default(0),
  defeats: integer('defeats').notNull().default(0),
  flees: integer('flees').notNull().default(0),
  victoriesPvp: integer('victories_pvp').notNull().default(0),
  defeatsPvp: integer('defeats_pvp').notNull().default(0),
  fleesPvp: integer('flees_pvp').notNull().default(0),
  doubleKo: integer('double_ko').notNull().default(0),

  // Warehouse
  warehouse: integer('warehouse').notNull().default(0),
  warehouseUpdate: integer('warehouse_update').notNull().default(0),
  shopUpdate: integer('shop_update').notNull().default(0),

  // Preferences
  pvpAllow: integer('pvp_allow').notNull().default(1),

  // Status
  isBattling: integer('is_battling').notNull().default(0),
  isDead: integer('is_dead').notNull().default(0),

  createdAt: text('created_at').notNull().default(''),
});

// ─── Races ───────────────────────────────────────────────────────────────────
export const races = sqliteTable('races', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  image: text('image').notNull().default(''),
  mightBonus: integer('might_bonus').notNull().default(0),
  dexterityBonus: integer('dexterity_bonus').notNull().default(0),
  constitutionBonus: integer('constitution_bonus').notNull().default(0),
  intelligenceBonus: integer('intelligence_bonus').notNull().default(0),
  wisdomBonus: integer('wisdom_bonus').notNull().default(0),
  charismaBonus: integer('charisma_bonus').notNull().default(0),
  mightMalus: integer('might_malus').notNull().default(0),
  dexterityMalus: integer('dexterity_malus').notNull().default(0),
  constitutionMalus: integer('constitution_malus').notNull().default(0),
  intelligenceMalus: integer('intelligence_malus').notNull().default(0),
  wisdomMalus: integer('wisdom_malus').notNull().default(0),
  charismaMalus: integer('charisma_malus').notNull().default(0),
  weightCapacity: integer('weight_capacity').notNull().default(1000),
  weightPerLevel: integer('weight_per_level').notNull().default(5),
  skillMiningBonus: integer('skill_mining_bonus').notNull().default(0),
  skillStoneBonus: integer('skill_stone_bonus').notNull().default(0),
  skillForgeBonus: integer('skill_forge_bonus').notNull().default(0),
  skillEnchantmentBonus: integer('skill_enchantment_bonus').notNull().default(0),
  skillTradingBonus: integer('skill_trading_bonus').notNull().default(0),
  skillThiefBonus: integer('skill_thief_bonus').notNull().default(0),
});

// ─── Classes ─────────────────────────────────────────────────────────────────
export const classes = sqliteTable('classes', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  image: text('image').notNull().default(''),
  selectable: integer('selectable').notNull().default(1),
  mightReq: integer('might_req').notNull().default(0),
  dexterityReq: integer('dexterity_req').notNull().default(0),
  constitutionReq: integer('constitution_req').notNull().default(0),
  intelligenceReq: integer('intelligence_req').notNull().default(0),
  wisdomReq: integer('wisdom_req').notNull().default(0),
  charismaReq: integer('charisma_req').notNull().default(0),
  baseHp: integer('base_hp').notNull().default(0),
  baseMp: integer('base_mp').notNull().default(0),
  baseAc: integer('base_ac').notNull().default(0),
  updateHp: integer('update_hp').notNull().default(0),
  updateMp: integer('update_mp').notNull().default(0),
  updateAc: integer('update_ac').notNull().default(0),
});

// ─── Elements ────────────────────────────────────────────────────────────────
export const elements = sqliteTable('elements', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  image: text('image').notNull().default(''),
  level: integer('level').notNull().default(0),
  color: text('color').notNull().default('#ffffff'),
  opposeStrong: integer('oppose_strong').notNull().default(0),
  opposeStrongDmg: integer('oppose_strong_dmg').notNull().default(100),
  opposeSameDmg: integer('oppose_same_dmg').notNull().default(100),
  opposeWeak: integer('oppose_weak').notNull().default(0),
  opposeWeakDmg: integer('oppose_weak_dmg').notNull().default(100),
  skillMiningBonus: integer('skill_mining_bonus').notNull().default(0),
  skillStoneBonus: integer('skill_stone_bonus').notNull().default(0),
  skillForgeBonus: integer('skill_forge_bonus').notNull().default(0),
  skillEnchantmentBonus: integer('skill_enchantment_bonus').notNull().default(0),
  skillTradingBonus: integer('skill_trading_bonus').notNull().default(0),
  skillThiefBonus: integer('skill_thief_bonus').notNull().default(0),
});

// ─── Alignments ──────────────────────────────────────────────────────────────
export const alignments = sqliteTable('alignments', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  image: text('image').notNull().default(''),
});

// ─── Monsters ────────────────────────────────────────────────────────────────
export const monsters = sqliteTable('monsters', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  image: text('image').notNull().default(''),
  level: integer('level').notNull().default(1),
  hp: integer('hp').notNull().default(10),
  mp: integer('mp').notNull().default(10),
  attack: integer('attack').notNull().default(5),
  defense: integer('defense').notNull().default(5),
  mpPower: integer('mp_power').notNull().default(1),
  customSpell: text('custom_spell').notNull().default('a magical spell'),
  magicAttack: integer('magic_attack').notNull().default(10),
  magicResistance: integer('magic_resistance').notNull().default(10),
  sp: integer('sp').notNull().default(0),
  thiefSkill: integer('thief_skill').notNull().default(0),
  elementId: integer('element_id').notNull().default(1),
});

// ─── Battles ─────────────────────────────────────────────────────────────────
export const battles = sqliteTable('battles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: integer('type').notNull().default(0), // 0 = PvE, 1 = PvP
  turn: integer('turn').notNull().default(0),
  result: integer('result').notNull().default(0), // 0 = in progress, 1 = won, 2 = lost, 3 = fled
  log: text('log').notNull().default('[]'), // JSON array of turn results
  startTime: integer('start_time').notNull().default(0),
  finishTime: integer('finish_time').notNull().default(0),

  // Challenger (player)
  challengerId: integer('challenger_id').notNull(),
  challengerHp: integer('challenger_hp').notNull().default(0),
  challengerMp: integer('challenger_mp').notNull().default(0),
  challengerAtt: integer('challenger_att').notNull().default(0),
  challengerDef: integer('challenger_def').notNull().default(0),
  challengerMagicAttack: integer('challenger_magic_attack').notNull().default(0),
  challengerMagicResistance: integer('challenger_magic_resistance').notNull().default(0),
  challengerElement: integer('challenger_element').notNull().default(0),

  // Opponent (monster or player)
  opponentId: integer('opponent_id').notNull(),
  opponentHp: integer('opponent_hp').notNull().default(0),
  opponentHpMax: integer('opponent_hp_max').notNull().default(0),
  opponentMp: integer('opponent_mp').notNull().default(0),
  opponentMpMax: integer('opponent_mp_max').notNull().default(0),
  opponentAtt: integer('opponent_att').notNull().default(0),
  opponentDef: integer('opponent_def').notNull().default(0),
  opponentMagicAttack: integer('opponent_magic_attack').notNull().default(0),
  opponentMagicResistance: integer('opponent_magic_resistance').notNull().default(0),
  opponentElement: integer('opponent_element').notNull().default(0),
  opponentSp: integer('opponent_sp').notNull().default(0),
});

// ─── Items ───────────────────────────────────────────────────────────────────
export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  image: text('image').notNull().default(''),
  typeId: integer('type_id').notNull().default(0),
  qualityId: integer('quality_id').notNull().default(3),
  power: integer('power').notNull().default(0),
  addPower: integer('add_power').notNull().default(0), // Additional power modifier
  weight: integer('weight').notNull().default(25),
  duration: integer('duration').notNull().default(100),
  durationMax: integer('duration_max').notNull().default(100),
  price: integer('price').notNull().default(0),

  // Equipment bonuses
  bonusMight: integer('bonus_might').notNull().default(0),
  bonusDexterity: integer('bonus_dexterity').notNull().default(0),
  bonusConstitution: integer('bonus_constitution').notNull().default(0),
  bonusIntelligence: integer('bonus_intelligence').notNull().default(0),
  bonusWisdom: integer('bonus_wisdom').notNull().default(0),
  bonusCharisma: integer('bonus_charisma').notNull().default(0),
  bonusHp: integer('bonus_hp').notNull().default(0),
  bonusMp: integer('bonus_mp').notNull().default(0),
  bonusAc: integer('bonus_ac').notNull().default(0),

  // Element properties (for weapons)
  elementId: integer('element_id').notNull().default(0),
  elementStrongDmg: integer('element_strong_dmg').notNull().default(100),
  elementSameDmg: integer('element_same_dmg').notNull().default(100),
  elementWeakDmg: integer('element_weak_dmg').notNull().default(100),

  // Critical hit (for weapons)
  critHit: integer('crit_hit').notNull().default(20), // Threat range (20 = only nat 20)
  critHitMod: integer('crit_hit_mod').notNull().default(2), // Crit damage multiplier

  // Sell back
  sellBackPercentage: integer('sell_back_percentage').notNull().default(50),

  // Stat restrictions
  restrictLevel: integer('restrict_level').notNull().default(0),
  restrictMight: integer('restrict_might').notNull().default(0),
  restrictDexterity: integer('restrict_dexterity').notNull().default(0),
  restrictConstitution: integer('restrict_constitution').notNull().default(0),
  restrictIntelligence: integer('restrict_intelligence').notNull().default(0),
  restrictWisdom: integer('restrict_wisdom').notNull().default(0),
  restrictCharisma: integer('restrict_charisma').notNull().default(0),

  // Class/Race/Element/Alignment restrictions
  restrictClassEnable: integer('restrict_class_enable').notNull().default(0),
  restrictClass: text('restrict_class').notNull().default(''),
  restrictRaceEnable: integer('restrict_race_enable').notNull().default(0),
  restrictRace: text('restrict_race').notNull().default(''),
  restrictAlignEnable: integer('restrict_align_enable').notNull().default(0),
  restrictAlign: text('restrict_align').notNull().default(''),
  restrictElementEnable: integer('restrict_element_enable').notNull().default(0),
  restrictElement: text('restrict_element').notNull().default(''),

  // Ownership & location
  ownerId: integer('owner_id').notNull().default(0), // 0 = shop/system, userId = player-owned
  shopId: integer('shop_id').notNull().default(0), // 0 = in inventory, >0 = in that shop
  equipped: integer('equipped').notNull().default(0), // 0 = not equipped, 1 = equipped
  inWarehouse: integer('in_warehouse').notNull().default(0),
});

// ─── Item Types ──────────────────────────────────────────────────────────────
export const itemTypes = sqliteTable('item_types', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  image: text('image').notNull().default(''),
});

// ─── Item Qualities ──────────────────────────────────────────────────────────
export const itemQualities = sqliteTable('item_qualities', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  modifier: integer('modifier').notNull().default(100),
});

// ─── Shops ───────────────────────────────────────────────────────────────────
export const shops = sqliteTable('shops', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ownerId: integer('owner_id').notNull().default(0), // 0 = NPC shop
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
});

// ─── Skills ──────────────────────────────────────────────────────────────────
export const skills = sqliteTable('skills', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  requiredSp: integer('required_sp').notNull().default(0),
  image: text('image').notNull().default(''),
});

// ─── Vault Accounts ──────────────────────────────────────────────────────────
export const vaultAccounts = sqliteTable('vault_accounts', {
  userId: integer('user_id').primaryKey().references(() => users.id),
  balance: integer('balance').notNull().default(0),
  lastInterestTime: integer('last_interest_time').notNull().default(0),
  loanAmount: integer('loan_amount').notNull().default(0),
  loanInterestTime: integer('loan_interest_time').notNull().default(0),
});

// ─── Stocks ──────────────────────────────────────────────────────────────────
export const stocks = sqliteTable('stocks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  currentPrice: integer('current_price').notNull().default(100),
  previousPrice: integer('previous_price').notNull().default(100),
  minPrice: integer('min_price').notNull().default(50),
  maxPrice: integer('max_price').notNull().default(300),
});

// ─── Stock Holdings ──────────────────────────────────────────────────────────
export const stockHoldings = sqliteTable('stock_holdings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  stockId: integer('stock_id').notNull().references(() => stocks.id),
  shares: integer('shares').notNull().default(0),
  purchasePrice: integer('purchase_price').notNull().default(0),
});

// ─── Chat Messages ───────────────────────────────────────────────────────────
export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  username: text('username').notNull(),
  message: text('message').notNull(),
  createdAt: text('created_at').notNull().default(''),
});

// ─── Jail Records ───────────────────────────────────────────────────────────
export const jailRecords = sqliteTable('jail_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  reason: text('reason').notNull().default(''),
  jailedAt: text('jailed_at').notNull().default(''),
  releaseAt: text('release_at').notNull().default(''),
  bailCost: integer('bail_cost').notNull().default(0),
  released: integer('released').notNull().default(0),       // 0=still jailed, 1=time served, 2=bailed out
  releasedAt: text('released_at').notNull().default(''),
});

// ─── Game Config ─────────────────────────────────────────────────────────────
export const gameConfig = sqliteTable('game_config', {
  key: text('key').primaryKey(),
  value: text('value').notNull().default('0'),
});
