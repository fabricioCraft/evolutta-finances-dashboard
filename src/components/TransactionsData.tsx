// src/components/TransactionsData.tsx
import { getTransactions, getCategories } from "@/services/api";
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default async function TransactionsData({ startDate, endDate }: { startDate?: string; endDate?: string }) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return (
        <p className="text-center text-gray-500 h-full flex items-center justify-center">Faça login para ver suas transações.</p>
      );
    }

    const transactions = await getTransactions(startDate, endDate, session.access_token);
    let categoriesById: Record<string, string> = {};
    try {
      const categories = await getCategories(session.access_token);
      categoriesById = Object.fromEntries(categories.map((c: any) => [c.id, c.name]));
    } catch (e) {
      categoriesById = {};
    }

    if (transactions.length === 0) {
      return <p className="text-center text-gray-500 h-full flex items-center justify-center">Nenhuma transação encontrada neste período.</p>;
    }

    return (
      <div className="overflow-y-auto max-h-[400px] pr-2">
        <ul className="space-y-2">
          {transactions.map((t: any) => (
            <li key={t.id} className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-white/5">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-3 ${t.type === 'REVENUE' ? 'bg-green-900/50 text-accent-green' : 'bg-red-900/50 text-accent-red'}`}>
                  {t.type === 'REVENUE' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.cleanedDescription ?? t.description}</p>
                  <p className="text-xs text-gray-400">{t.Category?.name ?? categoriesById[t.categoryId] ?? t.category?.name ?? 'Sem Categoria'}</p> 
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${t.type === 'REVENUE' ? 'text-accent-green' : 'text-accent-red'}`}>
                  {t.type === 'REVENUE' ? '+' : '-'} {formatCurrency(Math.abs(t.amount))}
                </p>
                <p className="text-xs text-gray-500">{formatDate(t.date)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="text-center text-red-400 h-full flex items-center justify-center">
        <p className="font-semibold text-sm">Não foi possível carregar as transações.</p>
      </div>
    );
  }
}