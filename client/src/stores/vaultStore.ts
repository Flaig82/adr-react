import { create } from 'zustand';
import { api } from '../api/client';

interface StockInfo {
  id: number;
  name: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
}

interface HoldingInfo {
  stockId: number;
  stockName: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
}

interface VaultState {
  // Bank
  hasAccount: boolean;
  balance: number;
  pendingInterest: number;
  nextInterestIn: number;

  // Loan
  loanAmount: number;
  loanPayoff: number;
  loanOverdue: boolean;
  loanDueIn: number;

  // Gold
  gold: number;

  // Stocks
  stocks: StockInfo[];
  holdings: HoldingInfo[];
  nextStockUpdateIn: number;

  // UI
  isLoading: boolean;
  isActing: boolean;
  error: string | null;
  message: string | null;

  // Actions
  fetchStatus: () => Promise<void>;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
  takeLoan: (amount: number) => Promise<void>;
  repayLoan: () => Promise<void>;
  buyStock: (stockId: number, shares: number) => Promise<void>;
  sellStock: (stockId: number, shares: number) => Promise<void>;
  clearMessage: () => void;
  clearError: () => void;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  hasAccount: false,
  balance: 0,
  pendingInterest: 0,
  nextInterestIn: 0,
  loanAmount: 0,
  loanPayoff: 0,
  loanOverdue: false,
  loanDueIn: 0,
  gold: 0,
  stocks: [],
  holdings: [],
  nextStockUpdateIn: 0,
  isLoading: false,
  isActing: false,
  error: null,
  message: null,

  fetchStatus: async () => {
    try {
      set({ isLoading: true, error: null });
      const status = await api.getVaultStatus();
      set({
        hasAccount: status.hasAccount,
        balance: status.balance,
        pendingInterest: status.pendingInterest,
        nextInterestIn: status.nextInterestIn,
        loanAmount: status.loanAmount,
        loanPayoff: status.loanPayoff,
        loanOverdue: status.loanOverdue,
        loanDueIn: status.loanDueIn,
        gold: status.gold,
        stocks: status.stocks,
        holdings: status.holdings,
        nextStockUpdateIn: status.nextStockUpdateIn,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  deposit: async (amount: number) => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.vaultDeposit(amount);
      set({ message: result.message, isActing: false });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  withdraw: async (amount: number) => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.vaultWithdraw(amount);
      set({ message: result.message, isActing: false });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  takeLoan: async (amount: number) => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.takeLoan(amount);
      set({ message: result.message, isActing: false });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  repayLoan: async () => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.repayLoan();
      set({ message: result.message, isActing: false });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  buyStock: async (stockId: number, shares: number) => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.buyStock(stockId, shares);
      set({ message: result.message, isActing: false });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  sellStock: async (stockId: number, shares: number) => {
    try {
      set({ isActing: true, error: null, message: null });
      const result = await api.sellStock(stockId, shares);
      set({ message: result.message, isActing: false });
      await get().fetchStatus();
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  clearMessage: () => set({ message: null }),
  clearError: () => set({ error: null }),
}));
