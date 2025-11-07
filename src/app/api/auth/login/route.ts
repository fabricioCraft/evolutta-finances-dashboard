// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabaseServerClient';

type LoginBody = { email: string; password: string };

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as Partial<LoginBody>;
    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Garantir que os cookies de sessão estejam setados na resposta
    const sessionRes = await supabase.auth.getSession();
    const session = sessionRes.data.session;
    if (!session) {
      return NextResponse.json({ error: 'Sessão não criada.' }, { status: 401 });
    }

    const response = NextResponse.json({ user: data.user ?? null }, { status: 200 });
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      let projectRef: string | null = null;
      try {
        const u = new URL(supabaseUrl);
        const host = u.hostname; // e.g. abcd.supabase.co
        projectRef = host.split('.')[0] || null;
      } catch {}

      // Setar cookies de acesso e refresh com configurações seguras
      response.cookies.set('sb-access-token', session.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      });
      if (session.refresh_token) {
        response.cookies.set('sb-refresh-token', session.refresh_token, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        });
      }

      // Também setar cookies namespaced pelo project-ref (formato usado pelo @supabase/ssr)
      if (projectRef) {
        response.cookies.set(`sb-${projectRef}-access-token`, session.access_token, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        });
        if (session.refresh_token) {
          response.cookies.set(`sb-${projectRef}-refresh-token`, session.refresh_token, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
          });
        }
      }
    } catch {}

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}