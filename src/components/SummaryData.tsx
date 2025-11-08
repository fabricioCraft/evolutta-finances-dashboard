// src/components/SummaryData.tsx 
import { getMonthlySummary, getTransactions } from "../services/api"; 
import StatCard from "./StatCard"; 
import { ArrowUpRight, ArrowDownLeft, Scale } from 'lucide-react'; 
import { createSupabaseServerClient } from "../lib/supabaseServerClient";

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); 

export default async function SummaryData({ startDate, endDate }: { startDate?: string; endDate?: string }) { 
  try { 
    // Obter sessão atual do Supabase no servidor
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Caso não haja sessão, exibir um estado amigável em vez de quebrar a página
    if (!session) {
      return (
        <div className="grid grid-cols-1">
          <div className="p-4 bg-dark-card border border-dark-border rounded-xl text-center text-gray-400">
            <p className="text-sm">Faça login para ver o resumo financeiro.</p>
          </div>
        </div>
      );
    }

    // Se houver intervalo selecionado, calcular o resumo estritamente dentro do período usando transações
    if (startDate || endDate) {
      const txs = await getTransactions(startDate, endDate, session.access_token);
      const revenues = txs.reduce((sum: number, t: any) => sum + (t.amount > 0 ? t.amount : 0), 0);
      const expenses = txs.reduce((sum: number, t: any) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);
      const balance = revenues - expenses;
      console.log('[SummaryData] range summary', { count: txs.length, revenues, expenses, balance, startDate, endDate });
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> 
          <StatCard title="Receitas" value={formatCurrency(revenues)} icon={<ArrowUpRight size={24} />} colorClass="text-accent-green" /> 
          <StatCard title="Despesas" value={formatCurrency(expenses)} icon={<ArrowDownLeft size={24} />} colorClass="text-accent-red" /> 
          <StatCard title="Saldo" value={formatCurrency(balance)} icon={<Scale size={24} />} colorClass="text-accent-blue" /> 
        </div>
      );
    }

    // Caso não haja intervalo, manter o resumo mensal padrão (mês atual)
    const summary = await getMonthlySummary(undefined, undefined, session.access_token);
    console.log('[SummaryData] monthly summary', summary);
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> 
        <StatCard title="Receitas" value={formatCurrency(summary.revenues ?? 0)} icon={<ArrowUpRight size={24} />} colorClass="text-accent-green" /> 
        <StatCard title="Despesas" value={formatCurrency(summary.expenses ?? 0)} icon={<ArrowDownLeft size={24} />} colorClass="text-accent-red" /> 
        <StatCard title="Saldo" value={formatCurrency(summary.balance ?? 0)} icon={<Scale size={24} />} colorClass="text-accent-blue" /> 
      </div> 
    ); 
  } catch (error: any) { 
    return ( 
      <div className="grid grid-cols-1"> 
        <div className="p-4 bg-dark-card border border-accent-red rounded-xl text-center text-red-400"> 
          <p className="font-semibold text-sm">Erro ao carregar o resumo financeiro.</p> 
        </div> 
      </div> 
    ); 
  } 
}