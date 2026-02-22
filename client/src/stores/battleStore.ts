import { create } from 'zustand';
import { api } from '../api/client';

// ─── Types ──────────────────────────────────────────────────────────────────

interface MonsterState {
  id: number;
  name: string;
  image: string;
  level: number;
  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;
  elementId: number;
  customSpell: string;
}

interface PlayerCombatStats {
  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;
  att: number;
  def: number;
  magicAtt: number;
  magicDef: number;
}

interface BattleRewards {
  xp: number;
  gold: number;
  sp: number;
  leveledUp: boolean;
  newLevel?: number;
}

type BattleResult = 'ongoing' | 'victory' | 'defeat' | 'fled';

interface BattleStoreState {
  // Battle state
  battleId: number | null;
  monster: MonsterState | null;
  player: PlayerCombatStats | null;
  round: number;
  result: BattleResult | null;
  rewards: BattleRewards | null;

  // Battle log
  log: string[];

  // UI state
  isLoading: boolean;
  isActing: boolean;
  error: string | null;

  // Character status (for pre-battle checks)
  isDead: boolean;
  currentHp: number;
  currentHpMax: number;

  // Actions
  checkBattle: () => Promise<void>;
  startBattle: () => Promise<void>;
  performAction: (action: 'attack' | 'defend' | 'flee') => Promise<void>;
  templeHeal: () => Promise<void>;
  templeResurrect: () => Promise<void>;
  clearBattle: () => void;
  clearError: () => void;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useBattleStore = create<BattleStoreState>((set, get) => ({
  battleId: null,
  monster: null,
  player: null,
  round: 0,
  result: null,
  rewards: null,
  log: [],
  isLoading: false,
  isActing: false,
  error: null,
  isDead: false,
  currentHp: 0,
  currentHpMax: 0,

  // Check if there's an active battle (on page load)
  checkBattle: async () => {
    try {
      set({ isLoading: true, error: null });
      const { battle } = await api.getBattle();

      if (battle) {
        set({
          battleId: battle.battleId,
          monster: battle.monster,
          player: battle.player,
          round: battle.round,
          result: 'ongoing',
          log: ['Resuming battle...'],
          isLoading: false,
        });
      } else {
        // No active battle — fetch character status for heal/resurrect checks
        try {
          const char = await api.getCharacter();
          set({
            isLoading: false,
            isDead: char.isDead === 1,
            currentHp: char.hp,
            currentHpMax: char.hpMax,
          });
        } catch {
          set({ isLoading: false });
        }
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Start a new battle
  startBattle: async () => {
    try {
      set({ isLoading: true, error: null, log: [], rewards: null, result: null });
      const data = await api.startBattle();

      const startLog: string[] = [];
      startLog.push(`A wild ${data.monster.name} (Lv.${data.monster.level}) appears!`);
      startLog.push(data.playerFirst
        ? 'You have the initiative! You strike first.'
        : `${data.monster.name} strikes first!`
      );

      set({
        battleId: data.battleId,
        monster: data.monster,
        player: data.player,
        round: data.round,
        result: 'ongoing',
        log: startLog,
        isLoading: false,
        isDead: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Perform a battle action (attack, defend, flee)
  performAction: async (action) => {
    const { battleId } = get();
    if (!battleId) return;

    try {
      set({ isActing: true, error: null });
      const data = await api.battleAction(battleId, action);

      set((state) => ({
        round: data.round,
        monster: state.monster ? {
          ...state.monster,
          hp: data.monsterHp,
          mp: data.monsterMp,
        } : null,
        player: state.player ? {
          ...state.player,
          hp: data.playerHp,
          mp: data.playerMp,
          hpMax: data.playerHpMax,
          mpMax: data.playerMpMax,
        } : null,
        currentHp: data.playerHp,
        currentHpMax: data.playerHpMax,
        log: [...state.log, ...data.messages],
        result: data.result,
        rewards: data.rewards || null,
        isActing: false,
        isDead: data.result === 'defeat',
        battleId: data.battleOver ? null : state.battleId,
      }));
    } catch (err: any) {
      set({ error: err.message, isActing: false });
    }
  },

  // Temple heal
  templeHeal: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.templeHeal();
      set({
        isLoading: false,
        currentHp: data.hp,
        currentHpMax: data.hpMax,
        log: [`Healed to full HP! (Cost: ${data.cost}g)`],
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Temple resurrect
  templeResurrect: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.templeResurrect();
      set({
        isLoading: false,
        isDead: false,
        currentHp: data.hp,
        log: [`Resurrected at ${data.hp} HP! (Cost: ${data.cost}g)`],
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Clear battle state
  clearBattle: () => set({
    battleId: null,
    monster: null,
    player: null,
    round: 0,
    result: null,
    rewards: null,
    log: [],
    error: null,
  }),

  clearError: () => set({ error: null }),
}));
