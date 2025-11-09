// src/app/providers.tsx
'use client'
import React from 'react'

// Provider mínimo para App Router, sem dependências removidas
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}