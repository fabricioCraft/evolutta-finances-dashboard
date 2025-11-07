// src/components/ChartData.tsx 
import { getTransactions } from "../services/api"; 
import { processPieChartData } from "../lib/chartUtils"; 
import ExpensesPieChart from "./ExpensesPieChart"; 
import { createSupabaseServerClient } from "../lib/supabaseServerClient";

export default async function ChartData() { 
  try { 
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return (
        <p className="text-center text-gray-500 h-full flex items-center justify-center">Faça login para ver o gráfico de despesas.</p>
      );
    }

    const transactions = await getTransactions(undefined, undefined, session.access_token); 
    const pieChartData = processPieChartData(transactions); 

    if (pieChartData.length === 0) { 
      return <p className="text-center text-gray-500 h-full flex items-center justify-center">Não há dados de despesas para exibir o gráfico.</p>; 
    } 
    
    return <ExpensesPieChart data={pieChartData} />; 
  } catch (error: any) { 
    return ( 
      <div className="text-center text-red-400 h-full flex items-center justify-center"> 
        <p className="font-semibold text-sm">Não foi possível carregar os dados do gráfico.</p> 
      </div> 
    ); 
  } 
}