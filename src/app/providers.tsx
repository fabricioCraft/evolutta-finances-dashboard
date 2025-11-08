// src/app/providers.tsx
'use client';

import { useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Cria uma única instância do cliente Supabase que será compartilhada
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={null} // A sessão será buscada e gerenciada automaticamente pelo provider
    >
      {children}
    </SessionContextProvider>
  );
}