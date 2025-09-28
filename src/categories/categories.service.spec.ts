import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { ICategoriesRepository } from './categories.repository';

// Mock do repositório que será criado futuramente
const mockCategoriesRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
} as jest.Mocked<ICategoriesRepository>;

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository: jest.Mocked<ICategoriesRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: 'ICategoriesRepository',
          useValue: mockCategoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoriesRepository = module.get<ICategoriesRepository>('ICategoriesRepository') as jest.Mocked<ICategoriesRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call the repository with the correct data and create a new category', async () => {
    // 1. Definir createCategoryDto
    const createCategoryDto = { name: 'Marketing' };

    // 2. Definir mockCreatedCategory
    const mockCreatedCategory = {
      id: '1',
      name: 'Marketing',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 3. Configurar mock do repositório
    categoriesRepository.create.mockResolvedValue(mockCreatedCategory);

    // 4. Chamar método create do serviço
    const result = await service.create(createCategoryDto);

    // 5. Verificações
    // a. Verificar se o repositório foi chamado com o DTO correto
    expect(categoriesRepository.create).toHaveBeenCalledWith(createCategoryDto);
    expect(categoriesRepository.create).toHaveBeenCalledTimes(1);

    // b. Verificar se o resultado é o mockCreatedCategory
    expect(result).toEqual(mockCreatedCategory);
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      // Arrange
      const mockCategories = [
        {
          id: '1',
          name: 'Alimentação',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          name: 'Transporte',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: '3',
          name: 'Lazer',
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
        },
      ];

      categoriesRepository.findAll.mockResolvedValue(mockCategories);

      // Act
      const result = await service.findAll();

      // Assert
      expect(categoriesRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategories);
    });
  });

  describe('update', () => {
    it('should call the repository with an id and data, and return the updated category', async () => {
      // Arrange
      const categoryId = '1';
      const updateCategoryDto = { name: 'Despesas de Marketing' };
      
      const mockUpdatedCategory = {
        id: '1',
        name: 'Despesas de Marketing',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      categoriesRepository.update.mockResolvedValue(mockUpdatedCategory);

      // Act
      const result = await service.update(categoryId, updateCategoryDto);

      // Assert
      expect(categoriesRepository.update).toHaveBeenCalledWith(categoryId, updateCategoryDto);
      expect(categoriesRepository.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUpdatedCategory);
    });
  });

  describe('remove', () => {
    it('should call the repository with the correct id to remove a category', async () => {
      // Arrange
      const categoryId = '1';
      const mockDeletedCategory = {
        id: categoryId,
        name: 'Categoria Deletada',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      categoriesRepository.remove.mockResolvedValue(mockDeletedCategory);

      // Act
      const result = await service.remove(categoryId);

      // Assert
      expect(categoriesRepository.remove).toHaveBeenCalledWith(categoryId);
      expect(categoriesRepository.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDeletedCategory);
    });
  });
});
