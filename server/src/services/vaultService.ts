import { eq, and } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { calculateInterest, stockPriceChange } from '@adr/shared';

// ─── Config Constants ───────────────────────────────────────────────────────

const INTEREST_RATE = 4;            // 4% per period
const INTEREST_TIME = 86400;        // 1 day in seconds
const LOAN_INTEREST = 15;           // 15% one-time fee
const LOAN_INTEREST_TIME = 864000;  // 10 days in seconds
const LOAN_MAX = 5000;              // Max loan amount
const STOCK_UPDATE_TIME = 86400;    // 1 day in seconds
const STOCK_MIN_CHANGE = 0;
const STOCK_MAX_CHANGE = 10;
const MAX_SHARES_PER_TX = 50;       // Max shares per transaction

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VaultStatus {
  hasAccount: boolean;
  balance: number;
  pendingInterest: number;
  nextInterestIn: number;      // seconds until next interest payout
  loanAmount: number;
  loanPayoff: number;
  loanOverdue: boolean;
  loanDueIn: number;           // seconds until loan is overdue (0 if no loan or already overdue)
  gold: number;
  stocks: StockInfo[];
  holdings: HoldingInfo[];
  nextStockUpdateIn: number;   // seconds until next stock price change
}

interface StockInfo {
  id: number;
  name: string;
  currentPrice: number;
  previousPrice: number;
  change: number;       // price difference
  changePercent: number; // % change
}

