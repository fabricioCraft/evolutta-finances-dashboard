import { Injectable, Inject, Logger } from '@nestjs/common';
import { Client as BelvoClient } from 'belvo';
import { BELVO_CLIENT } from '../belvo/belvo.provider';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ConnectionsService {
  private readonly logger = new Logger(ConnectionsService.name);

  constructor(
    @Inject(BELVO_CLIENT) private readonly belvo: BelvoClient,
    private readonly prisma: PrismaService,
  ) {}

  async getConnectToken(userId: string): Promise<string> {
    // Garantir autenticação antes de solicitar o token do widget
    if ((this.belvo as any).connect) {
      await (this.belvo as any).connect();
    }
    const response = await (this.belvo as any).widgetToken.create();
    return response.access;
  }

  async saveConnection(userId: string, linkId: string, institution: string) {
    // 1. Salvar o link Belvo
    const newLink = await this.prisma.belvoLink.create({
      data: {
        belvoLinkId: linkId,
        institution,
        accessMode: 'recurrent',
        status: 'valid',
        userId,
      },
    });

    // 2. Buscar contas pelo linkId via Belvo e salvar
    try {
      // Garantir conexão do client com Belvo
      // Alguns métodos do SDK Node fazem conexão lazily; aqui garantimos explicitamente
      if ((this.belvo as any).connect) {
        await (this.belvo as any).connect();
      }

      const accounts: any[] = await (this.belvo as any).accounts.retrieve(linkId);

      for (const account of accounts ?? []) {
        const balance = typeof account?.balance?.current === 'number'
          ? account.balance.current
          : parseFloat(String(account?.balance?.current ?? '0'));

        await this.prisma.account.upsert({
          where: { belvoAccountId: account.id },
          update: {
            name: account.name ?? account?.institution?.name ?? 'Conta',
            type: account.type ?? 'unknown',
            balance: Number.isFinite(balance) ? balance : 0,
            currency: account.currency ?? 'BRL',
            belvoLinkId: newLink.id,
          },
          create: {
            belvoAccountId: account.id,
            name: account.name ?? account?.institution?.name ?? 'Conta',
            type: account.type ?? 'unknown',
            balance: Number.isFinite(balance) ? balance : 0,
            currency: account.currency ?? 'BRL',
            belvoLinkId: newLink.id,
          },
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Falha ao recuperar/salvar contas Belvo para link ${linkId}: ${message}`);
    }

    return { success: true, link: newLink };
  }
}
