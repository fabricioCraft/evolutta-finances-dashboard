-- =====================================================
-- TABELAS PARA INTEGRAÇÃO COM BELVO
-- =====================================================
-- Este arquivo cria as tabelas necessárias para armazenar
-- dados recebidos dos webhooks do Belvo

-- =====================================================
-- 1. TABELA DE LOGS DE WEBHOOKS
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_type VARCHAR(50) NOT NULL,
    webhook_code VARCHAR(50),
    payload JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_type ON webhook_logs(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_at ON webhook_logs(processed_at);

-- =====================================================
-- 2. TABELA DE CONTAS DO BELVO
-- =====================================================
CREATE TABLE IF NOT EXISTS belvo_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    belvo_id VARCHAR(255) UNIQUE NOT NULL,
    institution VARCHAR(255),
    account_type VARCHAR(100),
    account_number VARCHAR(255),
    balance DECIMAL(15,2),
    currency VARCHAR(10),
    name VARCHAR(255),
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_belvo_accounts_belvo_id ON belvo_accounts(belvo_id);
CREATE INDEX IF NOT EXISTS idx_belvo_accounts_institution ON belvo_accounts(institution);

-- =====================================================
-- 3. TABELA DE LINKS DO BELVO
-- =====================================================
CREATE TABLE IF NOT EXISTS belvo_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    belvo_id VARCHAR(255) UNIQUE NOT NULL,
    institution VARCHAR(255),
    status VARCHAR(50),
    created_by VARCHAR(255),
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_belvo_links_belvo_id ON belvo_links(belvo_id);
CREATE INDEX IF NOT EXISTS idx_belvo_links_status ON belvo_links(status);

-- =====================================================
-- 4. ADICIONAR COLUNAS À TABELA RAWTRANSACTIONS
-- =====================================================
-- Adicionar colunas para rastrear origem e ID externo
DO $$ 
BEGIN
    -- Adicionar coluna source se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'RawTransactions' 
        AND column_name = 'source'
    ) THEN
        ALTER TABLE "RawTransactions" 
        ADD COLUMN source VARCHAR(50) DEFAULT 'manual';
    END IF;

    -- Adicionar coluna external_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'RawTransactions' 
        AND column_name = 'external_id'
    ) THEN
        ALTER TABLE "RawTransactions" 
        ADD COLUMN external_id VARCHAR(255);
    END IF;
END $$;

-- Criar índice para external_id se não existir
CREATE INDEX IF NOT EXISTS idx_rawtransactions_external_id 
ON "RawTransactions"(external_id);

CREATE INDEX IF NOT EXISTS idx_rawtransactions_source 
ON "RawTransactions"(source);

-- =====================================================
-- 5. FUNÇÃO PARA ATUALIZAR TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 6. TRIGGERS PARA ATUALIZAR TIMESTAMP AUTOMATICAMENTE
-- =====================================================
-- Trigger para webhook_logs
DROP TRIGGER IF EXISTS update_webhook_logs_updated_at ON webhook_logs;
CREATE TRIGGER update_webhook_logs_updated_at
    BEFORE UPDATE ON webhook_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para belvo_accounts
DROP TRIGGER IF EXISTS update_belvo_accounts_updated_at ON belvo_accounts;
CREATE TRIGGER update_belvo_accounts_updated_at
    BEFORE UPDATE ON belvo_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para belvo_links
DROP TRIGGER IF EXISTS update_belvo_links_updated_at ON belvo_links;
CREATE TRIGGER update_belvo_links_updated_at
    BEFORE UPDATE ON belvo_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================
-- Habilitar RLS nas tabelas
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE belvo_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE belvo_links ENABLE ROW LEVEL SECURITY;

-- Política para service_role (acesso total)
CREATE POLICY "Service role can access all webhook_logs" ON webhook_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all belvo_accounts" ON belvo_accounts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all belvo_links" ON belvo_links
    FOR ALL USING (auth.role() = 'service_role');

-- Política para usuários autenticados (apenas leitura)
CREATE POLICY "Authenticated users can read webhook_logs" ON webhook_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read belvo_accounts" ON belvo_accounts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read belvo_links" ON belvo_links
    FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE webhook_logs IS 'Log de todos os webhooks recebidos do Belvo';
COMMENT ON TABLE belvo_accounts IS 'Contas bancárias sincronizadas do Belvo';
COMMENT ON TABLE belvo_links IS 'Links de conexão com instituições financeiras do Belvo';

COMMENT ON COLUMN webhook_logs.webhook_type IS 'Tipo do webhook (ACCOUNTS, TRANSACTIONS, LINKS, etc.)';
COMMENT ON COLUMN webhook_logs.status IS 'Status do processamento (pending, success, error)';
COMMENT ON COLUMN belvo_accounts.belvo_id IS 'ID único da conta no Belvo';
COMMENT ON COLUMN belvo_links.belvo_id IS 'ID único do link no Belvo';