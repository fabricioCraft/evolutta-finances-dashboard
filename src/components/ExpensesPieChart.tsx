// @ts-nocheck
// src/components/ExpensesPieChart.tsx
'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartData {
  name: string;
  value: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ExpensesPieChart({ data }: { data: PieChartData[] }) {
  const total = data.reduce((acc, entry) => acc + entry.value, 0);

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer>
        <PieChart>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={80}
            outerRadius={120}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            nameKey="name"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: 'url(#glow)', opacity: 0.9 }} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
            contentStyle={{
              background: 'rgba(31, 41, 55, 0.8)',
              borderColor: '#374151',
              backdropFilter: 'blur(4px)'
            }}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#9CA3AF" fontSize="16px">
            Total
          </text>
          <text x="50%" y="50%" dy={24} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="24px" fontWeight="bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}