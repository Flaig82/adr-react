import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useCharacterStore } from '../stores/characterStore';

interface JailStatus {
  isJailed: boolean;
  recordId?: number;
  reason?: string;
  jailedAt?: string;
  releaseAt?: string;
  bailCost?: number;
  remainingSeconds?: number;
  remainingFormatted?: string;
}

interface JailRecord {
  id: number;
  reason: string;
  jailedAt: string;
  releaseAt: string;
  bailCost: number;
  released: number;
  releasedAt: string;
  status: string;
}

export function Jail() {
  const [status, setStatus] = useState<JailStatus | null>(null);
  const [history, setHistory] = useState<JailRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { character, fetchCharacter } = useCharacterStore();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statusData, historyData] = await Promise.all([
        api.getJailStatus(),
        api.getJailHistory(),
      ]);
      setStatus(statusData);
      setHistory(historyData.records);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchCharacter();
  }, [fetchCharacter]);

  // Auto-refresh countdown while jailed
  useEffect(() => {
    if (!status?.isJailed) return;
    const interval = setInterval(() => {
      loadData();
    }, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [status?.isJailed]);

  const handleBail = async () => {
    try {
      setIsPaying(true);
      setError(null);
      const result = await api.payBail();
      setMessage(result.message);
      await loadData();
      fetchCharacter();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPaying(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="card text-center py-12">
          <div className="animate-spin text-3xl mb-2">⚔️</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <h1 className="text-2xl font-bold text-adr-gold flex items-center gap-2">
        ⛓️ Jail
      </h1>

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

      {/* Current Status */}
      {status?.isJailed ? (
        <div className="card bg-red-900/10 border-red-700/30">
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🔒</div>
            <h2 className="text-xl font-bold text-red-300 mb-1">You are in Jail!</h2>
            <p className="text-gray-400 text-sm mb-4">{status.reason}</p>

            {/* Countdown */}
            <div className="bg-gray-900/50 rounded-lg p-4 inline-block mb-4">
              <div className="text-3xl font-bold text-red-400 font-mono">
                {status.remainingFormatted}
              </div>
              <div className="text-xs text-gray-500 mt-1">remaining</div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="text-sm text-gray-400">
                Release: {formatDate(status.releaseAt!)}
              </div>

              {/* Bail button */}
              <button
                onClick={handleBail}
                disabled={isPaying || (character?.gold ?? 0) < (status.bailCost ?? 0)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  (character?.gold ?? 0) >= (status.bailCost ?? 0)
                    ? 'bg-adr-gold/20 text-adr-gold hover:bg-adr-gold/30 border border-adr-gold/30'
                    : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                }`}
              >
                {isPaying ? 'Paying...' : `Pay Bail — ${status.bailCost}g`}
              </button>
              {(character?.gold ?? 0) < (status.bailCost ?? 0) && (
                <p className="text-xs text-red-400">
                  Not enough gold (you have {character?.gold ?? 0}g)
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-8">
          <div className="text-4xl mb-2">🆓</div>
          <h2 className="text-lg font-semibold text-green-400">You are free!</h2>
          <p className="text-sm text-gray-500 mt-1">Stay out of trouble, adventurer.</p>
        </div>
      )}

      {/* Jail History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Criminal Record ({history.length})
          </h3>
          <div className="space-y-2">
            {history.slice().reverse().map(record => (
              <div key={record.id} className="card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">{record.reason}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDate(record.jailedAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      record.status === 'Serving'
                        ? 'bg-red-900/30 text-red-400'
                        : record.status === 'Bailed Out'
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}>
                      {record.status}
                    </span>
                    {record.status === 'Bailed Out' && (
                      <div className="text-xs text-gray-500 mt-0.5">{record.bailCost}g bail</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
