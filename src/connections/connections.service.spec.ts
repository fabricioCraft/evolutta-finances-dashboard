import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionsService } from './connections.service';

describe('ConnectionsService', () => {
  let service: ConnectionsService;
  let mockBelvoClient: any;

  beforeEach(async () => {
    // Mock do BelvoClient
    mockBelvoClient = {
      widgetToken: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionsService,
        {
          provide: 'BELVO_CLIENT',
          useValue: mockBelvoClient,
        },
      ],
    }).compile();

    service = module.get<ConnectionsService>(ConnectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a connect widget token', async () => {
    // Definir um userId de exemplo
    const userId = 'user-123';

    // Configurar o mock para retornar um objeto com a propriedade access
    const mockTokenResponse = { access: 'fake_access_token' };
    mockBelvoClient.widgetToken.create.mockResolvedValue(mockTokenResponse);

    // Chamar o método service.getConnectToken(userId)
    const result = await service.getConnectToken(userId);

    // Verificar que o método belvo.widgetToken.create() foi chamado
    expect(mockBelvoClient.widgetToken.create).toHaveBeenCalled();

    // Verificar que o resultado retornado é a string 'fake_access_token'
    expect(result).toBe('fake_access_token');
  });
});
