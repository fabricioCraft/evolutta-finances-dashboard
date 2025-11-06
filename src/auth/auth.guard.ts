import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

@Injectable()
export class AuthGuard implements CanActivate {
  private supabaseClient?: any;

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  // Método para injetar o supabaseClient para testes
  setSupabaseClient(client: any) {
    this.supabaseClient = client;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    // Dividir a string do cabeçalho authorization pelo espaço
    const authParts = authorizationHeader.split(' ');

    // Verificar se o array não tem exatamente 2 partes ou se a primeira parte não é 'Bearer'
    if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid token format');
    }

    // Extrair o token
    const token = authParts[1];

    // Usar o supabaseClient se fornecido (para testes), senão usar o supabase injetado
    const client = this.supabaseClient || this.supabase;

    try {
      // Validar o token usando o Supabase
      const { data, error } = await client.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Anexar o usuário ao objeto request para uso posterior
      request.user = data.user;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
