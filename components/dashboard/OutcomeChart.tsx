'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface OutcomeChartProps {
  data: { name: string; value: number; color: string }[];
  total: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <span style={{ color: payload[0].payload.color }} className="font-bold">{payload[0].name}</span>
      <span className="text-slate-300 ml-2">{payload[0].value}</span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomLegend({ payload }: any) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload?.map((entry: { color: string; value: string; payload: { value: number } }) => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          {entry.value} <span className="text-slate-500">({entry.payload.value})</span>
        </li>
      ))}
    </ul>
  );
}

export default function OutcomeChart({ data, total }: OutcomeChartProps) {
  if (data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-slate-500 text-sm">
        Nessuna scommessa registrata
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={45}
          outerRadius={70}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
