/// <reference path="./types.d.ts" />

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/*
 * Configure these environment variables in Supabase:
 * - WEBHOOK_SECRET_KEY: Your secret key for webhook validation
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key
 */

// Environment variables configuration
const WEBHOOK_SECRET_KEY = Deno.env.get('WEBHOOK_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('PROJECT_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');

// Validate required environment variables
if (!WEBHOOK_SECRET_KEY) {
  console.error('WEBHOOK_SECRET_KEY environment variable is required');
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

/**
 * Validates the webhook signature from Belvo
 */
async function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Belvo typically sends signature as "sha256=<hash>"
    const receivedSignature = signature.replace('sha256=', '');
    
    return expectedSignature === receivedSignature;
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
}

/**
 * Processes Belvo webhook data and stores it in the database
 */
async function processWebhookData(webhookData: any) {
  try {
    console.log('Processing webhook data:', JSON.stringify(webhookData, null, 2));

    // Extract relevant information from the webhook
    const { webhook_type, webhook_code, data } = webhookData;

    // Handle different types of webhooks
    switch (webhook_type) {
      case 'ACCOUNTS':
        await processAccountsWebhook(data);
        break;
      case 'TRANSACTIONS':
        await processTransactionsWebhook(data);
        break;
      case 'LINKS':
        await processLinksWebhook(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${webhook_type}`);
    }

    // Log the webhook event
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        webhook_type,
        webhook_code,
        payload: webhookData,
        processed_at: new Date().toISOString(),
        status: 'success'
      });

    if (logError) {
      console.error('Error logging webhook:', logError);
    }

  } catch (error) {
    console.error('Error processing webhook data:', error);
    
    // Log the error
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        webhook_type: webhookData?.webhook_type || 'unknown',
        webhook_code: webhookData?.webhook_code || 'unknown',
        payload: webhookData,
        processed_at: new Date().toISOString(),
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

    if (logError) {
      console.error('Error logging webhook error:', logError);
    }

    throw error;
  }
}

/**
 * Process accounts webhook data
 */
async function processAccountsWebhook(data: any[]) {
  console.log('Processing accounts webhook');
  
  for (const account of data) {
    const { error } = await supabase
      .from('belvo_accounts')
      .upsert({
        belvo_id: account.id,
        institution: account.institution?.name,
        account_type: account.type,
        account_number: account.number,
        balance: account.balance?.current,
        currency: account.currency,
        name: account.name,
        raw_data: account,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'belvo_id'
      });

    if (error) {
      console.error('Error upserting account:', error);
    }
  }
}

/**
 * Process transactions webhook data
 */
async function processTransactionsWebhook(data: any[]) {
  console.log('Processing transactions webhook');
  
  for (const transaction of data) {
    const { error } = await supabase
      .from('RawTransactions')
      .insert({
        raw_description: transaction.description,
        amount: parseFloat(transaction.amount),
        date: transaction.value_date || transaction.accounting_date,
        user_id: 'webhook-user', // You might want to map this to actual user
        raw_data: transaction,
        source: 'belvo_webhook',
        external_id: transaction.id
      });

    if (error && !error.message.includes('duplicate key')) {
      console.error('Error inserting transaction:', error);
    }
  }
}

/**
 * Process links webhook data
 */
async function processLinksWebhook(data: any[]) {
  console.log('Processing links webhook');
  
  for (const link of data) {
    const { error } = await supabase
      .from('belvo_links')
      .upsert({
        belvo_id: link.id,
        institution: link.institution,
        status: link.status,
        created_by: link.created_by,
        raw_data: link,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'belvo_id'
      });

    if (error) {
      console.error('Error upserting link:', error);
    }
  }
}

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-belvo-signature, x-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Get the raw body for signature validation
    const body = await req.text();
    
    // Get the signature from headers
    const signature = req.headers.get('x-belvo-signature') || req.headers.get('x-signature');
    
    if (!signature) {
      console.error('Missing webhook signature');
      return new Response(
        JSON.stringify({ error: 'Missing webhook signature' }),
        { 
          status: 401, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Validate webhook signature if secret is configured
    if (WEBHOOK_SECRET_KEY) {
      const isValidSignature = await validateWebhookSignature(body, signature, WEBHOOK_SECRET_KEY);
      
      if (!isValidSignature) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { 
            status: 401, 
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders
            } 
          }
        );
      }
    } else {
      console.warn('WEBHOOK_SECRET_KEY not configured - skipping signature validation');
    }

    // Parse the webhook data
    const webhookData = JSON.parse(body);
    
    // Process the webhook data
    await processWebhookData(webhookData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully' 
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    console.error('Error in belvo-webhook-handler function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/belvo-webhook-handler' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
