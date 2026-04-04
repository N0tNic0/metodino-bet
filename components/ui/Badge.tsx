import { BetStatus } from '@/types';
import { cn } from '@/lib/utils';

interface BadgeProps {
  status: BetStatus;
  className?: string;
}

const STATUS_CONFIG: Record<BetStatus, { label: string; className: string }> = {
  vinta:   { label: 'Vinta',   className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  persa:   { label: 'Persa',   className: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
  pending: { label: 'Pending', className: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  void:    { label: 'Void',    className: 'bg-slate-500/20 text-slate-400 border border-slate-500/30' },
};

export default function Badge({ status, className }: BadgeProps) {
  const { label, className: statusClass } = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide', statusClass, className)}>
      {label}
    </span>
  );
}

export function StatusDot({ status }: { status: BetStatus }) {
  const colors: Record<BetStatus, string> = {
    vinta:   'bg-emerald-400',
    persa:   'bg-rose-400',
    pending: 'bg-amber-400',
    void:    'bg-slate-400',
  };
  return <span className={cn('inline-block w-2 h-2 rounded-full', colors[status])} />;
}
