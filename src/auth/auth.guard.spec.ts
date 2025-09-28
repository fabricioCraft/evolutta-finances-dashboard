import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    // Mock do cliente Supabase
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabaseClient,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should deny access if no authorization header is present', async () => {
    // Simular um objeto de requisição sem o cabeçalho authorization
    const mockRequest = {
      headers: {},
    };

    // Criar o mock do ExecutionContext para retornar essa requisição
    const mockContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    };

    // Chamar guard.canActivate(mockContext) e esperar que ele lance UnauthorizedException
    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should deny access if the authorization header is not in the "Bearer [TOKEN]" format', async () => {
    // Simular um objeto de requisição com cabeçalho authorization em formato inválido
    const mockRequest = {
      headers: {
        authorization: 'InvalidTokenFormat', // Formato inválido - não é "Bearer [TOKEN]"
      },
    };

    // Criar o mock do ExecutionContext para retornar essa requisição
    const mockContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    };

    // Chamar guard.canActivate(mockContext) e esperar que ele lance UnauthorizedException
    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should deny access if the token is invalid or expired', async () => {
    // Configurar o mock para retornar erro
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid token')
    });

    // Simular um objeto de requisição com cabeçalho authorization válido mas token falso
    const mockRequest = {
      headers: {
        authorization: 'Bearer token_falso',
      },
    };

    // Criar o mock do ExecutionContext para retornar essa requisição
    const mockContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    };

    // Chamar guard.canActivate(mockContext) e esperar que ele lance UnauthorizedException
    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should grant access and attach the user to the request if the token is valid', async () => {
    // Mock do usuário válido
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com'
    };

    // Configurar o mock para retornar sucesso
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    // Simular um objeto de requisição com cabeçalho authorization válido
    const mockRequest = {
      headers: {
        authorization: 'Bearer valid_token_123',
      },
    };

    // Criar o mock do ExecutionContext para retornar essa requisição
    const mockContext: ExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    };

    // Chamar guard.canActivate(mockContext) e esperar que retorne true
    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);

    // Verificar se o usuário foi anexado ao objeto request
    expect(mockRequest).toHaveProperty('user');
    expect(mockRequest.user).toEqual(mockUser);

    // Verificar se o método getUser foi chamado com o token correto
    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith('valid_token_123');
  });
});