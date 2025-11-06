import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaTransactionsRepository } from './transactions.repository';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: jest.Mocked<PrismaTransactionsRepository>;

  beforeEach(async () => {
    // Criar mock do PrismaTransactionsRepository
    const mockRepository = {
      findById: jest.fn(),
      updateCategory: jest.fn(),
      findAllByDateRange: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaTransactionsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get(PrismaTransactionsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should call repository findById with correct id and return result', async () => {
      const transactionId = 'test-id-123';
      const mockTransaction = {
        id: transactionId,
        description: 'Test transaction',
        cleanedDescription: 'test transaction',
        amount: -100.0,
        date: new Date('2024-01-15'),
        categoryId: 'test-category',
        userId: 'test-user-123',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      };

      repository.findById.mockResolvedValue(mockTransaction);

      const result = await service.findById(transactionId);

      expect(repository.findById).toHaveBeenCalledWith(transactionId);
      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTransaction);
    });

    it('should return null when transaction is not found', async () => {
      const transactionId = 'non-existent-id';

      repository.findById.mockResolvedValue(null);

      const result = await service.findById(transactionId);

      expect(repository.findById).toHaveBeenCalledWith(transactionId);
      expect(result).toBeNull();
    });
  });

  describe('updateCategory', () => {
    it('should call repository updateCategory with correct parameters and return result', async () => {
      const transactionId = 'test-id-123';
      const categoryId = 'new-category';
      const updatedTransaction = {
        id: transactionId,
        description: 'Test transaction',
        cleanedDescription: 'test transaction',
        amount: -100.0,
        date: new Date('2024-01-15'),
        categoryId: categoryId,
        userId: 'test-user-123',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      };

      repository.updateCategory.mockResolvedValue(updatedTransaction);

      const result = await service.updateCategory(transactionId, categoryId);

      expect(repository.updateCategory).toHaveBeenCalledWith(
        transactionId,
        categoryId,
      );
      expect(repository.updateCategory).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedTransaction);
    });
  });

  describe('findAllByDateRange', () => {
    it('should call the repository with the correct userId and date range and return its result', async () => {
      // Adicionar userId de exemplo ao teste
      const userId = 'test-user-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Criar array mockado de transações que seriam o 'retorno do banco de dados'
      const mockTransactions = [
        {
          id: '1',
          description: 'Compra no supermercado',
          cleanedDescription: 'compra no supermercado',
          amount: -150.0,
          date: new Date('2024-01-15'),
          categoryId: 'groceries',
          userId: 'test-user-123',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          description: 'Salário',
          cleanedDescription: 'salario',
          amount: 3000.0,
          date: new Date('2024-01-01'),
          categoryId: 'salary',
          userId: 'test-user-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: '3',
          description: 'Conta de luz',
          cleanedDescription: 'conta de luz',
          amount: -80.5,
          date: new Date('2024-01-20'),
          categoryId: 'utilities',
          userId: 'test-user-123',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20'),
        },
      ];

      // Configurar o mock do PrismaTransactionsRepository para retornar o array mockado
      repository.findAllByDateRange.mockResolvedValue(mockTransactions);

      // Chamar o método findAllByDateRange no TransactionsService com userId
      const result = await service.findAllByDateRange(
        userId,
        startDate,
        endDate,
      );

      // Verificar que o método findAllByDateRange do repositório foi chamado com userId e as datas exatas
      expect(repository.findAllByDateRange).toHaveBeenCalledWith(
        userId,
        startDate,
        endDate,
      );
      expect(repository.findAllByDateRange).toHaveBeenCalledTimes(1);

      // Verificar que o resultado retornado pelo serviço é o mesmo array mockado
      expect(result).toEqual(mockTransactions);
    });

    it('should return empty array when no transactions found in date range', async () => {
      const userId = 'test-user-456';
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-28');

      repository.findAllByDateRange.mockResolvedValue([]);

      const result = await service.findAllByDateRange(
        userId,
        startDate,
        endDate,
      );

      expect(repository.findAllByDateRange).toHaveBeenCalledWith(
        userId,
        startDate,
        endDate,
      );
      expect(result).toEqual([]);
    });

    it('should handle same start and end date (single day)', async () => {
      const userId = 'test-user-789';
      const singleDate = new Date('2024-01-15');
      const mockTransactions = [
        {
          id: '1',
          description: 'Single day transaction',
          cleanedDescription: 'single day transaction',
          amount: -50.0,
          date: new Date('2024-01-15'),
          categoryId: 'test',
          userId: 'test-user-789',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
      ];

      repository.findAllByDateRange.mockResolvedValue(mockTransactions);

      const result = await service.findAllByDateRange(
        userId,
        singleDate,
        singleDate,
      );

      expect(repository.findAllByDateRange).toHaveBeenCalledWith(
        userId,
        singleDate,
        singleDate,
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should handle different date ranges correctly', async () => {
      const userId = 'test-user-abc';
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2024-03-31');
      const mockTransactions = [
        {
          id: '1',
          description: 'Q4 transaction',
          cleanedDescription: 'q4 transaction',
          amount: -200.0,
          date: new Date('2023-12-15'),
          categoryId: 'q4',
          userId: 'test-user-abc',
          createdAt: new Date('2023-12-15'),
          updatedAt: new Date('2023-12-15'),
        },
        {
          id: '2',
          description: 'Q1 transaction',
          cleanedDescription: 'q1 transaction',
          amount: 1000.0,
          date: new Date('2024-01-15'),
          categoryId: 'q1',
          userId: 'test-user-abc',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
      ];

      repository.findAllByDateRange.mockResolvedValue(mockTransactions);

      const result = await service.findAllByDateRange(
        userId,
        startDate,
        endDate,
      );

      expect(repository.findAllByDateRange).toHaveBeenCalledWith(
        userId,
        startDate,
        endDate,
      );
      expect(result).toEqual(mockTransactions);
    });
  });
});
