import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionProcessingModule } from '../transaction-processing/transaction-processing.module';

@Module({
  imports: [TransactionProcessingModule],
  controllers: [TransactionsController]
})
export class TransactionsModule {}
