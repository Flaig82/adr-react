import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface CharacterSummary {
  id: number;
  userId: number;
  username: string;
  name: string;
  level: number;
  className: string;
  raceName: string;
  elementName: string;
  elementColor: string;
  alignmentName: string;
  victories: number;
  defeats: number;
  victoriesPvp: number;
  defeatsPvp: number;
  isDead: boolean;
}

interface CharacterDetail {
  name: string;
  username: string;
  level: number;
  xp: number;
  className: string;
  raceName: string;
  elementName: string;
  elementColor: string;
  alignmentName: string;
  might: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;
  ac: number;
  victories: number;
  defeats: number;
  flees: number;
  victoriesPvp: number;
  defeatsPvp: number;
  isDead: boolean;
}

export function CharacterList() {
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<CharacterDetail | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getCharacterList();
      setCharacters(data.characters);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const viewProfile = async (userId: number) => {
    if (selectedUserId === userId) {
      // Toggle off
      setSelectedProfile(null);
      setSelectedUserId(null);
      return;
    }
    try {
      setIsLoadingProfile(true);
      setSelectedUserId(userId);
      const data = await api.getCharacterProfile(userId);
      setSelectedProfile(data);
    } catch (err: any) {
      setError(err.message);
      setSelectedProfile(null);
      setSelectedUserId(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const filtered = characters.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.className.toLowerCase().includes(q) ||
      c.raceName.toLowerCase().includes(q)
    );
  });

  const StatBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
      <div>
        <div className="flex justify-between text-xs mb-0.5">
          <span className="text-gray-400">{label}</span>
          <span className="text-gray-300">{value}/{max}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-adr-gold flex items-center gap-2">
            📜 Adventurers
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {characters.length} characters in the realm
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-adr-darker border border-gray-700/50 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-adr-blue/50 w-48"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-2 rounded-lg mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
        </div>
      )}

      {isLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin text-3xl mb-2">⚔️</div>
          <p className="text-gray-500">Loading characters...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-2">🏜️</div>
          <p className="text-gray-500">
            {search ? 'No characters match your search.' : 'No adventurers found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Character</div>
            <div className="col-span-2">Class</div>
            <div className="col-span-2">Race / Element</div>
            <div className="col-span-1 text-center">Level</div>
            <div className="col-span-2 text-center">Record</div>
            <div className="col-span-1 text-center">Status</div>
          </div>

          {filtered.map((char, idx) => (
            <div key={char.id}>
              {/* Character Row */}
              <button
                onClick={() => viewProfile(char.userId)}
                className={`w-full grid grid-cols-12 gap-2 px-4 py-3 rounded-lg text-left transition-colors ${
                  selectedUserId === char.userId
                    ? 'bg-adr-blue/10 border border-adr-blue/30'
                    : 'card hover:bg-gray-800/50'
                }`}
              >
                <div className="col-span-1 text-gray-500 text-sm self-center">
                  {idx + 1}
                </div>
                <div className="col-span-3 self-center">
                  <div className="font-semibold text-white">{char.name}</div>
                  <div className="text-xs text-gray-500">@{char.username}</div>
                </div>
                <div className="col-span-2 self-center text-sm text-gray-300">
                  {char.className}
                </div>
                <div className="col-span-2 self-center">
                  <div className="text-sm text-gray-300">{char.raceName}</div>
                  <div className="text-xs" style={{ color: char.elementColor }}>
                    {char.elementName}
                  </div>
                </div>
                <div className="col-span-1 text-center self-center">
                  <span className="text-adr-gold font-bold">{char.level}</span>
                </div>
                <div className="col-span-2 text-center self-center text-sm">
                  <span className="text-green-400">{char.victories}W</span>
                  <span className="text-gray-600 mx-1">/</span>
                  <span className="text-red-400">{char.defeats}L</span>
                  {(char.victoriesPvp > 0 || char.defeatsPvp > 0) && (
                    <div className="text-xs text-gray-500">
                      PvP: {char.victoriesPvp}W/{char.defeatsPvp}L
                    </div>
                  )}
                </div>
                <div className="col-span-1 text-center self-center">
                  {char.isDead ? (
                    <span className="text-red-500 text-sm" title="Dead">💀</span>
                  ) : (
                    <span className="text-green-500 text-sm" title="Alive">🟢</span>
                  )}
                </div>
              </button>

              {/* Expanded Profile */}
              {selectedUserId === char.userId && (
                <div className="card ml-8 mt-1 mb-2 p-4 border-l-2 border-adr-blue/50">
                  {isLoadingProfile ? (
                    <div className="text-center py-4 text-gray-500">Loading profile...</div>
                  ) : selectedProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Stats */}
                      <div>
                        <h3 className="text-sm font-semibold text-adr-gold mb-3">Attributes</h3>
                        <div className="space-y-2 text-sm">
                          {[
                            { label: 'Might', value: selectedProfile.might },
                            { label: 'Dexterity', value: selectedProfile.dexterity },
                            { label: 'Constitution', value: selectedProfile.constitution },
                            { label: 'Intelligence', value: selectedProfile.intelligence },
                            { label: 'Wisdom', value: selectedProfile.wisdom },
                            { label: 'Charisma', value: selectedProfile.charisma },
                          ].map((s) => (
                            <div key={s.label} className="flex justify-between">
                              <span className="text-gray-400">{s.label}</span>
                              <span className="text-white font-medium">{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Vitals */}
                      <div>
                        <h3 className="text-sm font-semibold text-adr-gold mb-3">Vitals</h3>
                        <div className="space-y-3">
                          <StatBar label="HP" value={selectedProfile.hp} max={selectedProfile.hpMax} color="bg-red-500" />
                          <StatBar label="MP" value={selectedProfile.mp} max={selectedProfile.mpMax} color="bg-blue-500" />
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-400">Armor Class</span>
                            <span className="text-white font-medium">{selectedProfile.ac}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">XP</span>
                            <span className="text-white font-medium">{selectedProfile.xp.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Alignment</span>
                            <span className="text-white">{selectedProfile.alignmentName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Combat Record */}
                      <div>
                        <h3 className="text-sm font-semibold text-adr-gold mb-3">Combat Record</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">PvE Wins</span>
                            <span className="text-green-400">{selectedProfile.victories}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">PvE Losses</span>
                            <span className="text-red-400">{selectedProfile.defeats}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Flees</span>
                            <span className="text-yellow-400">{selectedProfile.flees}</span>
                          </div>
                          <div className="border-t border-gray-700/50 my-2"></div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">PvP Wins</span>
                            <span className="text-green-400">{selectedProfile.victoriesPvp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">PvP Losses</span>
                            <span className="text-red-400">{selectedProfile.defeatsPvp}</span>
                          </div>
                          {selectedProfile.isDead && (
                            <div className="mt-2 bg-red-900/20 border border-red-700/30 rounded px-3 py-1.5 text-center">
                              <span className="text-red-400 text-sm">💀 This character is dead</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
