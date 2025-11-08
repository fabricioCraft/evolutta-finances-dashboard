import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || undefined;

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

    // Chama o backend NestJS para gerar o token do widget
    const res = await fetch('http://localhost:4000/connections/connect-token', {
      method: 'POST',
      headers: {
        Authorization: authHeader || `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errTxt = await res.text();
      return NextResponse.json({ error: errTxt || 'Falha ao obter token' }, { status: res.status });
    }

    // O backend pode retornar uma string simples; normalizamos para { accessToken }
    let token: string | undefined;
    try {
      const json = await res.json();
      token = json?.accessToken ?? json?.access ?? json?.token ?? (typeof json === 'string' ? json : undefined);
    } catch {
      const txt = await res.text();
      token = txt?.replace(/^\"|\"$/g, '').replace(/^"|"$/g, '');
    }

    if (!token) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 500 });
    }

    return NextResponse.json({ accessToken: token });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro inesperado' }, { status: 500 });
  }
}