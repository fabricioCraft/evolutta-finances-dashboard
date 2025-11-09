import { Injectable, Inject, Logger, ServiceUnavailableException } from '@nestjs/common';
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
    // Verificar se credenciais da Belvo estão configuradas
    const secretId = process.env.BELVO_SECRET_ID;
    const secretPassword = process.env.BELVO_SECRET_PASSWORD;
    // Default para sandbox quando BELVO_API_URL não estiver presente
    const apiUrl = process.env.BELVO_API_URL || 'https://sandbox.belvo.com';
    const scopesEnv = (process.env.BELVO_WIDGET_SCOPES || '').trim();
    const scopes = scopesEnv || 'read_institutions,write_links,read_consents,write_consents,write_consent_callback,delete_consents';
    const fetchResourcesEnv = (process.env.BELVO_FETCH_RESOURCES || '').trim();
    const fetchResources = (fetchResourcesEnv || 'ACCOUNTS,TRANSACTIONS,OWNERS')
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);
    if (!secretId || !secretPassword) {
      this.logger.error('Belvo credentials not configured. Set BELVO_SECRET_ID and BELVO_SECRET_PASSWORD.');
      throw new ServiceUnavailableException('Belvo credentials missing. Configure BELVO_SECRET_ID/BELVO_SECRET_PASSWORD.');
    }

    // Garantir autenticação antes de solicitar o token do widget
    if ((this.belvo as any).connect) {
      await (this.belvo as any).connect();
    }
    try {
      const response = await (this.belvo as any).widgetToken.create?.();
      // Alguns ambientes retornam `token` ao invés de `access`
      const sdkToken = response?.access ?? response?.token ?? response;
      if (typeof sdkToken === 'string' && sdkToken.length > 0) {
        return sdkToken;
      }
      // Se o SDK não retornou um token válido, tenta via HTTP direto (recomendado pela documentação)
      return await this.createWidgetTokenViaHttp(apiUrl, secretId, secretPassword, scopes, fetchResources);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to create Belvo widget token for user ${userId}: ${message}`);
      // Tenta via HTTP como fallback em caso de erro do SDK
      try {
        return await this.createWidgetTokenViaHttp(apiUrl, secretId, secretPassword, scopes, fetchResources);
      } catch (httpErr) {
        const httpMsg = httpErr instanceof Error ? httpErr.message : String(httpErr);
        this.logger.error(`HTTP fallback failed to obtain Belvo widget token: ${httpMsg}`);
        throw new ServiceUnavailableException('Failed to obtain Belvo widget token. Check Belvo credentials, scopes, and connectivity.');
      }
    }
  }

  private async createWidgetTokenViaHttp(
    apiUrl: string,
    secretId: string,
    secretPassword: string,
    scopes: string,
    fetchResources: string[],
  ): Promise<string> {
    const tokenUrl = `${apiUrl.replace(/\/+$/, '')}/api/token/`;
    const basic = Buffer.from(`${secretId}:${secretPassword}`).toString('base64');
    const body = {
      // Conforme a documentação oficial, enviar apenas os scopes
      scopes,
    } as any;

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basic}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      this.logger.error(`Belvo /api/token/ responded with ${res.status}: ${errorText}`);
      throw new ServiceUnavailableException(`Belvo token API error (${res.status}).`);
    }

    let data: any;
    try {
      data = await res.json();
    } catch (e) {
      const txt = await res.text();
      data = txt;
    }

    const token = (data?.access ?? data?.token ?? (typeof data === 'string' ? data : undefined)) as string | undefined;
    if (!token || token.length === 0) {
      throw new ServiceUnavailableException('Belvo token API returned invalid token.');
    }
    return token;
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
