'use client';
// src/components/LogoutButton.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Silencia erros de signOut para não quebrar a UI
      console.error('Erro ao sair:', err);
    } finally {
      setLoading(false);
      router.push('/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 font-medium text-white bg-dark-card border border-dark-border rounded-lg hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
    >
      {loading ? 'Saindo...' : 'Sair'}
    </button>
  );
}