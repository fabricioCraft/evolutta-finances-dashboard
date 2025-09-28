import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import type { IReportsRepository } from './reports.repository';

describe('ReportsService', () => {
  let service: ReportsService;
  let reportsRepository: jest.Mocked<IReportsRepository>;

  beforeEach(async () => {
    // Criar mock do IReportsRepository
    const mockRepository = {
      getSummaryByDateRange: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: 'IReportsRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    reportsRepository = module.get('IReportsRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMonthlySummary', () => {
    it('should calculate the correct date range and call the repository', async () => {
      // 1. Definir um ano e mês de exemplo
      const year = 2025;
      const month = 10; // Outubro

      // 2. Definir as datas de início e fim esperadas para esse mês
      const expectedStartDate = new Date(2025, 9, 1); // 1 de Outubro (mês 9 porque é 0-indexed)
      const expectedEndDate = new Date(2025, 9, 31); // 31 de Outubro

      // 3. Simular o retorno do repositório
      const mockSummaryData = [
        { categoryName: 'Alimentação', total: -500.00 },
        { categoryName: 'Transporte', total: -200.00 },
        { categoryName: 'Lazer', total: -150.00 },
      ];

      // 4. Configurar o mock do reportsRepository.getSummaryByDateRange
      reportsRepository.getSummaryByDateRange.mockResolvedValue(mockSummaryData);

      // 5. Chamar o método service.getMonthlySummary(year, month)
      const result = await service.getMonthlySummary(year, month);

      // 6. Verificar se o método do repositório foi chamado com as datas corretas
      expect(reportsRepository.getSummaryByDateRange).toHaveBeenCalledWith(
        expectedStartDate,
        expectedEndDate
      );
      expect(reportsRepository.getSummaryByDateRange).toHaveBeenCalledTimes(1);

      // Verificar se o resultado retornado é o esperado
      expect(result).toEqual(mockSummaryData);
    });
  });
});