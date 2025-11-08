// src/lib/chartUtils.ts
// Utilitários para transformar transações em dados de gráfico de pizza

type Transaction = {
  amount?: number;
  value?: number;
  categoryId?: string | null;
  category?: { name?: string | null } | null; // suporte a resposta antiga (minúsculo)
  Category?: { name?: string | null } | null; // suporte a Prisma relation (maiúsculo)
};

type PieDatum = { label: string; value: number };

export function processPieChartData(
  transactions: Transaction[] = [],
  categoriesById: Record<string, string> = {}
): PieDatum[] {
  const expensesOnly = transactions.filter((t) => {
    const amount = typeof t.amount === 'number' ? t.amount : (typeof t.value === 'number' ? t.value : 0);
    return amount < 0; // considera negativos como despesas
  });

  const aggregated: Record<string, number> = {};

  for (const t of expensesOnly) {
    const amount = Math.abs(typeof t.amount === 'number' ? t.amount : (typeof t.value === 'number' ? t.value : 0));
    const fromMap = t.categoryId ? categoriesById[t.categoryId] : undefined;
    const label = (fromMap ?? t.Category?.name ?? t.category?.name ?? 'Sem categoria') || 'Sem categoria';
    aggregated[label] = (aggregated[label] ?? 0) + amount;
  }

  return Object.entries(aggregated)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}