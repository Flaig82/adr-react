import { useEffect, useState, useRef } from 'react';
import { useVaultStore } from '../stores/vaultStore';
import { useCharacterStore } from '../stores/characterStore';

// ─── Vault Tab Types ────────────────────────────────────────────────────────

type VaultTab = 'bank' | 'loan' | 'stocks';

// ─── Countdown Hook ─────────────────────────────────────────────────────────

function useCountdown(serverSeconds: number): number {
  const [remaining, setRemaining] = useState(serverSeconds);
  const startRef = useRef(Date.now());
  const serverRef = useRef(serverSeconds);

  // Reset when server sends a new value
  useEffect(() => {
    serverRef.current = serverSeconds;
    startRef.current = Date.now();
    setRemaining(serverSeconds);
  }, [serverSeconds]);

  useEffect(() => {
    if (serverRef.current <= 0) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      setRemaining(Math.max(0, serverRef.current - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, [serverSeconds]);

  return remaining;
}

// ─── Format Countdown ───────────────────────────────────────────────────────

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Now';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

// ─── Countdown Display ──────────────────────────────────────────────────────

function CountdownTimer({ seconds, label, icon, color = 'blue' }: {
  seconds: number;
  label: string;
  icon: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const remaining = useCountdown(seconds);
  const colorMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400 flex items-center gap-1.5">
        <span>{icon}</span> {label}
      </span>
      <span className={`font-mono font-medium ${colorMap[color]}`}>
        {formatCountdown(remaining)}
      </span>
    </div>
  );
}

// ─── Amount Input ───────────────────────────────────────────────────────────

function AmountInput({ value, onChange, max, label }: {
  value: string;
  onChange: (v: string) => void;
  max: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        max={max}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={label}
        className="input w-32 text-sm"
      />
      <button
        onClick={() => onChange(String(max))}
        className="text-xs text-adr-blue hover:text-blue-400"
      >
        Max ({max}g)
      </button>
    </div>
  );
}

// ─── Bank Section ───────────────────────────────────────────────────────────

function BankSection({ balance, pendingInterest, nextInterestIn, gold, isActing, onDeposit, onWithdraw }: {
  balance: number;
  pendingInterest: number;
  nextInterestIn: number;
  gold: number;
  isActing: boolean;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{'\uD83C\uDFE6'} Bank Account</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-adr-gold">{balance.toLocaleString()}g</div>
            <div className="text-xs text-gray-500">Balance</div>
          </div>
        </div>

        <div className="bg-gray-800/40 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Interest Rate</span>
            <span className="text-green-400 font-medium">4% / day</span>
          </div>
          {pendingInterest > 0 && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-400">Accrued Interest</span>
              <span className="text-green-400">+{pendingInterest}g (applied on next update)</span>
            </div>
          )}
          {balance > 0 && nextInterestIn > 0 && (
            <div className="mt-1">
              <CountdownTimer
                seconds={nextInterestIn}
                label="Next Interest Payout"
                icon="⏰"
                color="green"
              />
            </div>
          )}
        </div>

        {/* Deposit */}
        <div className="flex items-center gap-3 mb-3">
          <AmountInput
            value={depositAmount}
            onChange={setDepositAmount}
            max={gold}
            label="Deposit amount"
          />
          <button
            onClick={() => {
              const amt = parseInt(depositAmount, 10);
              if (amt > 0) { onDeposit(amt); setDepositAmount(''); }
            }}
            disabled={isActing || !depositAmount || parseInt(depositAmount, 10) <= 0 || parseInt(depositAmount, 10) > gold}
            className="btn-secondary text-xs px-4 py-2"
          >
            Deposit
          </button>
        </div>

        {/* Withdraw */}
        <div className="flex items-center gap-3">
          <AmountInput
            value={withdrawAmount}
            onChange={setWithdrawAmount}
            max={balance}
            label="Withdraw amount"
          />
          <button
            onClick={() => {
              const amt = parseInt(withdrawAmount, 10);
              if (amt > 0) { onWithdraw(amt); setWithdrawAmount(''); }
            }}
            disabled={isActing || !withdrawAmount || parseInt(withdrawAmount, 10) <= 0 || parseInt(withdrawAmount, 10) > balance}
            className="btn-outline text-xs px-4 py-2"
          >
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Loan Section ───────────────────────────────────────────────────────────

function LoanSection({ loanAmount, loanPayoff, loanOverdue, loanDueIn, gold, isActing, onTakeLoan, onRepay }: {
  loanAmount: number;
  loanPayoff: number;
  loanOverdue: boolean;
  loanDueIn: number;
  gold: number;
  isActing: boolean;
  onTakeLoan: (amount: number) => void;
  onRepay: () => void;
}) {
  const [loanInput, setLoanInput] = useState('');
  const hasLoan = loanAmount > 0;

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">{'\uD83D\uDCB0'} Loans</h3>

        {hasLoan ? (
          <>
            <div className={`rounded-lg p-4 mb-4 ${loanOverdue ? 'bg-red-900/20 border border-red-500/30' : 'bg-yellow-900/20 border border-yellow-500/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Active Loan</span>
                <span className="text-lg font-bold text-yellow-400">{loanAmount.toLocaleString()}g</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Repayment Amount (15% interest)</span>
                <span className="text-lg font-bold text-red-400">{loanPayoff.toLocaleString()}g</span>
              </div>
              {loanOverdue ? (
                <div className="text-xs text-red-400 mt-2">
                  {'\u26A0\uFE0F'} This loan is overdue! Repay immediately to avoid penalties.
                </div>
              ) : loanDueIn > 0 && (
                <div className="mt-2">
                  <CountdownTimer
                    seconds={loanDueIn}
                    label="Repayment Due In"
                    icon="⏳"
                    color="yellow"
                  />
                </div>
              )}
            </div>

            <button
              onClick={onRepay}
              disabled={isActing || gold < loanPayoff}
              className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
                gold >= loanPayoff
                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30'
                  : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
              }`}
            >
              {gold >= loanPayoff
                ? `Repay Loan (${loanPayoff.toLocaleString()}g)`
                : `Need ${(loanPayoff - gold).toLocaleString()}g more to repay`}
            </button>
          </>
        ) : (
          <>
            <div className="bg-gray-800/40 rounded-lg p-3 mb-4 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Maximum Loan</span>
                <span className="text-white">5,000g</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Interest Rate</span>
                <span className="text-yellow-400">15% (one-time fee)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Repayment Period</span>
                <span className="text-white">10 days</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AmountInput
                value={loanInput}
                onChange={setLoanInput}
                max={5000}
                label="Loan amount"
              />
              <button
                onClick={() => {
                  const amt = parseInt(loanInput, 10);
                  if (amt > 0) { onTakeLoan(amt); setLoanInput(''); }
                }}
                disabled={isActing || !loanInput || parseInt(loanInput, 10) <= 0 || parseInt(loanInput, 10) > 5000}
                className="btn-gold text-xs px-4 py-2"
              >
                Borrow
              </button>
            </div>
            {loanInput && parseInt(loanInput, 10) > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                You'll need to repay {Math.ceil(parseInt(loanInput, 10) * 1.15).toLocaleString()}g
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Stocks Section ─────────────────────────────────────────────────────────

function StocksSection({ stocks, holdings, gold, isActing, nextStockUpdateIn, onBuy, onSell }: {
  stocks: any[];
  holdings: any[];
  gold: number;
  isActing: boolean;
  nextStockUpdateIn: number;
  onBuy: (stockId: number, shares: number) => void;
  onSell: (stockId: number, shares: number) => void;
}) {
  const [buyAmounts, setBuyAmounts] = useState<Record<number, string>>({});
  const [sellAmounts, setSellAmounts] = useState<Record<number, string>>({});

  const totalValue = holdings.reduce((sum: number, h: any) => sum + h.value, 0);
  const totalPnl = holdings.reduce((sum: number, h: any) => sum + h.pnl, 0);

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      {holdings.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Portfolio</h3>
          <div className="flex items-center gap-6 mb-3">
            <div>
              <div className="text-xl font-bold text-white">{totalValue.toLocaleString()}g</div>
              <div className="text-xs text-gray-500">Total Value</div>
            </div>
            <div>
              <div className={`text-xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnl >= 0 ? '+' : ''}{totalPnl.toLocaleString()}g
              </div>
              <div className="text-xs text-gray-500">Unrealized P&L</div>
            </div>
          </div>

          <div className="space-y-2">
            {holdings.map((h: any) => (
              <div key={h.stockId} className="flex items-center justify-between bg-gray-800/40 rounded-lg p-2 text-sm">
                <div>
                  <span className="text-white font-medium">{h.stockName}</span>
                  <span className="text-gray-500 ml-2">{h.shares} shares @ {h.purchasePrice}g avg</span>
                </div>
                <div className="text-right">
                  <div className="text-white">{h.value.toLocaleString()}g</div>
                  <div className={`text-xs ${h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {h.pnl >= 0 ? '+' : ''}{h.pnl}g
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Exchange */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{'\uD83D\uDCC8'} Stock Exchange</h3>
          {nextStockUpdateIn > 0 && (
            <div className="text-xs">
              <CountdownTimer
                seconds={nextStockUpdateIn}
                label="Price Update"
                icon="🔄"
                color="blue"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {stocks.map((stock: any) => {
            const holding = holdings.find((h: any) => h.stockId === stock.id);
            const ownedShares = holding?.shares || 0;
            const buyAmt = parseInt(buyAmounts[stock.id] || '0', 10);
            const sellAmt = parseInt(sellAmounts[stock.id] || '0', 10);
            const buyCost = buyAmt * stock.currentPrice;

            return (
              <div key={stock.id} className="rounded-lg border border-gray-700/50 bg-gray-800/30 p-4">
                {/* Stock Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-medium">{stock.name}</div>
                    <div className="text-xs text-gray-500">
                      {ownedShares > 0 ? `${ownedShares} shares owned` : 'No shares owned'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{stock.currentPrice}g</div>
                    <div className={`text-xs flex items-center gap-1 ${
                      stock.change > 0 ? 'text-green-400' : stock.change < 0 ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      {stock.change > 0 ? '\u25B2' : stock.change < 0 ? '\u25BC' : '\u25CF'}
                      {' '}{stock.change > 0 ? '+' : ''}{stock.change}g ({stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%)
                    </div>
                  </div>
                </div>

                {/* Buy/Sell */}
                <div className="flex flex-wrap gap-3">
                  {/* Buy */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={buyAmounts[stock.id] || ''}
                      onChange={e => setBuyAmounts({ ...buyAmounts, [stock.id]: e.target.value })}
                      placeholder="Qty"
                      className="input w-20 text-xs"
                    />
                    <button
                      onClick={() => {
                        if (buyAmt > 0) {
                          onBuy(stock.id, buyAmt);
                          setBuyAmounts({ ...buyAmounts, [stock.id]: '' });
                        }
                      }}
                      disabled={isActing || buyAmt <= 0 || buyCost > gold}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        buyAmt > 0 && buyCost <= gold
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30'
                          : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                      }`}
                    >
                      Buy{buyAmt > 0 ? ` (${buyCost}g)` : ''}
                    </button>
                  </div>

                  {/* Sell */}
                  {ownedShares > 0 && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={ownedShares}
                        value={sellAmounts[stock.id] || ''}
                        onChange={e => setSellAmounts({ ...sellAmounts, [stock.id]: e.target.value })}
                        placeholder="Qty"
                        className="input w-20 text-xs"
                      />
                      <button
                        onClick={() => {
                          if (sellAmt > 0) {
                            onSell(stock.id, sellAmt);
                            setSellAmounts({ ...sellAmounts, [stock.id]: '' });
                          }
                        }}
                        disabled={isActing || sellAmt <= 0 || sellAmt > ownedShares}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          sellAmt > 0 && sellAmt <= ownedShares
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30'
                            : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                        }`}
                      >
                        Sell{sellAmt > 0 ? ` (${sellAmt * stock.currentPrice}g)` : ''}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Vault Page ────────────────────────────────────────────────────────

export function Vault() {
  const {
    balance, pendingInterest, nextInterestIn,
    loanAmount, loanPayoff, loanOverdue, loanDueIn,
    gold, stocks, holdings, nextStockUpdateIn,
    isLoading, isActing, error, message,
    fetchStatus, deposit, withdraw, takeLoan, repayLoan, buyStock, sellStock,
    clearMessage, clearError,
  } = useVaultStore();

  const { fetchCharacter } = useCharacterStore();
  const [activeTab, setActiveTab] = useState<VaultTab>('bank');

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // After vault actions, refresh character gold
  const handleDeposit = async (amount: number) => { await deposit(amount); fetchCharacter(); };
  const handleWithdraw = async (amount: number) => { await withdraw(amount); fetchCharacter(); };
  const handleTakeLoan = async (amount: number) => { await takeLoan(amount); fetchCharacter(); };
  const handleRepay = async () => { await repayLoan(); fetchCharacter(); };
  const handleBuyStock = async (stockId: number, shares: number) => { await buyStock(stockId, shares); fetchCharacter(); };
  const handleSellStock = async (stockId: number, shares: number) => { await sellStock(stockId, shares); fetchCharacter(); };

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(clearMessage, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (isLoading && !stocks.length) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-lg">Loading vault...</div>
        </div>
      </div>
    );
  }

  const tabs: { key: VaultTab; label: string; icon: string }[] = [
    { key: 'bank', label: 'Bank', icon: '\uD83C\uDFE6' },
    { key: 'loan', label: 'Loans', icon: '\uD83D\uDCB0' },
    { key: 'stocks', label: 'Stocks', icon: '\uD83D\uDCC8' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{'\uD83C\uDFE6'} Vault</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-adr-gold font-bold text-lg">{gold.toLocaleString()} Gold</span>
          {balance > 0 && (
            <span className="text-blue-400">Bank: {balance.toLocaleString()}g</span>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-center text-green-400 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-center text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-adr-blue text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.key === 'loan' && loanAmount > 0 && (
              <span className={`ml-1 w-2 h-2 rounded-full ${loanOverdue ? 'bg-red-400' : 'bg-yellow-400'}`} />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'bank' && (
        <BankSection
          balance={balance}
          pendingInterest={pendingInterest}
          nextInterestIn={nextInterestIn}
          gold={gold}
          isActing={isActing}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
        />
      )}
      {activeTab === 'loan' && (
        <LoanSection
          loanAmount={loanAmount}
          loanPayoff={loanPayoff}
          loanOverdue={loanOverdue}
          loanDueIn={loanDueIn}
          gold={gold}
          isActing={isActing}
          onTakeLoan={handleTakeLoan}
          onRepay={handleRepay}
        />
      )}
      {activeTab === 'stocks' && (
        <StocksSection
          stocks={stocks}
          holdings={holdings}
          gold={gold}
          isActing={isActing}
          nextStockUpdateIn={nextStockUpdateIn}
          onBuy={handleBuyStock}
          onSell={handleSellStock}
        />
      )}
    </div>
  );
}
