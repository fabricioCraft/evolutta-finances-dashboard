import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

// Tipo personalizado para User (compatível com Supabase Auth)
interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: jest.Mocked<ReportsService>;

  const mockReportsService = {
    getMonthlySummary: jest.fn(),
  };

  beforeEach(async () => {
    // Criar mock do SupabaseClient
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabaseClient,
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService) as jest.Mocked<ReportsService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMonthlySummary', () => {
    it('should call the service with year, month and userId from authenticated user', async () => {
      // Definir year e month como strings, simulando a URL
      const yearString = '2025';
      const monthString = '10';
      const mockUser = {
        id: 'test-user-123',
        email: 'test@example.com',
      } as User;

      // Simular o retorno do serviço (um objeto com os totais por categoria)
      const mockSummaryData = [
        { categoryName: 'Alimentação', total: -500.00 },
        { categoryName: 'Transporte', total: -200.00 },
        { categoryName: 'Lazer', total: -150.00 },
        { categoryName: 'Salário', total: 3000.00 },
      ];

      // Configurar o mock do reportsService.getMonthlySummary para retornar os dados mockados
      reportsService.getMonthlySummary.mockResolvedValue(mockSummaryData);

      // Chamar o método controller.getMonthlySummary(year, month, user)
      const result = await controller.getMonthlySummary(yearString, monthString, mockUser);

      // Verificar se o método do serviço foi chamado com os year, month e userId
      expect(reportsService.getMonthlySummary).toHaveBeenCalledWith(
        parseInt(yearString, 10), // 2025
        parseInt(monthString, 10), // 10
        mockUser.id // test-user-123
      );
      expect(reportsService.getMonthlySummary).toHaveBeenCalledTimes(1);

      // Verificar se o resultado retornado é o esperado
      expect(result).toEqual(mockSummaryData);
    });
  });
});