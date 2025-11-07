// src/app/error.tsx
'use client';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen bg-dark-bg text-gray-300">
        <div className="container mx-auto p-6 md:p-8">
          <div className="p-6 bg-dark-card border border-accent-red rounded-xl">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Ocorreu um erro inesperado</h2>
            <p className="text-sm mb-4">{error?.message ?? 'Falha desconhecida. Tente novamente.'}</p>
            <div className="flex gap-3">
              <button
                onClick={() => reset()}
                className="px-4 py-2 font-medium text-white bg-brand-primary rounded-lg border border-dark-border hover:bg-brand-primary/80 transition"
              >
                Tentar novamente
              </button>
              <Link href="/login" className="px-4 py-2 font-medium text-white bg-dark-card rounded-lg border border-dark-border hover:bg-dark-card/80 transition">
                Voltar para Login
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}