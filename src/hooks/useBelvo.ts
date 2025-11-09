'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Session } from '@supabase/supabase-js'

export function useBelvo() {
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }
    getSession()
  }, [supabase.auth])

  const openWidget = async () => {
    setIsLoading(true)
    try {
      if (!session) {
        throw new Error('Usuário não autenticado. A sessão está sendo carregada ou expirou.')
      }

      const tokenResponse = await fetch('/api/belvo/connect-token', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text()
        console.error('Erro do Backend:', tokenResponse.status, errorBody)
        throw new Error('Falha ao obter o token do widget do backend.')
      }

      const { accessToken } = await tokenResponse.json()
      if (!accessToken) throw new Error('Não foi possível obter o token de acesso do widget.')

      const onSuccess = async (link: string, institution: string) => {
        await fetch('/api/belvo/connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ linkId: link, institution }),
        })
        router.refresh()
      }

      ;(window as any).belvo.createWidget(accessToken, {}).build({
        onSuccess,
        onExit: () => setIsLoading(false),
      })
    } catch (error: any) {
      console.error('Erro ao abrir o widget da Belvo:', error)
      alert(error.message)
      setIsLoading(false)
    }
  }
  return { openWidget, isLoading }
}