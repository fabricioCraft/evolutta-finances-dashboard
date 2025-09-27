import { Injectable } from '@nestjs/common';
import { PrismaTransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: PrismaTransactionsRepository,
  ) {}

  async findById(id: string) {
    return this.transactionsRepository.findById(id);
  }

  async updateCategory(id: string, categoryId: string) {
    return this.transactionsRepository.updateCategory(id, categoryId);
  }

  async findAllByDateRange(startDate: Date, endDate: Date) {
    return this.transactionsRepository.findAllByDateRange(startDate, endDate);
  }
}
