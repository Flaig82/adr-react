import { create } from 'zustand';
import { api } from '../api/client';

interface ShopInfo {
  id: number;
  name: string;
  description: string;
}

interface ShopItem {
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
  adjustedPrice: number;
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

interface StealableItem {
  id: number;
  name: string;
  typeName: string;
  qualityName: string;
  price: number;
  dc: number;
  dcValue: number;
}

interface StealInfo {
  items: StealableItem[];
  canSteal: boolean;
  reason?: string;
  thiefLevel: number;
  thiefLimit: number;
  characterLevel: number;
  minLevel: number;
}

interface ShopState {
  shops: ShopInfo[];
  selectedShopId: number | null;
  items: ShopItem[];
  stealInfo: StealInfo | null;
  isLoading: boolean;
  isStealing: boolean;
  error: string | null;
  message: string | null;

  fetchShops: () => Promise<void>;
  selectShop: (shopId: number) => Promise<void>;
  buyItem: (itemId: number) => Promise<void>;
  fetchStealableItems: (shopId: number) => Promise<void>;
  attemptSteal: (itemId: number) => Promise<void>;
  clearMessage: () => void;
  clearError: () => void;
}

export const useShopStore = create<ShopState>((set, get) => ({
  shops: [],
  selectedShopId: null,
  items: [],
  stealInfo: null,
  isLoading: false,
  isStealing: false,
  error: null,
  message: null,

  fetchShops: async () => {
    try {
      set({ isLoading: true, error: null });
      const { shops } = await api.getShops();
      set({ shops, isLoading: false });

      // Auto-select first shop if none selected
      if (shops.length > 0 && !get().selectedShopId) {
        await get().selectShop(shops[0].id);
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  selectShop: async (shopId: number) => {
    try {
      set({ isLoading: true, error: null, selectedShopId: shopId });
      const { items } = await api.getShopItems(shopId);
      set({ items, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  buyItem: async (itemId: number) => {
    try {
      set({ error: null, message: null });
      const result = await api.buyItem(itemId);
      set({ message: result.message });

      // Refresh shop items (prices might change, trading limit changes)
      const shopId = get().selectedShopId;
      if (shopId) {
        const { items } = await api.getShopItems(shopId);
        set({ items });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchStealableItems: async (shopId: number) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.getStealableItems(shopId);
      set({ stealInfo: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false, stealInfo: null });
    }
  },

  attemptSteal: async (itemId: number) => {
    try {
      set({ isStealing: true, error: null, message: null });
      const result = await api.attemptSteal(itemId);
      set({ message: result.message, isStealing: false });

      // Refresh stealable items
      const shopId = get().selectedShopId;
      if (shopId) {
        await get().fetchStealableItems(shopId);
      }
    } catch (err: any) {
      set({ error: err.message, isStealing: false });

      // Refresh stealable items (limit may have changed)
      const shopId = get().selectedShopId;
      if (shopId) {
        await get().fetchStealableItems(shopId);
      }
    }
  },

  clearMessage: () => set({ message: null }),
  clearError: () => set({ error: null }),
}));
