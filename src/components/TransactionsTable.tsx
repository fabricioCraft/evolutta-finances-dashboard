// src/components/TransactionsTable.tsx
// Renderiza tabela com transações recebidas do servidor (SSR) via props.
// Remove fetch no client para evitar falhas de autenticação e inconsistências.
import { useMemo } from 'react';

type Transaction = {
  id?: string;
  date?: string;
  description?: string;
  amount?: number;
  category?: string;
};

export default function TransactionsTable({ transactions = [] as Transaction[] }: { transactions?: Transaction[] }) {
  const items = useMemo(() => Array.isArray(transactions) ? transactions : [], [transactions]);

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Transações</h3>
      <table className="w-full text-sm text-gray-300">
        <thead>
          <tr className="text-left">
            <th className="py-2">Data</th>
            <th className="py-2">Descrição</th>
            <th className="py-2">Categoria</th>
            <th className="py-2 text-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t, idx) => (
            <tr key={t.id ?? idx} className="border-t border-dark-border">
              <td className="py-2">{t.date ?? '-'}</td>
              <td className="py-2">{t.description ?? '-'}</td>
              <td className="py-2">{(t as any).Category?.name ?? (t as any).category ?? '-'}</td>
              <td className="py-2 text-right">
                {typeof t.amount === 'number'
                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)
                  : '-'}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-500">
                Nenhuma transação encontrada
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}