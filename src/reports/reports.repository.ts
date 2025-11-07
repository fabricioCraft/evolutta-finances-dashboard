import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface IReportsRepository {
  getSummaryByDateRange(
    startDate: Date,
    endDate: Date,
    userId: string,
  ): Promise<any>;
}

@Injectable()
export class PrismaReportsRepository implements IReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSummaryByDateRange(
    startDate: Date,
    endDate: Date,
    userId: string,
  ): Promise<any> {
    // Somar receitas (valores positivos) no período
    const revenueAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        amount: { gt: 0 },
      },
    });

    // Somar despesas (valores negativos) no período
    const expenseAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        amount: { lt: 0 },
      },
    });

    const revenues = revenueAgg._sum.amount ?? 0;
    const expensesSum = expenseAgg._sum.amount ?? 0; // negativo
    const balance = revenues + expensesSum; // despesas são negativas

    return {
      revenues,
      expenses: Math.abs(expensesSum),
      balance,
    };
  }
}
