// src/components/StatCard.tsx 
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  colorClass: string;
}

export default function StatCard({ title, value, icon, colorClass }: StatCardProps) {
  const neonColor = colorClass.includes('green')
    ? 'shadow-accent-green/30'
    : colorClass.includes('red')
    ? 'shadow-accent-red/30'
    : 'shadow-accent-blue/30';

  return (
    <div className={`bg-dark-card border border-dark-border rounded-xl p-6 transition-all duration-300 hover:border-brand-primary/50 hover:shadow-[0_0_20px_0] ${neonColor}`}> 
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