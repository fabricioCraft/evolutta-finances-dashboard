// @ts-nocheck
// src/components/WidgetContainer.tsx 
import React from 'react';

interface WidgetContainerProps { 
  title: string; 
  children: React.ReactNode; 
  className?: string; 
} 

export default function WidgetContainer({ title, children, className = '' }: WidgetContainerProps) { 
  return ( 
    <div className={`bg-dark-card border border-dark-border rounded-xl p-6 ${className}`}> 
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3> 
      <div className="h-full"> 
        {children} 
      </div> 
    </div> 
  ); 
}