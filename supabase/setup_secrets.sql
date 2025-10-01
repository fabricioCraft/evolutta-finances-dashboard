-- =====================================================
-- CONFIGURAÇÃO DE SECRETS PARA O SUPABASE
-- =====================================================
-- Este arquivo contém os comandos necessários para configurar
-- os secrets utilizados pelas funções e triggers do projeto.

-- IMPORTANTE: Execute estes comandos no SQL Editor do Supabase
-- ou através do CLI após fazer deploy do projeto.

-- =====================================================
-- 1. CONFIGURAR SERVICE ROLE KEY
-- =====================================================
-- Substitua 'your-actual-service-role-key' pela sua Service Role Key real
-- Obtenha em: https://app.supabase.com/project/_/settings/api

-- ATENÇÃO: NÃO commite este arquivo com a chave real!
-- Use este comando apenas como referência.

/*
SELECT vault.create_secret(
    'SERVICE_ROLE_KEY', 
    'your-actual-service-role-key-here'
);
*/

-- =====================================================
-- 2. CONFIGURAR URL DO PROJETO SUPABASE
-- =====================================================
-- Configure a URL do seu projeto para uso nas funções

/*
SELECT vault.create_secret(
    'SUPABASE_URL', 
    'https://your-project-ref.supabase.co'
);
*/

-- =====================================================
-- 3. CONFIGURAR WEBHOOK SECRET DO BELVO
-- =====================================================
-- Configure a chave secreta para validação de webhooks do Belvo

/*
SELECT vault.create_secret(
    'WEBHOOK_SECRET_KEY', 
    'your-belvo-webhook-secret-key'
);
*/

-- =====================================================
-- 4. VERIFICAR SECRETS CONFIGURADOS
-- =====================================================
-- Use este comando para verificar quais secrets estão configurados
-- (não mostra os valores, apenas os nomes)

SELECT name, description, created_at 
FROM vault.secrets 
ORDER BY created_at DESC;

-- =====================================================
-- 5. CONFIGURAR VARIÁVEIS DE AMBIENTE PARA EDGE FUNCTIONS
-- =====================================================
-- Além dos secrets do vault, você também precisa configurar
-- as variáveis de ambiente para as Edge Functions no painel do Supabase:
--
-- 1. Acesse: https://app.supabase.com/project/_/settings/functions
-- 2. Adicione as seguintes variáveis:
--    - WEBHOOK_SECRET_KEY: sua chave secreta do Belvo
--    - PROJECT_URL: https://your-project-ref.supabase.co
--    - SERVICE_ROLE_KEY: sua service role key
--    - SUPABASE_URL: https://your-project-ref.supabase.co
--    - SUPABASE_SERVICE_ROLE_KEY: sua service role key

-- =====================================================
-- 6. CONFIGURAR SETTING PARA URL DO PROJETO
-- =====================================================
-- Configure a URL do projeto como um setting do PostgreSQL
-- para uso no trigger

/*
ALTER DATABASE postgres SET app.supabase_url = 'https://your-project-ref.supabase.co';
*/

-- Para desenvolvimento local:
/*
ALTER DATABASE postgres SET app.supabase_url = 'http://127.0.0.1:54321';
*/

-- =====================================================
-- 7. COMANDOS DE LIMPEZA (SE NECESSÁRIO)
-- =====================================================
-- Use estes comandos apenas se precisar remover secrets

/*
-- Remover um secret específico
SELECT vault.delete_secret('SERVICE_ROLE_KEY');

-- Listar todos os secrets (apenas nomes)
SELECT name FROM vault.secrets;
*/

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================
-- 1. Substitua todos os valores 'your-*' pelos valores reais
-- 2. Execute os comandos SELECT vault.create_secret() no SQL Editor
-- 3. Configure as variáveis de ambiente das Edge Functions
-- 4. Execute o comando ALTER DATABASE para configurar a URL
-- 5. Teste as funções para verificar se estão funcionando corretamente