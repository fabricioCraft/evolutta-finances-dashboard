import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CategorizationService } from '../transaction-processing/categorization/categorization.service';
import { AuthGuard } from '../auth/auth.guard';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

// Tipo personalizado para User (compatível com Supabase Auth)
interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: jest.Mocked<TransactionsService>;

  beforeEach(async () => {
    // Criar mock do TransactionsService
    const mockTransactionsService = {
      findById: jest.fn(),
      updateCategory: jest.fn(),
      findAllByDateRange: jest.fn(),
    };

    // Criar mock do CategorizationService
    const mockCategorizationService = {
      learnFromManualCategorization: jest.fn(),
    };

    // Criar mock do SupabaseClient
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
        {
          provide: CategorizationService,
          useValue: mockCategorizationService,
        },
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabaseClient,
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAllByDateRange on the service with correctly parsed dates', async () => {
    // Definir startDateString e endDateString como strings, simulando o que vem da URL
    const startDateString = '2024-01-01';
    const endDateString = '2024-01-31';

    // Definir um mockResult (um array de transações) que o serviço mockado deverá retornar
    const mockResult = [
      {
        id: '1',
        description: 'Compra no supermercado',
        cleanedDescription: 'compra no supermercado',
        amount: -150.50,
        date: new Date('2024-01-15'),
        categoryId: 'groceries',
        userId: 'test-user-id',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        description: 'Salário',
        cleanedDescription: 'salario',
        amount: 3000.00,
        date: new Date('2024-01-01'),
        categoryId: 'salary',
        userId: 'test-user-id',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    // Configurar o mock do transactionsService.findAllByDateRange para retornar o mockResult
    service.findAllByDateRange.mockResolvedValue(mockResult);

    // Criar mock do usuário
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
    } as User;

    // Chamar o método controller.findAll(startDateString, endDateString, mockUser)
    const result = await controller.findAll(startDateString, endDateString, mockUser);

    // Verificar que o método findAllByDateRange do serviço foi chamado com userId e objetos Date reais
    expect(service.findAllByDateRange).toHaveBeenCalledWith(
      mockUser.id,
      new Date(startDateString),
      new Date(endDateString)
    );
    expect(service.findAllByDateRange).toHaveBeenCalledTimes(1);

    // Verificar que o resultado retornado pelo método do controller é exatamente o mockResult
    expect(result).toEqual(mockResult);
  });
});