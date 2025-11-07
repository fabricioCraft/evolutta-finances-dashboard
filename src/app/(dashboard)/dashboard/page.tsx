// src/app/(dashboard)/dashboard/page.tsx 
import { Suspense } from 'react'; 
import WidgetContainer from '../../../components/WidgetContainer'; 
import SummaryData from '../../../components/SummaryData'; 
import ChartData from '../../../components/ChartData'; 

const SummarySkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
    <div className="h-28 bg-dark-card rounded-xl"></div>
    <div className="h-28 bg-dark-card rounded-xl"></div>
    <div className="h-28 bg-dark-card rounded-xl"></div>
  </div>
);

const ChartSkeleton = () => <div className="h-[350px] bg-dark-card/50 rounded-xl animate-pulse"></div>;

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Resumo Mensal</h1>
        <Suspense fallback={<SummarySkeleton />}>
          <SummaryData />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <WidgetContainer title="Despesas por Categoria">
            <Suspense fallback={<ChartSkeleton />}>
              <ChartData />
            </Suspense>
          </WidgetContainer>
        </div>

        <div className="lg:col-span-2">
          <WidgetContainer title="Últimas Transações">
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <p>A tabela de transações será implementada aqui.</p>
            </div>
          </WidgetContainer>
        </div>
      </div>
    </div>
  );
}