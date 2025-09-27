import { Test, TestingModule } from '@nestjs/testing';
import { CategorizationService } from './categorization.service';

describe('CategorizationService', () => {
  let service: CategorizationService;
  let mockRulesRepository: jest.Mocked<any>;

  beforeEach(async () => {
    // Create mock for RulesRepository
    mockRulesRepository = {
      create: jest.fn(),
      findByKeyword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategorizationService,
        {
          provide: 'RULES_REPOSITORY',
          useValue: mockRulesRepository,
        },
      ],
    }).compile();

    service = module.get<CategorizationService>(CategorizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cleanDescription', () => {
    it('should remove a common payment prefix like PGTO*', () => {
      const result = service.cleanDescription('PGTO* CONTA DE LUZ');
      expect(result).toBe('Conta De Luz');
    });

    it('should correctly convert an all-caps string to Title Case', () => {
      const result = service.cleanDescription('FORNECEDOR XPTO LTDA');
      expect(result).toBe('Fornecedor Xpto Ltda');
    });
  });

  describe('categorize', () => {
    it('should return the correct category ID based on a simple keyword match', () => {
      const description = 'Pagamento Fatura AWS Services';
      const rules = [
        { keyword: 'GOOGLE', categoryId: 'cat_software', rule_type: 'CONTAINS' },
        { keyword: 'AWS', categoryId: 'cat_infra', rule_type: 'CONTAINS' }
      ];

      const result = service.categorize(description, rules);
      expect(result).toBe('cat_infra');
    });

    it('should return a default "uncategorized" ID if no rules match', () => {
      const description = 'Padaria do Bairro';
      const rules = [
        { keyword: 'GOOGLE', categoryId: 'cat_software', rule_type: 'CONTAINS' },
        { keyword: 'AWS', categoryId: 'cat_infra', rule_type: 'CONTAINS' }
      ];

      const result = service.categorize(description, rules);
      expect(result).toBe('cat_uncategorized');
    });
  });

  describe('learnFromManualCategorization', () => {
    it('should create a new categorization rule with a normalized, lowercase keyword', async () => {
      // Simulate an uncategorized transaction
      const transaction = {
        id: 'txn_123',
        description: 'COMPRA IFOOD BRASIL',
        categoryId: 'cat_uncategorized'
      };

      // Simulate user's choice
      const newCategoryId = 'cat_food';

      // Configure mock to indicate rule doesn't exist yet
      mockRulesRepository.findByKeyword.mockResolvedValue(null);
      mockRulesRepository.create.mockResolvedValue({
        id: 'rule_123',
        keyword: 'ifood',
        categoryId: 'cat_food',
        rule_type: 'CONTAINS'
      });

      // Call the method
      await service.learnFromManualCategorization(transaction, newCategoryId);

      // Verify that create was called once
      expect(mockRulesRepository.create).toHaveBeenCalledTimes(1);

      // Verify that create was called with correct arguments (keyword in lowercase)
      expect(mockRulesRepository.create).toHaveBeenCalledWith({
        keyword: 'ifood',
        categoryId: 'cat_food',
        rule_type: 'CONTAINS'
      });
    });
  });
});
