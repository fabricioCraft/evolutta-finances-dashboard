-- CreateRawTransactionsTable
-- Esta migração representa a tabela RawTransactions que já existe no banco
-- Criada para sincronizar o histórico de migrações com o estado atual do banco

CREATE TABLE IF NOT EXISTS "RawTransactions" (
    "id" SERIAL NOT NULL,
    "belvo_id" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "raw_description" TEXT,
    "transaction_date" TIMESTAMPTZ(6) NOT NULL,
    "type" TEXT NOT NULL,
    "account_id" TEXT,
    "raw_payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "RawTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RawTransactions_belvo_id_key" ON "RawTransactions"("belvo_id");