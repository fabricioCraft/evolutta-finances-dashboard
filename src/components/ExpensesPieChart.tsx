// @ts-nocheck
// src/components/ExpensesPieChart.tsx
'use client';
import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartData {
  name: string;
  value: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const fmtBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function ExpensesPieChart({ data }: { data: PieChartData[] }) {
  const total = useMemo(() => data.reduce((acc, entry) => acc + entry.value, 0), [data]);
  const dataWithPct = useMemo(() => data.map(d => ({ ...d, pct: total > 0 ? Math.round((d.value / total) * 1000) / 10 : 0 })), [data, total]);

  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const filtered = useMemo(() => dataWithPct.filter(d => !hidden[d.name]), [dataWithPct, hidden]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0];
    const name = p?.name ?? p?.payload?.name;
    const value = p?.value ?? p?.payload?.value ?? 0;
    const pct = p?.payload?.pct ?? 0;
    return (
      <div style={{ background: 'rgba(31, 41, 55, 0.9)', border: '1px solid #374151', padding: 8, borderRadius: 8 }}>
        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{name}</div>
        <div style={{ fontWeight: 'bold', color: '#fff' }}>{fmtBRL(value)} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({pct}%)</span></div>
      </div>
    );
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {payload.map((entry: any, idx: number) => {
          const name = entry?.value ?? entry?.payload?.name;
          const pct = entry?.payload?.pct ?? 0;
          const color = COLORS[idx % COLORS.length];
          const isHidden = !!hidden[name];
          return (
            <button
              key={`legend-${name}-${idx}`}
              className={`flex items-center gap-2 px-2 py-1 rounded-md border text-xs ${isHidden ? 'opacity-50 border-dark-border' : 'border-brand-primary/40'} hover:bg-white/5`}
              onClick={() => setHidden(prev => ({ ...prev, [name]: !prev[name] }))}
              aria-pressed={isHidden}
            >
              <span className="inline-block w-2 h-2 rounded" style={{ backgroundColor: color }} />
              <span className="text-gray-200">{name}</span>
              <span className="text-gray-400">{pct}%</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-[350px] overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={80}
            outerRadius={120}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            stroke="none"
            isAnimationActive={false}
          >
            {filtered.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                style={{ opacity: 0.95 }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#9CA3AF" fontSize="14px">
            Total
          </text>
          <text x="50%" y="50%" dy={20} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="20px" fontWeight="bold">
            {fmtBRL(total)}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}