import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ICategoriesRepository } from './categories.repository';

// Mock do repositório que será criado futuramente
const mockCategoriesRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
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
    // 1. Definir createCategoryDto e userId
    const createCategoryDto = { name: 'Marketing' };
    const userId = 'test-user-123';

    // 2. Definir mockCreatedCategory
    const mockCreatedCategory = {
      id: '1',
      name: 'Marketing',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: userId,
    };

    // 3. Configurar mock do repositório
    categoriesRepository.create.mockResolvedValue(mockCreatedCategory);

    // 4. Chamar método create do serviço
    const result = await service.create(createCategoryDto, userId);

    // 5. Verificações
    // a. Verificar se o repositório foi chamado com o DTO e userId corretos
    expect(categoriesRepository.create).toHaveBeenCalledWith(createCategoryDto, userId);
    expect(categoriesRepository.create).toHaveBeenCalledTimes(1);

    // b. Verificar se o resultado é o mockCreatedCategory
    expect(result).toEqual(mockCreatedCategory);
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      // Arrange
      const userId = 'test-user-456';
      const mockCategories = [
        {
          id: '1',
          name: 'Alimentação',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          userId: userId,
        },
        {
          id: '2',
          name: 'Transporte',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          userId: userId,
        },
        {
          id: '3',
          name: 'Lazer',
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
          userId: userId,
        },
      ];

      categoriesRepository.findAll.mockResolvedValue(mockCategories);

      // Act
      const result = await service.findAll(userId);

      // Assert
      expect(categoriesRepository.findAll).toHaveBeenCalledWith(userId);
      expect(categoriesRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategories);
    });
  });

  describe('update', () => {
    it('should call the repository with an id and data, and return the updated category', async () => {
      // Arrange
      const categoryId = '1';
      const userId = 'test-user-123';
      const updateCategoryDto = { name: 'Despesas de Marketing' };
      
      const mockCategory = {
        id: '1',
        name: 'Categoria Original',
        userId: 'test-user-123', // Categoria pertence ao usuário
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      
      const mockUpdatedCategory = {
        id: '1',
        name: 'Despesas de Marketing',
        userId: 'test-user-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      categoriesRepository.findById.mockResolvedValue(mockCategory);
      categoriesRepository.update.mockResolvedValue(mockUpdatedCategory);

      // Act
      const result = await service.update(categoryId, updateCategoryDto, userId);

      // Assert
      expect(categoriesRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(categoriesRepository.findById).toHaveBeenCalledTimes(1);
      expect(categoriesRepository.update).toHaveBeenCalledWith(categoryId, updateCategoryDto);
      expect(categoriesRepository.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUpdatedCategory);
    });

    it('should throw a ForbiddenException if a user tries to update a category they do not own', async () => {
      // Arrange
      const categoryId = '1';
      const userId = 'test-user-123';
      const updateCategoryDto = { name: 'Despesas de Marketing' };
      
      const mockCategory = {
        id: '1',
        name: 'Categoria Original',
        userId: 'different-user-456', // Categoria pertence a outro usuário
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      categoriesRepository.findById.mockResolvedValue(mockCategory);

      // Act & Assert
      await expect(service.update(categoryId, updateCategoryDto, userId))
        .rejects.toThrow(ForbiddenException);
      
      expect(categoriesRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(categoriesRepository.findById).toHaveBeenCalledTimes(1);
      expect(categoriesRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should call the repository with the correct id to remove a category', async () => {
      // Arrange
      const categoryId = '1';
      const userId = 'test-user-123';
      
      const mockCategory = {
        id: '1',
        name: 'Categoria Original',
        userId: 'test-user-123', // Categoria pertence ao usuário
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      
      const mockDeletedCategory = {
        id: categoryId,
        name: 'Categoria Deletada',
        userId: 'test-user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      categoriesRepository.findById.mockResolvedValue(mockCategory);
      categoriesRepository.remove.mockResolvedValue(mockDeletedCategory);

      // Act
      const result = await service.remove(categoryId, userId);

      // Assert
      expect(categoriesRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(categoriesRepository.findById).toHaveBeenCalledTimes(1);
      expect(categoriesRepository.remove).toHaveBeenCalledWith(categoryId);
      expect(categoriesRepository.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDeletedCategory);
    });

    it('should throw a ForbiddenException if a user tries to remove a category they do not own', async () => {
      // Arrange
      const categoryId = '1';
      const userId = 'test-user-123';
      
      const mockCategory = {
        id: '1',
        name: 'Categoria Original',
        userId: 'different-user-456', // Categoria pertence a outro usuário
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      categoriesRepository.findById.mockResolvedValue(mockCategory);

      // Act & Assert
      await expect(service.remove(categoryId, userId))
        .rejects.toThrow(ForbiddenException);
      
      expect(categoriesRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(categoriesRepository.findById).toHaveBeenCalledTimes(1);
      expect(categoriesRepository.remove).not.toHaveBeenCalled();
    });
  });
});
