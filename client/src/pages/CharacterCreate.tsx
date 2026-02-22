import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { useCharacterStore } from '../stores/characterStore';

interface CreationData {
  races: any[];
  classes: any[];
  elements: any[];
  alignments: any[];
}

interface Stats {
  might: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export function CharacterCreate() {
  const navigate = useNavigate();
  const { setHasCharacter } = useAuthStore();
  const { setCharacter } = useCharacterStore();

  const [data, setData] = useState<CreationData | null>(null);
  const [name, setName] = useState('');
  const [raceId, setRaceId] = useState(1);
  const [classId, setClassId] = useState(1);
  const [elementId, setElementId] = useState(1);
  const [alignmentId, setAlignmentId] = useState(1);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    api.getCreationData().then(setData).catch(console.error);
  }, []);

  const handleRoll = async () => {
    setRolling(true);
    try {
      const rolled = await api.rollStats();
      setStats(rolled);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRolling(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stats) {
      setError('You must roll your stats first!');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const character = await api.createCharacter({
        name,
        raceId,
        classId,
        elementId,
        alignmentId,
        stats,
      });
      setCharacter(character);
      setHasCharacter(true);
      navigate('/character');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  const selectedRace = data.races.find((r) => r.id === raceId);
  const selectedClass = data.classes.find((c) => c.id === classId);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-adr-gold">Create Your Character</h1>
          <p className="text-gray-400 mt-2">Choose wisely — your adventure awaits!</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Character Name */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Character Name</h2>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter character name"
              required
              minLength={2}
              maxLength={30}
            />
          </div>

          {/* Race Selection */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Race</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.races.map((race) => (
                <button
                  key={race.id}
                  type="button"
                  onClick={() => setRaceId(race.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-center
                    ${raceId === race.id
                      ? 'border-adr-gold bg-adr-gold/10'
                      : 'border-gray-700 hover:border-gray-500'
                    }`}
                >
                  <div className="font-semibold">{race.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{race.description}</div>
                </button>
              ))}
            </div>
            {selectedRace && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                {(['might', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map((stat) => {
                  const bonus = selectedRace[`${stat}Bonus` as keyof typeof selectedRace] as number || 0;
                  const malus = selectedRace[`${stat}Malus` as keyof typeof selectedRace] as number || 0;
                  const net = bonus - malus;
                  if (net === 0) return null;
                  return (
                    <div key={stat} className={`stat-badge ${net > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                      {stat.slice(0, 3).toUpperCase()}: {net > 0 ? '+' : ''}{net}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Class Selection */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Class</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.classes.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setClassId(cls.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-center
                    ${classId === cls.id
                      ? 'border-adr-gold bg-adr-gold/10'
                      : 'border-gray-700 hover:border-gray-500'
                    }`}
                >
                  <div className="font-semibold">{cls.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{cls.description}</div>
                  <div className="flex gap-2 justify-center mt-2 text-xs">
                    <span className="text-green-400">HP +{cls.baseHp}</span>
                    <span className="text-blue-400">MP +{cls.baseMp}</span>
                    {cls.baseAc > 0 && <span className="text-yellow-400">AC +{cls.baseAc}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Element Selection */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Element</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.elements.map((elem) => (
                <button
                  key={elem.id}
                  type="button"
                  onClick={() => setElementId(elem.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-center
                    ${elementId === elem.id
                      ? 'border-adr-gold bg-adr-gold/10'
                      : 'border-gray-700 hover:border-gray-500'
                    }`}
                >
                  <div className="font-semibold" style={{ color: elem.color }}>{elem.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{elem.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Alignment Selection */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Alignment</h2>
            <div className="grid grid-cols-3 gap-3">
              {data.alignments.map((align) => (
                <button
                  key={align.id}
                  type="button"
                  onClick={() => setAlignmentId(align.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-center
                    ${alignmentId === align.id
                      ? 'border-adr-gold bg-adr-gold/10'
                      : 'border-gray-700 hover:border-gray-500'
                    }`}
                >
                  <div className="font-semibold">{align.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{align.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Stat Rolling */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Stats</h2>
              <button
                type="button"
                onClick={handleRoll}
                className="btn-gold"
                disabled={rolling}
              >
                {rolling ? 'Rolling...' : stats ? 'Re-Roll (4d6 drop lowest)' : 'Roll Stats (4d6 drop lowest)'}
              </button>
            </div>

            {stats ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(stats).map(([key, value]) => {
                  const bonus = selectedRace?.[`${key}Bonus` as keyof typeof selectedRace] as number || 0;
                  const malus = selectedRace?.[`${key}Malus` as keyof typeof selectedRace] as number || 0;
                  const net = bonus - malus;
                  const final = Math.min(20, Math.max(3, value + net));

                  return (
                    <div key={key} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-sm text-gray-400 uppercase">{key}</div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold text-white">{final}</span>
                        {net !== 0 && (
                          <span className={`text-sm ${net > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ({value} {net > 0 ? '+' : ''}{net})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Click "Roll Stats" to generate your attributes
              </div>
            )}
          </div>

          {/* Summary & Create */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <span className="text-gray-400">Name:</span>{' '}
                <span className="text-white font-medium">{name || '—'}</span>
              </div>
              <div>
                <span className="text-gray-400">Race:</span>{' '}
                <span className="text-white font-medium">{selectedRace?.name || '—'}</span>
              </div>
              <div>
                <span className="text-gray-400">Class:</span>{' '}
                <span className="text-white font-medium">{selectedClass?.name || '—'}</span>
              </div>
              <div>
                <span className="text-gray-400">Element:</span>{' '}
                <span className="font-medium" style={{ color: data.elements.find(e => e.id === elementId)?.color }}>
                  {data.elements.find(e => e.id === elementId)?.name || '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Alignment:</span>{' '}
                <span className="text-white font-medium">{data.alignments.find(a => a.id === alignmentId)?.name || '—'}</span>
              </div>
              {selectedClass && (
                <div>
                  <span className="text-gray-400">Starting:</span>{' '}
                  <span className="text-green-400">HP +{selectedClass.baseHp}</span>{' '}
                  <span className="text-blue-400">MP +{selectedClass.baseMp}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full text-lg py-3"
              disabled={loading || !stats}
            >
              {loading ? 'Creating Character...' : 'Create Character'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
