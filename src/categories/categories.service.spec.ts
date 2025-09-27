import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { ICategoriesRepository } from './categories.repository';

// Mock do repositório que será criado futuramente
const mockCategoriesRepository = {
  create: jest.fn(),
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
});
