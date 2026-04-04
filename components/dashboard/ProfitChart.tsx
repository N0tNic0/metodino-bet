'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { CumulativeProfitPoint } from '@/types';
import { formatCurrencyPlain } from '@/lib/calculations';

interface ProfitChartProps {
  data: CumulativeProfitPoint[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as CumulativeProfitPoint;
  const profit = d.cumProfit;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{d.date}</p>
      <p className={profit >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
        {profit >= 0 ? '+' : ''}{formatCurrencyPlain(profit)}
      </p>
    </div>
  );
}

export default function ProfitChart({ data }: ProfitChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-slate-500 text-sm">
        Nessuna scommessa conclusa
      </div>
    );
  }

  const isPositive = data.length > 0 && data[data.length - 1].cumProfit >= 0;
  const color = isPositive ? '#10b981' : '#f43f5e';

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => (v === 0 ? '0' : `${v > 0 ? '+' : ''}${v}€`)}
        />
        <ReferenceLine y={0} stroke="#334155" strokeDasharray="4 4" />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="cumProfit"
          stroke={color}
          strokeWidth={2}
          fill="url(#profitGradient)"
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
