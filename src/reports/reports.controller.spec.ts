import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: jest.Mocked<ReportsService>;

  const mockReportsService = {
    getMonthlySummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService) as jest.Mocked<ReportsService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMonthlySummary', () => {
    it('should call the service with year and month from query params', async () => {
      // Definir year e month como strings, simulando a URL
      const yearString = '2025';
      const monthString = '10';

      // Simular o retorno do serviço (um objeto com os totais por categoria)
      const mockSummaryData = [
        { categoryName: 'Alimentação', total: -500.00 },
        { categoryName: 'Transporte', total: -200.00 },
        { categoryName: 'Lazer', total: -150.00 },
        { categoryName: 'Salário', total: 3000.00 },
      ];

      // Configurar o mock do reportsService.getMonthlySummary para retornar os dados mockados
      reportsService.getMonthlySummary.mockResolvedValue(mockSummaryData);

      // Chamar o método controller.getMonthlySummary(year, month) (que ainda não existe)
      const result = await controller.getMonthlySummary(yearString, monthString);

      // Verificar se o método do serviço foi chamado com os year e month convertidos para números
      expect(reportsService.getMonthlySummary).toHaveBeenCalledWith(
        parseInt(yearString, 10), // 2025
        parseInt(monthString, 10) // 10
      );
      expect(reportsService.getMonthlySummary).toHaveBeenCalledTimes(1);

      // Verificar se o resultado retornado é o esperado
      expect(result).toEqual(mockSummaryData);
    });
  });
});