import { create } from 'zustand';
import { api } from '../api/client';

interface InventoryItem {
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
  slot: string | null;
}

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  message: string | null;

  fetchInventory: () => Promise<void>;
  equipItem: (itemId: number) => Promise<void>;
  unequipItem: (itemId: number) => Promise<void>;
  sellItem: (itemId: number) => Promise<void>;
  dropItem: (itemId: number) => Promise<void>;
  giveItem: (itemId: number, targetUserId: number) => Promise<void>;
  clearMessage: () => void;
  clearError: () => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  message: null,

  fetchInventory: async () => {
    try {
      set({ isLoading: true, error: null });
      const { items } = await api.getInventory();
      set({ items, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  equipItem: async (itemId: number) => {
    try {
      set({ error: null, message: null });
      const result = await api.equipItem(itemId);
      set({ message: result.message });
      // Re-fetch inventory to get updated state
      const { items } = await api.getInventory();
      set({ items });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  unequipItem: async (itemId: number) => {
    try {
      set({ error: null, message: null });
      const result = await api.unequipItem(itemId);
      set({ message: result.message });
      const { items } = await api.getInventory();
      set({ items });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  sellItem: async (itemId: number) => {
    try {
      set({ error: null, message: null });
      const result = await api.sellItem(itemId);
      set({ message: result.message });
      const { items } = await api.getInventory();
      set({ items });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  dropItem: async (itemId: number) => {
    try {
      set({ error: null, message: null });
      const result = await api.dropItem(itemId);
      set({ message: result.message });
      const { items } = await api.getInventory();
      set({ items });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  giveItem: async (itemId: number, targetUserId: number) => {
    try {
      set({ error: null, message: null });
      const result = await api.giveItem(itemId, targetUserId);
      set({ message: result.message });
      const { items } = await api.getInventory();
      set({ items });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  clearMessage: () => set({ message: null }),
  clearError: () => set({ error: null }),
}));
