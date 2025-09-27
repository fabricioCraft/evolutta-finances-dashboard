import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CategorizationService } from '../transaction-processing/categorization/categorization.service';

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
        amount: -150.00,
        date: new Date('2024-01-15'),
        categoryId: 'groceries',
      },
      {
        id: '2',
        description: 'Salário',
        amount: 3000.00,
        date: new Date('2024-01-01'),
        categoryId: 'salary',
      },
    ];

    // Configurar o mock do transactionsService.findAllByDateRange para retornar o mockResult
    service.findAllByDateRange.mockResolvedValue(mockResult);

    // Chamar o método controller.findAll(startDateString, endDateString) (que ainda não existe)
    const result = await controller.findAll(startDateString, endDateString);

    // Verificar que o método findAllByDateRange do serviço foi chamado com objetos Date reais
    expect(service.findAllByDateRange).toHaveBeenCalledWith(
      new Date(startDateString),
      new Date(endDateString)
    );
    expect(service.findAllByDateRange).toHaveBeenCalledTimes(1);

    // Verificar que o resultado retornado pelo método do controller é exatamente o mockResult
    expect(result).toEqual(mockResult);
  });
});