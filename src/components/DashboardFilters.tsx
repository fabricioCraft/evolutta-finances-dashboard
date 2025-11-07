// src/components/DashboardFilters.tsx 
'use client'; 
import { CalendarDays } from 'lucide-react'; 

export default function DashboardFilters() { 
  // Lógica para o date picker virá aqui no futuro 
  return ( 
    <div className="flex items-center space-x-4"> 
      <button className="flex items-center px-4 py-2 bg-dark-card border border-dark-border text-gray-300 rounded-lg text-sm hover:border-brand-primary transition-all"> 
        <CalendarDays size={18} className="mr-2" /> 
        <span>Últimos 30 dias</span> 
      </button> 
      {/* Outros filtros podem ser adicionados aqui */} 
    </div> 
  ); 
}