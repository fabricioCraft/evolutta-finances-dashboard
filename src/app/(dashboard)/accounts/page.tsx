'use client';
import { CreditCard, Plus } from 'lucide-react';
import { useBelvo } from '@/hooks/useBelvo';

export default function AccountsPage() {
  const { openWidget, isLoading } = useBelvo();

  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Contas Conectadas</h1>
        <button
          onClick={openWidget}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all disabled:bg-gray-500"
        >
          <Plus size={18} className="mr-2" />
          {isLoading ? 'Carregando...' : 'Conectar Nova Conta'}
        </button>
      </div>

      {/* Aqui listaremos as contas já conectadas no futuro */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center">
        <CreditCard size={48} className="mx-auto text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-white">Nenhuma conta conectada</h3>
        <p className="text-gray-400 mt-2">Conecte sua primeira conta bancária para começar a sincronizar suas transações.</p>
      </div>
    </div>
  );
}