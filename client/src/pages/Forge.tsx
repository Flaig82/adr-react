import { useEffect, useState } from 'react';
import { useForgeStore } from '../stores/forgeStore';
import { useCharacterStore } from '../stores/characterStore';
import { QUALITY_TIERS } from '@adr/shared';

// ─── Quality color helper ───────────────────────────────────────────────────

function getQualityColor(qualityId: number): string {
  const tier = QUALITY_TIERS.find(q => q.id === qualityId);
  return tier?.color || '#888888';
}

// ─── Forge Tab Types ────────────────────────────────────────────────────────

type ForgeTab = 'mining' | 'stonecutting' | 'repair' | 'enchant';

// ─── Skill Progress ─────────────────────────────────────────────────────────

function SkillProgress({ label, level, uses, icon }: {
  label: string;
  level: number;
  uses: number;
  icon: string;
}) {
  const usesPerLevel = 10;
  const usesToNext = usesPerLevel - (uses % usesPerLevel);
  const progress = ((uses % usesPerLevel) / usesPerLevel) * 100;

  return (
    <div className="flex items-center gap-3 bg-gray-800/40 rounded-lg p-2.5">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white font-medium">{label}</span>
          <span className="text-adr-gold">Lv.{level}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-adr-blue rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{usesToNext} to lvl up</span>
        </div>
      </div>
    </div>
  );
}

// ─── Item Select Card ───────────────────────────────────────────────────────

function ForgeItemCard({ item, actionLabel, onAction, disabled, extra }: {
  item: any;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  extra?: React.ReactNode;
}) {
  const qualityColor = getQualityColor(item.qualityId);
  const durPercent = item.durationMax > 0 ? (item.duration / item.durationMax) * 100 : 100;

  return (
    <div className="rounded-lg border bg-gray-800/40 border-gray-700/50 p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white text-sm truncate">{item.name}</span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ color: qualityColor, backgroundColor: qualityColor + '20' }}>
            {item.qualityName}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span>{item.typeName}</span>
          {item.power > 0 && <span className="text-yellow-300">Pwr {item.power}{item.addPower > 0 ? `+${item.addPower}` : ''}</span>}
          <span className="flex items-center gap-1">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
              durPercent > 50 ? 'bg-green-500' : durPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            {item.duration}/{item.durationMax}
          </span>
        </div>
        {extra}
      </div>
      <button
        onClick={onAction}
        disabled={disabled}
        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0 ${
          disabled
            ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
            : 'bg-adr-gold/20 text-adr-gold hover:bg-adr-gold/30 border border-adr-gold/30'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

// ─── Mining Tab ─────────────────────────────────────────────────────────────

function MiningTab({ pickaxes, skillLevel, isActing, onMine }: {
  pickaxes: any[];
  skillLevel: number;
  isActing: boolean;
  onMine: (pickaxeId: number) => void;
}) {
  if (skillLevel < 1) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-3">{'\u26CF\uFE0F'}</div>
        <p className="text-gray-400">You haven't learned the Mining skill yet.</p>
        <p className="text-gray-500 text-sm mt-1">Visit the Town to learn Mining (requires 100 SP).</p>
      </div>
    );
  }

  if (pickaxes.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-3">{'\u26CF\uFE0F'}</div>
        <p className="text-gray-400">You don't have a pickaxe.</p>
        <p className="text-gray-500 text-sm mt-1">Buy a Mining Pick from the General Store.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-400 mb-3">
        Select a pickaxe to mine for ore and gems. Higher skill increases success rate and chance of rare finds.
      </p>
      {pickaxes.map(pick => (
        <ForgeItemCard
          key={pick.id}
          item={pick}
          actionLabel={isActing ? 'Mining...' : 'Mine'}
          onAction={() => onMine(pick.id)}
          disabled={isActing || pick.duration <= 0}
          extra={pick.duration <= 0 ? (
            <span className="text-xs text-red-400 mt-0.5 block">Broken — needs repair</span>
          ) : undefined}
        />
      ))}
    </div>
  );
}

// ─── Stone Cutting Tab ──────────────────────────────────────────────────────

