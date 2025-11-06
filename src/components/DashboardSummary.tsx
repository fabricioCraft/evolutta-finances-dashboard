// @ts-nocheck
// src/components/DashboardSummary.tsx
import { getMonthlySummary } from "@/services/api";
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
    const summary = await getMonthlySummary();
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