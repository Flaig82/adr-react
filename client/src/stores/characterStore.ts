import { create } from 'zustand';
import { api } from '../api/client';

interface CharacterState {
  character: any | null;
  isLoading: boolean;
  error: string | null;

  fetchCharacter: () => Promise<void>;
  setCharacter: (char: any) => void;
  clearCharacter: () => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
  character: null,
  isLoading: false,
  error: null,

  fetchCharacter: async () => {
    try {
      set({ isLoading: true, error: null });
      const character = await api.getCharacter();
      set({ character, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setCharacter: (character: any) => set({ character }),
  clearCharacter: () => set({ character: null }),
}));
