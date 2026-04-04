'use client';

import { Bet } from '@/types';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatOdds, formatDate } from '@/lib/calculations';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BetCardProps {
  bet: Bet;
  onEdit: (bet: Bet) => void;
  onDelete: (bet: Bet) => void;
}

const PROFIT_STYLE: Record<string, string> = {
  vinta:   'text-emerald-400',
  persa:   'text-rose-400',
  void:    'text-slate-400',
  pending: 'text-slate-500',
};

export default function BetCard({ bet, onEdit, onDelete }: BetCardProps) {
  const profitStyle = PROFIT_STYLE[bet.status];
  const showProfit  = bet.status !== 'pending';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 active:scale-[0.99] transition-transform">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {bet.description ? (
            <p className="text-sm font-medium text-white leading-snug truncate">{bet.description}</p>
          ) : (
            <p className="text-sm text-slate-500 italic">Senza descrizione</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-slate-500">{formatDate(bet.date)}</span>
            {bet.category && (
              <>
                <span className="text-slate-700">·</span>
                <span className="text-xs text-slate-500">{bet.category}</span>
              </>
            )}
            {bet.betType && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-400 text-[10px] font-medium border border-violet-500/20">
                {bet.betType}
              </span>
            )}
          </div>
        </div>
        <Badge status={bet.status} />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4">
        <Stat label="Quota" value={formatOdds(bet.odds)} />
        <div className="w-px h-8 bg-slate-800" />
        <Stat label="Stake" value={`€${bet.stake.toFixed(2)}`} />
        <div className="w-px h-8 bg-slate-800" />
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Profitto</span>
          <span className={cn('text-sm font-bold', profitStyle)}>
            {showProfit ? formatCurrency(bet.netProfit) : '—'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-800/60">
        <button
          onClick={() => onEdit(bet)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Modifica
        </button>
        <button
          onClick={() => onDelete(bet)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Elimina
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
