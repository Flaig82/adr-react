import { useEffect } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import { StatBar } from '../components/StatBar';
import { EquipmentSlots } from '../components/EquipmentSlots';
import { xpForLevel } from '@adr/shared';

export function CharacterProfile() {
  const { character, isLoading, fetchCharacter } = useCharacterStore();

  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  if (isLoading || !character) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Loading character...</div>
      </div>
    );
  }

  const xpNeeded = xpForLevel(character.level + 1, 10);
  const xpProgress = character.xp;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{character.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-gray-400">Level {character.level}</span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">{character.raceName}</span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">{character.className}</span>
              <span className="text-gray-600">|</span>
              <span style={{ color: character.elementColor }}>{character.elementName}</span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">{character.alignmentName}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-adr-gold">{character.gold ?? 0} Gold</div>
            <div className="text-sm text-gray-400">{character.xp} XP · {character.sp} SP</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vital Stats */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">Vitals</h2>
          <StatBar label="HP" current={character.hp} max={character.hpMax} color="bg-green-500" />
          <StatBar label="MP" current={character.mp} max={character.mpMax} color="bg-blue-500" />
          <StatBar label="XP to Next Level" current={xpProgress} max={xpNeeded} color="bg-adr-gold" />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">AC</div>
              <div className="text-xl font-bold">{character.ac}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">SP</div>
              <div className="text-xl font-bold">{character.sp}</div>
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Attributes</h2>
          <div className="space-y-3">
            {[
              { label: 'Might', value: character.might, color: 'text-red-400' },
              { label: 'Dexterity', value: character.dexterity, color: 'text-green-400' },
              { label: 'Constitution', value: character.constitution, color: 'text-yellow-400' },
              { label: 'Intelligence', value: character.intelligence, color: 'text-blue-400' },
              { label: 'Wisdom', value: character.wisdom, color: 'text-purple-400' },
              { label: 'Charisma', value: character.charisma, color: 'text-pink-400' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <span className="text-gray-300">{stat.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stat.color.replace('text-', 'bg-')}`}
                      style={{ width: `${(stat.value / 20) * 100}%` }}
                    />
                  </div>
                  <span className={`font-bold w-6 text-right ${stat.color}`}>{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Equipment</h2>
          <EquipmentSlots character={character} />
        </div>
      </div>

      {/* Battle Record */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Battle Record</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{character.victories}</div>
            <div className="text-sm text-gray-400">Victories</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{character.defeats}</div>
            <div className="text-sm text-gray-400">Defeats</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{character.flees}</div>
            <div className="text-sm text-gray-400">Flees</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{character.victoriesPvp}</div>
            <div className="text-sm text-gray-400">PvP Wins</div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Skills</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'Mining', level: character.skillMining, uses: character.skillMiningUses },
            { name: 'Stonecutting', level: character.skillStone, uses: character.skillStoneUses },
            { name: 'Forge', level: character.skillForge, uses: character.skillForgeUses },
            { name: 'Enchantment', level: character.skillEnchantment, uses: character.skillEnchantmentUses },
            { name: 'Trading', level: character.skillTrading, uses: character.skillTradingUses },
            { name: 'Thief', level: character.skillThief, uses: character.skillThiefUses },
          ].map((skill) => (
            <div
              key={skill.name}
              className={`bg-gray-800/50 rounded-lg p-3 ${skill.level > 0 ? '' : 'opacity-40'}`}
            >
              <div className="font-medium text-sm">{skill.name}</div>
              <div className="text-xs text-gray-400">
                {skill.level > 0 ? `Level ${skill.level} (${skill.uses} uses)` : 'Not learned'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
