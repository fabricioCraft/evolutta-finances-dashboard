// src/app/(dashboard)/dashboard/page.tsx 
import { Suspense } from 'react'; 
import WidgetContainer from '@/components/WidgetContainer'; 
import SummaryData from '@/components/SummaryData'; 
import ChartData from '@/components/ChartData'; 
import TransactionsData from '@/components/TransactionsData'; 
import DashboardFilters from '@/components/DashboardFilters'; 

const SummarySkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
    <div className="h-28 bg-dark-card rounded-xl"></div>
    <div className="h-28 bg-dark-card rounded-xl"></div>
    <div className="h-28 bg-dark-card rounded-xl"></div>
  </div>
);

const ChartSkeleton = () => <div className="h-[350px] bg-dark-card/50 rounded-xl animate-pulse"></div>;
const TableSkeleton = () => <div className="h-[400px] bg-dark-card/50 rounded-xl animate-pulse"></div>;

export default function DashboardPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) { 
  return ( 
    <div className="container mx-auto p-6 md:p-8 space-y-8"> 
      {/* CABEÇALHO DA PÁGINA COM TÍTULO E FILTROS */} 
      <div className="flex flex-col md:flex-row md:items-center md:justify-between"> 
        <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Meu Dashboard</h1> 
        <DashboardFilters /> 
      </div> 

      {/* CARDS DE RESUMO */} 
      <div> 
        <Suspense fallback={<SummarySkeleton />}> 
          <SummaryData endDate={typeof searchParams?.endDate === 'string' ? searchParams!.endDate : undefined} /> 
        </Suspense> 
      </div> 

      {/* CONTEÚDO PRINCIPAL (GRÁFICOS E TABELA) */} 
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8"> 
        <div className="lg:col-span-3"> 
          <WidgetContainer title="Despesas por Categoria"> 
            <Suspense fallback={<ChartSkeleton />}> 
              <ChartData startDate={typeof searchParams?.startDate === 'string' ? searchParams!.startDate : undefined} endDate={typeof searchParams?.endDate === 'string' ? searchParams!.endDate : undefined} /> 
            </Suspense> 
          </WidgetContainer> 
        </div> 
        
        <div className="lg:col-span-2"> 
          <WidgetContainer title="Últimas Transações"> 
            <Suspense fallback={<TableSkeleton />}> 
              <TransactionsData startDate={typeof searchParams?.startDate === 'string' ? searchParams!.startDate : undefined} endDate={typeof searchParams?.endDate === 'string' ? searchParams!.endDate : undefined} /> 
            </Suspense> 
          </WidgetContainer> 
        </div> 
      </div> 
      
      {/* Futuramente: Outra linha de widgets com gráficos de linha, etc. */} 
    </div> 
  ); 
}