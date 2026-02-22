import { create } from 'zustand';
import { api } from '../api/client';

interface CharacterInfo {
  name: string;
  level: number;
  gold: number;
  sp: number;
  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;
  isDead: boolean;
  classId: number;
  className: string;
}

interface StatInfo {
  key: string;
  label: string;
  value: number;
  cost: number;
}

interface SkillInfo {
  id: number;
  name: string;
  description: string;
  requiredSp: number;
  image: string;
  learned: boolean;
  level: number;
  uses: number;
}

interface TempleInfo {
  healCost: number;
  resurrectCost: number;
  canHeal: boolean;
  canResurrect: boolean;
  needsHeal: boolean;
  needsResurrect: boolean;
}

interface LimitsInfo {
  battle: number;
  battleMax: number;
  skill: number;
  skillMax: number;
  trading: number;
  tradingMax: number;
  thief: number;
  thiefMax: number;
  nextReset: number;
}

interface ClassInfo {
  id: number;
  name: string;
  description: string;
  image: string;
  mightReq: number;
  dexterityReq: number;
  constitutionReq: number;
  intelligenceReq: number;
  wisdomReq: number;
  charismaReq: number;
  baseHp: number;
  baseMp: number;
  baseAc: number;
  updateHp: number;
  updateMp: number;
  updateAc: number;
  isCurrent: boolean;
  meetsRequirements: boolean;
}

interface TownState {
  character: CharacterInfo | null;
  stats: StatInfo[];
  skills: SkillInfo[];
  temple: TempleInfo | null;
  limits: LimitsInfo | null;
  classes: ClassInfo[];
  classChangeCost: number;

  isLoading: boolean;
  isActing: boolean;
  error: string | null;
  message: string | null;

  fetchStatus: () => Promise<void>;
  trainStat: (stat: string) => Promise<void>;
  learnSkill: (skillId: number) => Promise<void>;
  changeClass: (classId: number) => Promise<void>;
  heal: () => Promise<void>;
  resurrect: () => Promise<void>;
  clearMessage: () => void;
  clearError: () => void;
}

export const useTownStore = create<TownState>((set, get) => ({
  character: null,
  stats: [],
  skills: [],
  temple: null,
  limits: null,
  classes: [],
  classChangeCost: 100,

  isLoading: false,
  isActing: false,
  error: null,
  message: null,

  fetchStatus: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.getTownStatus();
      set({
        character: data.character,
        stats: data.stats,
        skills: data.skills,
        temple: data.temple,
        limits: data.limits,
        classes: data.classes,
        classChangeCost: data.classChangeCost,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  trainStat: async (stat: string) => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.trainStat(stat);
      set({ message: result.message, isActing: false });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  learnSkill: async (skillId: number) => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.learnSkill(skillId);
      set({ message: result.message, isActing: false });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  changeClass: async (classId: number) => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.changeClass(classId);
      set({ message: result.message, isActing: false });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  heal: async () => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.townHeal();
      set({ message: result.message, isActing: false });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  resurrect: async () => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.townResurrect();
      set({ message: result.message, isActing: false });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  clearMessage: () => set({ message: null }),
  clearError: () => set({ error: null }),
}));
