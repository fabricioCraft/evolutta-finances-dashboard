-- =====================================================
-- Script SQL para Gatilho da Edge Function transaction-processor
-- =====================================================
-- Este script cria um gatilho que automaticamente chama a Edge Function
-- transaction-processor sempre que uma nova linha for inserida na tabela RawTransactions
--
-- Pré-requisitos:
-- 1. A extensão http deve estar habilitada no Supabase
-- 2. A Edge Function transaction-processor deve estar deployada
-- 3. A tabela RawTransactions deve existir
--
-- Para executar este script:
-- 1. Acesse o SQL Editor no Supabase Dashboard
-- 2. Cole este script e execute
-- =====================================================

-- 1. Habilitar a extensão http (necessária para fazer requisições HTTP)
CREATE EXTENSION IF NOT EXISTS http;

-- 2. Criar a função que será executada pelo gatilho
CREATE OR REPLACE FUNCTION trigger_transaction_processor()
RETURNS TRIGGER AS $$
DECLARE
    function_url TEXT;
    jwt_token TEXT;
    payload JSON;
    response http_response;
BEGIN
    -- Configurar a URL da Edge Function usando variável de ambiente
    -- A URL será obtida das configurações do projeto
    SELECT current_setting('app.supabase_url', true) INTO function_url;
    IF function_url IS NULL OR function_url = '' THEN
        function_url := 'http://127.0.0.1:54321'; -- Fallback para desenvolvimento local
    END IF;
    function_url := function_url || '/functions/v1/transaction-processor';
    
    -- Obter o Service Role Key das configurações seguras
    -- IMPORTANTE: Configure a Service Role Key como um secret no Supabase
    -- Comando: SELECT vault.create_secret('SERVICE_ROLE_KEY', 'your-actual-service-role-key');
    BEGIN
        SELECT decrypted_secret INTO jwt_token 
        FROM vault.decrypted_secrets 
        WHERE name = 'SERVICE_ROLE_KEY';
    EXCEPTION
        WHEN OTHERS THEN
            -- Fallback para desenvolvimento local (use apenas em desenvolvimento!)
            jwt_token := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
            RAISE WARNING 'Using development JWT token. Configure SERVICE_ROLE_KEY secret for production!';
    END;
    
    -- Verificar se o token foi obtido
    IF jwt_token IS NULL OR jwt_token = '' THEN
        RAISE WARNING 'SERVICE_ROLE_KEY not found. Transaction processor will not be called for ID: %', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Criar o payload JSON com o ID da nova transação
    payload := json_build_object(
        'raw_transaction_id', NEW.id::text
    );
    
    -- Log da operação (opcional, para debug)
    RAISE NOTICE 'Calling transaction-processor for transaction ID: %', NEW.id;
    RAISE NOTICE 'Payload: %', payload;
    
    -- Fazer a requisição HTTP POST para a Edge Function
    SELECT * INTO response
    FROM http((
        'POST',
        function_url,
        ARRAY[
            http_header('Content-Type', 'application/json'),
            http_header('Authorization', 'Bearer ' || jwt_token)
        ],
        'application/json',
        payload::text
    ));
    
    -- Log da resposta (opcional, para debug)
    RAISE NOTICE 'HTTP Response Status: %', response.status;
    RAISE NOTICE 'HTTP Response Content: %', response.content;
    
    -- Verificar se a requisição foi bem-sucedida
    IF response.status >= 200 AND response.status < 300 THEN
        RAISE NOTICE 'Transaction processor called successfully for ID: %', NEW.id;
    ELSE
        -- Log do erro, mas não falha a transação original
        RAISE WARNING 'Failed to call transaction processor for ID: %. Status: %, Content: %', 
                     NEW.id, response.status, response.content;
    END IF;
    
    -- Retornar NEW para continuar com a inserção normal
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, log mas não falha a transação original
        RAISE WARNING 'Error calling transaction processor for ID: %. Error: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar o gatilho na tabela RawTransactions
DROP TRIGGER IF EXISTS trigger_process_raw_transaction ON "RawTransactions";

