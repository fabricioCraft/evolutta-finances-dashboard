import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      const dbUrl = process.env.DATABASE_URL || '';
      try {
        const parsed = new URL(dbUrl.replace('postgresql://', 'http://'));
        const host = parsed.hostname;
        const port = parsed.port;
        const dbName = parsed.pathname.replace('/', '') || 'unknown';
        console.log(`[Prisma] Conectado com sucesso em ${host}:${port}/${dbName}`);
      } catch {
        console.log('[Prisma] Conectado ao banco de dados com sucesso');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[Prisma] Falha ao conectar ao banco de dados na inicialização:', message);
      console.warn('[Prisma] Verifique se DATABASE_URL/DIRECT_URL estão configurados e se o Postgres está ativo.');
      // Não lançar erro aqui para permitir que o servidor suba e exiba mensagens amigáveis nas rotas.
    }
  }
}
