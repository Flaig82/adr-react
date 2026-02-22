const BASE_URL = '/api';

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
    request<{ id: number; username: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    request<{ id: number; username: string; hasCharacter: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', { method: 'POST' }),

  me: () =>
    request<{ id: number; username: string; hasCharacter: boolean }>('/auth/me'),

  // Character
  getCharacter: () =>
    request<any>('/character'),

  getCreationData: () =>
    request<{
      races: any[];
      classes: any[];
      elements: any[];
      alignments: any[];
    }>('/character/creation-data'),

  rollStats: () =>
    request<{
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
    request<any>('/character', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Battle
  getBattle: () =>
    request<{ battle: any | null }>('/battle'),

  startBattle: () =>
    request<any>('/battle/start', { method: 'POST' }),

  battleAction: (battleId: number, action: 'attack' | 'defend' | 'flee') =>
    request<any>('/battle/action', {
      method: 'POST',
      body: JSON.stringify({ battleId, action }),
    }),

  templeHeal: () =>
    request<{ hp: number; hpMax: number; cost: number }>('/battle/heal', {
      method: 'POST',
    }),

  templeResurrect: () =>
    request<{ hp: number; cost: number }>('/battle/resurrect', {
      method: 'POST',
    }),

  // Inventory
  getInventory: () =>
    request<{ items: any[] }>('/inventory'),

  equipItem: (itemId: number) =>
    request<{ success: boolean; message: string }>('/inventory/equip', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),

  unequipItem: (itemId: number) =>
    request<{ success: boolean; message: string }>('/inventory/unequip', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),

  sellItem: (itemId: number) =>
    request<{ gold: number; message: string }>('/inventory/sell', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),

  dropItem: (itemId: number) =>
    request<{ message: string }>('/inventory/drop', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),

  giveItem: (itemId: number, targetUserId: number) =>
    request<{ message: string }>('/inventory/give', {
      method: 'POST',
      body: JSON.stringify({ itemId, targetUserId }),
    }),

  // Shop
  getShops: () =>
    request<{ shops: any[] }>('/shop'),

  getShopItems: (shopId: number) =>
    request<{ items: any[] }>(`/shop/${shopId}/items`),

  buyItem: (itemId: number) =>
    request<{ message: string; gold: number; itemName: string }>('/shop/buy', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),

  // Forge
  getForgeStatus: () =>
    request<any>('/forge'),

  mine: (pickaxeId: number) =>
    request<any>('/forge/mine', {
      method: 'POST',
      body: JSON.stringify({ pickaxeId }),
    }),

  cutStone: (materialId: number) =>
    request<any>('/forge/cut', {
      method: 'POST',
      body: JSON.stringify({ materialId }),
    }),

  repairItem: (itemId: number) =>
    request<any>('/forge/repair', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),

  enchantItem: (itemId: number) =>
    request<any>('/forge/enchant', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),

  // Vault
  getVaultStatus: () =>
    request<any>('/vault'),

  vaultDeposit: (amount: number) =>
    request<any>('/vault/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  vaultWithdraw: (amount: number) =>
    request<any>('/vault/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  takeLoan: (amount: number) =>
    request<any>('/vault/loan', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  repayLoan: () =>
    request<any>('/vault/repay', { method: 'POST' }),

  buyStock: (stockId: number, shares: number) =>
    request<any>('/vault/stock/buy', {
      method: 'POST',
      body: JSON.stringify({ stockId, shares }),
    }),

  sellStock: (stockId: number, shares: number) =>
    request<any>('/vault/stock/sell', {
      method: 'POST',
      body: JSON.stringify({ stockId, shares }),
    }),

  // Town
  getTownStatus: () =>
    request<any>('/town'),

  trainStat: (stat: string) =>
    request<any>('/town/train', {
      method: 'POST',
      body: JSON.stringify({ stat }),
    }),

  learnSkill: (skillId: number) =>
    request<any>('/town/learn-skill', {
      method: 'POST',
      body: JSON.stringify({ skillId }),
    }),

  changeClass: (classId: number) =>
    request<any>('/town/change-class', {
      method: 'POST',
      body: JSON.stringify({ classId }),
    }),

  townHeal: () =>
    request<any>('/town/heal', { method: 'POST' }),

  townResurrect: () =>
    request<any>('/town/resurrect', { method: 'POST' }),

  // Chat
  getMessages: () =>
    request<{ messages: any[] }>('/chat'),

  pollMessages: (afterId: number) =>
    request<{ messages: any[] }>(`/chat/poll?after=${afterId}`),

  sendMessage: (message: string) =>
    request<any>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Thief (steal from shops)
  getStealableItems: (shopId: number) =>
    request<any>(`/shop/${shopId}/steal`),

  attemptSteal: (itemId: number) =>
    request<any>('/shop/steal', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),

  // Character List
  getCharacterList: () =>
    request<{ characters: any[] }>('/characters'),

  getCharacterProfile: (userId: number) =>
    request<any>(`/characters/${userId}`),

  // Jail
  getJailStatus: () =>
    request<any>('/jail'),

  payBail: () =>
    request<any>('/jail/bail', { method: 'POST' }),

  getJailHistory: () =>
    request<{ records: any[] }>('/jail/history'),
};