function StoneCuttingTab({ materials, skillLevel, isActing, onCut }: {
  materials: any[];
  skillLevel: number;
  isActing: boolean;
  onCut: (materialId: number) => void;
}) {
  if (skillLevel < 1) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-3">{'\uD83D\uDC8E'}</div>
        <p className="text-gray-400">You haven't learned the Stonecutting skill yet.</p>
        <p className="text-gray-500 text-sm mt-1">Visit the Town to learn Stonecutting (requires 200 SP).</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-3">{'\uD83D\uDC8E'}</div>
        <p className="text-gray-400">You don't have any raw materials to cut.</p>
        <p className="text-gray-500 text-sm mt-1">Mine for materials first, or buy some from a shop.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-400 mb-3">
        Cut and polish raw materials to improve their quality (max: Very Good). Warning: 5% chance of critical failure!
      </p>
      {materials.filter(m => m.qualityId < 5).map(mat => (
        <ForgeItemCard
          key={mat.id}
          item={mat}
          actionLabel={isActing ? 'Cutting...' : 'Cut'}
          onAction={() => onCut(mat.id)}
          disabled={isActing}
        />
      ))}
      {materials.filter(m => m.qualityId >= 5).length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          {materials.filter(m => m.qualityId >= 5).length} material(s) already at max quality.
        </div>
      )}
    </div>
  );
}

// ─── Repair Tab ─────────────────────────────────────────────────────────────

function RepairTab({ equipment, skillLevel, isActing, gold, onRepair }: {
  equipment: any[];
  skillLevel: number;
  isActing: boolean;
  gold: number;
  onRepair: (itemId: number) => void;
}) {
  if (skillLevel < 1) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-3">{'\uD83D\uDD28'}</div>
        <p className="text-gray-400">You haven't learned the Forge skill yet.</p>
        <p className="text-gray-500 text-sm mt-1">Visit the Town to learn Forging (requires 50 SP).</p>
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-3">{'\uD83D\uDD28'}</div>
        <p className="text-gray-400">No items need repair.</p>
        <p className="text-gray-500 text-sm mt-1">All your equipment is at full durability.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-400 mb-3">
        Repair damaged equipment to restore durability. Each repair slightly reduces max durability. Warning: 5% chance of critical failure!
      </p>
      {equipment.map(item => {
        const cost = Math.max(1, Math.floor(item.price * 0.3 * (1 - item.duration / item.durationMax)));
        const canAfford = gold >= cost;

        return (
          <ForgeItemCard
            key={item.id}
            item={item}
            actionLabel={isActing ? 'Repairing...' : `Repair (${cost}g)`}
            onAction={() => onRepair(item.id)}
            disabled={isActing || !canAfford || item.durationMax <= 1}
            extra={
              <div className="flex items-center gap-2 mt-0.5">
                {!canAfford && <span className="text-xs text-red-400">Not enough gold</span>}
                {item.durationMax <= 1 && <span className="text-xs text-red-400">Too worn to repair</span>}
              </div>
            }
          />
        );
      })}
    </div>
  );
}

// ─── Enchant Tab ────────────────────────────────────────────────────────────

function EnchantTab({ items, skillLevel, isActing, gold, onEnchant }: {
  items: any[];
  skillLevel: number;
  isActing: boolean;
  gold: number;
  onEnchant: (itemId: number) => void;
}) {
  if (skillLevel < 1) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-3">{'\u2728'}</div>
        <p className="text-gray-400">You haven't learned the Enchantment skill yet.</p>
        <p className="text-gray-500 text-sm mt-1">Visit the Town to learn Enchantment (requires 300 SP).</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-3">{'\u2728'}</div>
        <p className="text-gray-400">No equipment to enchant.</p>
        <p className="text-gray-500 text-sm mt-1">Unequip an item first, then bring it here to enchant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-400 mb-3">
        Enchant equipment to add bonus power. Cost increases with each enchantment. Warning: 5% chance of losing all bonus power!
      </p>
      {items.map(item => {
        const cost = 50 + item.addPower * 20;
        const canAfford = gold >= cost;

        return (
          <ForgeItemCard
            key={item.id}
            item={item}
            actionLabel={isActing ? 'Enchanting...' : `Enchant (${cost}g)`}
            onAction={() => onEnchant(item.id)}
            disabled={isActing || !canAfford}
            extra={
              <div className="flex items-center gap-2 mt-0.5">
                {item.addPower > 0 && (
                  <span className="text-xs text-purple-400">+{item.addPower} bonus power</span>
                )}
                {!canAfford && <span className="text-xs text-red-400">Not enough gold</span>}
              </div>
            }
          />
        );
      })}
    </div>
  );
}

