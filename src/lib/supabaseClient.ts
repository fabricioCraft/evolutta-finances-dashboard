// src/lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr';

// Cliente Supabase para uso em componentes Client no App Router
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);