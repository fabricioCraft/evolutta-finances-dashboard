import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionProcessingModule } from './transaction-processing/transaction-processing.module';

@Module({
  imports: [TransactionProcessingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
