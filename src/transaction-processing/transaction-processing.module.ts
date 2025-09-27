import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { CategorizationService } from './categorization/categorization.service';
import { PrismaRulesRepository } from './rules.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    CategorizationService,
    {
      provide: 'RULES_REPOSITORY',
      useClass: PrismaRulesRepository,
    },
  ],
  exports: [CategorizationService],
})
export class TransactionProcessingModule {}
