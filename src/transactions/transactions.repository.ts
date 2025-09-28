import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface ITransactionsRepository {
  findById(id: string): Promise<any>;
  updateCategory(id: string, categoryId: string): Promise<any>;
  findAllByDateRange(userId: string, startDate: Date, endDate: Date): Promise<any[]>;
}

@Injectable()
export class PrismaTransactionsRepository implements ITransactionsRepository {
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
   * Busca todas as transações de um usuário dentro de um intervalo de datas
   * @param userId - ID do usuário
   * @param startDate - Data inicial (inclusive)
   * @param endDate - Data final (inclusive)
   * @returns Array de transações encontradas no período para o usuário
   */
  async findAllByDateRange(userId: string, startDate: Date, endDate: Date) {
    return this.prisma.transaction.findMany({
      where: {
        userId: userId, // filtrar por usuário
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