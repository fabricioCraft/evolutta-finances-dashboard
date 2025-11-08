import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('[Prisma] Conectado ao banco de dados com sucesso');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[Prisma] Falha ao conectar ao banco de dados na inicialização:', message);
      console.warn('[Prisma] Verifique se DATABASE_URL/DIRECT_URL estão configurados e se o Postgres está ativo.');
      // Não lançar erro aqui para permitir que o servidor suba e exiba mensagens amigáveis nas rotas.
    }
  }
}
