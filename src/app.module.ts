import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { TransactionProcessingModule } from './transaction-processing/transaction-processing.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { ConnectionsModule } from './connections/connections.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    // Carrega variáveis de ambiente do arquivo .env e torna ConfigService global
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TransactionProcessingModule,
    TransactionsModule,
    CategoriesModule,
    AuthModule,
    ConnectionsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
