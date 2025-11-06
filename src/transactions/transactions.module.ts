import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionProcessingModule } from '../transaction-processing/transaction-processing.module';
import { TransactionsService } from './transactions.service';
import { PrismaTransactionsRepository } from './transactions.repository';
import { PrismaModule } from '../prisma.module';
import { LoggerMiddleware } from '../common/middleware/logger.middleware';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [TransactionProcessingModule, PrismaModule, SupabaseModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaTransactionsRepository],
})
export class TransactionsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(TransactionsController);
  }
}
