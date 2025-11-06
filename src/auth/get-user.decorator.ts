import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Tipo personalizado para User (compatível com Supabase Auth)
interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
