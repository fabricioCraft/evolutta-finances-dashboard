// src/lib/supabaseServerClient.ts
import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Server-side Supabase client with cookie-based session for App Router
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  // Fallback robusto para ambientes onde cookieStore.get pode não estar disponível
  const readCookie = async (name: string): Promise<string | undefined> => {
    const getter: any = (cookieStore as any)?.get;
    if (typeof getter === 'function') {
      return getter.call(cookieStore, name)?.value;
    }
    try {
      const hdrs: any = await headers();
      const cookieHeader: string = typeof hdrs?.get === 'function' ? (hdrs.get('cookie') ?? '') : '';
      const parts = cookieHeader.split(';');
      for (const part of parts) {
        const [key, ...rest] = part.trim().split('=');
        if (key === name) {
          const raw = rest.join('=');
          try {
            return decodeURIComponent(raw);
          } catch {
            return raw;
          }
        }
      }
    } catch {}
    return undefined;
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  return createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        get(name: string) {
          // readCookie agora é assíncrono; como o SSR do Supabase espera sync,
          // preferimos usar o cookieStore resolvido diretamente aqui
          try {
            return (cookieStore as any)?.get?.(name)?.value;
          } catch {}
          return undefined;
        },
        set(name: string, value: string, options: any) {
          // Em Route Handlers e Server Actions, cookies() permite escrita
          const setter: any = (cookieStore as any)?.set;
          if (typeof setter === 'function') {
            try {
              setter.call(cookieStore, name, value, options);
            } catch {}
          }
        },
        remove(name: string, options: any) {
          const deleter: any = (cookieStore as any)?.delete;
          if (typeof deleter === 'function') {
            try {
              deleter.call(cookieStore, name, options);
            } catch {}
          }
        },
      },
    }
  );
};