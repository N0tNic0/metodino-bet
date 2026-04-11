import { createClient } from '@supabase/supabase-js';
import { Bet, Player } from '@/types';

// ── Client singleton ────────────────────────────────────────────────────────

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Returns true when Supabase env vars are configured.
 * When false, the app falls back to localStorage.
 */
export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured
  ? createClient(url!, key!)
  : null;

// ── Row shape (snake_case, matches Postgres column names) ───────────────────

interface BetRow {
  id:          string;
  date:        string;
  description: string | null;
  category:    string | null;
  bet_type:    string | null;
  odds:        number;
  stake:       number;
  status:      string;
  vincita:     number | null;
  net_profit:  number;
  player_ids:  string[];
  created_at:  string;
  updated_at:  string;
}

interface PlayerRow {
  id:               string;
  name:             string;
  registered_at:    string;
  capital_invested: number;
  created_at:       string;
  updated_at:       string;
}

// ── Converters ──────────────────────────────────────────────────────────────

function rowToBet(row: BetRow): Bet {
  return {
    id:          row.id,
    date:        row.date,
    description: row.description ?? undefined,
    category:    row.category ?? undefined,
    betType:     row.bet_type ?? undefined,
    odds:        Number(row.odds),
    stake:       Number(row.stake),
    status:      row.status as Bet['status'],
    vincita:     row.vincita != null ? Number(row.vincita) : undefined,
    netProfit:   Number(row.net_profit),
    playerIds:   Array.isArray(row.player_ids) ? row.player_ids : [],
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

function betToRow(bet: Omit<Bet, 'createdAt' | 'updatedAt'>): Omit<BetRow, 'created_at' | 'updated_at'> {
  return {
    id:          bet.id,
    date:        bet.date,
    description: bet.description ?? null,
    category:    bet.category ?? null,
    bet_type:    bet.betType ?? null,
    odds:        bet.odds,
    stake:       bet.stake,
    status:      bet.status,
    vincita:     bet.vincita ?? null,
    net_profit:  bet.netProfit,
    player_ids:  bet.playerIds ?? [],
  };
}

function rowToPlayer(row: PlayerRow): Player {
  return {
    id:              row.id,
    name:            row.name,
    registeredAt:    row.registered_at,
    capitalInvested: Number(row.capital_invested),
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

function playerToRow(player: Omit<Player, 'createdAt' | 'updatedAt'>): Omit<PlayerRow, 'created_at' | 'updated_at'> {
  return {
    id:               player.id,
    name:             player.name,
    registered_at:    player.registeredAt,
    capital_invested: player.capitalInvested,
  };
}

// ── CRUD ────────────────────────────────────────────────────────────────────

export async function sbLoadBets(): Promise<Bet[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as BetRow[]).map(rowToBet);
}

export async function sbInsertBet(bet: Bet): Promise<Bet> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('bets')
    .insert(betToRow(bet))
    .select()
    .single();
  if (error) throw error;
  return rowToBet(data as BetRow);
}

export async function sbUpdateBet(bet: Bet): Promise<Bet> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('bets')
    .update(betToRow(bet))
    .eq('id', bet.id)
    .select()
    .single();
  if (error) throw error;
  return rowToBet(data as BetRow);
}

export async function sbDeleteBet(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('bets').delete().eq('id', id);
  if (error) throw error;
}

export async function sbUpsertBets(bets: Bet[]): Promise<void> {
  if (!supabase || bets.length === 0) return;
  const rows = bets.map(b => betToRow(b));
  const { error } = await supabase.from('bets').upsert(rows, { onConflict: 'id' });
  if (error) throw error;
}

// ── Player CRUD ──────────────────────────────────────────────────────────────

export async function sbLoadPlayers(): Promise<Player[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data as PlayerRow[]).map(rowToPlayer);
}

export async function sbInsertPlayer(player: Player): Promise<Player> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('players')
    .insert(playerToRow(player))
    .select()
    .single();
  if (error) throw error;
  return rowToPlayer(data as PlayerRow);
}

export async function sbUpdatePlayer(player: Player): Promise<Player> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('players')
    .update(playerToRow(player))
    .eq('id', player.id)
    .select()
    .single();
  if (error) throw error;
  return rowToPlayer(data as PlayerRow);
}

export async function sbDeletePlayer(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
}
