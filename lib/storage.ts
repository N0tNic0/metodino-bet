import { Bet } from '@/types';
import { calcNetProfit } from './calculations';

const STORAGE_KEY = 'metodino-bet-v1';

export function loadBets(): Bet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBets(bets: Bet[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
  } catch (e) {
    console.error('Failed to save bets:', e);
  }
}

export function createBet(data: Omit<Bet, 'id' | 'netProfit' | 'createdAt' | 'updatedAt'>): Bet {
  const now = new Date().toISOString();
  return {
    ...data,
    id: crypto.randomUUID(),
    netProfit: calcNetProfit(data.odds, data.stake, data.status, data.vincita),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateBet(existing: Bet, patch: Partial<Omit<Bet, 'id' | 'createdAt'>>): Bet {
  const updated: Bet = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  updated.netProfit = calcNetProfit(updated.odds, updated.stake, updated.status, updated.vincita);
  return updated;
}
