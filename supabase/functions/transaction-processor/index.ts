// Edge Function: transaction-processor
// Processa transações da tabela RawTransactions, aplica limpeza e categorização,
// e insere na tabela Transaction com ID gerado automaticamente usando CUID2

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createId } from 'https://esm.sh/@paralleldrive/cuid2@2.2.2'

// Tipos para as estruturas de dados
interface RawTransaction {
  id: number
  belvo_id: string
  amount: number
  raw_description: string | null
  transaction_date: string
  type: string
  account_id: string | null
  raw_payload: any
  created_at: string
  status: string
  user_id: string
}

interface CategorizationRule {
  id: string
  keyword: string
  categoryId: string
  normalizedDescription: string | null
}

interface Category {
  id: string
  name: string
  color: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface ProcessedTransaction {
  id: string // ID gerado automaticamente com CUID
  description: string
  cleanedDescription: string | null
  amount: number
  categoryId: string
  date: string
  createdAt: string
  updatedAt: string
  userId: string
}

// Configuração do ambiente
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

console.log('🔧 Configuração da Edge Function:')
console.log('- SUPABASE_URL:', supabaseUrl ? 'Configurado' : 'NÃO CONFIGURADO')
console.log('- SERVICE_KEY:', supabaseServiceKey ? 'Configurado' : 'NÃO CONFIGURADO')

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  try {
    console.log('🚀 Edge Function transaction-processor iniciada')
    console.log('📥 Método da requisição:', req.method)
    console.log('📥 Headers da requisição:', Object.fromEntries(req.headers.entries()))

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Verificar se é uma requisição POST
    if (req.method !== 'POST') {
      console.log('❌ Método não permitido:', req.method)
      return new Response(
        JSON.stringify({ error: 'Método não permitido. Use POST.' }),
        { 
          status: 405, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }

    // Ler o payload da requisição
    const payload = await req.json()
    console.log('📦 Payload recebido:', JSON.stringify(payload, null, 2))

    // Extrair o record do payload do gatilho do Supabase
    const record = payload.record
    if (!record) {
      console.log('❌ Nenhum record encontrado no payload')
      return new Response(
        JSON.stringify({ error: 'Nenhum record encontrado no payload' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      )
    }

    console.log('📋 Record extraído:', JSON.stringify(record, null, 2))

    // Inicializar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('✅ Cliente Supabase inicializado')

    // Processar a transação
    const result = await processTransaction(supabase, record)
    
    console.log('✅ Transação processada com sucesso:', result)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Transação processada com sucesso',
        result 
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )

  } catch (error) {
    console.error('💥 Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message,
        stack: error.stack 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})

async function processTransaction(supabase: any, rawTransaction: RawTransaction) {
  console.log('🔄 Iniciando processamento da transação:', rawTransaction.belvo_id)

  try {
    // 1. Verificar se a transação já foi processada
    console.log('🔍 Verificando se a transação já foi processada...')
    const { data: existingTransaction, error: checkError } = await supabase
      .from('Transaction')
      .select('id')
      .eq('description', rawTransaction.raw_description || `Transação ${rawTransaction.belvo_id}`)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar transação existente:', checkError)
      throw new Error(`Erro ao verificar transação existente: ${checkError.message}`)
    }

    if (existingTransaction) {
      console.log('⚠️ Transação já processada, pulando:', existingTransaction.id)
      return { 
        action: 'skipped', 
        reason: 'Transação já processada',
        transactionId: existingTransaction.id 
      }
    }

    // 2. Limpar a descrição da transação
    console.log('🧹 Limpando descrição da transação...')
    const cleanedDescription = cleanDescription(rawTransaction.raw_description || '')
    console.log('📝 Descrição original:', rawTransaction.raw_description)
    console.log('✨ Descrição limpa:', cleanedDescription)

    // 3. Buscar regras de categorização
    console.log('📋 Buscando regras de categorização...')
    const { data: rules, error: rulesError } = await supabase
      .from('CategorizationRule')
      .select(`
        id,
        keyword,
        categoryId,
        normalizedDescription
      `)

    if (rulesError) {
      console.error('❌ Erro ao buscar regras de categorização:', rulesError)
      throw new Error(`Erro ao buscar regras: ${rulesError.message}`)
    }

    console.log(`📊 ${rules?.length || 0} regras de categorização encontradas`)

    // 4. Aplicar categorização
    console.log('🎯 Aplicando categorização...')
    const categorizationResult = await categorizeTransaction(supabase, cleanedDescription, rules || [])
    console.log('🏷️ Categoria determinada:', categorizationResult.categoryId)
    console.log('📝 Descrição final:', categorizationResult.finalCleanedDescription)

    // 5. Gerar ID único usando CUID2
    const transactionId = createId()
    console.log('🆔 ID gerado para a transação:', transactionId)

    // 6. Preparar dados da transação processada
    const now = new Date().toISOString()
    const processedTransaction: ProcessedTransaction = {
      id: transactionId, // ID gerado automaticamente
      description: rawTransaction.raw_description || `Transação ${rawTransaction.belvo_id}`,
      cleanedDescription: categorizationResult.finalCleanedDescription,
      amount: rawTransaction.amount,
      categoryId: categorizationResult.categoryId,
      date: rawTransaction.transaction_date,
      createdAt: now,
      updatedAt: now,
      userId: rawTransaction.user_id // Usa o user_id da RawTransaction
    }

    console.log('💾 Dados da transação processada:', JSON.stringify(processedTransaction, null, 2))

    // 7. Inserir na tabela Transaction
    console.log('💾 Inserindo transação processada na tabela Transaction...')
    const { data: insertedTransaction, error: insertError } = await supabase
      .from('Transaction')
      .insert(processedTransaction)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao inserir transação:', insertError)
      throw new Error(`Erro ao inserir transação: ${insertError.message}`)
    }

    console.log('✅ Transação inserida com sucesso:', insertedTransaction.id)

    // 8. Atualizar status da RawTransaction para PROCESSED
    console.log('🔄 Atualizando status da RawTransaction...')
    const { error: updateError } = await supabase
      .from('RawTransactions')
      .update({ status: 'PROCESSED' })
      .eq('id', rawTransaction.id)

    if (updateError) {
      console.error('⚠️ Erro ao atualizar status da RawTransaction:', updateError)
      // Não falhar o processo por causa disso
    } else {
      console.log('✅ Status da RawTransaction atualizado para PROCESSED')
    }

    return {
      action: 'processed',
      transactionId: insertedTransaction.id,
      originalDescription: rawTransaction.raw_description,
      cleanedDescription: categorizationResult.finalCleanedDescription,
      categoryId: categorizationResult.categoryId,
      amount: rawTransaction.amount
    }

  } catch (error) {
    console.error('💥 Erro no processamento da transação:', error)
    
    // Atualizar status para ERROR em caso de falha
    try {
      await supabase
        .from('RawTransactions')
        .update({ status: 'ERROR' })
        .eq('id', rawTransaction.id)
      console.log('⚠️ Status da RawTransaction atualizado para ERROR')
    } catch (updateError) {
      console.error('❌ Erro ao atualizar status para ERROR:', updateError)
    }
    
    throw error
  }
}

function cleanDescription(description: string): string {
  console.log('🧹 Iniciando limpeza da descrição:', description)
  
  if (!description || description.trim() === '') {
    console.log('⚠️ Descrição vazia, retornando string vazia')
    return ''
  }

  let cleaned = description.trim()
  
  // Remover apenas caracteres especiais específicos, mantendo letras e espaços
  cleaned = cleaned.replace(/[*#@$%&+=\[\]{}|\\:";'<>?,./]/g, ' ')
  
  // Remover sequências de números muito longos (8+ dígitos, provavelmente IDs)
  cleaned = cleaned.replace(/\b\d{8,}\b/g, ' ')
  
  // Remover códigos alfanuméricos muito específicos (mantendo palavras normais)
  cleaned = cleaned.replace(/\b[A-Z]{3,}[0-9]{3,}\b/g, ' ')
  cleaned = cleaned.replace(/\b[0-9]{3,}[A-Z]{3,}\b/g, ' ')
  
  // Remover múltiplos espaços
  cleaned = cleaned.replace(/\s+/g, ' ')
  
  // Converter para minúsculas para padronização
  cleaned = cleaned.toLowerCase().trim()
  
  console.log('✨ Descrição limpa:', cleaned)
  return cleaned
}

async function categorizeTransaction(
  supabase: any, 
  cleanedDescription: string, 
  rules: CategorizationRule[]
): Promise<{ categoryId: string; finalCleanedDescription: string }> {
  console.log('🎯 Iniciando categorização para:', cleanedDescription)
  console.log(`📋 Avaliando ${rules.length} regras`)

  // Buscar categoria padrão
  console.log('🔍 Buscando categoria padrão...')
  const { data: defaultCategory, error: defaultError } = await supabase
    .from('Category')
    .select('id')
    .eq('name', 'Outros')
    .single()

  if (defaultError) {
    console.error('❌ Erro ao buscar categoria padrão:', defaultError)
    // Se não encontrar "Outros", buscar qualquer categoria
    const { data: anyCategory, error: anyError } = await supabase
      .from('Category')
      .select('id')
      .limit(1)
      .single()
    
    if (anyError) {
      console.error('❌ Erro ao buscar qualquer categoria:', anyError)
      throw new Error('Nenhuma categoria encontrada no sistema')
    }
    
    console.log('⚠️ Usando primeira categoria disponível como padrão:', anyCategory.id)
    return { categoryId: anyCategory.id, finalCleanedDescription: cleanedDescription }
  }

  const defaultCategoryId = defaultCategory.id
  console.log('✅ Categoria padrão encontrada:', defaultCategoryId)

  // Aplicar regras de categorização por prioridade
  for (const rule of rules) {
    console.log(`🔍 Avaliando regra: ${rule.keyword}`)
    console.log(`📝 Keyword: "${rule.keyword}"`)
    
    const keyword = rule.keyword.toLowerCase()
    const description = cleanedDescription.toLowerCase()
    
    // Verifica se a descrição contém a keyword
    const matches = description.includes(keyword)
    
    console.log(`${matches ? '✅' : '❌'} Regra ${rule.keyword}: ${matches ? 'MATCH' : 'NO MATCH'}`)
    
    if (matches) {
      console.log(`🎯 Categoria determinada pela regra "${rule.keyword}": ${rule.categoryId}`)
      
      // Usar normalizedDescription se disponível, senão usar a descrição limpa original
      const finalDescription = rule.normalizedDescription || cleanedDescription
      console.log(`📝 Descrição final: ${finalDescription}`)
      
      return { categoryId: rule.categoryId, finalCleanedDescription: finalDescription }
    }
  }
  
  console.log(`🏷️ Nenhuma regra aplicável, usando categoria padrão: ${defaultCategoryId}`)
  return { categoryId: defaultCategoryId, finalCleanedDescription: cleanedDescription }
}

console.log('🚀 Edge Function transaction-processor carregada e pronta!')
