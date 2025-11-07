'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Fallback para variáveis sem NEXT_PUBLIC_ em ambientes locais
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  const mock: any = {
    auth: {
      async signInWithPassword() {
        return {
          data: null,
          error: new Error(
            'Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY ou SUPABASE_URL/SUPABASE_ANON_KEY',
          ),
        };
      },
    },
  };
  supabase = mock as SupabaseClient;
}

export { supabase };