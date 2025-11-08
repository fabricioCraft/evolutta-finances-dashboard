// @ts-nocheck
// src/components/DashboardContent.tsx
import { getTransactions } from "@/services/api";
import { processPieChartData } from "@/lib/chartUtils";
import ExpensesPieChart from "./ExpensesPieChart";
import TransactionsTable from "./TransactionsTable";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getCategories } from "@/services/api";

export default async function DashboardContent() {
  try {
    // Obter sessão atual do Supabase no servidor para autenticar chamadas ao backend
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-5 p-6 bg-dark-card border border-dark-border rounded-xl text-center text-gray-400">
            <p className="text-sm">Faça login para ver o conteúdo do dashboard.</p>
          </div>
        </div>
      );
    }

    const transactions = await getTransactions(undefined, undefined, session.access_token);
    const categories = await getCategories(session.access_token);
    const categoriesById = Object.fromEntries(categories.map((c: any) => [c.id, c.name]));
    const transactionsEnriched = Array.isArray(transactions)
      ? transactions.map((t: any) => ({
          ...t,
          category: t?.category ?? (t?.categoryId ? categoriesById[t.categoryId] : undefined),
        }))
      : [];
    const pieChartData = processPieChartData(transactionsEnriched, categoriesById);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
            {pieChartData.length > 0 ? (
              <ExpensesPieChart data={pieChartData.map((d) => ({ name: d.label, value: d.value }))} />
            ) : (
              <p className="text-center text-gray-500 py-16">Não há dados de despesas para exibir o gráfico.</p>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <TransactionsTable transactions={transactionsEnriched.slice(0, 10)} />
          <p className="text-center mt-4 text-sm text-gray-500">Exibindo as 10 transações mais recentes.</p>
        </div>
      </div>
    );
  } catch (error: any) {
    // Mantém a estrutura principal com um contêiner de erro integrado ao layout
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-5 p-6 bg-dark-card border border-accent-red rounded-xl text-center text-red-400">
          <p className="font-semibold">Erro ao carregar conteúdo do dashboard</p>
          <p className="text-sm">{error?.message}</p>
        </div>
      </div>
    );
  }
}