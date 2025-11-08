import { config } from 'dotenv';
// Garantir que valores do .env substituam variáveis de ambiente pré-existentes
config({ override: true });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Log básico para confirmar SUPABASE_URL efetivo (sem chaves)
  const effectiveSupabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log('[Boot] SUPABASE_URL =', effectiveSupabaseUrl);
  const supabaseServiceRoleKeyPresent = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('[Boot] SUPABASE_SERVICE_ROLE_KEY presente?', supabaseServiceRoleKeyPresent ? 'SIM' : 'NÃO');

  const app = await NestFactory.create(AppModule);

  // Enable CORS for cross-origin requests
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://localhost:3000',
      'https://127.0.0.1:3000',
      // Next.js dev default in this project
      'http://localhost:3333',
      'http://127.0.0.1:3333',
      'https://localhost:3333',
      'https://127.0.0.1:3333',
      // Additional Next.js dev ports used in this workspace
      'http://localhost:3334',
      'http://127.0.0.1:3334',
      'https://localhost:3334',
      'https://127.0.0.1:3334',
      'http://localhost:3335',
      'http://127.0.0.1:3335',
      'https://localhost:3335',
      'https://127.0.0.1:3335',
      // Add your production frontend URL here
      // 'https://your-frontend-domain.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}

bootstrap();