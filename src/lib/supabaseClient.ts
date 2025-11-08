// src/lib/supabaseClient.ts
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

// Este é um cliente que só deve ser usado em Componentes de Cliente ('use client')
export const supabase = createPagesBrowserClient();