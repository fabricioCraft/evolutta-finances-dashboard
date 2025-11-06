// src/lib/supabaseServerClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client used in App Router server components
export function createSupabaseServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  // Create a client even if envs are missing; auth.getSession() will return null
  return createClient(url, anon, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}