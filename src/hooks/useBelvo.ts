// src/hooks/useBelvo.ts
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export function useBelvo() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const openWidget = async () => {
    setIsLoading(true);

    try {
      // 1. Obter a sessão do usuário ATUAL para pegar o token de acesso
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado. Faça o login novamente.');
      }

      // 2. Pede o token de acesso para o nosso backend, ENVIANDO o token do usuário
      const tokenResponse = await fetch('/api/belvo/connect-token', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!tokenResponse.ok) {
        throw new Error('Falha ao obter o token do widget do backend.');
      }

      const { accessToken } = await tokenResponse.json();

      if (!accessToken) {
        throw new Error('Não foi possível obter o token de acesso do widget.');
      }

      // 3. Define a função de callback para quando a conexão for bem-sucedida
      const onSuccess = async (link: string, institution: string) => {
        // 4. Envia o linkId para o nosso backend para ser salvo
        await fetch('/api/belvo/connections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ linkId: link, institution: institution }),
        });

        // Recarrega a página para mostrar a nova conta conectada
        router.refresh();
      };

      // 5. Cria e abre o widget da Belvo
      (window as any).belvo
        .createWidget(accessToken, {
          // Você pode adicionar mais opções aqui se precisar
        })
        .build({
          onSuccess: onSuccess,
          onExit: () => setIsLoading(false),
        });
    } catch (error: any) {
      console.error('Erro ao abrir o widget da Belvo:', error);
      alert(error?.message || 'Erro ao abrir o widget da Belvo.');
      setIsLoading(false);
    }
  };

  return { openWidget, isLoading };
}