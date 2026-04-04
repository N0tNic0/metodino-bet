'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { BetFilters } from '@/types';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface BetFiltersProps {
  filters: BetFilters;
  activeFilterCount: number;
  onUpdate: <K extends keyof BetFilters>(key: K, value: BetFilters[K]) => void;
  onReset: () => void;
}

const STATUS_TABS: { value: BetFilters['status']; label: string }[] = [
  { value: 'all',     label: 'Tutte' },
  { value: 'vinta',   label: 'Vinte' },
  { value: 'persa',   label: 'Perse' },
  { value: 'pending', label: 'Pending' },
  { value: 'void',    label: 'Void' },
];

const SORT_OPTIONS = [
  { value: 'date',      label: 'Data' },
  { value: 'odds',      label: 'Quota' },
  { value: 'stake',     label: 'Stake' },
  { value: 'netProfit', label: 'Profitto' },
];

export default function BetFiltersPanel({ filters, activeFilterCount, onUpdate, onReset }: BetFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Status tabs + expand toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => onUpdate('status', tab.value)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                filters.status === tab.value
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setExpanded(v => !v)}
          className={cn(
            'flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors',
            activeFilterCount > 0
              ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-white',
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
          {/* Search */}
          <input
            type="text"
            placeholder="Cerca descrizione / categoria…"
            value={filters.search}
            onChange={e => onUpdate('search', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
          />

          {/* Date range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Dal</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => onUpdate('dateFrom', e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Al</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => onUpdate('dateTo', e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Odds range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Quota min</label>
              <input
                type="number"
                placeholder="1.00"
                min="1"
                step="0.05"
                value={filters.oddsMin}
                onChange={e => onUpdate('oddsMin', e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Quota max</label>
              <input
                type="number"
                placeholder="10.00"
                min="1"
                step="0.05"
                value={filters.oddsMax}
                onChange={e => onUpdate('oddsMax', e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Ordina per</label>
              <select
                value={filters.sortBy}
                onChange={e => onUpdate('sortBy', e.target.value as BetFilters['sortBy'])}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#1e293b' }}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Direzione</label>
              <button
                onClick={() => onUpdate('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
              >
                {filters.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>
          </div>

          {/* Reset */}
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset} className="self-end text-rose-400 hover:text-rose-300">
              <X className="w-3.5 h-3.5" />
              Reset filtri
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
