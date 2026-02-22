import { create } from 'zustand';
import { api } from '../api/client';

interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  message: string;
  createdAt: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  lastMessageId: number;

  fetchMessages: () => Promise<void>;
  pollMessages: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  lastMessageId: 0,

  fetchMessages: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.getMessages();
      const lastId = data.messages.length > 0
        ? data.messages[data.messages.length - 1].id
        : 0;
      set({
        messages: data.messages,
        lastMessageId: lastId,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  pollMessages: async () => {
    try {
      const { lastMessageId } = get();
      const data = await api.pollMessages(lastMessageId);
      if (data.messages.length > 0) {
        const newLastId = data.messages[data.messages.length - 1].id;
        set(state => ({
          messages: [...state.messages, ...data.messages].slice(-100), // Keep last 100
          lastMessageId: newLastId,
        }));
      }
    } catch {
      // Silently fail on poll errors
    }
  },

  sendMessage: async (message: string) => {
    try {
      set({ isSending: true, error: null });
      await api.sendMessage(message);
      set({ isSending: false });
      // Poll immediately for the new message
      await get().pollMessages();
    } catch (err: any) {
      set({ error: err.message, isSending: false });
    }
  },

  clearError: () => set({ error: null }),
}));
