import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '../auth/auth.guard';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

// Tipo personalizado para User (compatível com Supabase Auth)
interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

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
    // Criar mock do SupabaseClient
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabaseClient,
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    categoriesService = module.get<CategoriesService>(
      CategoriesService,
    ) as jest.Mocked<CategoriesService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call the create method on the service and return the result', async () => {
    // Arrange
    const createCategoryDto = { name: 'Salários' };
    const mockUser = { id: 'test-user-123' } as User;
    const mockResult = {
      id: '1',
      name: 'Salários',
      userId: 'test-user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    categoriesService.create.mockResolvedValue(mockResult);

    // Act
    const result = await controller.create(createCategoryDto, mockUser);

    // Assert
    expect(categoriesService.create).toHaveBeenCalledWith(
      createCategoryDto,
      'test-user-123',
    );
    expect(result).toBe(mockResult);
  });

  describe('findAll', () => {
    it('should call findAll on the service and return the result', async () => {
      // Arrange
      const mockUser = { id: 'test-user-123' } as User;
      const mockResult = [
        {
          id: '1',
          name: 'Alimentação',
          userId: 'test-user-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          name: 'Transporte',
          userId: 'test-user-123',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: '3',
          name: 'Lazer',
          userId: 'test-user-123',
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
        },
      ];

      categoriesService.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await controller.findAll(mockUser);

      // Assert
      expect(categoriesService.findAll).toHaveBeenCalledWith('test-user-123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should call update on the service and return the result', async () => {
      // Arrange
      const categoryId = '1';
      const updateCategoryDto = { name: 'Alimentação Atualizada' };
      const mockUser = { id: 'test-user-123' } as User;
      const mockResult = {
        id: '1',
        name: 'Alimentação Atualizada',
        userId: 'test-user-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      categoriesService.update.mockResolvedValue(mockResult);

      // Act
      const result = await controller.update(
        categoryId,
        updateCategoryDto,
        mockUser,
      );

      // Assert
      expect(categoriesService.update).toHaveBeenCalledWith(
        categoryId,
        updateCategoryDto,
        mockUser.id,
      );
      expect(result).toBe(mockResult);
    });
  });

  describe('remove', () => {
    it('should call remove on the service with the correct id from params', async () => {
      // Arrange
      const categoryId = '1';
      const mockUser = { id: 'test-user-123' } as User;

      categoriesService.remove.mockResolvedValue({
        id: '1',
        name: 'Deleted Category',
        userId: 'test-user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      await controller.remove(categoryId, mockUser);

      // Assert
      expect(categoriesService.remove).toHaveBeenCalledWith(
        categoryId,
        mockUser.id,
      );
      expect(categoriesService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
