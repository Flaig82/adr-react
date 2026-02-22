import { create } from 'zustand';
import { api } from '../api/client';

interface ForgeItem {
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

interface ForgeState {
  // Skills
  skillMining: number;
  skillStone: number;
  skillForge: number;
  skillEnchantment: number;
  skillMiningUses: number;
  skillStoneUses: number;
  skillForgeUses: number;
  skillEnchantmentUses: number;
  skillLimit: number;

  // Items for each action
  pickaxes: ForgeItem[];
  rawMaterials: ForgeItem[];
  equipment: ForgeItem[];
  magicItems: ForgeItem[];

  // UI state
  isLoading: boolean;
  isActing: boolean;
  error: string | null;
  message: string | null;
  lastResult: any | null;

  // Actions
  fetchStatus: () => Promise<void>;
  mine: (pickaxeId: number) => Promise<void>;
  cutStone: (materialId: number) => Promise<void>;
  repair: (itemId: number) => Promise<void>;
  enchant: (itemId: number) => Promise<void>;
  clearMessage: () => void;
  clearError: () => void;
}

export const useForgeStore = create<ForgeState>((set, get) => ({
  skillMining: 0,
  skillStone: 0,
  skillForge: 0,
  skillEnchantment: 0,
  skillMiningUses: 0,
  skillStoneUses: 0,
  skillForgeUses: 0,
  skillEnchantmentUses: 0,
  skillLimit: 30,

  pickaxes: [],
  rawMaterials: [],
  equipment: [],
  magicItems: [],

  isLoading: false,
  isActing: false,
  error: null,
  message: null,
  lastResult: null,

  fetchStatus: async () => {
    try {
      set({ isLoading: true, error: null });
      const status = await api.getForgeStatus();
      set({
        skillMining: status.skillMining,
        skillStone: status.skillStone,
        skillForge: status.skillForge,
        skillEnchantment: status.skillEnchantment,
        skillMiningUses: status.skillMiningUses,
        skillStoneUses: status.skillStoneUses,
        skillForgeUses: status.skillForgeUses,
        skillEnchantmentUses: status.skillEnchantmentUses,
        skillLimit: status.skillLimit,
        pickaxes: status.pickaxes,
        rawMaterials: status.rawMaterials,
        equipment: status.equipment,
        magicItems: status.magicItems,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  mine: async (pickaxeId: number) => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.mine(pickaxeId);
      set({
        message: result.message,
        lastResult: result,
        isActing: false,
      });
      // Refresh status to update items and skill info
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  cutStone: async (materialId: number) => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.cutStone(materialId);
      set({
        message: result.message,
        lastResult: result,
        isActing: false,
      });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  repair: async (itemId: number) => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.repairItem(itemId);
      set({
        message: result.message,
        lastResult: result,
        isActing: false,
      });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  enchant: async (itemId: number) => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.enchantItem(itemId);
      set({
        message: result.message,
        lastResult: result,
        isActing: false,
      });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  clearMessage: () => set({ message: null }),
  clearError: () => set({ error: null }),
}));
