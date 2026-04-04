'use client';

import { useMemo, useRef } from 'react';
import { Search, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import BetCard from '@/components/bets/BetCard';
import BetFiltersPanel from '@/components/bets/BetFilters';
import { useBetsContext } from '@/providers/BetsProvider';
import { useFilters } from '@/hooks/useFilters';
import { calcStats, formatCurrencyPlain } from '@/lib/calculations';
import { cn } from '@/lib/utils';

export default function BetsPage() {
  const { bets, initialized, openForm, openDelete } = useBetsContext();
  const { filters, filteredBets, updateFilter, resetFilters, activeFilterCount } = useFilters(bets);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredStats = useMemo(() => calcStats(filteredBets), [filteredBets]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-nav">
      <Header
        title="Scommesse"
        subtitle={`${filteredBets.length} di ${bets.length} scommesse`}
        right={
          <button
            onClick={() => openForm()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuova
          </button>
        }
      />

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Quick search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Cerca scommessa…"
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Filters */}
        <BetFiltersPanel
          filters={filters}
          activeFilterCount={activeFilterCount}
          onUpdate={updateFilter}
          onReset={resetFilters}
        />

        {/* Filtered summary bar */}
        {filteredBets.length > 0 && (
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-3 text-xs">
              <Chip color="emerald" label={`${filteredStats.won}V`} />
              <Chip color="rose"    label={`${filteredStats.lost}P`} />
              <Chip color="amber"   label={`${filteredStats.pending}⏳`} />
            </div>
            <span className={cn(
              'text-sm font-bold',
              filteredStats.totalNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400',
            )}>
              {filteredStats.totalNetProfit >= 0 ? '+' : ''}{formatCurrencyPlain(filteredStats.totalNetProfit)}
            </span>
          </div>
        )}

        {/* Bets list */}
        {filteredBets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            {bets.length === 0 ? (
              <>
                <p className="font-semibold text-white">Nessuna scommessa</p>
                <p className="text-sm text-slate-400">Premi il pulsante <strong>+</strong> per aggiungerne una</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-white">Nessun risultato</p>
                <p className="text-sm text-slate-400">Prova a modificare i filtri</p>
                <button
                  onClick={resetFilters}
                  className="text-xs text-violet-400 hover:text-violet-300 underline"
                >
                  Reset filtri
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredBets.map(bet => (
              <BetCard
                key={bet.id}
                bet={bet}
                onEdit={openForm}
                onDelete={openDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ color, label }: { color: 'emerald' | 'rose' | 'amber'; label: string }) {
  const styles = {
    emerald: 'text-emerald-400',
    rose:    'text-rose-400',
    amber:   'text-amber-400',
  };
  return <span className={cn('font-semibold', styles[color])}>{label}</span>;
}
