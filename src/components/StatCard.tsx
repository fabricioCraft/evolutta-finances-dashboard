// src/components/StatCard.tsx 
interface StatCardProps { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  colorClass: string; // ex: 'text-accent-green' 
} 

export default function StatCard({ title, value, icon, colorClass }: StatCardProps) { 
  return ( 
    <div className="bg-dark-card border border-dark-border rounded-xl p-6 transition-all duration-300 hover:border-brand-primary hover:scale-[1.02]"> 
      <div className="flex items-center justify-between"> 
        <div className="flex flex-col"> 
          <span className="text-gray-400 text-sm">{title}</span> 
          <span className="text-3xl font-bold text-white mt-1">{value}</span> 
        </div> 
        <div className={`p-3 rounded-lg bg-gray-900 ${colorClass}`}> 
          {icon} 
        </div> 
      </div> 
    </div> 
  ); 
}