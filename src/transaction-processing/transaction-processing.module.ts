import { Module } from '@nestjs/common';
import { CategorizationService } from './categorization/categorization.service';

@Module({
  providers: [CategorizationService]
})
export class TransactionProcessingModule {}
