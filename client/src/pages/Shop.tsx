import { useEffect, useState } from 'react';
import { useShopStore } from '../stores/shopStore';
import { useCharacterStore } from '../stores/characterStore';
import { QUALITY_TIERS } from '@adr/shared';

// ─── Quality color helper ───────────────────────────────────────────────────

function getQualityColor(qualityId: number): string {
  const tier = QUALITY_TIERS.find(q => q.id === qualityId);
  return tier?.color || '#888888';
}

// ─── Item Type Icons ────────────────────────────────────────────────────────

function getItemIcon(typeId: number): string {
  const icons: Record<number, string> = {
    1: '\u26CF\uFE0F',   // Raw Material
    2: '\uD83D\uDC8E',   // Rare Material
    3: '\u26CF\uFE0F',   // Pickaxe
    4: '\uD83D\uDCD6',   // Magic Tome
    5: '\u2694\uFE0F',   // Weapon
    6: '\u2728',          // Enchanted Weapon
    7: '\uD83D\uDEE1\uFE0F', // Armor
    8: '\uD83D\uDEE1\uFE0F', // Shield
    9: '\u26D1\uFE0F',   // Helm
    10: '\uD83E\uDDE4',  // Gloves
    11: '\uD83D\uDD2E',  // Magic Attack
    12: '\uD83D\uDD2E',  // Magic Defense
    13: '\uD83D\uDCFF',  // Amulet
    14: '\uD83D\uDC8D',  // Ring
    15: '\u2764\uFE0F',  // Health Potion
    16: '\uD83D\uDCA7',  // Mana Potion
    17: '\uD83D\uDCDC',  // Scroll
    18: '\uD83D\uDCE6',  // Misc
  };
  return icons[typeId] || '\uD83D\uDCE6';
}

// ─── Slot label helper ──────────────────────────────────────────────────────

function getSlotLabel(slot: string | null): string {
  const labels: Record<string, string> = {
    weapon: 'Weapon',
    armor: 'Armor',
    shield: 'Shield',
    helm: 'Helm',
    gloves: 'Gloves',
    amulet: 'Amulet',
    ring: 'Ring',
    magic_attack: 'Magic Atk',
    magic_defense: 'Magic Def',
  };
  return slot ? labels[slot] || slot : 'Misc';
}

// ─── Shop Item Card ─────────────────────────────────────────────────────────

