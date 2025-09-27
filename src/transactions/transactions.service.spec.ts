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
        amount: -100.00,
        date: new Date('2024-01-15'),
        categoryId: 'test-category',
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
        amount: -100.00,
        date: new Date('2024-01-15'),
        categoryId: categoryId,
      };

      repository.updateCategory.mockResolvedValue(updatedTransaction);

      const result = await service.updateCategory(transactionId, categoryId);

      expect(repository.updateCategory).toHaveBeenCalledWith(transactionId, categoryId);
      expect(repository.updateCategory).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedTransaction);
    });
  });

  describe('findAllByDateRange', () => {
    it('should call the repository with the correct date range and return its result', async () => {
      // Definir startDate e endDate de exemplo
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Criar array mockado de transações que seriam o 'retorno do banco de dados'
      const mockTransactions = [
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
        {
          id: '3',
          description: 'Conta de luz',
          amount: -80.50,
          date: new Date('2024-01-20'),
          categoryId: 'utilities',
        },
      ];

      // Configurar o mock do PrismaTransactionsRepository para retornar o array mockado
      repository.findAllByDateRange.mockResolvedValue(mockTransactions);

      // Chamar o método findAllByDateRange no TransactionsService
      const result = await service.findAllByDateRange(startDate, endDate);

      // Verificar que o método findAllByDateRange do repositório foi chamado com as datas exatas
      expect(repository.findAllByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(repository.findAllByDateRange).toHaveBeenCalledTimes(1);

      // Verificar que o resultado retornado pelo serviço é o mesmo array mockado
      expect(result).toEqual(mockTransactions);
    });

    it('should return empty array when no transactions found in date range', async () => {
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-28');

      repository.findAllByDateRange.mockResolvedValue([]);

      const result = await service.findAllByDateRange(startDate, endDate);

      expect(repository.findAllByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual([]);
    });

    it('should handle same start and end date (single day)', async () => {
      const singleDate = new Date('2024-01-15');
      const mockTransactions = [
        {
          id: '1',
          description: 'Single day transaction',
          amount: -50.00,
          date: new Date('2024-01-15'),
          categoryId: 'test',
        },
      ];

      repository.findAllByDateRange.mockResolvedValue(mockTransactions);

      const result = await service.findAllByDateRange(singleDate, singleDate);

      expect(repository.findAllByDateRange).toHaveBeenCalledWith(singleDate, singleDate);
      expect(result).toEqual(mockTransactions);
    });

    it('should handle different date ranges correctly', async () => {
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2024-03-31');
      const mockTransactions = [
        {
          id: '1',
          description: 'Q4 transaction',
          amount: -200.00,
          date: new Date('2023-12-15'),
          categoryId: 'q4',
        },
        {
          id: '2',
          description: 'Q1 transaction',
          amount: 1000.00,
          date: new Date('2024-01-15'),
          categoryId: 'q1',
        },
      ];

      repository.findAllByDateRange.mockResolvedValue(mockTransactions);

      const result = await service.findAllByDateRange(startDate, endDate);

      expect(repository.findAllByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual(mockTransactions);
    });
  });
});