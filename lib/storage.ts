import { Bet, Player } from '@/types';
import { calcNetProfit } from './calculations';

const STORAGE_KEY = 'metodino-bet-v1';
const PLAYERS_STORAGE_KEY = 'metodino-bet-players-v1';

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
    playerIds: data.playerIds ?? [],
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

// ── Player storage ────────────────────────────────────────────────────────────

export function loadPlayers(): Player[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PLAYERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePlayers(players: Player[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
  } catch (e) {
    console.error('Failed to save players:', e);
  }
}

export function createPlayer(data: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Player {
  const now = new Date().toISOString();
  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
}

export function updatePlayer(existing: Player, patch: Partial<Omit<Player, 'id' | 'createdAt'>>): Player {
  return { ...existing, ...patch, updatedAt: new Date().toISOString() };
}
