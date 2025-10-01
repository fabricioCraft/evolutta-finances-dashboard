-- AddCleanedDescriptionToTransaction
-- Adiciona a coluna cleanedDescription à tabela Transaction para armazenar
-- descrições limpas processadas pela Edge Function transaction-processor

ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "cleanedDescription" TEXT;