// @ts-nocheck
// src/components/DashboardSummary.tsx
import { getMonthlySummary } from "@/services/api";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import StatCard from "./StatCard";

// Ícones e helpers
const RevenueIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" />
); // Cole o SVG completo aqui
const ExpenseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" />
); // Cole o SVG completo aqui
const BalanceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" />
); // Cole o SVG completo aqui
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default async function DashboardSummary() {
  try {
    // Obter sessão atual do Supabase no servidor para autenticar chamadas ao backend
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Caso não haja sessão, exibir um estado amigável
    if (!session) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-3 p-4 bg-dark-card border border-dark-border rounded-xl text-center text-gray-400">
            <p className="text-sm">Faça login para ver o resumo financeiro.</p>
          </div>
        </div>
      );
    }

    const summary = await getMonthlySummary(undefined, undefined, session.access_token);
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Receitas" value={formatCurrency(summary.revenues ?? 0)} icon={<RevenueIcon />} />
        <StatCard title="Despesas" value={formatCurrency(summary.expenses ?? 0)} icon={<ExpenseIcon />} />
        <StatCard title="Saldo" value={formatCurrency(summary.balance ?? 0)} icon={<BalanceIcon />} />
      </div>
    );
  } catch (error: any) {
    // Mantém a estrutura dos cards com um contêiner de erro visual integrado
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-3 p-4 bg-dark-card border border-accent-red rounded-xl text-center text-red-400">
          <p className="font-semibold">Erro ao carregar resumo</p>
          <p className="text-sm">{error?.message}</p>
        </div>
      </div>
    );
  }
}