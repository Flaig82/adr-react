// Vault/bank types — mirrors phpbb_adr_vault_users, vault_exchange

export interface VaultAccount {
  userId: number;
  balance: number;
  lastInterestTime: number; // Unix timestamp
  loanAmount: number;
  loanInterestTime: number; // Unix timestamp
}

export interface Stock {
  id: number;
  name: string;
  currentPrice: number;
  previousPrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface StockHolding {
  userId: number;
  stockId: number;
  shares: number;
  purchasePrice: number; // Average buy price
}

export interface VaultTransaction {
  type: 'deposit' | 'withdraw' | 'interest' | 'loan_take' | 'loan_repay';
  amount: number;
  balanceAfter: number;
  timestamp: string;
}
