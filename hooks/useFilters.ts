'use client';

import { useState, useMemo } from 'react';
import { Bet, BetFilters } from '@/types';

export const DEFAULT_FILTERS: BetFilters = {
  status:    'all',
  dateFrom:  '',
  dateTo:    '',
  oddsMin:   '',
  oddsMax:   '',
  search:    '',
  sortBy:    'date',
  sortOrder: 'desc',
};

export function useFilters(bets: Bet[]) {
  const [filters, setFilters] = useState<BetFilters>(DEFAULT_FILTERS);

  const filteredBets = useMemo(() => {
    let result = [...bets];

    if (filters.status !== 'all')
      result = result.filter(b => b.status === filters.status);

    if (filters.dateFrom)
      result = result.filter(b => b.date >= filters.dateFrom);

    if (filters.dateTo)
      result = result.filter(b => b.date <= filters.dateTo);

    const oddsMin = parseFloat(filters.oddsMin);
    if (!isNaN(oddsMin))
      result = result.filter(b => b.odds >= oddsMin);

    const oddsMax = parseFloat(filters.oddsMax);
    if (!isNaN(oddsMax))
      result = result.filter(b => b.odds <= oddsMax);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(b =>
        b.description?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (filters.sortBy) {
        case 'date':      cmp = a.date.localeCompare(b.date); break;
        case 'odds':      cmp = a.odds - b.odds; break;
        case 'stake':     cmp = a.stake - b.stake; break;
        case 'netProfit': cmp = a.netProfit - b.netProfit; break;
      }
      return filters.sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [bets, filters]);

  const updateFilter = <K extends keyof BetFilters>(key: K, value: BetFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => DEFAULT_FILTERS[k as keyof BetFilters] !== v
  ).length;

  return { filters, filteredBets, updateFilter, resetFilters, activeFilterCount };
}
