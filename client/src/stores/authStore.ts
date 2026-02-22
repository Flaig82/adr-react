import { create } from 'zustand';
import { api } from '../api/client';

interface AuthState {
  userId: number | null;
  username: string | null;
  hasCharacter: boolean;
  isLoading: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setHasCharacter: (has: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  username: null,
  hasCharacter: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const data = await api.me();
      set({
        userId: data.id,
        username: data.username,
        hasCharacter: data.hasCharacter,
        isLoading: false,
      });
    } catch {
      set({ userId: null, username: null, hasCharacter: false, isLoading: false });
    }
  },

  login: async (username: string, password: string) => {
    try {
      set({ error: null, isLoading: true });
      const data = await api.login(username, password);
      set({
        userId: data.id,
        username: data.username,
        hasCharacter: data.hasCharacter,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (username: string, password: string) => {
    try {
      set({ error: null, isLoading: true });
      const data = await api.register(username, password);
      set({
        userId: data.id,
        username: data.username,
        hasCharacter: false,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.logout();
    } finally {
      set({ userId: null, username: null, hasCharacter: false, error: null });
    }
  },

  setHasCharacter: (has: boolean) => set({ hasCharacter: has }),
  clearError: () => set({ error: null }),
}));