interface HoldingInfo {
  stockId: number;
  stockName: string;
  shares: number;
  purchasePrice: number; // avg cost basis
  currentPrice: number;
  value: number;         // shares * currentPrice
  pnl: number;           // unrealized P&L
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCharacter(userId: number) {
  const char = db.select().from(schema.characters)
    .where(eq(schema.characters.userId, userId)).get();
  if (!char) throw new Error('No character found');
  if (char.isBattling) throw new Error('Cannot use the vault during battle');
  return char;
}

function getOrCreateAccount(userId: number) {
  let account = db.select().from(schema.vaultAccounts)
    .where(eq(schema.vaultAccounts.userId, userId)).get();

  if (!account) {
    db.insert(schema.vaultAccounts).values({
      userId,
      balance: 0,
      lastInterestTime: Math.floor(Date.now() / 1000),
      loanAmount: 0,
      loanInterestTime: 0,
    }).run();
    account = db.select().from(schema.vaultAccounts)
      .where(eq(schema.vaultAccounts.userId, userId)).get()!;
  }

  return account;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

// Apply pending interest to account (called on every vault access)
function applyInterest(userId: number): number {
  const account = getOrCreateAccount(userId);
  if (account.balance <= 0) return 0;

  const elapsed = nowSeconds() - account.lastInterestTime;
  const interest = calculateInterest(account.balance, INTEREST_RATE, elapsed, INTEREST_TIME);

  if (interest > 0) {
    db.update(schema.vaultAccounts).set({
      balance: account.balance + interest,
      lastInterestTime: nowSeconds(),
    }).where(eq(schema.vaultAccounts.userId, userId)).run();
  }

  return interest;
}

// Update stock prices if enough time has passed (on-access)
function updateStockPrices(): void {
  const config = db.select().from(schema.gameConfig)
    .where(eq(schema.gameConfig.key, 'stock_last_update')).get();

  const lastUpdate = config ? parseInt(config.value, 10) : 0;
  const elapsed = nowSeconds() - lastUpdate;

  if (elapsed < STOCK_UPDATE_TIME) return; // Not time yet

  // How many periods have passed
  const periods = Math.floor(elapsed / STOCK_UPDATE_TIME);

  const stocks = db.select().from(schema.stocks).all();

  for (const stock of stocks) {
    let price = stock.currentPrice;
    // Apply price changes for each missed period
    for (let i = 0; i < periods; i++) {
      price = stockPriceChange(price, STOCK_MIN_CHANGE, STOCK_MAX_CHANGE, stock.minPrice, stock.maxPrice);
    }

    db.update(schema.stocks).set({
      previousPrice: stock.currentPrice,
      currentPrice: price,
    }).where(eq(schema.stocks.id, stock.id)).run();
  }

  // Update last change timestamp
  if (config) {
    db.update(schema.gameConfig).set({
      value: String(nowSeconds()),
    }).where(eq(schema.gameConfig.key, 'stock_last_update')).run();
  } else {
    db.insert(schema.gameConfig).values({
      key: 'stock_last_update',
      value: String(nowSeconds()),
    }).run();
  }
}

// ─── Get Vault Status ───────────────────────────────────────────────────────

export function getVaultStatus(userId: number): VaultStatus {
  const char = getCharacter(userId);

  // Apply interest & update stocks on access
  applyInterest(userId);
  updateStockPrices();

  const account = getOrCreateAccount(userId);

  // Calculate pending interest (for display)
  const elapsed = nowSeconds() - account.lastInterestTime;
  const pendingInterest = calculateInterest(account.balance, INTEREST_RATE, elapsed, INTEREST_TIME);

  // Time until next interest payout
  const nextInterestIn = account.balance > 0
    ? Math.max(0, INTEREST_TIME - elapsed)
    : 0;

  // Calculate loan payoff
  let loanPayoff = 0;
  let loanOverdue = false;
  let loanDueIn = 0;
  if (account.loanAmount > 0) {
    loanPayoff = Math.ceil(account.loanAmount * (1 + LOAN_INTEREST / 100));
    if (account.loanInterestTime > 0) {
      const loanElapsed = nowSeconds() - account.loanInterestTime;
      loanOverdue = loanElapsed > LOAN_INTEREST_TIME;
      loanDueIn = loanOverdue ? 0 : Math.max(0, LOAN_INTEREST_TIME - loanElapsed);
    }
  }

  // Time until next stock price update
  const stockConfig = db.select().from(schema.gameConfig)
    .where(eq(schema.gameConfig.key, 'stock_last_update')).get();
  const stockLastUpdate = stockConfig ? parseInt(stockConfig.value, 10) : 0;
  const stockElapsed = nowSeconds() - stockLastUpdate;
  const nextStockUpdateIn = Math.max(0, STOCK_UPDATE_TIME - stockElapsed);

  // Get stocks
  const stocks = db.select().from(schema.stocks).all();
  const stockInfos: StockInfo[] = stocks.map(s => ({
    id: s.id,
    name: s.name,
    currentPrice: s.currentPrice,
    previousPrice: s.previousPrice,
    change: s.currentPrice - s.previousPrice,
    changePercent: s.previousPrice > 0
      ? Math.round(((s.currentPrice - s.previousPrice) / s.previousPrice) * 10000) / 100
      : 0,
  }));

  // Get user holdings
  const holdings = db.select().from(schema.stockHoldings)
    .where(eq(schema.stockHoldings.userId, userId))
    .all();

  const holdingInfos: HoldingInfo[] = holdings
    .filter(h => h.shares > 0)
    .map(h => {
      const stock = stocks.find(s => s.id === h.stockId);
      const currentPrice = stock?.currentPrice || 0;
      const value = h.shares * currentPrice;
      const costBasis = h.shares * h.purchasePrice;
      return {
        stockId: h.stockId,
        stockName: stock?.name || 'Unknown',
        shares: h.shares,
        purchasePrice: h.purchasePrice,
        currentPrice,
        value,
        pnl: value - costBasis,
      };
    });

  return {
    hasAccount: true,
    balance: account.balance,
    pendingInterest,
    nextInterestIn,
    loanAmount: account.loanAmount,
    loanPayoff,
    loanOverdue,
    loanDueIn,
    gold: char.gold,
    stocks: stockInfos,
    holdings: holdingInfos,
    nextStockUpdateIn,
  };
}

// ─── Deposit ────────────────────────────────────────────────────────────────

export function deposit(userId: number, amount: number): { balance: number; gold: number; message: string } {
  if (amount <= 0) throw new Error('Amount must be positive');

  const char = getCharacter(userId);
  if (char.gold < amount) throw new Error(`Not enough gold! You have ${char.gold}g`);

  applyInterest(userId);
  const account = getOrCreateAccount(userId);

  const newBalance = account.balance + amount;
  const newGold = char.gold - amount;

  db.update(schema.vaultAccounts).set({ balance: newBalance })
    .where(eq(schema.vaultAccounts.userId, userId)).run();
  db.update(schema.characters).set({ gold: newGold })
    .where(eq(schema.characters.userId, userId)).run();

  return {
    balance: newBalance,
    gold: newGold,
    message: `Deposited ${amount}g. New balance: ${newBalance}g`,
  };
}

// ─── Withdraw ───────────────────────────────────────────────────────────────

export function withdraw(userId: number, amount: number): { balance: number; gold: number; message: string } {
  if (amount <= 0) throw new Error('Amount must be positive');

  const char = getCharacter(userId);

  applyInterest(userId);
  const account = getOrCreateAccount(userId);

  if (account.balance < amount) throw new Error(`Insufficient balance! You have ${account.balance}g in the vault`);

  const newBalance = account.balance - amount;
  const newGold = char.gold + amount;

  db.update(schema.vaultAccounts).set({ balance: newBalance })
    .where(eq(schema.vaultAccounts.userId, userId)).run();
  db.update(schema.characters).set({ gold: newGold })
    .where(eq(schema.characters.userId, userId)).run();

  return {
    balance: newBalance,
    gold: newGold,
    message: `Withdrew ${amount}g. New balance: ${newBalance}g`,
  };
}

// ─── Take Loan ──────────────────────────────────────────────────────────────

export function takeLoan(userId: number, amount: number): { loanAmount: number; gold: number; message: string } {
  if (amount <= 0) throw new Error('Amount must be positive');
  if (amount > LOAN_MAX) throw new Error(`Maximum loan amount is ${LOAN_MAX}g`);

  const char = getCharacter(userId);
  const account = getOrCreateAccount(userId);

  if (account.loanAmount > 0) {
    throw new Error('You already have an active loan. Repay it first!');
  }

  const newGold = char.gold + amount;

  db.update(schema.vaultAccounts).set({
    loanAmount: amount,
    loanInterestTime: nowSeconds(),
  }).where(eq(schema.vaultAccounts.userId, userId)).run();

  db.update(schema.characters).set({ gold: newGold })
    .where(eq(schema.characters.userId, userId)).run();

  const payoff = Math.ceil(amount * (1 + LOAN_INTEREST / 100));

  return {
    loanAmount: amount,
    gold: newGold,
    message: `Borrowed ${amount}g. You must repay ${payoff}g (${LOAN_INTEREST}% interest).`,
  };
}

// ─── Repay Loan ─────────────────────────────────────────────────────────────

export function repayLoan(userId: number): { gold: number; message: string } {
  const char = getCharacter(userId);
  const account = getOrCreateAccount(userId);

  if (account.loanAmount <= 0) throw new Error('You have no active loan');

  const payoff = Math.ceil(account.loanAmount * (1 + LOAN_INTEREST / 100));

  if (char.gold < payoff) {
    throw new Error(`Not enough gold to repay! You need ${payoff}g, you have ${char.gold}g`);
  }

  const newGold = char.gold - payoff;

  db.update(schema.vaultAccounts).set({
    loanAmount: 0,
    loanInterestTime: 0,
  }).where(eq(schema.vaultAccounts.userId, userId)).run();

  db.update(schema.characters).set({ gold: newGold })
    .where(eq(schema.characters.userId, userId)).run();

  return {
    gold: newGold,
    message: `Loan repaid! Paid ${payoff}g (${account.loanAmount}g principal + ${payoff - account.loanAmount}g interest).`,
  };
}

// ─── Buy Stock ──────────────────────────────────────────────────────────────

export function buyStock(
  userId: number, stockId: number, shares: number,
): { gold: number; shares: number; totalCost: number; message: string } {
  if (shares <= 0) throw new Error('Must buy at least 1 share');
  if (shares > MAX_SHARES_PER_TX) throw new Error(`Maximum ${MAX_SHARES_PER_TX} shares per transaction`);

  const char = getCharacter(userId);

  updateStockPrices();

  const stock = db.select().from(schema.stocks)
    .where(eq(schema.stocks.id, stockId)).get();
  if (!stock) throw new Error('Stock not found');

  const totalCost = shares * stock.currentPrice;
  if (char.gold < totalCost) {
    throw new Error(`Not enough gold! ${shares} shares × ${stock.currentPrice}g = ${totalCost}g, you have ${char.gold}g`);
  }

  // Deduct gold
  const newGold = char.gold - totalCost;
  db.update(schema.characters).set({ gold: newGold })
    .where(eq(schema.characters.userId, userId)).run();

  // Update or create holding
  const holding = db.select().from(schema.stockHoldings)
    .where(and(
      eq(schema.stockHoldings.userId, userId),
      eq(schema.stockHoldings.stockId, stockId),
    )).get();

  let newShares: number;
  if (holding) {
    // Weighted average purchase price
    const totalShares = holding.shares + shares;
    const avgPrice = Math.floor(
      (holding.shares * holding.purchasePrice + shares * stock.currentPrice) / totalShares,
    );
    newShares = totalShares;

    db.update(schema.stockHoldings).set({
      shares: totalShares,
      purchasePrice: avgPrice,
    }).where(eq(schema.stockHoldings.id, holding.id)).run();
  } else {
    newShares = shares;
    db.insert(schema.stockHoldings).values({
      userId,
      stockId,
      shares,
      purchasePrice: stock.currentPrice,
    }).run();
  }

  return {
    gold: newGold,
    shares: newShares,
    totalCost,
    message: `Bought ${shares} shares of ${stock.name} at ${stock.currentPrice}g each (total: ${totalCost}g)`,
  };
}

// ─── Sell Stock ─────────────────────────────────────────────────────────────

export function sellStock(
  userId: number, stockId: number, shares: number,
): { gold: number; shares: number; totalValue: number; message: string } {
  if (shares <= 0) throw new Error('Must sell at least 1 share');
  if (shares > MAX_SHARES_PER_TX) throw new Error(`Maximum ${MAX_SHARES_PER_TX} shares per transaction`);

  const char = getCharacter(userId);

  updateStockPrices();

  const stock = db.select().from(schema.stocks)
    .where(eq(schema.stocks.id, stockId)).get();
  if (!stock) throw new Error('Stock not found');

  const holding = db.select().from(schema.stockHoldings)
    .where(and(
      eq(schema.stockHoldings.userId, userId),
      eq(schema.stockHoldings.stockId, stockId),
    )).get();

  if (!holding || holding.shares < shares) {
    throw new Error(`You don't own enough shares. You have ${holding?.shares || 0}`);
  }

  const totalValue = shares * stock.currentPrice;
  const newGold = char.gold + totalValue;
  const newShares = holding.shares - shares;

  // Add gold
  db.update(schema.characters).set({ gold: newGold })
    .where(eq(schema.characters.userId, userId)).run();

  // Update holding
  if (newShares <= 0) {
    db.delete(schema.stockHoldings).where(eq(schema.stockHoldings.id, holding.id)).run();
  } else {
    db.update(schema.stockHoldings).set({ shares: newShares })
      .where(eq(schema.stockHoldings.id, holding.id)).run();
  }

  const profit = totalValue - (shares * holding.purchasePrice);

  return {
    gold: newGold,
    shares: newShares,
    totalValue,
    message: `Sold ${shares} shares of ${stock.name} at ${stock.currentPrice}g each (total: ${totalValue}g, ${profit >= 0 ? 'profit' : 'loss'}: ${Math.abs(profit)}g)`,
  };
}
