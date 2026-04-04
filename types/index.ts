export type BetStatus = 'pending' | 'vinta' | 'persa' | 'void';

export interface Bet {
  id: string;
  date: string;          // YYYY-MM-DD
  description?: string;
  category?: string;
  betType?: string;      // tipo di giocata, e.g. Singola, Multipla, Over/Under…
  odds: number;          // decimal odds, e.g. 1.85
  stake: number;         // amount wagered
  status: BetStatus;
  netProfit: number;     // computed automatically
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}

/**
 * Aggregated statistics for a set of bets.
 *
 * Note on "concluded" vs "total":
 * - concluded = vinta + persa + void  (excludes pending)
 * - winRate / lossRate are computed over concluded only
 * - pendingRate is computed over total
 * - ROI is computed over totalStakeConcluded only (pending bets are excluded from financial KPIs)
 */
export interface BetStats {
  total: number;
  won: number;
  lost: number;
  pending: number;
  void: number;
  concluded: number;
  totalStake: number;
  totalStakeConcluded: number;
  totalNetProfit: number;
  avgOdds: number;
  winRate: number;       // (won / concluded) * 100
  lossRate: number;      // (lost / concluded) * 100
  pendingRate: number;   // (pending / total) * 100
  roi: number;           // (totalNetProfit / totalStakeConcluded) * 100
  avgNetProfit: number;  // totalNetProfit / concluded
  bestOdds: number;      // highest odds among won bets
  worstOdds: number;     // highest odds among lost bets (biggest "missed" win)
}

export interface BetFilters {
  status: BetStatus | 'all';
  dateFrom: string;
  dateTo: string;
  oddsMin: string;
  oddsMax: string;
  search: string;
  sortBy: 'date' | 'odds' | 'stake' | 'netProfit';
  sortOrder: 'asc' | 'desc';
}

export interface CumulativeProfitPoint {
  date: string;       // YYYY-MM-DD
  label: string;      // short label for chart axis
  profit: number;     // net profit of this bet
  cumProfit: number;  // running total
}

export interface BetFormData {
  date: string;
  description: string;
  category: string;
  betType: string;
  odds: string;
  stake: string;
  status: BetStatus;
}
