// src/services/api.ts
// Funções de acesso à API do backend NestJS

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type SummaryResponse = {
  revenues: number;
  expenses: number;
  balance: number;
};

// Permite injetar token de autorização explicitamente, evitando depender de variáveis públicas
export async function getMonthlySummary(year?: number, month?: number, authToken?: string): Promise<SummaryResponse> {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  const url = `${API_BASE_URL}/reports/monthly-summary?year=${y}&month=${m}`;
  console.log('[API] GET monthly-summary', { url, API_BASE_URL, hasAuthToken: !!authToken });

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      // Preferir token passado por parâmetro; fallback para variável pública se existir
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(!authToken && process.env.NEXT_PUBLIC_AUTH_TOKEN ? { Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}` } : {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Falha ao buscar resumo: ${res.status}`);
  }

  const data: unknown = await res.json();
  console.log('[API] monthly-summary response', data);
  return data as SummaryResponse;
}

// Permite injetar token de autorização explicitamente
export async function getTransactions(startDate?: string, endDate?: string, authToken?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const url = `${API_BASE_URL}/transactions${params.size ? `?${params.toString()}` : ''}`;
  console.log('[API] GET transactions', { url, API_BASE_URL, hasAuthToken: !!authToken });

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(!authToken && process.env.NEXT_PUBLIC_AUTH_TOKEN ? { Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}` } : {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Falha ao buscar transações: ${res.status}`);
  }

  const data: unknown = await res.json();
  console.log('[API] transactions response count', Array.isArray(data) ? data.length : 'N/A');
  return Array.isArray(data) ? (data as any[]) : [];
}