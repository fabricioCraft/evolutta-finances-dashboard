import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaTransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca uma transação específica pelo ID
   * @param id - ID da transação
   * @returns A transação encontrada ou null se não existir
   */
  async findById(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id }
    });
  }

  /**
   * Atualiza a categoria de uma transação
   * @param id - ID da transação
   * @param categoryId - Nova categoria da transação
   * @returns A transação atualizada
   */
  async updateCategory(id: string, categoryId: string) {
    return this.prisma.transaction.update({
      where: { id },
      data: { categoryId }
    });
  }

  /**
   * Busca todas as transações dentro de um intervalo de datas
   * @param startDate - Data inicial (inclusive)
   * @param endDate - Data final (inclusive)
   * @returns Array de transações encontradas no período
   */
  async findAllByDateRange(startDate: Date, endDate: Date) {
    return this.prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate, // maior ou igual a startDate
          lte: endDate,   // menor ou igual a endDate
        }
      },
      orderBy: {
        date: 'desc' // ordenar por data decrescente
      }
    });
  }
}