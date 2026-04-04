import { Bet, BetStats, BetStatus, CumulativeProfitPoint } from '@/types';

// ─── Core calculations ────────────────────────────────────────────────────────

/**
 * Calculates the net profit for a single bet.
 * - vinta:   stake * (odds - 1)
 * - persa:   -stake
 * - void:    0  (stake returned)
 * - pending: 0  (not yet resolved)
 */
export function calcNetProfit(odds: number, stake: number, status: BetStatus): number {
  switch (status) {
    case 'vinta':   return parseFloat((stake * (odds - 1)).toFixed(2));
    case 'persa':   return -stake;
    case 'void':    return 0;
    case 'pending': return 0;
  }
}

// ─── Aggregated stats ─────────────────────────────────────────────────────────

export function calcStats(bets: Bet[]): BetStats {
  const total   = bets.length;
  const won     = bets.filter(b => b.status === 'vinta').length;
  const lost    = bets.filter(b => b.status === 'persa').length;
  const pending = bets.filter(b => b.status === 'pending').length;
  const voidN   = bets.filter(b => b.status === 'void').length;
  const concluded = won + lost + voidN;

  const concludedBets        = bets.filter(b => b.status !== 'pending');
  const totalStake           = bets.reduce((s, b) => s + b.stake, 0);
  const totalStakeConcluded  = concludedBets.reduce((s, b) => s + b.stake, 0);
  const totalNetProfit       = parseFloat(concludedBets.reduce((s, b) => s + b.netProfit, 0).toFixed(2));

  const avgOdds    = total > 0 ? bets.reduce((s, b) => s + b.odds, 0) / total : 0;
  const winRate    = concluded > 0 ? (won / concluded) * 100 : 0;
  const lossRate   = concluded > 0 ? (lost / concluded) * 100 : 0;
  const pendingRate = total > 0 ? (pending / total) * 100 : 0;
  const roi        = totalStakeConcluded > 0 ? (totalNetProfit / totalStakeConcluded) * 100 : 0;
  const avgNetProfit = concluded > 0 ? totalNetProfit / concluded : 0;

  const wonBets  = bets.filter(b => b.status === 'vinta');
  const lostBets = bets.filter(b => b.status === 'persa');
  const bestOdds  = wonBets.length  > 0 ? Math.max(...wonBets.map(b => b.odds))  : 0;
  const worstOdds = lostBets.length > 0 ? Math.max(...lostBets.map(b => b.odds)) : 0;

  return {
    total, won, lost, pending, void: voidN, concluded,
    totalStake, totalStakeConcluded, totalNetProfit,
    avgOdds, winRate, lossRate, pendingRate, roi,
    avgNetProfit, bestOdds, worstOdds,
  };
}

// ─── Chart data ───────────────────────────────────────────────────────────────

export function calcCumulativeProfit(bets: Bet[]): CumulativeProfitPoint[] {
  const sorted = [...bets]
    .filter(b => b.status !== 'pending')
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

  let cumProfit = 0;
  return sorted.map(bet => {
    cumProfit = parseFloat((cumProfit + bet.netProfit).toFixed(2));
    const [, month, day] = bet.date.split('-');
    return {
      date: bet.date,
      label: `${day}/${month}`,
      profit: bet.netProfit,
      cumProfit,
    };
  });
}

export function calcOutcomeDistribution(bets: Bet[]) {
  const won     = bets.filter(b => b.status === 'vinta').length;
  const lost    = bets.filter(b => b.status === 'persa').length;
  const pending = bets.filter(b => b.status === 'pending').length;
  const voidN   = bets.filter(b => b.status === 'void').length;
  return [
    { name: 'Vinte',   value: won,     color: '#10b981' },
    { name: 'Perse',   value: lost,    color: '#f43f5e' },
    { name: 'Pending', value: pending, color: '#f59e0b' },
    { name: 'Void',    value: voidN,   color: '#64748b' },
  ].filter(d => d.value > 0);
}

// ─── Monthly breakdown ────────────────────────────────────────────────────────

export function calcMonthlyStats(bets: Bet[]) {
  const byMonth: Record<string, { label: string; profit: number; won: number; lost: number; stake: number }> = {};
  bets.filter(b => b.status !== 'pending').forEach(b => {
    const key = b.date.slice(0, 7); // YYYY-MM
    const [year, month] = key.split('-');
    const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('it-IT', { month: 'short', year: '2-digit' });
    if (!byMonth[key]) byMonth[key] = { label, profit: 0, won: 0, lost: 0, stake: 0 };
    byMonth[key].profit = parseFloat((byMonth[key].profit + b.netProfit).toFixed(2));
    byMonth[key].stake  += b.stake;
    if (b.status === 'vinta') byMonth[key].won++;
    if (b.status === 'persa') byMonth[key].lost++;
  });
  return Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  const prefix = value > 0 ? '+' : '';
  return prefix + new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyPlain(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatOdds(value: number): string {
  return value.toFixed(2);
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