function ShopItemCard({ item, gold, onBuy }: {
  item: any;
  gold: number;
  onBuy: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const qualityColor = getQualityColor(item.qualityId);
  const totalPower = item.power + item.addPower;
  const canAfford = gold >= item.adjustedPrice;
  const hasDiscount = item.adjustedPrice < item.price;

  // Collect stat bonuses
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
      className="rounded-lg border bg-gray-800/40 border-gray-700/50 hover:border-gray-500/50 p-3 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0 mt-0.5">{getItemIcon(item.typeId)}</div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">{item.name}</span>
            <span className="text-xs text-gray-500 bg-gray-700/50 px-1.5 py-0.5 rounded">
              {getSlotLabel(item.slot)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs mt-0.5">
            <span style={{ color: qualityColor }}>{item.qualityName}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">{item.typeName}</span>
            {item.restrictLevel > 0 && (
              <>
                <span className="text-gray-600">|</span>
                <span className="text-orange-400">Lv.{item.restrictLevel}+</span>
              </>
            )}
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
        </div>

        {/* Price + Buy */}
        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            {hasDiscount && (
              <span className="text-xs text-gray-500 line-through">{item.price}g</span>
            )}
            <span className={`text-sm font-bold ${canAfford ? 'text-adr-gold' : 'text-red-400'}`}>
              {item.adjustedPrice}g
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onBuy(item.id); }}
            disabled={!canAfford}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
              canAfford
                ? 'bg-adr-gold/20 text-adr-gold hover:bg-adr-gold/30 border border-adr-gold/30'
                : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
            }`}
          >
            Buy
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs space-y-1.5">
          <p className="text-gray-400">{item.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500">
            <span>Weight: {item.weight}</span>
            <span>Durability: {item.duration}/{item.durationMax}</span>
            {item.critHit < 20 && <span>Crit Range: {item.critHit}-20</span>}
            {item.critHitMod > 2 && <span>Crit Mult: x{item.critHitMod}</span>}
            <span>Sell Back: {item.sellBackPercentage}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Category Filter ────────────────────────────────────────────────────────

type ItemCategory = 'all' | 'weapons' | 'armor' | 'accessories' | 'magic' | 'consumables' | 'tools';

function getCategoryItems(items: any[], category: ItemCategory): any[] {
  switch (category) {
    case 'weapons': return items.filter(i => [5, 6].includes(i.typeId));
    case 'armor': return items.filter(i => [7, 8, 9, 10].includes(i.typeId));
    case 'accessories': return items.filter(i => [13, 14].includes(i.typeId));
    case 'magic': return items.filter(i => [11, 12].includes(i.typeId));
    case 'consumables': return items.filter(i => [15, 16, 17].includes(i.typeId));
    case 'tools': return items.filter(i => [1, 2, 3, 4].includes(i.typeId));
    default: return items;
  }
}

// ─── Main Shop Page ─────────────────────────────────────────────────────────

export function Shop() {
  const {
    shops, selectedShopId, items, stealInfo, isLoading, isStealing, error, message,
    fetchShops, selectShop, buyItem, fetchStealableItems, attemptSteal,
    clearMessage, clearError,
  } = useShopStore();

  const { character, fetchCharacter } = useCharacterStore();
  const [category, setCategory] = useState<ItemCategory>('all');
  const [mode, setMode] = useState<'buy' | 'steal'>('buy');

  useEffect(() => {
    fetchShops();
    fetchCharacter();
  }, [fetchShops, fetchCharacter]);

  // After buying, refresh character gold
  const handleBuy = async (itemId: number) => {
    await buyItem(itemId);
    fetchCharacter();
  };

  const handleSteal = async (itemId: number) => {
    await attemptSteal(itemId);
    fetchCharacter();
  };

  // Load stealable items when switching to steal mode
  useEffect(() => {
    if (mode === 'steal' && selectedShopId) {
      fetchStealableItems(selectedShopId);
    }
  }, [mode, selectedShopId, fetchStealableItems]);

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

  const filteredItems = getCategoryItems(items, category);
  const sortedItems = [...filteredItems].sort((a: any, b: any) => {
    if (a.typeId !== b.typeId) return a.typeId - b.typeId;
    return b.qualityId - a.qualityId;
  });

  const gold = character?.gold ?? 0;

  if (isLoading && shops.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-lg">Loading shops...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{'\uD83C\uDFEA'} Shops</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-adr-gold font-bold text-lg">{gold} Gold</span>
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

      {/* Shop Tabs */}
      <div className="flex gap-2 flex-wrap">
        {shops.map(shop => (
          <button
            key={shop.id}
            onClick={() => selectShop(shop.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedShopId === shop.id
                ? 'bg-adr-blue text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {shop.name}
          </button>
        ))}
      </div>

      {/* Selected Shop Description */}
      {selectedShopId && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {shops.find(s => s.id === selectedShopId)?.name}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {shops.find(s => s.id === selectedShopId)?.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {items.length} items available
              </div>
              {/* Buy / Steal toggle */}
              <div className="flex rounded-lg overflow-hidden border border-gray-700/50">
                <button
                  onClick={() => setMode('buy')}
                  className={`text-xs px-3 py-1.5 font-medium transition-colors ${
                    mode === 'buy' ? 'bg-adr-blue text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setMode('steal')}
                  className={`text-xs px-3 py-1.5 font-medium transition-colors ${
                    mode === 'steal' ? 'bg-red-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
                  }`}
                >
                  Steal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'buy' ? (
        <>
          {/* Category Filters (buy mode only) */}
          <div className="flex gap-2 flex-wrap">
            {([
              ['all', 'All'],
              ['weapons', 'Weapons'],
              ['armor', 'Armor'],
              ['accessories', 'Accessories'],
              ['magic', 'Magic Items'],
              ['consumables', 'Consumables'],
              ['tools', 'Tools & Materials'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  category === key
                    ? 'bg-adr-blue text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Item List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">Loading items...</div>
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">{'\uD83C\uDFEA'}</div>
              <p className="text-gray-400">
                {category === 'all'
                  ? 'This shop has no items.'
                  : 'No items match this category.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedItems.map((item: any) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  gold={gold}
                  onBuy={handleBuy}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* ─── Steal Mode ───────────────────────────────────────────────── */
        <div className="space-y-4">
          {/* Steal Info Banner */}
          <div className="card bg-red-900/10 border-red-700/30">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🗡️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-300">Thief Mode</h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  Attempt to steal items from this shop. Higher DC means harder to steal.
                  Failure results in a gold fine!
                </p>
                {stealInfo && (
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-gray-400">
                      Skill Level: <span className="text-white font-medium">{stealInfo.thiefLevel}</span>
                    </span>
                    <span className="text-gray-400">
                      Attempts Left: <span className="text-white font-medium">{stealInfo.thiefLimit}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">Casing the joint...</div>
            </div>
          ) : stealInfo && !stealInfo.canSteal ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">🚫</div>
              <p className="text-gray-400">{stealInfo.reason || 'You cannot steal right now.'}</p>
            </div>
          ) : stealInfo && stealInfo.items.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">🏪</div>
              <p className="text-gray-400">Nothing to steal from this shop.</p>
            </div>
          ) : stealInfo ? (
            <div className="space-y-2">
              {stealInfo.items.map((item) => {
                // DC difficulty color
                const dcColor =
                  item.dcValue <= 20 ? 'text-green-400' :
                  item.dcValue <= 45 ? 'text-yellow-400' :
                  item.dcValue <= 75 ? 'text-orange-400' :
                  'text-red-400';

                const dcLabel =
                  item.dcValue <= 12 ? 'Easy' :
                  item.dcValue <= 30 ? 'Medium' :
                  item.dcValue <= 75 ? 'Hard' :
                  'Very Hard';

                return (
                  <div key={item.id} className="rounded-lg border bg-gray-800/40 border-gray-700/50 hover:border-red-700/30 p-3 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white">{item.name}</div>
                        <div className="flex items-center gap-2 text-xs mt-0.5">
                          <span className="text-gray-400">{item.qualityName}</span>
                          <span className="text-gray-600">|</span>
                          <span className="text-gray-400">{item.typeName}</span>
                          <span className="text-gray-600">|</span>
                          <span className="text-adr-gold">{item.price}g value</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className={`text-sm font-bold ${dcColor}`}>DC {item.dcValue}</div>
                          <div className="text-xs text-gray-500">{dcLabel}</div>
                        </div>
                        <button
                          onClick={() => handleSteal(item.id)}
                          disabled={isStealing}
                          className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-colors ${
                            isStealing
                              ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                              : 'bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-700/30'
                          }`}
                        >
                          {isStealing ? '...' : 'Steal'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
