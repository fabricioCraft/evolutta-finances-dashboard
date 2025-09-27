import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { TransactionProcessingModule } from './transaction-processing/transaction-processing.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [PrismaModule, TransactionProcessingModule, TransactionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
