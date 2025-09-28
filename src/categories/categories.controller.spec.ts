import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: jest.Mocked<CategoriesService>;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    categoriesService = module.get<CategoriesService>(CategoriesService) as jest.Mocked<CategoriesService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call the create method on the service and return the result', async () => {
    // Arrange
    const createCategoryDto = { name: 'Salários' };
    const mockResult = {
      id: 1,
      name: 'Salários',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    categoriesService.create.mockResolvedValue(mockResult);

    // Act
    const result = await controller.create(createCategoryDto);

    // Assert
    expect(categoriesService.create).toHaveBeenCalledWith(createCategoryDto);
    expect(result).toBe(mockResult);
  });

  describe('findAll', () => {
    it('should call findAll on the service and return the result', async () => {
      // Arrange
      const mockResult = [
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

      categoriesService.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(categoriesService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should call update on the service and return the result', async () => {
      // Arrange
      const categoryId = '1';
      const updateCategoryDto = { name: 'Alimentação Atualizada' };
      const mockResult = {
        id: '1',
        name: 'Alimentação Atualizada',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      categoriesService.update.mockResolvedValue(mockResult);

      // Act
      const result = await controller.update(categoryId, updateCategoryDto);

      // Assert
      expect(categoriesService.update).toHaveBeenCalledWith(categoryId, updateCategoryDto);
      expect(result).toBe(mockResult);
    });
  });

  describe('remove', () => {
    it('should call remove on the service with the correct id from params', async () => {
      // Arrange
      const categoryId = '1';

      categoriesService.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(categoryId);

      // Assert
      expect(categoriesService.remove).toHaveBeenCalledWith(categoryId);
      expect(categoriesService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
