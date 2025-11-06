// src/components/ExpensesPieChart.tsx
// Componente simples para exibir dados agregados de despesas
import type { ReactElement } from 'react';

type PieData = { label: string; value: number }[];

export default function ExpensesPieChart({ data }: { data: PieData }): ReactElement {
  return (
    <div className="card-dark p-4 text-gray-300">
      <h3 className="text-lg font-semibold mb-3">Distribuição de Despesas</h3>
      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.label} className="flex items-center justify-between">
            <span className="text-sm">{item.label}</span>
            <span className="text-sm font-medium text-accent-red">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}