// ─── Main Forge Page ────────────────────────────────────────────────────────

export function Forge() {
  const {
    skillMining, skillStone, skillForge, skillEnchantment,
    skillMiningUses, skillStoneUses, skillForgeUses, skillEnchantmentUses,
    skillLimit,
    pickaxes, rawMaterials, equipment, magicItems,
    isLoading, isActing, error, message, lastResult,
    fetchStatus, mine, cutStone, repair, enchant,
    clearMessage, clearError,
  } = useForgeStore();

  const { character, fetchCharacter } = useCharacterStore();
  const [activeTab, setActiveTab] = useState<ForgeTab>('mining');

  useEffect(() => {
    fetchStatus();
    fetchCharacter();
  }, [fetchStatus, fetchCharacter]);

  // After forge actions, refresh character gold
  const handleMine = async (pickaxeId: number) => {
    await mine(pickaxeId);
    fetchCharacter();
  };
  const handleCut = async (materialId: number) => {
    await cutStone(materialId);
    fetchCharacter();
  };
  const handleRepair = async (itemId: number) => {
    await repair(itemId);
    fetchCharacter();
  };
  const handleEnchant = async (itemId: number) => {
    await enchant(itemId);
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

  const gold = character?.gold ?? 0;

  if (isLoading && !pickaxes.length && !rawMaterials.length) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-lg">Loading forge...</div>
        </div>
      </div>
    );
  }

  const tabs: { key: ForgeTab; label: string; icon: string }[] = [
    { key: 'mining', label: 'Mining', icon: '\u26CF\uFE0F' },
    { key: 'stonecutting', label: 'Stone Cut', icon: '\uD83D\uDC8E' },
    { key: 'repair', label: 'Repair', icon: '\uD83D\uDD28' },
    { key: 'enchant', label: 'Enchant', icon: '\u2728' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{'\uD83D\uDD28'} Forge & Crafting</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-adr-gold font-bold text-lg">{gold} Gold</span>
          <span className="text-gray-400">Skills: {skillLimit} left today</span>
        </div>
      </div>

      {/* Result message */}
      {message && (
        <div className={`rounded-lg p-3 text-center text-sm border ${
          lastResult?.criticalFailure
            ? 'bg-red-900/20 border-red-500/30 text-red-400'
            : lastResult?.success
              ? 'bg-green-900/20 border-green-500/30 text-green-400'
              : 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400'
        }`}>
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-center text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Summary */}
        <div className="card lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Forge Skills</h2>
          <SkillProgress label="Mining" level={skillMining} uses={skillMiningUses} icon={'\u26CF\uFE0F'} />
          <SkillProgress label="Stonecutting" level={skillStone} uses={skillStoneUses} icon={'\uD83D\uDC8E'} />
          <SkillProgress label="Forge/Repair" level={skillForge} uses={skillForgeUses} icon={'\uD83D\uDD28'} />
          <SkillProgress label="Enchantment" level={skillEnchantment} uses={skillEnchantmentUses} icon={'\u2728'} />

          <div className="border-t border-gray-700/50 pt-3 mt-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Daily skill uses remaining</span>
              <span className={skillLimit <= 5 ? 'text-red-400' : 'text-gray-400'}>{skillLimit}/30</span>
            </div>
          </div>
        </div>

        {/* Forge Actions */}
        <div className="lg:col-span-2 space-y-4">
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
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          {activeTab === 'mining' && (
            <MiningTab
              pickaxes={pickaxes}
              skillLevel={skillMining}
              isActing={isActing}
              onMine={handleMine}
            />
          )}
          {activeTab === 'stonecutting' && (
            <StoneCuttingTab
              materials={rawMaterials}
              skillLevel={skillStone}
              isActing={isActing}
              onCut={handleCut}
            />
          )}
          {activeTab === 'repair' && (
            <RepairTab
              equipment={equipment}
              skillLevel={skillForge}
              isActing={isActing}
              gold={gold}
              onRepair={handleRepair}
            />
          )}
          {activeTab === 'enchant' && (
            <EnchantTab
              items={magicItems}
              skillLevel={skillEnchantment}
              isActing={isActing}
              gold={gold}
              onEnchant={handleEnchant}
            />
          )}
        </div>
      </div>
    </div>
  );
}
