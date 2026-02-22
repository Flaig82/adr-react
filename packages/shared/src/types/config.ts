// Game config types — mirrors phpbb_adr_general

export interface GameConfig {
  // Character limits
  maxCharacteristic: number;   // 20
  minCharacteristic: number;   // 3
  allowReroll: boolean;
  allowCharacterDelete: boolean;

  // Daily limits
  battleLimit: number;         // 20
  skillLimit: number;          // 30
  tradingLimit: number;        // 30
  thiefLimit: number;          // 10

  // Battle settings
  battleEnable: boolean;
  monsterStatsModifier: number; // 150 (percentage)
  baseExpMin: number;           // 10
  baseExpMax: number;           // 40
  baseExpModifier: number;      // 120 (percentage)
  baseRewardMin: number;        // 10
  baseRewardMax: number;        // 40
  baseRewardModifier: number;   // 120 (percentage)
  baseSpModifier: number;       // 120 (percentage)
  battleCalcType: number;       // 1

  // PvP settings
  pvpEnable: boolean;
  pvpDefiesMax: number;         // 5

  // Economy
  itemModifierPower: number;    // 100
  skillTradingPower: number;    // 2
  trainingSkillCost: number;    // 1000
  trainingCharacCost: number;   // 3000
  trainingUpgradeCost: number;  // 10000
  trainingChangeCost: number;   // 100
  newShopPrice: number;         // 500

  // Warehouse & Shops
  warehouseTax: number;         // 10 (percentage)
  shopTax: number;              // 10 (percentage)

  // Thief
  thiefFailureDamage: number;   // 2000
  thiefFailurePunishment: boolean;
  thiefFailureTime: number;     // 21600 (seconds = 6 hours)
  shopStealMinLevel: number;    // 5

  // Vault/Banking
  vaultEnable: boolean;
  loanEnable: boolean;
  interestRate: number;         // 4 (percentage)
  interestTime: number;         // 86400 (seconds = 1 day)
  loanInterest: number;         // 15 (percentage)
  loanInterestTime: number;     // 864000 (seconds)
  loanMaxSum: number;           // 5000

  // Stock market
  stockMaxChange: number;       // 10 (percentage)
  stockMinChange: number;       // 0

  // Temple
  templeHealCost: number;       // 100
  templeResurrectCost: number;  // 300

  // Leveling
  nextLevelPenalty: number;     // 10 (percentage)
}
