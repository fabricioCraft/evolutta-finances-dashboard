-- Script SQL para adicionar a coluna cleanedDescription à tabela Transaction
-- Execute este script no SQL Editor do painel do Supabase

-- Adicionar a coluna cleanedDescription à tabela Transaction
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "cleanedDescription" TEXT;

-- Verificar se a coluna foi adicionada com sucesso
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Transaction' 
AND column_name = 'cleanedDescription';

-- Comentário: Esta coluna será usada pela Edge Function transaction-processor
-- para armazenar a descrição limpa das transações para categorização automática