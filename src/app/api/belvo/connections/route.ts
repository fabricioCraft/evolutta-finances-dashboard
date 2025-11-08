import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || undefined;

    // Fallback: tentar obter token via cookies/supabase quando o header não veio
    let accessToken: string | undefined;
    if (!authHeader) {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getSession();
      accessToken = data.session?.access_token;
    }

    if (!authHeader && !accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${API_BASE_URL}/connections/connections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader || `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json({ error: text || 'Falha ao salvar conexão' }, { status: res.status });
    }

    // Sucesso
    return NextResponse.json({ ok: true, message: text || 'Conexão salva com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro inesperado' }, { status: 500 });
  }
}