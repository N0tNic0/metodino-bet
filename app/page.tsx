'use client';

import { useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Target, Percent, DollarSign,
  BarChart3, Trophy, Clock, RefreshCw, Download, Upload,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import KpiCard from '@/components/dashboard/KpiCard';
import ProfitChart from '@/components/dashboard/ProfitChart';
import OutcomeChart from '@/components/dashboard/OutcomeChart';
import { useBetsContext } from '@/providers/BetsProvider';
import {
  calcStats, calcCumulativeProfit, calcOutcomeDistribution, calcMonthlyStats,
  formatCurrency, formatCurrencyPlain, formatPercent, formatOdds,
} from '@/lib/calculations';
import { exportToCSV, importFromCSV } from '@/lib/csv';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { bets, initialized, openForm, importBets } = useBetsContext();

  const stats       = useMemo(() => calcStats(bets),                    [bets]);
  const cumProfit   = useMemo(() => calcCumulativeProfit(bets),          [bets]);
  const distribution = useMemo(() => calcOutcomeDistribution(bets),     [bets]);
  const monthly     = useMemo(() => calcMonthlyStats(bets),              [bets]);

  const handleImport = () => {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const { bets: imported, errors } = await importFromCSV(file);
        if (imported.length > 0) importBets(imported);
        if (errors.length > 0) alert(`Importazione completata con ${errors.length} errore/i:\n${errors.join('\n')}`);
        else alert(`Importate ${imported.length} scommesse.`);
      } catch {
        alert('Errore durante l\'importazione del file.');
      }
    };
    input.click();
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roiSentiment = stats.roi > 0 ? 'positive' : stats.roi < 0 ? 'negative' : 'neutral';
  const profitSentiment = stats.totalNetProfit > 0 ? 'positive' : stats.totalNetProfit < 0 ? 'negative' : 'neutral';

  return (
    <div className="max-w-lg mx-auto pb-nav">
      <Header
        title="Metodino Bet"
        subtitle={`${stats.total} scommesse registrate`}
        right={
          <div className="flex gap-1.5">
            <button
              onClick={handleImport}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Importa CSV"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={() => exportToCSV(bets)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Esporta CSV"
              disabled={bets.length === 0}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="px-4 pt-4 flex flex-col gap-5">
        {/* Empty state */}
        {bets.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Nessuna scommessa</p>
              <p className="text-sm text-slate-400 mt-1">Aggiungi la tua prima scommessa per vedere le statistiche</p>
            </div>
            <Button onClick={() => openForm()}>+ Aggiungi scommessa</Button>
          </div>
        )}

        {bets.length > 0 && (
          <>
            {/* Profit / ROI highlight */}
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                label="Profitto netto"
                value={formatCurrency(stats.totalNetProfit)}
                icon={stats.totalNetProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                sentiment={profitSentiment}
                sub={`su ${stats.concluded} scommesse concluse`}
              />
              <KpiCard
                label="ROI"
                value={formatPercent(stats.roi)}
                icon={<Percent className="w-4 h-4" />}
                sentiment={roiSentiment}
                sub={`stake concluso: ${formatCurrencyPlain(stats.totalStakeConcluded)}`}
              />
            </div>

            {/* Win / Loss / Pending / Void counts */}
            <div className="grid grid-cols-4 gap-2">
              <CountTile label="Vinte"   value={stats.won}     color="text-emerald-400" bg="bg-emerald-500/10" />
              <CountTile label="Perse"   value={stats.lost}    color="text-rose-400"    bg="bg-rose-500/10" />
              <CountTile label="Pending" value={stats.pending} color="text-amber-400"   bg="bg-amber-500/10" />
              <CountTile label="Void"    value={stats.void}    color="text-slate-400"   bg="bg-slate-700/30" />
            </div>

            {/* Rates */}
            <div className="grid grid-cols-3 gap-3">
              <KpiCard label="Win Rate"     value={formatPercent(stats.winRate)}     icon={<Trophy className="w-4 h-4" />}   sentiment={stats.winRate > 50 ? 'positive' : 'neutral'} small />
              <KpiCard label="Loss Rate"    value={formatPercent(stats.lossRate)}    icon={<Target className="w-4 h-4" />}   sentiment={stats.lossRate > 50 ? 'negative' : 'neutral'} small />
              <KpiCard label="Pending"      value={formatPercent(stats.pendingRate)} icon={<Clock className="w-4 h-4" />}    sentiment="warning" small />
            </div>

            {/* Other KPIs */}
            <div className="grid grid-cols-2 gap-3">
              <KpiCard label="Stake totale"    value={formatCurrencyPlain(stats.totalStake)}  icon={<DollarSign className="w-4 h-4" />} sentiment="neutral" />
              <KpiCard label="Quota media"     value={formatOdds(stats.avgOdds)}               icon={<BarChart3 className="w-4 h-4" />}  sentiment="info" />
              <KpiCard label="Profitto medio"  value={formatCurrency(stats.avgNetProfit)}       icon={<TrendingUp className="w-4 h-4" />} sentiment={stats.avgNetProfit >= 0 ? 'positive' : 'negative'} />
              {stats.bestOdds > 0 && (
                <KpiCard label="Miglior quota vinta" value={formatOdds(stats.bestOdds)} icon={<Trophy className="w-4 h-4" />} sentiment="positive" />
              )}
            </div>

            {/* Cumulative profit chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Andamento profitto</h2>
                <span className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-full',
                  stats.totalNetProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400',
                )}>
                  {formatCurrency(stats.totalNetProfit)}
                </span>
              </div>
              <ProfitChart data={cumProfit} />
            </div>

            {/* Outcome distribution chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-white mb-1">Distribuzione esiti</h2>
              <OutcomeChart data={distribution} total={stats.total} />
            </div>

            {/* Monthly breakdown */}
            {monthly.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h2 className="text-sm font-semibold text-white mb-3">Statistiche mensili</h2>
                <div className="flex flex-col gap-2">
                  {monthly.map(m => (
                    <div key={m.label} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-sm text-white capitalize">{m.label}</span>
                        <span className="text-xs text-slate-500">{m.won}V  {m.lost}P · stake {formatCurrencyPlain(m.stake)}</span>
                      </div>
                      <span className={cn('text-sm font-bold', m.profit >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                        {m.profit >= 0 ? '+' : ''}{formatCurrencyPlain(m.profit)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refresh / clear hint */}
            <div className="flex items-center gap-2 text-xs text-slate-600 justify-center pb-2">
              <RefreshCw className="w-3 h-3" />
              <span>Dati salvati in locale · aggiornati automaticamente</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CountTile({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className={cn('rounded-xl border border-slate-800 p-3 flex flex-col items-center gap-1', bg)}>
      <span className={cn('text-xl font-bold', color)}>{value}</span>
      <span className="text-[10px] text-slate-500 font-medium">{label}</span>
    </div>
  );
}
