import { useEffect, useState } from 'react';
import { useInventoryStore } from '../stores/inventoryStore';
import { useCharacterStore } from '../stores/characterStore';
import { QUALITY_TIERS, EQUIPMENT_SLOTS } from '@adr/shared';
import { api } from '../api/client';

// ─── Quality color helper ───────────────────────────────────────────────────

function getQualityColor(qualityId: number): string {
  const tier = QUALITY_TIERS.find(q => q.id === qualityId);
  return tier?.color || '#888888';
}

function getQualityName(qualityId: number): string {
  const tier = QUALITY_TIERS.find(q => q.id === qualityId);
  return tier?.name || 'Unknown';
}

// ─── Item Type Icons ────────────────────────────────────────────────────────

function getItemIcon(typeId: number): string {
  const icons: Record<number, string> = {
    1: '\u26CF\uFE0F',   // Raw Material - pick
    2: '\uD83D\uDC8E',   // Rare Material - gem
    3: '\u26CF\uFE0F',   // Pickaxe
    4: '\uD83D\uDCD6',   // Magic Tome - book
    5: '\u2694\uFE0F',   // Weapon - swords
    6: '\u2728',          // Enchanted Weapon - sparkles
    7: '\uD83D\uDEE1\uFE0F', // Armor - shield
    8: '\uD83D\uDEE1\uFE0F', // Shield
    9: '\u26D1\uFE0F',   // Helm
    10: '\uD83E\uDDE4',  // Gloves
    11: '\uD83D\uDD2E',  // Magic Attack - crystal ball
    12: '\uD83D\uDD2E',  // Magic Defense
    13: '\uD83D\uDCFF',  // Amulet - beads
    14: '\uD83D\uDC8D',  // Ring
    15: '\u2764\uFE0F',  // Health Potion
    16: '\uD83D\uDCA7',  // Mana Potion
    17: '\uD83D\uDCDC',  // Scroll
    18: '\uD83D\uDCE6',  // Misc - package
  };
  return icons[typeId] || '\uD83D\uDCE6';
}

// ─── Item Card ──────────────────────────────────────────────────────────────

