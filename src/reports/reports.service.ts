import { Injectable, Inject } from '@nestjs/common';
import type { IReportsRepository } from './reports.repository';

@Injectable()
export class ReportsService {
  constructor(
    @Inject('IReportsRepository')
    private readonly reportsRepository: IReportsRepository,
  ) {}

  async getMonthlySummary(
    year: number,
    month: number,
    userId: string,
  ): Promise<any> {
    // Calcular o startDate (primeiro dia do mês/ano fornecido)
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    // Calcular o endDate (último dia do mesmo mês/ano)
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    // Chamar o método do repositório com as datas calculadas
    const summaryData = await this.reportsRepository.getSummaryByDateRange(
      startDate,
      endDate,
      userId,
    );

    // O repositório já retorna um Record<string, number>, então retornamos diretamente
    return summaryData;
  }
}
