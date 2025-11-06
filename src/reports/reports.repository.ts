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
    // Usar groupBy do Prisma na tabela Transaction
    const groupedTransactions = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        // Filtrar apenas transações do tipo DEBIT (valores negativos)
        amount: {
          lt: 0,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Buscar os nomes das categorias para transformar o resultado
    const categoryIds = groupedTransactions.map((item) => item.categoryId);
    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Criar um mapa de categoryId para categoryName
    const categoryMap = categories.reduce(
      (map, category) => {
        map[category.id] = category.name;
        return map;
      },
      {} as Record<string, string>,
    );

    // Transformar o resultado para que a chave seja o nome da categoria
    const result = groupedTransactions.reduce(
      (summary, item) => {
        const categoryName =
          categoryMap[item.categoryId] || 'Categoria Desconhecida';
        summary[categoryName] = item._sum.amount || 0;
        return summary;
      },
      {} as Record<string, number>,
    );

    return result;
  }
}
