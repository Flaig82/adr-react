import { demoApi } from './demoApi';

const BASE_URL = '/api';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (username: string, password: string) =>
    DEMO_MODE
      ? demoApi.register(username, password)
      : request<{ id: number; username: string }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        }),

  login: (username: string, password: string) =>
    DEMO_MODE
      ? demoApi.login(username, password)
      : request<{ id: number; username: string; hasCharacter: boolean }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        }),

  logout: () =>
    DEMO_MODE
      ? demoApi.logout()
      : request<{ message: string }>('/auth/logout', { method: 'POST' }),

  me: () =>
    DEMO_MODE
      ? demoApi.me()
      : request<{ id: number; username: string; hasCharacter: boolean }>('/auth/me'),

  // Character
  getCharacter: () =>
    DEMO_MODE
      ? demoApi.getCharacter()
      : request<any>('/character'),

  getCreationData: () =>
    DEMO_MODE
      ? demoApi.getCreationData()
      : request<{
          races: any[];
          classes: any[];
          elements: any[];
          alignments: any[];
        }>('/character/creation-data'),

  rollStats: () =>
    DEMO_MODE
      ? demoApi.rollStats()
      : request<{
          might: number;
          dexterity: number;
          constitution: number;
          intelligence: number;
          wisdom: number;
          charisma: number;
        }>('/character/roll', { method: 'POST' }),

  createCharacter: (data: {
    name: string;
    raceId: number;
    classId: number;
    elementId: number;
    alignmentId: number;
    stats: {
      might: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
  }) =>
    DEMO_MODE
      ? demoApi.createCharacter(data)
      : request<any>('/character', {
          method: 'POST',
          body: JSON.stringify(data),
        }),

  // Battle
  getBattle: () =>
    DEMO_MODE
      ? demoApi.getBattle()
      : request<{ battle: any | null }>('/battle'),

  startBattle: () =>
    DEMO_MODE
      ? demoApi.startBattle()
      : request<any>('/battle/start', { method: 'POST' }),

  battleAction: (battleId: number, action: 'attack' | 'defend' | 'flee') =>
    DEMO_MODE
      ? demoApi.battleAction(battleId, action)
      : request<any>('/battle/action', {
          method: 'POST',
          body: JSON.stringify({ battleId, action }),
        }),

  templeHeal: () =>
    DEMO_MODE
      ? demoApi.templeHeal()
      : request<{ hp: number; hpMax: number; cost: number }>('/battle/heal', {
          method: 'POST',
        }),

  templeResurrect: () =>
    DEMO_MODE
      ? demoApi.templeResurrect()
      : request<{ hp: number; cost: number }>('/battle/resurrect', {
          method: 'POST',
        }),

  // Inventory
  getInventory: () =>
    DEMO_MODE
      ? demoApi.getInventory()
      : request<{ items: any[] }>('/inventory'),

  equipItem: (itemId: number) =>
    DEMO_MODE
      ? demoApi.equipItem(itemId)
      : request<{ success: boolean; message: string }>('/inventory/equip', {
          method: 'POST',
          body: JSON.stringify({ itemId }),
        }),

  unequipItem: (itemId: number) =>
    DEMO_MODE
      ? demoApi.unequipItem(itemId)
      : request<{ success: boolean; message: string }>('/inventory/unequip', {
          method: 'POST',
          body: JSON.stringify({ itemId }),
        }),

  sellItem: (itemId: number) =>
    DEMO_MODE
      ? demoApi.sellItem(itemId)
      : request<{ gold: number; message: string }>('/inventory/sell', {
          method: 'POST',
          body: JSON.stringify({ itemId }),
        }),

  dropItem: (itemId: number) =>
    DEMO_MODE
      ? demoApi.dropItem(itemId)
      : request<{ message: string }>('/inventory/drop', {
          method: 'POST',
          body: JSON.stringify({ itemId }),
        }),

  giveItem: (itemId: number, targetUserId: number) =>
    DEMO_MODE
      ? demoApi.giveItem(itemId, targetUserId)
      : request<{ message: string }>('/inventory/give', {
          method: 'POST',
          body: JSON.stringify({ itemId, targetUserId }),
        }),

  // Shop
  getShops: () =>
    DEMO_MODE
      ? demoApi.getShops()
      : request<{ shops: any[] }>('/shop'),

  getShopItems: (shopId: number) =>
    DEMO_MODE
      ? demoApi.getShopItems(shopId)
      : request<{ items: any[] }>(`/shop/${shopId}/items`),

  buyItem: (itemId: number) =>
    DEMO_MODE
      ? demoApi.buyItem(itemId)
      : request<{ message: string; gold: number; itemName: string }>('/shop/buy', {
          method: 'POST',
          body: JSON.stringify({ itemId }),
        }),

  // Forge
  getForgeStatus: () =>
    DEMO_MODE
      ? demoApi.getForgeStatus()
      : request<any>('/forge'),

  mine: (pickaxeId: number) =>
    DEMO_MODE
      ? demoApi.mine(pickaxeId)
      : request<any>('/forge/mine', {
          method: 'POST',
          body: JSON.stringify({ pickaxeId }),
        }),

  cutStone: (materialId: number) =>
    DEMO_MODE
      ? demoApi.cutStone(materialId)
      : request<any>('/forge/cut', {
          method: 'POST',
          body: JSON.stringify({ materialId }),
        }),

  repairItem: (itemId: number) =>
    DEMO_MODE
      ? demoApi.repairItem(itemId)
      : request<any>('/forge/repair', {
          method: 'POST',
          body: JSON.stringify({ itemId }),
        }),

  enchantItem: (itemId: number) =>
    DEMO_MODE
      ? demoApi.enchantItem(itemId)
      : request<any>('/forge/enchant', {
          method: 'POST',
          body: JSON.stringify({ itemId }),
        }),

  // Vault
  getVaultStatus: () =>
    DEMO_MODE
      ? demoApi.getVaultStatus()
      : request<any>('/vault'),

  vaultDeposit: (amount: number) =>
    DEMO_MODE
      ? demoApi.vaultDeposit(amount)
      : request<any>('/vault/deposit', {
          method: 'POST',
          body: JSON.stringify({ amount }),
        }),

  vaultWithdraw: (amount: number) =>
    DEMO_MODE
      ? demoApi.vaultWithdraw(amount)
      : request<any>('/vault/withdraw', {
          method: 'POST',
          body: JSON.stringify({ amount }),
        }),

  takeLoan: (amount: number) =>
    DEMO_MODE
      ? demoApi.takeLoan(amount)
      : request<any>('/vault/loan', {
          method: 'POST',
          body: JSON.stringify({ amount }),
        }),

  repayLoan: () =>
    DEMO_MODE
      ? demoApi.repayLoan()
      : request<any>('/vault/repay', { method: 'POST' }),

  buyStock: (stockId: number, shares: number) =>
    DEMO_MODE
      ? demoApi.buyStock(stockId, shares)
      : request<any>('/vault/stock/buy', {
          method: 'POST',
          body: JSON.stringify({ stockId, shares }),
        }),

  sellStock: (stockId: number, shares: number) =>
    DEMO_MODE
      ? demoApi.sellStock(stockId, shares)
      : request<any>('/vault/stock/sell', {
          method: 'POST',
          body: JSON.stringify({ stockId, shares }),
        }),

  // Town
  getTownStatus: () =>
    DEMO_MODE
      ? demoApi.getTownStatus()
      : request<any>('/town'),

  trainStat: (stat: string) =>
    DEMO_MODE
      ? demoApi.trainStat(stat)
      : request<any>('/town/train', {
          method: 'POST',
          body: JSON.stringify({ stat }),
        }),

  learnSkill: (skillId: number) =>
    DEMO_MODE
      ? demoApi.learnSkill(skillId)
      : request<any>('/town/learn-skill', {
          method: 'POST',
          body: JSON.stringify({ skillId }),
        }),

  changeClass: (classId: number) =>
    DEMO_MODE
      ? demoApi.changeClass(classId)
      : request<any>('/town/change-class', {
          method: 'POST',
          body: JSON.stringify({ classId }),
        }),

  townHeal: () =>
    DEMO_MODE
      ? demoApi.townHeal()
      : request<any>('/town/heal', { method: 'POST' }),

  townResurrect: () =>
    DEMO_MODE
      ? demoApi.townResurrect()
      : request<any>('/town/resurrect', { method: 'POST' }),

  // Chat
  getMessages: () =>
    DEMO_MODE
      ? demoApi.getMessages()
      : request<{ messages: any[] }>('/chat'),

  pollMessages: (afterId: number) =>
    DEMO_MODE
      ? demoApi.pollMessages(afterId)
      : request<{ messages: any[] }>(`/chat/poll?after=${afterId}`),

  sendMessage: (message: string) =>
    DEMO_MODE
      ? demoApi.sendMessage(message)
      : request<any>('/chat', {
          method: 'POST',
          body: JSON.stringify({ message }),
        }),

  // Thief (steal from shops)
  getStealableItems: (shopId: number) =>
    DEMO_MODE
      ? demoApi.getStealableItems(shopId)
      : request<any>(`/shop/${shopId}/steal`),

  attemptSteal: (itemId: number) =>
    DEMO_MODE
      ? demoApi.attemptSteal(itemId)
      : request<any>('/shop/steal', {
          method: 'POST',
          body: JSON.stringify({ itemId }),
        }),

  // Character List
  getCharacterList: () =>
    DEMO_MODE
      ? demoApi.getCharacterList()
      : request<{ characters: any[] }>('/characters'),

  getCharacterProfile: (userId: number) =>
    DEMO_MODE
      ? demoApi.getCharacterProfile(userId)
      : request<any>(`/characters/${userId}`),

  // Jail
  getJailStatus: () =>
    DEMO_MODE
      ? demoApi.getJailStatus()
      : request<any>('/jail'),

  payBail: () =>
    DEMO_MODE
      ? demoApi.payBail()
      : request<any>('/jail/bail', { method: 'POST' }),

  getJailHistory: () =>
    DEMO_MODE
      ? demoApi.getJailHistory()
      : request<{ records: any[] }>('/jail/history'),
};
