'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

export function useBelvo() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const openWidget = async () => {
    setIsLoading(true);
    try {
      if (!session) {
        throw new Error('Usuário não autenticado. Faça o login novamente.');
      }

      const tokenResponse = await fetch('/api/belvo/connect-token', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        console.error('Erro do Backend:', tokenResponse.status, errorBody);
        throw new Error('Falha ao obter o token do widget do backend.');
      }
      const { accessToken } = await tokenResponse.json();
      if (!accessToken) throw new Error('Não foi possível obter o token de acesso do widget.');

      const onSuccess = async (link: string, institution: string) => {
        await fetch('/api/belvo/connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ linkId: link, institution }),
        });
        router.refresh();
      };

      (window as any).belvo.createWidget(accessToken, {}).build({
        onSuccess,
        onExit: () => setIsLoading(false),
      });
    } catch (error: any) {
      console.error('Erro ao abrir o widget da Belvo:', error);
      alert(error.message);
      setIsLoading(false);
    }
  };
  return { openWidget, isLoading };
}