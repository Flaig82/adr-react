import { useEffect, useRef } from 'react';
import { useBattleStore } from '../stores/battleStore';
import { StatBar } from '../components/StatBar';

// ─── HP Bar with color transitions ─────────────────────────────────────────

function HpBar({ label, current, max, size = 'normal' }: {
  label: string;
  current: number;
  max: number;
  size?: 'normal' | 'large';
}) {
  const percent = max > 0 ? (current / max) * 100 : 0;
  const color = percent > 60 ? 'bg-green-500' : percent > 25 ? 'bg-yellow-500' : 'bg-red-500';
  const height = size === 'large' ? 'h-4' : 'h-2.5';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="text-gray-400">{current} / {max}</span>
      </div>
      <div className={`${height} bg-gray-700 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ─── Battle Log ─────────────────────────────────────────────────────────────

function BattleLog({ messages }: { messages: string[] }) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={logRef}
      className="bg-gray-900/80 rounded-lg border border-gray-700/50 p-4 h-48 overflow-y-auto space-y-1"
    >
      {messages.length === 0 ? (
        <p className="text-gray-500 text-sm italic">Battle log will appear here...</p>
      ) : (
        messages.map((msg, i) => {
          let textClass = 'text-gray-300 text-sm';
          if (msg.includes('CRITICAL')) textClass = 'text-yellow-400 text-sm font-bold';
          else if (msg.includes('defeated') && !msg.includes('was defeated')) textClass = 'text-green-400 text-sm font-semibold';
          else if (msg.includes('Earned')) textClass = 'text-green-400 text-sm font-semibold';
          else if (msg.includes('was defeated') || msg.includes('Visit the temple')) textClass = 'text-red-400 text-sm font-semibold';
          else if (msg.includes('fled')) textClass = 'text-yellow-300 text-sm';
          else if (msg.includes('misses') || msg.includes('fails')) textClass = 'text-gray-500 text-sm italic';
          else if (msg.includes('LEVEL UP')) textClass = 'text-adr-gold text-sm font-bold';
          else if (msg.includes('defensive stance')) textClass = 'text-blue-400 text-sm';

          return (
            <p key={i} className={textClass}>
              {msg}
            </p>
          );
        })
      )}
    </div>
  );
}

// ─── Monster Display ────────────────────────────────────────────────────────

function getMonsterEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('dragon')) return '\uD83D\uDC09';
  if (lower.includes('skeleton')) return '\uD83D\uDC80';
  if (lower.includes('goblin')) return '\uD83D\uDC7A';
  if (lower.includes('wolf') || lower.includes('worg')) return '\uD83D\uDC3A';
  if (lower.includes('spider')) return '\uD83D\uDD77\uFE0F';
  if (lower.includes('slime') || lower.includes('ooze')) return '\uD83E\uDDA0';
  if (lower.includes('bat')) return '\uD83E\uDD87';
  if (lower.includes('rat')) return '\uD83D\uDC00';
  if (lower.includes('troll')) return '\uD83E\uDDCC';
  if (lower.includes('orc')) return '\uD83D\uDC79';
  return '\u2694\uFE0F';
}

function MonsterDisplay({ monster }: { monster: { name: string; level: number; hp: number; hpMax: number; mp: number; mpMax: number; image: string } }) {
  const hpPercent = monster.hpMax > 0 ? (monster.hp / monster.hpMax) * 100 : 0;

  return (
    <div className="text-center space-y-3">
      <div className="mx-auto w-32 h-32 rounded-xl bg-gray-800/80 border-2 border-gray-600/50 flex items-center justify-center overflow-hidden">
        <span className="text-6xl">{getMonsterEmoji(monster.name)}</span>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white">{monster.name}</h3>
        <span className="text-sm text-gray-400">Level {monster.level}</span>
      </div>

      <div className="max-w-xs mx-auto">
        <HpBar label="HP" current={monster.hp} max={monster.hpMax} size="large" />
        {monster.mpMax > 0 && (
          <div className="mt-2">
            <StatBar label="MP" current={monster.mp} max={monster.mpMax} color="bg-blue-500" />
          </div>
        )}
      </div>

      {hpPercent < 25 && hpPercent > 0 && (
        <span className="text-xs text-red-400 animate-pulse">Badly wounded!</span>
      )}
    </div>
  );
}

// ─── Victory Screen ─────────────────────────────────────────────────────────

function VictoryScreen({ rewards, onContinue }: { rewards: { xp: number; gold: number; sp: number; leveledUp: boolean; newLevel?: number }; onContinue: () => void }) {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="text-6xl">{'\uD83C\uDFC6'}</div>
      <h2 className="text-3xl font-bold text-green-400">Victory!</h2>

      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
        <div className="bg-gray-800/60 rounded-lg p-3">
          <div className="text-lg font-bold text-adr-gold">{rewards.xp}</div>
          <div className="text-xs text-gray-400">XP</div>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-3">
          <div className="text-lg font-bold text-yellow-300">{rewards.gold}</div>
          <div className="text-xs text-gray-400">Gold</div>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-3">
          <div className="text-lg font-bold text-purple-400">{rewards.sp}</div>
          <div className="text-xs text-gray-400">SP</div>
        </div>
      </div>

      {rewards.leveledUp && (
        <div className="bg-adr-gold/10 border border-adr-gold/30 rounded-lg p-4">
          <div className="text-adr-gold font-bold text-lg">Level Up!</div>
          <div className="text-gray-300">You reached level {rewards.newLevel}!</div>
        </div>
      )}

      <button onClick={onContinue} className="btn-primary text-lg px-8 py-3">
        Continue Fighting
      </button>
    </div>
  );
}

// ─── Defeat Screen ──────────────────────────────────────────────────────────

function DefeatScreen({ onResurrect, onHeal, isDead, isLoading }: {
  onResurrect: () => void;
  onHeal: () => void;
  isDead: boolean;
  isLoading: boolean;
}) {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="text-6xl">{'\u2620\uFE0F'}</div>
      <h2 className="text-3xl font-bold text-red-400">Defeated!</h2>
      <p className="text-gray-400">Your character has fallen in battle.</p>

      <div className="space-y-3 max-w-xs mx-auto">
        {isDead ? (
          <button
            onClick={onResurrect}
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? 'Resurrecting...' : 'Resurrect at Temple (300g)'}
          </button>
        ) : (
          <button
            onClick={onHeal}
            disabled={isLoading}
            className="btn-secondary w-full py-3"
          >
            {isLoading ? 'Healing...' : 'Heal at Temple (100g)'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Fled Screen ────────────────────────────────────────────────────────────

function FledScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="text-6xl">{'\uD83D\uDCA8'}</div>
      <h2 className="text-3xl font-bold text-yellow-300">Escaped!</h2>
      <p className="text-gray-400">You escaped from battle. Live to fight another day.</p>

      <button onClick={onContinue} className="btn-primary text-lg px-8 py-3">
        Find Another Monster
      </button>
    </div>
  );
}

// ─── Pre-Battle (No Battle Active) ──────────────────────────────────────────

function PreBattle({ onStart, isDead, currentHp, currentHpMax, onHeal, onResurrect, isLoading, error }: {
  onStart: () => void;
  isDead: boolean;
  currentHp: number;
  currentHpMax: number;
  onHeal: () => void;
  onResurrect: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  const needsHealing = currentHp < currentHpMax && currentHp > 0 && !isDead;

  return (
    <div className="text-center space-y-6 py-8">
      <div className="text-6xl">{'\u2694\uFE0F'}</div>
      <h2 className="text-3xl font-bold text-adr-gold">Battle Arena</h2>
      <p className="text-gray-400 max-w-md mx-auto">
        Venture forth to fight monsters, earn XP, gold, and skill points.
        Defeat enemies to level up and become stronger!
      </p>

      {isDead ? (
        <div className="space-y-4">
          <p className="text-red-400 font-semibold">Your character is dead!</p>
          <button
            onClick={onResurrect}
            disabled={isLoading}
            className="btn-primary py-3 px-8"
          >
            {isLoading ? 'Resurrecting...' : 'Resurrect at Temple (300g)'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {needsHealing && (
            <div className="max-w-xs mx-auto space-y-2">
              <HpBar label="HP" current={currentHp} max={currentHpMax} />
              <button
                onClick={onHeal}
                disabled={isLoading}
                className="btn-secondary w-full"
              >
                {isLoading ? 'Healing...' : 'Heal at Temple (100g)'}
              </button>
            </div>
          )}

          <button
            onClick={onStart}
            disabled={isLoading || currentHp <= 0}
            className="btn-primary text-lg py-3 px-10"
          >
            {isLoading ? 'Searching for monster...' : 'Start Battle!'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}

// ─── Active Battle ──────────────────────────────────────────────────────────

function ActiveBattle({ monster, player, round, log, isActing, onAction }: {
  monster: any;
  player: any;
  round: number;
  log: string[];
  isActing: boolean;
  onAction: (action: 'attack' | 'defend' | 'flee') => void;
}) {
  return (
    <div className="space-y-6">
      {/* Round counter */}
      <div className="text-center">
        <span className="text-sm text-gray-500 uppercase tracking-wider">Round {round + 1}</span>
      </div>

      {/* Battle field */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monster */}
        <div className="card">
          <MonsterDisplay monster={monster} />
        </div>

        {/* Battle Log (center) */}
        <div className="card lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Battle Log</h3>
          <BattleLog messages={log} />
        </div>

        {/* Player Stats */}
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Your Stats</h3>
          <HpBar label="HP" current={player.hp} max={player.hpMax} size="large" />
          <StatBar label="MP" current={player.mp} max={player.mpMax} color="bg-blue-500" />

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400">ATT</div>
              <div className="text-lg font-bold text-red-400">{player.att}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400">DEF</div>
              <div className="text-lg font-bold text-blue-400">{player.def}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400">M.ATT</div>
              <div className="text-lg font-bold text-purple-400">{player.magicAtt}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400">M.DEF</div>
              <div className="text-lg font-bold text-teal-400">{player.magicDef}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card">
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onAction('attack')}
            disabled={isActing}
            className="btn-primary px-8 py-3 text-lg flex items-center gap-2"
          >
            {'\u2694\uFE0F'} {isActing ? 'Acting...' : 'Attack'}
          </button>
          <button
            onClick={() => onAction('defend')}
            disabled={isActing}
            className="btn-secondary px-8 py-3 text-lg flex items-center gap-2"
          >
            {'\uD83D\uDEE1\uFE0F'} {isActing ? 'Acting...' : 'Defend'}
          </button>
          <button
            onClick={() => onAction('flee')}
            disabled={isActing}
            className="btn-outline px-8 py-3 text-lg flex items-center gap-2"
          >
            {'\uD83D\uDCA8'} {isActing ? 'Acting...' : 'Flee'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Battle Page ───────────────────────────────────────────────────────

export function Battle() {
  const {
    battleId, monster, player, round, result, rewards, log,
    isLoading, isActing, error, isDead, currentHp, currentHpMax,
    checkBattle, startBattle, performAction, templeHeal, templeResurrect, clearBattle,
  } = useBattleStore();

  useEffect(() => {
    checkBattle();
  }, [checkBattle]);

  if (isLoading && !battleId && result === null) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    clearBattle();
    checkBattle();
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* No active battle */}
      {!battleId && result === null && (
        <div className="card">
          <PreBattle
            onStart={startBattle}
            isDead={isDead}
            currentHp={currentHp}
            currentHpMax={currentHpMax}
            onHeal={templeHeal}
            onResurrect={templeResurrect}
            isLoading={isLoading}
            error={error}
          />
        </div>
      )}

      {/* Active battle */}
      {battleId && result === 'ongoing' && monster && player && (
        <ActiveBattle
          monster={monster}
          player={player}
          round={round}
          log={log}
          isActing={isActing}
          onAction={performAction}
        />
      )}

      {/* Victory */}
      {result === 'victory' && rewards && (
        <div className="card">
          <BattleLog messages={log} />
          <div className="mt-6">
            <VictoryScreen rewards={rewards} onContinue={handleContinue} />
          </div>
        </div>
      )}

      {/* Defeat */}
      {result === 'defeat' && (
        <div className="card">
          <BattleLog messages={log} />
          <div className="mt-6">
            <DefeatScreen
              onResurrect={templeResurrect}
              onHeal={templeHeal}
              isDead={isDead}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Fled */}
      {result === 'fled' && (
        <div className="card">
          <BattleLog messages={log} />
          <div className="mt-6">
            <FledScreen onContinue={handleContinue} />
          </div>
        </div>
      )}

      {/* Error display */}
      {error && battleId && (
        <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