CREATE TRIGGER trigger_process_raw_transaction
    AFTER INSERT ON "RawTransactions"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_transaction_processor();

-- =====================================================
-- Comandos para gerenciar o gatilho (para referência)
-- =====================================================

-- Para desabilitar o gatilho:
-- ALTER TABLE "RawTransactions" DISABLE TRIGGER trigger_process_raw_transaction;

-- Para habilitar o gatilho:
-- ALTER TABLE "RawTransactions" ENABLE TRIGGER trigger_process_raw_transaction;

-- Para remover o gatilho:
-- DROP TRIGGER IF EXISTS trigger_process_raw_transaction ON "RawTransactions";

-- Para remover a função:
-- DROP FUNCTION IF EXISTS trigger_transaction_processor();

-- =====================================================
-- Script de teste (opcional)
-- =====================================================

-- Para testar o gatilho, você pode inserir uma transação de teste:
/*
INSERT INTO "RawTransactions" (
    raw_description,
    amount,
    date,
    user_id,
    raw_data
) VALUES (
    'TESTE PAGAMENTO PIX LOJA ABC',
    -50.00,
    NOW(),
    'test-user-id',
    '{"test": true}'::jsonb
);
*/

-- =====================================================
-- Configuração Avançada com Service Role Key
-- =====================================================

-- Versão alternativa usando Service Role Key armazenada como secret
-- (Requer configuração prévia do secret no Supabase)
/*
CREATE OR REPLACE FUNCTION trigger_transaction_processor_with_secret()
RETURNS TRIGGER AS $$
DECLARE
    function_url TEXT;
    service_role_key TEXT;
    payload JSON;
    response http_response;
BEGIN
    function_url := 'https://wmhlcwujduiorwuqauno.supabase.co/functions/v1/transaction-processor';
    
    -- Buscar a Service Role Key dos secrets do Supabase
    -- Primeiro você precisa configurar: 
    -- SELECT vault.create_secret('SERVICE_ROLE_KEY', 'your-actual-service-role-key');
    SELECT decrypted_secret INTO service_role_key 
    FROM vault.decrypted_secrets 
    WHERE name = 'SERVICE_ROLE_KEY';
    
    IF service_role_key IS NULL THEN
        RAISE WARNING 'SERVICE_ROLE_KEY not found in vault for transaction ID: %', NEW.id;
        RETURN NEW;
    END IF;
    
    payload := json_build_object('raw_transaction_id', NEW.id::text);
    
    SELECT * INTO response
    FROM http((
        'POST',
        function_url,
        ARRAY[
            http_header('Content-Type', 'application/json'),
            http_header('Authorization', 'Bearer ' || service_role_key)
        ],
        'application/json',
        payload::text
    ));
    
    IF response.status >= 200 AND response.status < 300 THEN
        RAISE NOTICE 'Transaction processor called successfully for ID: %', NEW.id;
    ELSE
        RAISE WARNING 'Failed to call transaction processor for ID: %. Status: %, Content: %', 
                     NEW.id, response.status, response.content;
    END IF;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error calling transaction processor for ID: %. Error: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;
*/

-- =====================================================
-- Notas Importantes
-- =====================================================
/*
1. SEGURANÇA:
   - Substitua o JWT token de exemplo por um token válido
   - Use a Service Role Key do seu projeto Supabase
   - Considere usar o vault do Supabase para armazenar secrets

2. URL DA FUNÇÃO:
   - Substitua 'wmhlcwujduiorwuqauno' pelo ID do seu projeto Supabase
   - Certifique-se de que a Edge Function está deployada

3. TRATAMENTO DE ERROS:
   - O gatilho não falha a inserção original em caso de erro
   - Erros são logados como WARNING para monitoramento

4. PERFORMANCE:
   - O gatilho faz uma requisição HTTP síncrona
   - Para alto volume, considere usar uma fila assíncrona

5. MONITORAMENTO:
   - Use os logs do Supabase para monitorar as execuções
   - Verifique os logs da Edge Function para debug
*/