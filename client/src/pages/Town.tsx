import { useEffect, useState } from 'react';
import { useTownStore } from '../stores/townStore';
import { useCharacterStore } from '../stores/characterStore';

// ─── Tab Types ──────────────────────────────────────────────────────────────

type TownTab = 'training' | 'skills' | 'temple' | 'class' | 'limits';

// ─── Stat Training Section ──────────────────────────────────────────────────

function TrainingSection({ stats, gold, isActing, onTrain }: {
  stats: { key: string; label: string; value: number; cost: number }[];
  gold: number;
  isActing: boolean;
  onTrain: (stat: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-4">
        Train your attributes to become stronger. Cost increases with your current stat value.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stats.map(stat => {
          const canAfford = gold >= stat.cost;
          return (
            <div
              key={stat.key}
              className="rounded-lg border bg-gray-800/40 border-gray-700/50 p-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-sm">{stat.label}</span>
                  <span className="text-adr-gold font-bold text-lg">{stat.value}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Cost: <span className={canAfford ? 'text-yellow-300' : 'text-red-400'}>{stat.cost.toLocaleString()}g</span>
                </div>
              </div>
              <button
                onClick={() => onTrain(stat.key)}
                disabled={isActing || !canAfford}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0 ${
                  isActing || !canAfford
                    ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                    : 'bg-adr-gold/20 text-adr-gold hover:bg-adr-gold/30 border border-adr-gold/30'
                }`}
              >
                {isActing ? 'Training...' : '+1'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Skills Section ─────────────────────────────────────────────────────────

function SkillsSection({ skills, sp, isActing, onLearn }: {
  skills: { id: number; name: string; description: string; requiredSp: number; learned: boolean; level: number; uses: number }[];
  sp: number;
  isActing: boolean;
  onLearn: (skillId: number) => void;
}) {
  const skillIcons: Record<number, string> = {
    1: '\u26CF\uFE0F',   // Mining
    2: '\uD83D\uDC8E',   // Stonecutting
    3: '\uD83D\uDD28',   // Forge
    4: '\u2728',           // Enchantment
    5: '\uD83D\uDCB0',   // Trading
    6: '\uD83D\uDC7E',   // Thief
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-4">
        Spend SP (Skill Points) to learn new skills. SP is earned from winning battles.
      </p>
      <div className="space-y-2">
        {skills.map(skill => {
          const canAfford = sp >= skill.requiredSp;
          return (
            <div
              key={skill.id}
              className={`rounded-lg border p-3 flex items-center gap-3 ${
                skill.learned
                  ? 'bg-green-900/10 border-green-700/30'
                  : 'bg-gray-800/40 border-gray-700/50'
              }`}
            >
              <span className="text-2xl">{skillIcons[skill.id] || '\uD83C\uDFAF'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">{skill.name}</span>
                  {skill.learned && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-900/30 text-green-400 border border-green-700/30">
                      Lv.{skill.level}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{skill.description}</p>
                {skill.learned && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden max-w-32">
                      <div
                        className="h-full bg-adr-blue rounded-full transition-all"
                        style={{ width: `${((skill.uses % 10) / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{10 - (skill.uses % 10)} uses to lvl up</span>
                  </div>
                )}
              </div>
              {!skill.learned ? (
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs text-gray-500">{skill.requiredSp} SP</span>
                  <button
                    onClick={() => onLearn(skill.id)}
                    disabled={isActing || !canAfford}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      isActing || !canAfford
                        ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                        : 'bg-adr-blue/20 text-adr-blue hover:bg-adr-blue/30 border border-adr-blue/30'
                    }`}
                  >
                    {isActing ? 'Learning...' : 'Learn'}
                  </button>
                  {!canAfford && <span className="text-xs text-red-400">Need {skill.requiredSp - sp} more SP</span>}
                </div>
              ) : (
                <div className="text-xs text-green-400 flex-shrink-0">
                  Learned
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Temple Section ─────────────────────────────────────────────────────────

function TempleSection({ character, temple, isActing, onHeal, onResurrect }: {
  character: { hp: number; hpMax: number; mp: number; mpMax: number; isDead: boolean; gold: number; level: number };
  temple: { healCost: number; resurrectCost: number; canHeal: boolean; canResurrect: boolean; needsHeal: boolean; needsResurrect: boolean };
  isActing: boolean;
  onHeal: () => void;
  onResurrect: () => void;
}) {
  const hpPercent = character.hpMax > 0 ? (character.hp / character.hpMax) * 100 : 0;
  const mpPercent = character.mpMax > 0 ? (character.mp / character.mpMax) * 100 : 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        The Temple offers healing and resurrection services. Costs scale with your level.
      </p>

      {/* Status */}
      <div className="card space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Current Status</h3>

        {character.isDead && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-center">
            <span className="text-red-400 font-bold text-lg">{'\uD83D\uDC80'} DEAD</span>
            <p className="text-red-300 text-sm mt-1">Your character needs to be resurrected.</p>
          </div>
        )}

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">HP</span>
              <span className={character.hp < character.hpMax ? 'text-red-400' : 'text-green-400'}>
                {character.hp} / {character.hpMax}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  hpPercent > 50 ? 'bg-green-500' : hpPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">MP</span>
              <span className={character.mp < character.mpMax ? 'text-blue-400' : 'text-adr-blue'}>
                {character.mp} / {character.mpMax}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${mpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Heal */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{'\u2764\uFE0F'}</span>
            <div>
              <h3 className="text-white font-medium">Heal</h3>
              <p className="text-xs text-gray-500">Restore full HP & MP</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Cost: <span className={character.gold >= temple.healCost ? 'text-yellow-300' : 'text-red-400'}>
              {temple.healCost.toLocaleString()}g
            </span>
            <span className="text-xs text-gray-600 ml-1">({100}g x Lv.{character.level})</span>
          </div>
          <button
            onClick={onHeal}
            disabled={isActing || !temple.canHeal}
            className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
              isActing || !temple.canHeal
                ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                : 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30'
            }`}
          >
            {isActing ? 'Healing...' : !temple.needsHeal ? 'Full Health' : character.gold < temple.healCost ? 'Not Enough Gold' : character.isDead ? 'Resurrect First' : 'Heal'}
          </button>
        </div>

        {/* Resurrect */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{'\u2728'}</span>
            <div>
              <h3 className="text-white font-medium">Resurrect</h3>
              <p className="text-xs text-gray-500">Return from death (50% HP/MP)</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Cost: <span className={character.gold >= temple.resurrectCost ? 'text-yellow-300' : 'text-red-400'}>
              {temple.resurrectCost.toLocaleString()}g
            </span>
            <span className="text-xs text-gray-600 ml-1">({300}g x Lv.{character.level})</span>
          </div>
          <button
            onClick={onResurrect}
            disabled={isActing || !temple.canResurrect}
            className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
              isActing || !temple.canResurrect
                ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-600/30'
            }`}
          >
            {isActing ? 'Resurrecting...' : !temple.needsResurrect ? 'Alive & Well' : character.gold < temple.resurrectCost ? 'Not Enough Gold' : 'Resurrect'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Class Change Section ───────────────────────────────────────────────────

function ClassSection({ classes, currentClassId, gold, classChangeCost, isActing, onChangeClass }: {
  classes: any[];
  currentClassId: number;
  gold: number;
  classChangeCost: number;
  isActing: boolean;
  onChangeClass: (classId: number) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-4">
        Change your class to gain different combat bonuses. Costs {classChangeCost}g. You must meet stat requirements.
      </p>
      <div className="space-y-2">
        {classes.map(cls => (
          <div
            key={cls.id}
            className={`rounded-lg border p-3 flex items-center gap-3 ${
              cls.isCurrent
                ? 'bg-adr-gold/5 border-adr-gold/30'
                : cls.meetsRequirements
                  ? 'bg-gray-800/40 border-gray-700/50'
                  : 'bg-gray-900/40 border-gray-800/50 opacity-60'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white text-sm">{cls.name}</span>
                {cls.isCurrent && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-adr-gold/20 text-adr-gold border border-adr-gold/30">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{cls.description}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs">
                <span className="text-green-400">+{cls.updateHp} HP/lvl</span>
                <span className="text-blue-400">+{cls.updateMp} MP/lvl</span>
                {cls.updateAc > 0 && <span className="text-yellow-400">+{cls.updateAc} AC/lvl</span>}
              </div>
              {!cls.meetsRequirements && (
                <div className="flex flex-wrap gap-x-2 mt-1 text-xs text-red-400/70">
                  {cls.mightReq > 0 && <span>Mig {cls.mightReq}</span>}
                  {cls.dexterityReq > 0 && <span>Dex {cls.dexterityReq}</span>}
                  {cls.constitutionReq > 0 && <span>Con {cls.constitutionReq}</span>}
                  {cls.intelligenceReq > 0 && <span>Int {cls.intelligenceReq}</span>}
                  {cls.wisdomReq > 0 && <span>Wis {cls.wisdomReq}</span>}
                  {cls.charismaReq > 0 && <span>Cha {cls.charismaReq}</span>}
                </div>
              )}
            </div>
            {!cls.isCurrent && (
              <button
                onClick={() => onChangeClass(cls.id)}
                disabled={isActing || !cls.meetsRequirements || gold < classChangeCost}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0 ${
                  isActing || !cls.meetsRequirements || gold < classChangeCost
                    ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                    : 'bg-adr-gold/20 text-adr-gold hover:bg-adr-gold/30 border border-adr-gold/30'
                }`}
              >
                {isActing ? 'Changing...' : `Change (${classChangeCost}g)`}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Daily Limits Section ───────────────────────────────────────────────────

function LimitsSection({ limits }: {
  limits: { battle: number; battleMax: number; skill: number; skillMax: number; trading: number; tradingMax: number; thief: number; thiefMax: number; nextReset: number };
}) {
  const now = Math.floor(Date.now() / 1000);
  const timeToReset = Math.max(0, limits.nextReset - now);
  const hours = Math.floor(timeToReset / 3600);
  const minutes = Math.floor((timeToReset % 3600) / 60);

  const limitBars = [
    { label: 'Battle', value: limits.battle, max: limits.battleMax, icon: '\u2694\uFE0F', color: 'bg-red-500' },
    { label: 'Skill', value: limits.skill, max: limits.skillMax, icon: '\uD83D\uDD28', color: 'bg-blue-500' },
    { label: 'Trading', value: limits.trading, max: limits.tradingMax, icon: '\uD83D\uDCB0', color: 'bg-green-500' },
    { label: 'Thief', value: limits.thief, max: limits.thiefMax, icon: '\uD83D\uDC7E', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Daily action limits reset every 24 hours. Use them wisely!
      </p>

      <div className="text-sm text-gray-400">
        Next reset: {timeToReset > 0 ? (
          <span className="text-adr-gold">{hours}h {minutes}m</span>
        ) : (
          <span className="text-green-400">Ready!</span>
        )}
      </div>

      <div className="space-y-3">
        {limitBars.map(limit => {
          const percent = limit.max > 0 ? (limit.value / limit.max) * 100 : 0;
          return (
            <div key={limit.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <span>{limit.icon}</span>
                  {limit.label}
                </span>
                <span className={limit.value === 0 ? 'text-red-400 font-medium' : 'text-gray-400'}>
                  {limit.value} / {limit.max}
                </span>
              </div>
              <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${limit.color}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Town Page ─────────────────────────────────────────────────────────

export function Town() {
  const {
    character, stats, skills, temple, limits, classes, classChangeCost,
    isLoading, isActing, error, message,
    fetchStatus, trainStat, learnSkill, changeClass, heal, resurrect,
    clearMessage, clearError,
  } = useTownStore();

  const { fetchCharacter } = useCharacterStore();
  const [activeTab, setActiveTab] = useState<TownTab>('training');

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Refresh character store after town actions
  const handleTrain = async (stat: string) => {
    await trainStat(stat);
    fetchCharacter();
  };

  const handleLearnSkill = async (skillId: number) => {
    await learnSkill(skillId);
    fetchCharacter();
  };

  const handleChangeClass = async (classId: number) => {
    await changeClass(classId);
    fetchCharacter();
  };

  const handleHeal = async () => {
    await heal();
    fetchCharacter();
  };

  const handleResurrect = async () => {
    await resurrect();
    fetchCharacter();
  };

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(clearMessage, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (isLoading && !character) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-lg">Loading town...</div>
        </div>
      </div>
    );
  }

  if (!character || !temple || !limits) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">{'\u274C'}</div>
          <p className="text-red-400">Failed to load town data.</p>
        </div>
      </div>
    );
  }

  const tabs: { key: TownTab; label: string; icon: string; badge?: string }[] = [
    { key: 'training', label: 'Training', icon: '\uD83D\uDCAA' },
    { key: 'skills', label: 'Skills', icon: '\uD83D\uDCDA' },
    { key: 'temple', label: 'Temple', icon: '\u26EA',
      badge: temple.needsResurrect ? '\uD83D\uDC80' : temple.needsHeal ? '\u2764\uFE0F' : undefined },
    { key: 'class', label: 'Class', icon: '\uD83C\uDFAD' },
    { key: 'limits', label: 'Limits', icon: '\u23F3' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-white">{'\uD83C\uDFD8\uFE0F'} Town</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-adr-gold font-bold">{character.gold.toLocaleString()} Gold</span>
          <span className="text-adr-blue font-bold">{character.sp} SP</span>
          <span className="text-gray-400">Lv.{character.level} {character.className}</span>
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
            {tab.badge && <span className="text-xs">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'training' && (
          <TrainingSection
            stats={stats}
            gold={character.gold}
            isActing={isActing}
            onTrain={handleTrain}
          />
        )}
        {activeTab === 'skills' && (
          <SkillsSection
            skills={skills}
            sp={character.sp}
            isActing={isActing}
            onLearn={handleLearnSkill}
          />
        )}
        {activeTab === 'temple' && (
          <TempleSection
            character={character}
            temple={temple}
            isActing={isActing}
            onHeal={handleHeal}
            onResurrect={handleResurrect}
          />
        )}
        {activeTab === 'class' && (
          <ClassSection
            classes={classes}
            currentClassId={character.classId}
            gold={character.gold}
            classChangeCost={classChangeCost}
            isActing={isActing}
            onChangeClass={handleChangeClass}
          />
        )}
        {activeTab === 'limits' && (
          <LimitsSection limits={limits} />
        )}
      </div>
    </div>
  );
}
