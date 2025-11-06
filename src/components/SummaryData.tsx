// @ts-nocheck
// src/components/SummaryData.tsx 
import { getMonthlySummary } from "../services/api"; 
import StatCard from "./StatCard"; 
import { ArrowUpRight, ArrowDownLeft, Scale } from 'lucide-react'; 

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); 

export default async function SummaryData() { 
  try { 
    const summary = await getMonthlySummary(); 
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