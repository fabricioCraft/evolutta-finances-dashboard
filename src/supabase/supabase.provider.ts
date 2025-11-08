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

    // Usar exclusivamente a chave de serviço do backend
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são variáveis de ambiente obrigatórias.',
      );
    }

    return createClient(supabaseUrl, supabaseServiceKey);
  },
};