function ItemCard({ item, onEquip, onUnequip, onSell, onDrop, onGive }: {
  item: any;
  onEquip: (id: number) => void;
  onUnequip: (id: number) => void;
  onSell: (id: number) => void;
  onDrop: (id: number) => void;
  onGive: (id: number) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const qualityColor = getQualityColor(item.qualityId);
  const totalPower = item.power + item.addPower;
  const durPercent = item.durationMax > 0 ? (item.duration / item.durationMax) * 100 : 100;

  // Collect stat bonuses for display
  const bonuses: string[] = [];
  if (item.bonusMight) bonuses.push(`+${item.bonusMight} STR`);
  if (item.bonusDexterity) bonuses.push(`+${item.bonusDexterity} DEX`);
  if (item.bonusConstitution) bonuses.push(`+${item.bonusConstitution} CON`);
  if (item.bonusIntelligence) bonuses.push(`+${item.bonusIntelligence} INT`);
  if (item.bonusWisdom) bonuses.push(`+${item.bonusWisdom} WIS`);
  if (item.bonusCharisma) bonuses.push(`+${item.bonusCharisma} CHA`);
  if (item.bonusAc) bonuses.push(`+${item.bonusAc} AC`);
  if (item.bonusHp) bonuses.push(`+${item.bonusHp} HP`);
  if (item.bonusMp) bonuses.push(`+${item.bonusMp} MP`);

  return (
    <div
      className={`rounded-lg border p-3 transition-all cursor-pointer ${
        item.equipped
          ? 'bg-adr-blue/10 border-adr-blue/50'
          : 'bg-gray-800/40 border-gray-700/50 hover:border-gray-500/50'
      }`}
      onClick={() => setShowActions(!showActions)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0 mt-0.5">{getItemIcon(item.typeId)}</div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">{item.name}</span>
            {item.equipped === 1 && (
              <span className="text-xs bg-adr-blue/30 text-adr-blue px-1.5 py-0.5 rounded">E</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs mt-0.5">
            <span style={{ color: qualityColor }}>{item.qualityName || getQualityName(item.qualityId)}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">{item.typeName}</span>
          </div>

          {/* Power / bonuses */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {totalPower > 0 && (
              <span className="text-xs bg-gray-700/50 px-1.5 py-0.5 rounded text-yellow-300">
                Pwr {totalPower}
              </span>
            )}
            {bonuses.map((b, i) => (
              <span key={i} className="text-xs bg-gray-700/50 px-1.5 py-0.5 rounded text-green-400">
                {b}
              </span>
            ))}
          </div>

          {/* Durability bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  durPercent > 50 ? 'bg-green-500' : durPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${durPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{item.duration}/{item.durationMax}</span>
          </div>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <div className="text-sm text-adr-gold font-medium">{Math.ceil(item.price * 0.5)}g</div>
          <div className="text-xs text-gray-500">{item.weight}w</div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="mt-3 pt-3 border-t border-gray-700/50 flex flex-wrap gap-2">
          {item.slot && !item.equipped && (
            <button
              onClick={(e) => { e.stopPropagation(); onEquip(item.id); }}
              className="btn-secondary text-xs px-3 py-1"
            >
              Equip
            </button>
          )}
          {item.equipped === 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onUnequip(item.id); }}
              className="btn-outline text-xs px-3 py-1"
            >
              Unequip
            </button>
          )}
          {!item.equipped && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onSell(item.id); }}
                className="btn-gold text-xs px-3 py-1"
              >
                Sell ({Math.ceil(item.price * 0.5)}g)
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onGive(item.id); }}
                className="text-xs px-3 py-1 text-purple-400 hover:text-purple-300"
              >
                Give
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDrop(item.id); }}
                className="text-xs px-3 py-1 text-red-400 hover:text-red-300"
              >
                Drop
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Equipment Summary ──────────────────────────────────────────────────────

function EquipmentSummary({ items }: { items: any[] }) {
  const equipped = items.filter(i => i.equipped === 1);

  return (
    <div className="space-y-2">
      {EQUIPMENT_SLOTS.map(slot => {
        const item = equipped.find(i => i.slot === slot.key);
        return (
          <div key={slot.key} className="flex items-center gap-3 bg-gray-800/40 rounded-lg p-2">
            <div className="text-xs text-gray-500 w-20 text-right">{slot.label}</div>
            {item ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm">{getItemIcon(item.typeId)}</span>
                <span className="text-sm text-white truncate">{item.name}</span>
                <span className="text-xs ml-auto" style={{ color: getQualityColor(item.qualityId) }}>
                  {getQualityName(item.qualityId)}
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-600 italic">Empty</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Inventory Page ────────────────────────────────────────────────────

export function Inventory() {
  const {
    items, isLoading, error, message,
    fetchInventory, equipItem, unequipItem, sellItem, dropItem, giveItem,
    clearMessage, clearError,
  } = useInventoryStore();

  const { character, fetchCharacter } = useCharacterStore();

  const [filter, setFilter] = useState<'all' | 'equipped' | 'weapons' | 'armor' | 'consumables'>('all');
  const [giveModalItemId, setGiveModalItemId] = useState<number | null>(null);
  const [players, setPlayers] = useState<{ userId: number; name: string; username: string }[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchCharacter();
  }, [fetchInventory, fetchCharacter]);

  // After actions, refresh character to update gold
  const handleEquip = async (id: number) => {
    await equipItem(id);
    fetchCharacter();
  };
  const handleUnequip = async (id: number) => {
    await unequipItem(id);
    fetchCharacter();
  };
  const handleSell = async (id: number) => {
    await sellItem(id);
    fetchCharacter();
  };
  const handleDrop = async (id: number) => {
    await dropItem(id);
  };

  const openGiveModal = async (itemId: number) => {
    setGiveModalItemId(itemId);
    setLoadingPlayers(true);
    try {
      const data = await api.getCharacterList();
      // Filter out the current user
      const others = data.characters
        .filter((c: any) => c.username !== character?.name && c.userId !== character?.userId)
        .map((c: any) => ({ userId: c.userId, name: c.name, username: c.username }));
      setPlayers(others);
    } catch {
      setPlayers([]);
    }
    setLoadingPlayers(false);
  };

  const handleGive = async (targetUserId: number) => {
    if (!giveModalItemId) return;
    await giveItem(giveModalItemId, targetUserId);
    setGiveModalItemId(null);
    fetchCharacter();
  };

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(clearMessage, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Filter items
  const filteredItems = items.filter(item => {
    switch (filter) {
      case 'equipped': return item.equipped === 1;
      case 'weapons': return [5, 6].includes(item.typeId);
      case 'armor': return [7, 8, 9, 10].includes(item.typeId);
      case 'consumables': return [15, 16, 17].includes(item.typeId);
      default: return true;
    }
  });

  // Sort: equipped first, then by type, then by quality
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.equipped !== b.equipped) return b.equipped - a.equipped;
    if (a.typeId !== b.typeId) return a.typeId - b.typeId;
    return b.qualityId - a.qualityId;
  });

  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);

  if (isLoading && items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-lg">Loading inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{'\uD83C\uDF92'} Inventory</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-adr-gold font-medium">{character?.gold || 0} Gold</span>
          <span className="text-gray-400">{items.length} items</span>
          <span className="text-gray-400">{totalWeight}w</span>
        </div>
      </div>

      {/* Toast messages */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment Summary */}
        <div className="card lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Equipment</h2>
          <EquipmentSummary items={items} />
        </div>

        {/* Item List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {([
              ['all', 'All'],
              ['equipped', 'Equipped'],
              ['weapons', 'Weapons'],
              ['armor', 'Armor'],
              ['consumables', 'Consumables'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? 'bg-adr-blue text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Items */}
          {sortedItems.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">{'\uD83C\uDF92'}</div>
              <p className="text-gray-400">
                {filter === 'all'
                  ? 'Your inventory is empty. Visit a shop to buy items!'
                  : 'No items match this filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onEquip={handleEquip}
                  onUnequip={handleUnequip}
                  onSell={handleSell}
                  onDrop={handleDrop}
                  onGive={openGiveModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Give Item Modal */}
      {giveModalItemId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setGiveModalItemId(null)}
        >
          <div className="bg-adr-dark border border-gray-700/50 rounded-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-adr-gold mb-1">Give Item</h3>
            <p className="text-sm text-gray-400 mb-4">
              Give <span className="text-white font-medium">
                {items.find(i => i.id === giveModalItemId)?.name}
              </span> to:
            </p>

            {loadingPlayers ? (
              <div className="text-center py-6 text-gray-500">Loading players...</div>
            ) : players.length === 0 ? (
              <div className="text-center py-6 text-gray-500">No other players found.</div>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {players.map(p => (
                  <button
                    key={p.userId}
                    onClick={() => handleGive(p.userId)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div>
                      <span className="text-white font-medium">{p.name}</span>
                      <span className="text-gray-500 text-xs ml-2">@{p.username}</span>
                    </div>
                    <span className="text-purple-400 text-xs">Give</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setGiveModalItemId(null)}
              className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-300 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
