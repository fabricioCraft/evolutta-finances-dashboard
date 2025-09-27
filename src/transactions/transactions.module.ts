import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionProcessingModule } from '../transaction-processing/transaction-processing.module';
import { TransactionsService } from './transactions.service';
import { PrismaTransactionsRepository } from './transactions.repository';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [TransactionProcessingModule, PrismaModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaTransactionsRepository]
})
export class TransactionsModule {}
