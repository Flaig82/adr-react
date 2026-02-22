// Battle-related types — mirrors phpbb_adr_battle_list, battle_monsters, battle_pvp

export interface Monster {
  id: number;
  name: string;
  image: string;
  level: number;
  hp: number;
  mp: number;
  might: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  ac: number;
  elementId: number;

  // Loot
  xpReward: number;
  goldRewardMin: number;
  goldRewardMax: number;
  spReward: number;
  dropItemId: number; // Item ID it can drop (0 = none)
  dropRate: number; // Percentage chance to drop
}

export type BattleAction = 'attack' | 'defend' | 'magic' | 'potion_hp' | 'potion_mp' | 'flee';

export interface BattleTurnResult {
  turn: number;
  playerAction: BattleAction;
  playerDamage: number;
  playerCrit: boolean;
  monsterDamage: number;
  monsterCrit: boolean;
  monsterUsedMagic: boolean;
  playerHp: number;
  playerMp: number;
  monsterHp: number;
  monsterMp: number;
  playerDefending: boolean;
  message: string;
  battleOver: boolean;
  playerWon: boolean | null; // null if battle continues
}

export interface BattleState {
  id: number;
  characterId: number;
  monsterId: number;
  monsterName: string;
  monsterImage: string;
  monsterHp: number;
  monsterHpMax: number;
  monsterMp: number;
  monsterMpMax: number;
  playerHp: number;
  playerHpMax: number;
  playerMp: number;
  playerMpMax: number;
  turn: number;
  log: BattleTurnResult[];
  isOver: boolean;
  playerWon: boolean | null;
}

export interface BattleReward {
  xp: number;
  gold: number;
  sp: number;
  itemDrop: { itemId: number; name: string; image: string } | null;
  leveledUp: boolean;
  newLevel: number | null;
}

export interface PvpChallenge {
  id: number;
  challengerId: number;
  challengerName: string;
  defenderId: number;
  defenderName: string;
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed';
  winnerId: number | null;
  createdAt: string;
}
