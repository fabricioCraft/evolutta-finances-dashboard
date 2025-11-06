// src/services/api.ts
// Funções de acesso à API do backend NestJS

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type SummaryResponse = {
  revenues: number;
  expenses: number;
  balance: number;
};

export async function getMonthlySummary(year?: number, month?: number): Promise<SummaryResponse> {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  const url = `${API_BASE_URL}/reports/monthly-summary?year=${y}&month=${m}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      // Se necessário, injete Authorization com token do Supabase
      ...(process.env.NEXT_PUBLIC_AUTH_TOKEN ? { Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}` } : {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Falha ao buscar resumo: ${res.status}`);
  }

  return res.json();
}

export async function getTransactions(startDate?: string, endDate?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const url = `${API_BASE_URL}/transactions${params.size ? `?${params.toString()}` : ''}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...(process.env.NEXT_PUBLIC_AUTH_TOKEN ? { Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}` } : {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Falha ao buscar transações: ${res.status}`);
  }

  return res.json();
}