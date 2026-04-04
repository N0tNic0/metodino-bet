import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Sentiment = 'positive' | 'negative' | 'neutral' | 'warning' | 'info';

interface KpiCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  sentiment?: Sentiment;
  sub?: string;
  small?: boolean;
}

const SENTIMENT_STYLES: Record<Sentiment, { card: string; icon: string; value: string }> = {
  positive: {
    card:  'border-emerald-500/20 bg-emerald-500/5',
    icon:  'text-emerald-400 bg-emerald-500/10',
    value: 'text-emerald-400',
  },
  negative: {
    card:  'border-rose-500/20 bg-rose-500/5',
    icon:  'text-rose-400 bg-rose-500/10',
    value: 'text-rose-400',
  },
  neutral: {
    card:  'border-slate-700/60',
    icon:  'text-slate-400 bg-slate-800',
    value: 'text-white',
  },
  warning: {
    card:  'border-amber-500/20 bg-amber-500/5',
    icon:  'text-amber-400 bg-amber-500/10',
    value: 'text-amber-400',
  },
  info: {
    card:  'border-violet-500/20 bg-violet-500/5',
    icon:  'text-violet-400 bg-violet-500/10',
    value: 'text-violet-400',
  },
};

export default function KpiCard({ label, value, icon, sentiment = 'neutral', sub, small }: KpiCardProps) {
  const s = SENTIMENT_STYLES[sentiment];
  return (
    <div className={cn('rounded-2xl border bg-slate-900 p-4 flex flex-col gap-2', s.card)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 leading-tight">{label}</span>
        {icon && (
          <span className={cn('flex items-center justify-center w-7 h-7 rounded-lg', s.icon)}>
            {icon}
          </span>
        )}
      </div>
      <span className={cn('font-bold leading-none', small ? 'text-xl' : 'text-2xl', s.value)}>
        {value}
      </span>
      {sub && <span className="text-xs text-slate-500 leading-tight">{sub}</span>}
    </div>
  );
}
