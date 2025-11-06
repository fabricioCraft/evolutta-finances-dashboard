import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { AuthGuard } from '../auth/auth.guard';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

// Tipo personalizado para User (compatível com Supabase Auth)
interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

describe('ConnectionsController', () => {
  let controller: ConnectionsController;
  let connectionsService: jest.Mocked<ConnectionsService>;

  const mockConnectionsService = {
    getConnectToken: jest.fn(),
  };

  beforeEach(async () => {
    // Criar mock do SupabaseClient
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionsController],
      providers: [
        {
          provide: ConnectionsService,
          useValue: mockConnectionsService,
        },
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabaseClient,
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<ConnectionsController>(ConnectionsController);
    connectionsService = module.get<ConnectionsService>(
      ConnectionsService,
    ) as jest.Mocked<ConnectionsService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConnectToken', () => {
    it('should return a connect token for the authenticated user', async () => {
      // Arrange
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      } as User;

      const mockToken = 'fake-belvo-connect-token-12345';

      // Configurar o mock do service.getConnectToken para retornar o token falso
      connectionsService.getConnectToken.mockResolvedValue(mockToken);

      // Act
      const result = await controller.getConnectToken(mockUser);

      // Assert
      expect(connectionsService.getConnectToken).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(connectionsService.getConnectToken).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockToken);
    });
  });
});
