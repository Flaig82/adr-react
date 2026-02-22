// Skill and forge types — mirrors phpbb_adr_skills and forge mechanics

export interface Skill {
  id: number;
  name: string;
  description: string;
  requiredSp: number; // SP cost to learn
  image: string;
}

export type SkillName = 'mining' | 'stonecutting' | 'forge' | 'enchantment' | 'trading' | 'thief';

export interface ForgeResult {
  success: boolean;
  criticalFailure: boolean; // 5% chance — destroys materials
  itemCreated: {
    id: number;
    name: string;
    image: string;
    quality: number;
  } | null;
  materialsConsumed: { itemId: number; name: string }[];
  message: string;
}

export interface MiningResult {
  success: boolean;
  itemFound: {
    id: number;
    name: string;
    image: string;
    type: 'ore' | 'gem';
  } | null;
  message: string;
}

export interface ThiefResult {
  success: boolean;
  itemStolen: {
    id: number;
    name: string;
    image: string;
  } | null;
  caught: boolean;
  jailTime: number; // seconds
  damage: number; // gold penalty
  message: string;
}
