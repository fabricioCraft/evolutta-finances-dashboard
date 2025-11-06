// src/app/(auth)/register/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Placeholder: após registro, enviar para login
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Criar conta</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-dark-border px-3 py-2 text-gray-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-dark-border px-3 py-2 text-gray-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent-green hover:opacity-90 text-white py-2"
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-400">
          Já tem conta? <a href="/login" className="text-gray-200 underline">Entrar</a>
        </p>
      </div>
    </div>
  );
}