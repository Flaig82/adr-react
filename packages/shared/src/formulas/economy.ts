// Economy formulas — ported from ADR PHP (vault, trading, shops)

/**
 * Calculate compound interest on vault balance
 * Original PHP: interests_rate = 4%, interests_time = 86400 (daily)
 */
export function calculateInterest(
  balance: number,
  ratePercent: number,
  elapsedSeconds: number,
  interestPeriodSeconds: number,
): number {
  const periods = Math.floor(elapsedSeconds / interestPeriodSeconds);
  if (periods <= 0 || balance <= 0) return 0;

  const rate = ratePercent / 100;
  const newBalance = balance * Math.pow(1 + rate, periods);
  return Math.floor(newBalance - balance);
}

/**
 * Calculate loan interest owed
 * Original PHP: loan_interests = 15%
 */
export function calculateLoanInterest(
  loanAmount: number,
  ratePercent: number,
  elapsedSeconds: number,
  interestPeriodSeconds: number,
): number {
  const periods = Math.floor(elapsedSeconds / interestPeriodSeconds);
  if (periods <= 0 || loanAmount <= 0) return 0;

  const rate = ratePercent / 100;
  return Math.floor(loanAmount * rate * periods);
}

/**
 * Trading skill price modifier
 * Original PHP: skill_trading_power = 2, based on charisma
 * Better charisma + higher trading skill = better prices
 */
export function tradingModifier(
  charisma: number,
  tradingSkillLevel: number,
  tradingPower: number = 2,
): number {
  // Base modifier from charisma
  const charismaMod = Math.max(0, Math.floor((charisma - 10) / 2));

  // Skill modifier
  const skillMod = tradingSkillLevel * tradingPower;

  // Total percentage modifier (positive = discount on buying, bonus on selling)
  return Math.min(30, charismaMod + skillMod); // Cap at 30%
}

/**
 * Calculate buy price with trading modifier
 */
export function buyPrice(basePrice: number, tradingModPercent: number): number {
  const discount = tradingModPercent / 100;
  return Math.max(1, Math.floor(basePrice * (1 - discount)));
}

/**
 * Calculate sell price with trading modifier
 * Items sell for 50% base price + trading bonus
 */
export function sellPrice(basePrice: number, tradingModPercent: number): number {
  const bonus = tradingModPercent / 100;
  return Math.max(1, Math.floor(basePrice * (0.5 + bonus * 0.5)));
}

/**
 * Shop tax calculation
 */
export function shopTax(amount: number, taxPercent: number): number {
  return Math.floor(amount * (taxPercent / 100));
}

/**
 * Stock price daily variation
 * Original PHP: stock_min_change = 0, stock_max_change = 10
 */
export function stockPriceChange(
  currentPrice: number,
  minChange: number = 0,
  maxChange: number = 10,
  minPrice: number = 1,
  maxPrice: number = 1000,
): number {
  const changePercent = minChange + Math.random() * (maxChange - minChange);
  const direction = Math.random() < 0.5 ? -1 : 1;
  const change = Math.floor(currentPrice * (changePercent / 100)) * direction;
  const newPrice = currentPrice + change;
  return Math.max(minPrice, Math.min(maxPrice, newPrice));
}
