import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

export const supabaseProvider = {
  provide: SUPABASE_CLIENT,
  useFactory: (): SupabaseClient => {
    // Preferir URL remota; evitar apontar para instância local acidentalmente
    const envUrl = process.env.SUPABASE_URL;
    const nextPublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseUrl =
      envUrl && envUrl !== 'http://127.0.0.1:54321'
        ? envUrl
        : nextPublicUrl || envUrl;

    // Permitir fallback para NEXT_PUBLIC_* quando necessário
    const supabaseKey =
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required',
      );
    }

    return createClient(supabaseUrl, supabaseKey);
  },
};
