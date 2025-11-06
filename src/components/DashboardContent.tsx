// @ts-nocheck
// src/components/DashboardContent.tsx
import { getTransactions } from "@/services/api";
import { processPieChartData } from "@/lib/chartUtils";
import ExpensesPieChart from "./ExpensesPieChart";
import TransactionsTable from "./TransactionsTable";

export default async function DashboardContent() {
  try {
    const transactions = await getTransactions();
    const pieChartData = processPieChartData(transactions);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
            {pieChartData.length > 0 ? (
              <ExpensesPieChart data={pieChartData} />
            ) : (
              <p className="text-center text-gray-500 py-16">Não há dados de despesas para exibir o gráfico.</p>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <TransactionsTable transactions={transactions.slice(0, 10)} />
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